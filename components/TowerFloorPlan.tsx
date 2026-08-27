"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { ScanSearch } from "lucide-react";

type UnitBox = { x: number; y: number; w: number; h: number };

interface Unit {
  id: string;
  label: string;
  d: string;
  box: UnitBox;
}

interface TowerPlan {
  viewBox: string;
  width: number;
  height: number;
  raster: { href: string; width: number; height: number } | null;
  units: Unit[];
}

// A selected unit is framed to this fraction of the plan area, leaving a little
// breathing room around it instead of butting the walls against the edges.
const ZOOM_PADDING = 0.86;

// Framing a unit — and coming back out of one — glides on a long, softly
// decelerated curve, slow enough to read as a camera move rather than a cut.
// The pill anchors and the back chip derive their timing from this, so the whole
// view moves as one piece.
const ZOOM_MS = 2000;
// A shallow S: gentle at both ends *and* through the middle. What made earlier
// curves feel quick was their peak speed — a cubic ease-in-out sprints at 2.9x
// its own average halfway through, so lengthening it only stretched the pause
// either side of the rush. This one peaks at 1.4x, so the whole move drifts.
const ZOOM_EASE = "cubic-bezier(0.4, 0.15, 0.6, 0.85)";
// Free zoom on top of whatever the plan is currently framing: wheel or pinch to
// magnify, drag to move around. Limits are expressed on the *combined* scale,
// so from a framed unit the visitor can zoom back out to the whole floor as
// well as further in.
const MIN_EFFECTIVE_ZOOM = 1;
const MAX_EFFECTIVE_ZOOM = 8;
// Wheeling sets a target; the rendered zoom then chases it on its own, easing by
// a fixed fraction of the remaining distance each frame. Because the *rate* is
// what's bounded, spinning the wheel fast only pushes the target further away —
// the picture still drifts there slowly instead of lurching. Pinch and drag stay
// immediate: those follow the fingers.
const WHEEL_ZOOM_STEP = 0.0015;
const WHEEL_SMOOTH_TAU = 700;
const SETTLE_SCALE = 0.002;
const SETTLE_PX = 0.4;
const DRAG_SLOP_PX = 6;

const CHROME_FADE_MS = 300;

// The exports leave a blank margin outside the sheet's border frame, which sits
// 28 units in on every tower. Height is what caps how large the plan can draw
// (there is spare width either way), so that dead margin is trimmed off the top
// and bottom — stopping short of the frame itself so nothing looks cut.
const SHEET_TRIM_Y = 24;

// Each tower SVG embeds a ~2MB JPEG of the floor-plan render, so parsed plans
// are memoized per file — switching towers back and forth is then instant and
// never re-decodes the export.
const planCache = new Map<string, TowerPlan>();
const planRequests = new Map<string, Promise<TowerPlan>>();

// Measures each unit outline in viewBox coordinates. getBBox() only reports on
// rendered geometry, so the paths are briefly mounted in an off-screen probe
// SVG rather than parsed by hand — the exports mix H/V/L/C segments.
function measureUnitBoxes(ds: string[], viewBox: string): UnitBox[] {
  const svgNS = "http://www.w3.org/2000/svg";
  const probe = document.createElementNS(svgNS, "svg");
  probe.setAttribute("viewBox", viewBox);
  probe.setAttribute(
    "style",
    "position:fixed;left:-99999px;top:0;width:100px;height:100px;opacity:0;pointer-events:none",
  );
  document.body.appendChild(probe);

  try {
    return ds.map((d) => {
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", d);
      probe.appendChild(path);
      const box = path.getBBox();
      return { x: box.x, y: box.y, w: box.width, h: box.height };
    });
  } finally {
    probe.remove();
  }
}

// The tower SVGs are Figma exports with a fixed shape: one full-canvas <rect>
// painting the floor-plan render (an <image> parked in <defs>), then one
// translucent #CEC3AE <path> per unit sitting on top of it. Those paths are
// both the unit outlines we hit-test against and the "upper layer" a selected
// unit sheds, so unit detection is just reading them off the export.
function parsePlan(svgText: string): TowerPlan {
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const root = doc.documentElement;

  const attrWidth = Number(root.getAttribute("width")) || 0;
  const attrHeight = Number(root.getAttribute("height")) || 0;
  const viewBox =
    root.getAttribute("viewBox") || `0 0 ${attrWidth} ${attrHeight}`;
  const [, , vbWidth, vbHeight] = viewBox.split(/[\s,]+/).map(Number);
  const width = vbWidth || attrWidth;
  const height = vbHeight || attrHeight;

  const image = doc.querySelector("image");
  const href =
    image?.getAttribute("href") ||
    image?.getAttributeNS("http://www.w3.org/1999/xlink", "href") ||
    null;
  // The export always paints the render across the whole canvas, so the
  // <image>'s own size is only a fallback for the viewBox.
  const raster = href
    ? {
        href,
        width: Number(image?.getAttribute("width")) || width,
        height: Number(image?.getAttribute("height")) || height,
      }
    : null;

  const ds = Array.from(root.children)
    .filter((el) => el.tagName.toLowerCase() === "path")
    .map((el) => el.getAttribute("d") || "")
    .filter(Boolean);

  const boxes = measureUnitBoxes(ds, viewBox);

  // Number units clockwise from the top-left corner: the top band runs
  // left→right and the bottom band right→left. Exports list their paths in
  // whatever order they were drawn (Tower C starts bottom-right), so deriving
  // the order from geometry keeps "Unit 1" in the same corner on every tower.
  const midY = height / 2;
  const detected = ds.map((d, index) => ({ d, index, box: boxes[index] }));
  const isTop = (box: UnitBox) => box.y + box.h / 2 < midY;
  const ordered = [
    ...detected
      .filter((u) => isTop(u.box))
      .sort((a, b) => a.box.x - b.box.x || a.index - b.index),
    ...detected
      .filter((u) => !isTop(u.box))
      .sort((a, b) => b.box.x - a.box.x || a.index - b.index),
  ];

  return {
    viewBox,
    width,
    height,
    raster,
    units: ordered.map((u, i) => ({
      id: `unit-${i + 1}`,
      label: `Unit ${i + 1}`,
      d: u.d,
      box: u.box,
    })),
  };
}

function loadPlan(src: string): Promise<TowerPlan> {
  const cached = planCache.get(src);
  if (cached) return Promise.resolve(cached);

  const inFlight = planRequests.get(src);
  if (inFlight) return inFlight;

  const request = fetch(src)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${src}: ${res.status}`);
      return res.text();
    })
    .then((text) => {
      const plan = parsePlan(text);
      planCache.set(src, plan);
      planRequests.delete(src);
      return plan;
    })
    .catch((error) => {
      planRequests.delete(src);
      throw error;
    });

  planRequests.set(src, request);
  return request;
}

interface TowerFloorPlanProps {
  /** Path to a tower export, e.g. `/gallery/Tower A/tower-a.svg`. */
  src: string;
  /**
   * Combined scale of the plan (unit framing × the visitor's own zoom) and how
   * long that change is animating for. The page drifts its backdrop by a
   * fraction of the scale, on the same timing.
   */
  onZoomChange?: (effectiveScale: number, transitionMs: number) => void;
  /**
   * Selected unit, as `unit-1`…`unit-N` numbered clockwise from the plan's
   * top-left corner. Owned by the caller so the floor-plan pills and the
   * sidebar list stay in step.
   */
  activeUnitId: string | null;
  onSelectUnit: (unitId: string | null) => void;
  className?: string;
}

export default function TowerFloorPlan({
  src,
  activeUnitId,
  onSelectUnit,
  onZoomChange,
  className = "",
}: TowerFloorPlanProps) {
  // The parse cache is the source of truth, read straight through during render
  // so a cached export shows immediately — including right after a tower switch.
  // The reducer exists only to re-render once a fetch lands.
  const [, onPlanLoaded] = useReducer((count: number) => count + 1, 0);
  const plan = planCache.get(src) ?? null;
  const [size, setSize] = useState({ w: 0, h: 0 });
  // Keyed by unit so selecting a different one starts from its own framing
  // again, without an effect having to reset it.
  const [zoomState, setZoomState] = useState({
    unit: activeUnitId,
    scale: 1,
    x: 0,
    y: 0,
    ms: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const panRef = useRef<{ x: number; y: number; zoomX: number; zoomY: number } | null>(
    null,
  );
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const draggedRef = useRef(false);
  // Where the zoom is heading, where it is right now, and the frame loop
  // closing the gap between them.
  const zoomTargetRef = useRef({ unit: activeUnitId, scale: 1, x: 0, y: 0 });
  const zoomLiveRef = useRef({ scale: 1, x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);

  useEffect(() => {
    if (planCache.has(src)) return;

    let cancelled = false;
    loadPlan(src)
      .then(() => {
        if (!cancelled) onPlanLoaded();
      })
      .catch((error) => console.error("Tower floor plan failed to load", error));

    return () => {
      cancelled = true;
    };
  }, [src, onPlanLoaded]);

  // Unit pills and the zoom transform both live in container pixels, so the
  // plan's rendered rect has to be tracked rather than assumed — the container
  // rarely matches the export's 3900x2700 aspect exactly.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // The slice of the export actually shown, in viewBox units.
  const view = useMemo(() => {
    if (!plan) return null;
    const trim = Math.min(SHEET_TRIM_Y, plan.height / 4);
    return {
      x: 0,
      y: trim,
      w: plan.width,
      h: plan.height - trim * 2,
    };
  }, [plan]);

  // Maps viewBox coordinates to container pixels for the letterboxed plan.
  const fit = useMemo(() => {
    if (!view || !size.w || !size.h) return null;
    const scale = Math.min(size.w / view.w, size.h / view.h);
    return {
      scale,
      offX: (size.w - view.w * scale) / 2 - view.x * scale,
      offY: (size.h - view.h * scale) / 2 - view.y * scale,
    };
  }, [view, size]);

  const activeUnit =
    plan?.units.find((unit) => unit.id === activeUnitId) ?? null;

  const unitFrame = useMemo(() => {
    if (!activeUnit || !fit || !view)
      return { transform: "none", scale: 1, tx: 0, ty: 0 };

    const { scale, offX, offY } = fit;
    const rectW = activeUnit.box.w * scale;
    const rectH = activeUnit.box.h * scale;
    const rectX = offX + activeUnit.box.x * scale;
    const rectY = offY + activeUnit.box.y * scale;

    // Scaling happens about the container centre, so the translate is whatever
    // it takes to drag the unit's (already scaled) centre back onto it.
    const k = Math.min(size.w / rectW, size.h / rectH) * ZOOM_PADDING;
    let tx = -(rectX + rectW / 2 - size.w / 2) * k;
    let ty = -(rectY + rectH / 2 - size.h / 2) * k;

    // …then hold the sheet over the frame. A unit at the sheet's edge (Tower
    // 2's left column runs the full height at the very left) would otherwise
    // drag the paper off-centre and leave the page showing beside it.
    const scaledAt = (edge: number, centre: number) =>
      centre + (edge - centre) * k;
    const clampAxis = (t: number, near: number, far: number, extent: number) => {
      const max = -scaledAt(near, extent / 2);
      const min = extent - scaledAt(far, extent / 2);
      return min <= max
        ? Math.min(Math.max(t, min), max)
        : (min + max) / 2; // sheet smaller than the frame: centre it instead
    };

    const viewLeft = offX + view.x * scale;
    const viewTop = offY + view.y * scale;
    tx = clampAxis(tx, viewLeft, viewLeft + view.w * scale, size.w);
    ty = clampAxis(ty, viewTop, viewTop + view.h * scale, size.h);

    return {
      transform: `translate(${tx}px, ${ty}px) scale(${k})`,
      scale: k,
      tx,
      ty,
    };
  }, [activeUnit, fit, size, view]);

  const userZoom =
    zoomState.unit === activeUnitId
      ? zoomState
      : // A fresh unit starts from its own framing, easing on the same curve as
        // the plan so the two move as one.
        { unit: activeUnitId, scale: 1, x: 0, y: 0, ms: ZOOM_MS };
  // How far the content may be dragged before its edge would pull inside the
  // frame, given everything scaling it right now.
  const panLimit = (extent: number) =>
    Math.max(0, ((unitFrame.scale * userZoom.scale - 1) * extent) / 2);

  /**
   * The visitor's offset and the unit framing's own translate compose as
   * `user + userScale * unitTranslate`, so the limits have to be applied to
   * that sum. Clamping the visitor's offset alone left the sheet hanging off
   * centre when they zoomed back out: the scale unwound but the framing's
   * translate stayed. Clamping the sum makes zooming out walk the plan back to
   * the middle, and reach it exactly at 1×.
   */
  const clampOffset = (x: number, y: number, scale: number) => {
    const limit = (extent: number) =>
      Math.max(0, ((unitFrame.scale * scale - 1) * extent) / 2);
    const clamp = (value: number, max: number) =>
      Math.min(Math.max(value, -max), max);

    return {
      x: clamp(x + scale * unitFrame.tx, limit(size.w)) - scale * unitFrame.tx,
      y: clamp(y + scale * unitFrame.ty, limit(size.h)) - scale * unitFrame.ty,
    };
  };

  const clampScale = (scale: number) =>
    Math.min(
      Math.max(scale, MIN_EFFECTIVE_ZOOM / unitFrame.scale),
      MAX_EFFECTIVE_ZOOM / unitFrame.scale,
    );

  // Anchors the zoom on a point, so whatever sits under the cursor (or pinch
  // centre) stays put as the scale changes.
  const zoomAbout = (
    from: { scale: number; x: number; y: number },
    nextScale: number,
    originX: number,
    originY: number,
  ) => {
    const scale = clampScale(nextScale);
    const ratio = scale / from.scale;
    return {
      scale,
      ...clampOffset(
        (originX - size.w / 2) * (1 - ratio) + from.x * ratio,
        (originY - size.h / 2) * (1 - ratio) + from.y * ratio,
        scale,
      ),
    };
  };

  const stopChasing = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  useEffect(() => stopChasing, []);

  /** Applies a zoom straight away — for gestures that track the pointer. */
  const commitZoom = (
    next: { scale: number; x: number; y: number },
    ms: number,
  ) => {
    stopChasing();
    zoomLiveRef.current = next;
    zoomTargetRef.current = { unit: activeUnitId, ...next };
    setZoomState({ unit: activeUnitId, ...next, ms });
  };

  // Driven by requestAnimationFrame, which hands us the frame's timestamp — no
  // need to read a clock ourselves.
  const chaseTarget = (now: number): void => {
    // First frame of a chase has no previous stamp; a long-idle tab shouldn't
    // jump on its first frame back either.
    const dt = lastFrameRef.current
      ? Math.min(64, now - lastFrameRef.current)
      : 16;
    lastFrameRef.current = now;

    const target = zoomTargetRef.current;
    if (target.unit !== activeUnitId) {
      rafRef.current = null;
      return;
    }

    const live = zoomLiveRef.current;
    const closed = 1 - Math.exp(-dt / WHEEL_SMOOTH_TAU);
    const stepped = {
      scale: live.scale + (target.scale - live.scale) * closed,
      x: live.x + (target.x - live.x) * closed,
      y: live.y + (target.y - live.y) * closed,
    };
    const settled =
      Math.abs(target.scale - stepped.scale) < SETTLE_SCALE &&
      Math.abs(target.x - stepped.x) < SETTLE_PX &&
      Math.abs(target.y - stepped.y) < SETTLE_PX;
    const applied = settled
      ? { scale: target.scale, x: target.x, y: target.y }
      : stepped;

    zoomLiveRef.current = applied;
    // ms 0: the loop is doing the animating, frame by frame, so everything
    // reading this (pills, the page's backdrop) stays exactly in step.
    setZoomState({ unit: activeUnitId, ...applied, ms: 0 });
    rafRef.current = settled ? null : requestAnimationFrame(chaseTarget);
  };

  const localPoint = (event: React.PointerEvent | React.WheelEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    return {
      x: event.clientX - (rect?.left ?? 0),
      y: event.clientY - (rect?.top ?? 0),
    };
  };

  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const point = localPoint(event);
    // Steps accumulate on the target, not on what's drawn: a fast scroll piles
    // up distance rather than speed.
    const from =
      zoomTargetRef.current.unit === activeUnitId
        ? zoomTargetRef.current
        : { scale: 1, x: 0, y: 0 };

    zoomTargetRef.current = {
      unit: activeUnitId,
      ...zoomAbout(
        from,
        from.scale * Math.exp(-event.deltaY * WHEEL_ZOOM_STEP),
        point.x,
        point.y,
      ),
    };
    zoomLiveRef.current = {
      scale: userZoom.scale,
      x: userZoom.x,
      y: userZoom.y,
    };

    if (rafRef.current === null) {
      lastFrameRef.current = 0;
      rafRef.current = requestAnimationFrame(chaseTarget);
    }
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointers = pointersRef.current;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    draggedRef.current = false;

    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchRef.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        scale: userZoom.scale,
      };
      panRef.current = null;
      return;
    }

    if (pointers.size === 1) {
      // Deliberately no setPointerCapture here: capturing on pointerdown
      // retargets the following click to this container, which would swallow
      // every unit pill and outline tap. It is taken once a drag is real.
      panRef.current = {
        x: event.clientX,
        y: event.clientY,
        zoomX: userZoom.x,
        zoomY: userZoom.y,
      };
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointers = pointersRef.current;
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pinchRef.current && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const rect = containerRef.current?.getBoundingClientRect();
      draggedRef.current = true;
      commitZoom(
        zoomAbout(
          userZoom,
          pinchRef.current.scale * (dist / pinchRef.current.dist),
          (a.x + b.x) / 2 - (rect?.left ?? 0),
          (a.y + b.y) / 2 - (rect?.top ?? 0),
        ),
        0,
      );
      return;
    }

    const pan = panRef.current;
    if (!pan) return;

    const dx = event.clientX - pan.x;
    const dy = event.clientY - pan.y;
    if (
      !draggedRef.current &&
      (Math.abs(dx) > DRAG_SLOP_PX || Math.abs(dy) > DRAG_SLOP_PX)
    ) {
      draggedRef.current = true;
      // Now that it is a drag rather than a tap, follow the pointer even if it
      // leaves the plan.
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    if (panLimit(size.w) === 0 && panLimit(size.h) === 0) return; // nothing to move

    commitZoom(
      {
        scale: userZoom.scale,
        ...clampOffset(pan.zoomX + dx, pan.zoomY + dy, userZoom.scale),
      },
      0,
    );
  };

  const endPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointers = pointersRef.current;
    const pan = panRef.current;
    // Catches a flick that lands without intermediate move events: the click
    // that follows still has to know it was a drag, not a tap.
    if (
      pan &&
      (Math.abs(event.clientX - pan.x) > DRAG_SLOP_PX ||
        Math.abs(event.clientY - pan.y) > DRAG_SLOP_PX)
    ) {
      draggedRef.current = true;
    }

    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinchRef.current = null;
    if (pointers.size === 0) panRef.current = null;
  };

  // A drag that moved the plan shouldn't also count as picking a unit.
  const wasDrag = () => draggedRef.current;

  const resetUserZoom = () =>
    commitZoom({ scale: 1, x: 0, y: 0 }, ZOOM_MS);

  const effectiveScale = unitFrame.scale * userZoom.scale;

  useEffect(() => {
    onZoomChange?.(effectiveScale, userZoom.ms);
  }, [effectiveScale, userZoom.ms, onZoomChange]);

  const canPan = panLimit(size.w) > 0 || panLimit(size.h) > 0;

  return (
    <div
      ref={containerRef}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onDoubleClick={resetUserZoom}
      // Deliberately unclipped: the plan sits in a box only as wide as its
      // fitted self, so clipping there cut the magnified sheet off at a hard
      // rectangle. The page root clips instead, letting a zoom fill the screen.
      className={`relative h-full w-full touch-none ${
        canPan ? "cursor-grab active:cursor-grabbing" : ""
      } ${className}`}
    >
      {/* Free zoom sits outside the unit framing so the two compose: the plan
          settles on a unit, then the visitor can magnify and move it. */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${userZoom.x}px, ${userZoom.y}px) scale(${userZoom.scale})`,
          transformOrigin: "center",
          willChange: "transform",
          transitionProperty: "transform",
          transitionDuration: `${userZoom.ms}ms`,
          transitionTimingFunction: ZOOM_EASE,
        }}
      >
      <div
        className="absolute inset-0"
        style={{
          transform: unitFrame.transform,
          transformOrigin: "center",
          willChange: "transform",
          transitionProperty: "transform",
          transitionDuration: `${ZOOM_MS}ms`,
          transitionTimingFunction: ZOOM_EASE,
        }}
      >
        {plan && (
          <svg
            viewBox={
              view ? `${view.x} ${view.y} ${view.w} ${view.h}` : plan.viewBox
            }
            preserveAspectRatio="xMidYMid meet"
            className="h-full w-full"
          >
            {plan.raster && (
              <image
                href={plan.raster.href}
                x={0}
                y={0}
                width={plan.width}
                height={plan.height}
                preserveAspectRatio="none"
                onClick={() => {
                  if (!wasDrag()) onSelectUnit(null);
                }}
              />
            )}

            {plan.units.map((unit) => {
              const isActive = unit.id === activeUnitId;
              return (
                <path
                  key={unit.id}
                  d={unit.d}
                  fill="#CEC3AE"
                  // A selected unit sheds its overlay entirely — that's the
                  // "upper layer" coming off — but stays hit-testable so
                  // clicking it again backs out to the full floor.
                  // Plain fade with no delay: the same transition carries the
                  // hover dimming, which has to stay immediate.
                  className={`transition-opacity duration-300 ${
                    isActive
                      ? "cursor-zoom-out opacity-0"
                      : "cursor-zoom-in opacity-70 hover:opacity-40"
                  }`}
                  onClick={() => {
                    if (wasDrag()) return;
                    onSelectUnit(isActive ? null : unit.id);
                  }}
                />
              );
            })}
          </svg>
        )}
      </div>
      </div>

      {/* Unit pills stay anchored to their units through every zoom. The layer
          carries the visitor's own pan/zoom (no animation, so the counter-scale
          below cancels it exactly), while each anchor's left/top animates on the
          same curve as the unit framing — which moves points linearly in the
          eased progress, so a pill stays glued to its unit the whole way. */}
      {plan && fit && (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            transform: `translate(${userZoom.x}px, ${userZoom.y}px) scale(${userZoom.scale})`,
            transformOrigin: "center",
            transitionProperty: "transform",
            transitionDuration: `${userZoom.ms}ms`,
            transitionTimingFunction: ZOOM_EASE,
          }}
        >
          {plan.units.map((unit) => {
            const isActive = unit.id === activeUnitId;
            const anchorX = fit.offX + (unit.box.x + unit.box.w / 2) * fit.scale;
            const anchorY = fit.offY + (unit.box.y + unit.box.h / 2) * fit.scale;

            return (
              <div
                key={unit.id}
                className="absolute"
                style={{
                  left:
                    size.w / 2 +
                    (anchorX - size.w / 2) * unitFrame.scale +
                    unitFrame.tx,
                  top:
                    size.h / 2 +
                    (anchorY - size.h / 2) * unitFrame.scale +
                    unitFrame.ty,
                  transition: `left ${ZOOM_MS}ms ${ZOOM_EASE}, top ${ZOOM_MS}ms ${ZOOM_EASE}`,
                }}
              >
                <button
                  onClick={() => {
                    if (!wasDrag()) onSelectUnit(unit.id);
                  }}
                  // The unit being viewed keeps its pill exactly where it sits
                  // on the plan — dimmed and inert rather than moved or hidden.
                  disabled={isActive}
                  style={{
                    // Centres the pill on its anchor and holds it at a constant
                    // screen size however far the plan is magnified.
                    transform: `translate(-50%, -50%) scale(${1 / userZoom.scale})`,
                    transformOrigin: "center",
                    transitionProperty: "transform, opacity, background-color, color",
                    transitionDuration: `${userZoom.ms}ms, ${CHROME_FADE_MS}ms, 150ms, 150ms`,
                    transitionTimingFunction: `${ZOOM_EASE}, ease-out, ease-out, ease-out`,
                  }}
                  className={`flex lg:mt-4 sm:mt-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-black/80 px-3 h-8 text-[12px] font-medium text-white shadow-lg backdrop-blur-md phone-landscape:h-[18px] phone-landscape:gap-0 phone-landscape:px-1.5 phone-landscape:text-[8px] phone-landscape:font-semibold phone-landscape:tracking-tight ${
                    isActive
                      ? "pointer-events-none cursor-default opacity-40"
                      : "pointer-events-auto cursor-pointer opacity-100 hover:bg-black hover:text-[#C79A59]"
                  }`}
                >
                  <ScanSearch
                    size={14}
                    className="shrink-0 phone-landscape:hidden"
                  />
                  <span>{unit.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {!plan && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-4 border-white/10" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-white" />
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-white/70">
            Loading Floor Plan
          </div>
        </div>
      )}
    </div>
  );
}
