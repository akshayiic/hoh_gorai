"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

export interface TowerFloorPlanHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

type UnitBox = { x: number; y: number; w: number; h: number };

interface Unit {
  id: string;
  label: string;
  d: string;
  box: UnitBox;
}

/** A raster the export paints, with the placement it painted it at. */
interface PlanImage {
  href: string;
  width: number;
  height: number;
  /** Maps the image's own pixels into plan coordinates. */
  matrix: number[];
  /** Optional transform on the rect element (e.g. rotate) */
  rectTransform?: string | null;
}

interface TowerPlan {
  viewBox: string;
  width: number;
  height: number;
  /** The project aerial, cropped and rotated as the export placed it. */
  backdrop: PlanImage | null;
  /** Opacity of the black wash the export lays over the aerial. */
  wash: number;
  /** The floor-plan render. */
  sheet: PlanImage | null;
  /** The building silhouette the sheet is cut to, as a path `d`. */
  sheetClip: string | null;
  /** All floor-plan render sheets if the SVG contains multiple masked groups */
  sheets?: Array<{ image: PlanImage; clip: string | null }>;
  units: Unit[];
}

// A selected unit is framed to this fraction of the plan area, leaving a little
// breathing room around it instead of butting the walls against the edges.
const ZOOM_PADDING = 0.86;

// Framing a unit — and coming back out of one — glides on a long, softly
// decelerated curve, slow enough to read as a camera move rather than a cut.
// The whole scene travels, aerial and all, so this is longer than it would need
// to be for the sheet alone: a big move wants a slow one to stay subtle. The
// pill anchors and the back chip derive their timing from this, so the whole
// view moves as one piece.
const ZOOM_MS = 1000;
// A shallow S: gentle at both ends *and* through the middle. What made earlier
// curves feel quick was their peak speed — a cubic ease-in-out sprints at 2.9x
// its own average halfway through, so lengthening it only stretched the pause
// either side of the rush. This one peaks at 1.4x, so the whole move drifts.
const ZOOM_EASE = "cubic-bezier(0.4, 0.15, 0.6, 0.85)";
// Free zoom on top of whatever the plan is currently framing: wheel or pinch to
// magnify, drag to move around. Limits are expressed on the *combined* scale,
// so from a framed unit the visitor can zoom back out to the whole floor as
// well as further in.
const MIN_EFFECTIVE_ZOOM = 0.4;
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

// Each tower SVG embeds the aerial backdrop and the floor-plan render, so
// parsed plans are memoized per file — switching towers back and forth is then
// instant and never re-decodes the export.
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

const IDENTITY = [1, 0, 0, 1, 0, 0];

/** Reads the `matrix()` / `scale()` Figma writes on a pattern's <use>. */
function parseTransform(value: string | null): number[] {
  const matrix = value?.match(/matrix\(([^)]+)\)/);
  if (matrix) {
    const parts = matrix[1].split(/[\s,]+/).map(Number);
    return parts.length === 6 ? parts : IDENTITY;
  }
  const scale = value?.match(/scale\(([^)]+)\)/);
  if (scale) {
    const [sx, sy = sx] = scale[1].split(/[\s,]+/).map(Number);
    return [sx, 0, 0, sy, 0, 0];
  }
  return IDENTITY;
}

// A pattern's content is measured in the filled box (`objectBoundingBox`), so
// its matrix has to be composed with `translate(x, y) scale(w, h)` to land in
// plan coordinates.
function placeInBox(
  m: number[],
  x: number,
  y: number,
  w: number,
  h: number,
): number[] {
  return [m[0] * w, m[1] * h, m[2] * w, m[3] * h, m[4] * w + x, m[5] * h + y];
}

// The tower SVGs are Figma exports of the whole scene: the project aerial
// painted across the canvas, a black wash over it, then the floor-plan render
// cut to the building's footprint, and one translucent #CEC3AE <path> per unit.
//
// Figma expresses all of that in the two constructs Chrome is worst at
// re-rasterising: every raster is a <pattern>, and the footprint is an alpha
// <mask>. Both are recomputed at each step of a zoom, and re-tiling a 26MB
// backdrop through a pattern stalled the compositor for seconds — the plan
// appeared to flicker and freeze on the way back out. So the export is taken
// apart instead of injected: each pattern is resolved back to the plain <image>
// and transform it stands for, and the mask to an equivalent <clipPath>. Chrome
// decodes a plain image once and then only transforms it.
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

  // An XML document has no DTD declaring `id`, so `#id` selectors do not match
  // in it — the attribute has to be addressed directly.
  const byId = (id: string) => (id ? root.querySelector(`[id="${id}"]`) : null);
  const hrefOf = (el: Element | null) =>
    el?.getAttribute("href") ||
    el?.getAttributeNS("http://www.w3.org/1999/xlink", "href") ||
    null;
  const urlId = (value: string | null) =>
    value?.match(/url\(#([^)]+)\)/)?.[1] ?? "";

  /** Resolves a rect's `fill="url(#patternN)"` to the image it paints. */
  const imageFor = (rect: Element | null): PlanImage | null => {
    const pattern = byId(urlId(rect?.getAttribute("fill") ?? null));
    const use = pattern?.querySelector("use") ?? null;
    const image = byId((hrefOf(use) ?? "").replace(/^#/, ""));
    const href = hrefOf(image);
    if (!rect || !href) return null;

    return {
      href,
      width: Number(image?.getAttribute("width")) || width,
      height: Number(image?.getAttribute("height")) || height,
      rectTransform: rect.getAttribute("transform") || null,
      matrix: placeInBox(
        parseTransform(use?.getAttribute("transform") ?? null),
        Number(rect.getAttribute("x")) || 0,
        Number(rect.getAttribute("y")) || 0,
        Number(rect.getAttribute("width")) || width,
        Number(rect.getAttribute("height")) || height,
      ),
    };
  };

  // The sheet is the patterned rect inside the masked group; the backdrop is
  // the other one, painted across the whole canvas.
  const maskedGroups = Array.from(root.querySelectorAll("g[mask]"));
  const allSheetRects = maskedGroups
    .map((g) => g.querySelector("rect"))
    .filter(Boolean) as Element[];

  const backdropRect =
    Array.from(root.querySelectorAll("rect")).find(
      (el) => !allSheetRects.includes(el) && urlId(el.getAttribute("fill")),
    ) ?? null;

  const sheets = maskedGroups
    .map((g) => {
      const rect = g.querySelector("rect");
      const img = imageFor(rect);
      const clip =
        byId(urlId(g.getAttribute("mask") ?? null))
          ?.querySelector("path")
          ?.getAttribute("d") ?? null;
      return img ? { image: img, clip } : null;
    })
    .filter((s): s is { image: PlanImage; clip: string | null } => s !== null);

  const sheetRect = allSheetRects[0] ?? null;
  const sheetClip = sheets[0]?.clip ?? null;

  // The wash is a plain black rect over the aerial. (Figma also writes a
  // <foreignObject> backdrop-filter blur beside it; at 2.5px across a 4096-wide
  // canvas it is invisible, and keeping it would re-blur that whole surface on
  // every frame of a zoom, so it is dropped.)
  const washRect = Array.from(root.querySelectorAll("rect")).find(
    (el) => (el.getAttribute("fill") || "").toLowerCase() === "black",
  );
  const wash = washRect
    ? Number(washRect.getAttribute("fill-opacity") ?? 1) || 0
    : 0;

  // Unit outlines are the only #CEC3AE fills in the export, wherever the
  // exporter happened to nest them — Tower A's sit inside the masked group,
  // Towers B and C's at the top level — so they are matched by paint rather
  // than by position.
  const ds = Array.from(root.querySelectorAll("path"))
    .filter((el) => (el.getAttribute("fill") || "").toUpperCase() === "#CEC3AE")
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
    backdrop: imageFor(backdropRect),
    wash,
    sheet: imageFor(sheetRect),
    sheetClip,
    sheets,
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

export interface DefaultPlanTransform {
  scale?: number;
  shiftX?: number;
  shiftY?: number;
  autoCenter?: boolean;
}

interface TowerFloorPlanProps {
  /** Path to a tower export, e.g. `/gallery/Tower A/tower-a.svg`. */
  src: string;
  /** Optional rotation in degrees (e.g. 180) */
  rotation?: number;
  /**
   * Tailwind classes describing the area a selected unit should be framed in —
   * the slice of the screen the page chrome leaves clear. The plan itself still
   * covers the whole container; only the zoom target respects this.
   */
  frameClassName?: string;
  /**
   * Selected unit or units, as `unit-1`…`unit-N` or `["unit-1", "unit-5"]`.
   * Owned by the caller so the floor-plan highlights and the sidebar list stay in step.
   */
  activeUnitId?: string | string[] | null;
  onSelectUnit?: (unitId: string | null) => void;
  /**
   * List of unit ids whose overlay should be hidden (revealing the unit).
   */
  hiddenOverlayUnitIds?: string[];
  /**
   * Called when a unit is clicked/toggled.
   */
  onToggleUnit?: (unitId: string) => void;
  /**
   * Per-unit zoom scale multiplier (e.g. { 'unit-1': 2.5 } for units with large bounding boxes).
   */
  unitZoomMultipliers?: Record<string, number>;
  /**
   * Default master-plan scale and translation offset when no unit is active.
   */
  defaultTransform?: DefaultPlanTransform;
  /**
   * Optional key/counter that, when incremented, resets interactive pan/zoom back to initial scale.
   */
  resetKey?: number;
  className?: string;
  onPlanInteractedChange?: (isInteracted: boolean) => void;
  /**
   * How the floorplan SVG fits its container when at 1x.
   * "cover": fills the screen edge-to-edge (default for Tower 2 & 3).
   * "contain": fits the full SVG viewBox without any edge cropping (preserves original padding as in Master Layout).
   */
  fitMode?: "cover" | "contain";
  /** If true, selecting a unit will not zoom the camera into the unit's bounding box. */
  disableUnitZoom?: boolean;
}

const TowerFloorPlan = forwardRef<TowerFloorPlanHandle, TowerFloorPlanProps>(
  function TowerFloorPlan(
    {
      src,
      rotation = 0,
      activeUnitId = null,
      onSelectUnit,
      hiddenOverlayUnitIds,
      onToggleUnit,
      unitZoomMultipliers = {},
      defaultTransform,
      resetKey,
      onPlanInteractedChange,
      frameClassName = "",
      className = "",
      fitMode = "cover",
      disableUnitZoom = false,
    },
    ref,
  ) {
  // The parse cache is the source of truth, read straight through during render
  // so a cached export shows immediately — including right after a tower switch.
  // The reducer exists only to re-render once a fetch lands.
  const [, onPlanLoaded] = useReducer((count: number) => count + 1, 0);
  // Colons are legal in an id but awkward inside a url(#…) reference.
  const clipId = `plan-clip-${useId().replace(/:/g, "")}`;
  const plan = planCache.get(src) ?? null;
  const [size, setSize] = useState({ w: 0, h: 0 });
  const activeKey = useMemo(() => {
    if (!activeUnitId) return null;
    return Array.isArray(activeUnitId)
      ? activeUnitId.slice().sort().join(",")
      : activeUnitId;
  }, [activeUnitId]);

  // Keyed by unit so selecting a different one starts from its own framing
  // again, without an effect having to reset it.
  const [zoomState, setZoomState] = useState({
    unit: activeKey,
    scale: 1,
    x: 0,
    y: 0,
    ms: 0,
  });

  useEffect(() => {
    const isInteracted =
      zoomState.scale !== 1 || zoomState.x !== 0 || zoomState.y !== 0;
    onPlanInteractedChange?.(isInteracted);
  }, [zoomState.scale, zoomState.x, zoomState.y, onPlanInteractedChange]);

  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  // The clear area a selected unit is framed in, in container pixels.
  const [frameRect, setFrameRect] = useState<UnitBox | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const panRef = useRef<{
    x: number;
    y: number;
    zoomX: number;
    zoomY: number;
  } | null>(null);
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const draggedRef = useRef(false);
  // Where the zoom is heading, where it is right now, and the frame loop
  // closing the gap between them.
  const zoomTargetRef = useRef({ unit: activeKey, scale: 1, x: 0, y: 0 });
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
      .catch((error) =>
        console.error("Tower floor plan failed to load", error),
      );

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

  // The export is the finished scene, margins and all, so it is shown whole.
  const view = useMemo(() => {
    if (!plan) return null;
    const [x, y, w, h] = plan.viewBox.split(/[\s,]+/).map(Number);
    return {
      x: x || 0,
      y: y || 0,
      w: w || plan.width,
      h: h || plan.height,
    };
  }, [plan]);

  // Maps viewBox coordinates to container pixels.
  // In "cover" mode (Tower 2 & 3), it scales to the larger ratio to fill the screen edge-to-edge.
  // In "contain" mode (Master Layout), it scales to the smaller ratio to fit the full scene without any edge cropping.
  const fit = useMemo(() => {
    if (!view || !size.w || !size.h) return null;
    const scale =
      fitMode === "contain"
        ? Math.min(size.w / view.w, size.h / view.h)
        : Math.max(size.w / view.w, size.h / view.h);
    return {
      scale,
      offX: (size.w - view.w * scale) / 2 - view.x * scale,
      offY: (size.h - view.h * scale) / 2 - view.y * scale,
    };
  }, [view, size, fitMode]);

  // Position, not size, is what matters here, and ResizeObserver reports only
  // the latter — so the frame is re-read whenever the container resizes, which
  // is what moves it.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const host = containerRef.current;
    if (!frame || !host) return;
    const box = frame.getBoundingClientRect();
    const hostBox = host.getBoundingClientRect();
    setFrameRect({
      x: box.left - hostBox.left,
      y: box.top - hostBox.top,
      w: box.width,
      h: box.height,
    });
  }, [size.w, size.h, frameClassName]);

  const activeUnits = useMemo(() => {
    if (!plan || !activeUnitId) return [];
    const ids = Array.isArray(activeUnitId) ? activeUnitId : [activeUnitId];
    return plan.units.filter((unit) => ids.includes(unit.id));
  }, [plan, activeUnitId]);

  const activeBox = useMemo(() => {
    if (!activeUnits.length) return null;
    const minX = Math.min(...activeUnits.map((u) => u.box.x));
    const minY = Math.min(...activeUnits.map((u) => u.box.y));
    const maxX = Math.max(...activeUnits.map((u) => u.box.x + u.box.w));
    const maxY = Math.max(...activeUnits.map((u) => u.box.y + u.box.h));
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }, [activeUnits]);

  const allUnitsBox = useMemo(() => {
    if (!plan) return null;
    if (plan.units.length > 0) {
      const minX = Math.min(...plan.units.map((u) => u.box.x));
      const minY = Math.min(...plan.units.map((u) => u.box.y));
      const maxX = Math.max(...plan.units.map((u) => u.box.x + u.box.w));
      const maxY = Math.max(...plan.units.map((u) => u.box.y + u.box.h));
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }
    if (plan.sheets && plan.sheets.length > 0 && typeof document !== "undefined") {
      const clips = plan.sheets.map((s) => s.clip).filter(Boolean) as string[];
      if (clips.length > 0) {
        const boxes = measureUnitBoxes(clips, plan.viewBox);
        const valid = boxes.filter((b) => b.w > 0 && b.h > 0);
        if (valid.length > 0) {
          const minX = Math.min(...valid.map((b) => b.x));
          const minY = Math.min(...valid.map((b) => b.y));
          const maxX = Math.max(...valid.map((b) => b.x + b.w));
          const maxY = Math.max(...valid.map((b) => b.y + b.h));
          return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
        }
      }
    }
    return null;
  }, [plan]);

  const unitFrame = useMemo(() => {
    if (!fit || !view) return { transform: "none", scale: 1, tx: 0, ty: 0 };

    // When no unit is selected or unit zoom is disabled, apply default master-plan zoom and shift
    if (!activeBox || disableUnitZoom) {
      if (
        !defaultTransform ||
        (!defaultTransform.scale &&
          !defaultTransform.shiftX &&
          !defaultTransform.shiftY &&
          !defaultTransform.autoCenter)
      ) {
        return { transform: "none", scale: 1, tx: 0, ty: 0 };
      }

      const defaultScale = defaultTransform.scale ?? 1;
      let tx = defaultTransform.shiftX ?? 0;
      let ty = defaultTransform.shiftY ?? 0;

      if (defaultTransform.autoCenter && allUnitsBox) {
        const { scale, offX, offY } = fit;
        const rawX =
          rotation === 180 && plan
            ? plan.width - (allUnitsBox.x + allUnitsBox.w)
            : allUnitsBox.x;
        const rawY =
          rotation === 180 && plan
            ? plan.height - (allUnitsBox.y + allUnitsBox.h)
            : allUnitsBox.y;
        const rectX = offX + rawX * scale;
        const rectY = offY + rawY * scale;
        const frame = frameRect ?? { x: 0, y: 0, w: size.w, h: size.h };

        // Center the building footprint neatly in the available frame (right of sidebar)
        const targetTx =
          frame.x +
          frame.w / 2 -
          size.w / 2 -
          (rectX + (allUnitsBox.w * scale) / 2 - size.w / 2) * defaultScale;
        const targetTy =
          frame.y +
          frame.h / 2 -
          size.h / 2 -
          (rectY + (allUnitsBox.h * scale) / 2 - size.h / 2) * defaultScale;

        tx = targetTx + (defaultTransform.shiftX ?? 0);
        ty = targetTy + (defaultTransform.shiftY ?? 0);
      }

      return {
        transform: `translate(${tx}px, ${ty}px) scale(${defaultScale})`,
        scale: defaultScale,
        tx,
        ty,
      };
    }

    const { scale, offX, offY } = fit;
    const rectW = activeBox.w * scale;
    const rectH = activeBox.h * scale;
    const rawX =
      rotation === 180 && plan
        ? plan.width - (activeBox.x + activeBox.w)
        : activeBox.x;
    const rawY =
      rotation === 180 && plan
        ? plan.height - (activeBox.y + activeBox.h)
        : activeBox.y;
    const rectX = offX + rawX * scale;
    const rectY = offY + rawY * scale;

    // The plan covers the whole screen, but a unit is framed in the part of it
    // the sidebar and the bars leave clear — otherwise a zoom would settle
    // half-under the panel.
    const frame = frameRect ?? { x: 0, y: 0, w: size.w, h: size.h };

    // Scaling happens about the container centre, so the translate is whatever
    // it takes to drag the unit's (already scaled) centre onto the frame's.
    let multiplier = 1;
    if (Array.isArray(activeUnitId)) {
      let found = false;
      for (const id of activeUnitId) {
        if (unitZoomMultipliers[id] !== undefined) {
          multiplier = found
            ? Math.max(multiplier, unitZoomMultipliers[id])
            : unitZoomMultipliers[id];
          found = true;
        }
      }
    } else if (activeUnitId && unitZoomMultipliers[activeUnitId] !== undefined) {
      multiplier = unitZoomMultipliers[activeUnitId];
    }
    const k =
      Math.min(frame.w / rectW, frame.h / rectH) * ZOOM_PADDING * multiplier;
    let tx =
      frame.x + frame.w / 2 - size.w / 2 - (rectX + rectW / 2 - size.w / 2) * k;
    let ty =
      frame.y + frame.h / 2 - size.h / 2 - (rectY + rectH / 2 - size.h / 2) * k;

    // …then hold the sheet over the frame. A unit at the sheet's edge (Tower
    // 2's left column runs the full height at the very left) would otherwise
    // drag the paper off-centre and leave the page showing beside it.
    const scaledAt = (edge: number, centre: number) =>
      centre + (edge - centre) * k;
    const clampAxis = (
      t: number,
      near: number,
      far: number,
      extent: number,
    ) => {
      const max = -scaledAt(near, extent / 2);
      const min = extent - scaledAt(far, extent / 2);
      return min <= max ? Math.min(Math.max(t, min), max) : (min + max) / 2; // sheet smaller than the frame: centre it instead
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
  }, [
    activeBox,
    disableUnitZoom,
    fit,
    frameRect,
    size,
    view,
    rotation,
    plan,
    activeUnitId,
    unitZoomMultipliers,
    defaultTransform,
    allUnitsBox,
  ]);

  const userZoom =
    zoomState.unit === activeKey
      ? zoomState
      : // A fresh unit starts from its own framing, easing on the same curve as
        // the plan so the two move as one.
        { unit: activeKey, scale: 1, x: 0, y: 0, ms: ZOOM_MS };
  // Allow panning freely across the scene
  const panLimit = (extent: number) =>
    Math.max(extent * 0.5, ((unitFrame.scale * userZoom.scale - 1) * extent) / 2);

  const clampOffset = (x: number, y: number, scale: number) => {
    const effectiveScale = unitFrame.scale * scale;
    const limitX = Math.max(
      size.w * 0.7,
      Math.abs(unitFrame.tx) * 2,
      Math.abs(effectiveScale - 1) * size.w * 0.6 + size.w * 0.4,
    );
    const limitY = Math.max(
      size.h * 0.7,
      Math.abs(unitFrame.ty) * 2,
      Math.abs(effectiveScale - 1) * size.h * 0.6 + size.h * 0.4,
    );
    const clamp = (value: number, max: number) =>
      Math.min(Math.max(value, -max), max);

    return {
      x: clamp(x + scale * unitFrame.tx, limitX) - scale * unitFrame.tx,
      y: clamp(y + scale * unitFrame.ty, limitY) - scale * unitFrame.ty,
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
    zoomTargetRef.current = { unit: activeKey, ...next };
    setZoomState({ unit: activeKey, ...next, ms });
  };

  useImperativeHandle(
    ref,
    () => ({
      zoomIn: () => {
        const from =
          zoomTargetRef.current.unit === activeKey
            ? zoomTargetRef.current
            : { scale: 1, x: 0, y: 0 };
        commitZoom(
          zoomAbout(from, from.scale * 1.35, size.w / 2, size.h / 2),
          250,
        );
      },
      zoomOut: () => {
        const from =
          zoomTargetRef.current.unit === activeKey
            ? zoomTargetRef.current
            : { scale: 1, x: 0, y: 0 };
        commitZoom(
          zoomAbout(from, from.scale / 1.35, size.w / 2, size.h / 2),
          250,
        );
      },
      resetZoom: () => {
        commitZoom({ scale: 1, x: 0, y: 0 }, ZOOM_MS);
      },
    }),
    [activeKey, size.w, size.h],
  );

  useEffect(() => {
    if (resetKey !== undefined && resetKey > 0) {
      commitZoom({ scale: 1, x: 0, y: 0 }, ZOOM_MS);
    }
  }, [resetKey]);

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
    if (target.unit !== activeKey) {
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
    setZoomState({ unit: activeKey, ...applied, ms: 0 });
    rafRef.current = settled ? null : requestAnimationFrame(chaseTarget);
  };

  const localPoint = (event: React.PointerEvent | React.WheelEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    return {
      x: event.clientX - (rect?.left ?? 0),
      y: event.clientY - (rect?.top ?? 0),
    };
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = el.getBoundingClientRect();
      const point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      const from =
        zoomTargetRef.current.unit === activeKey
          ? zoomTargetRef.current
          : { scale: 1, x: 0, y: 0 };

      // Pinch on trackpad has event.ctrlKey = true
      const step = event.ctrlKey ? WHEEL_ZOOM_STEP * 2.5 : WHEEL_ZOOM_STEP;

      zoomTargetRef.current = {
        unit: activeKey,
        ...zoomAbout(
          from,
          from.scale * Math.exp(-event.deltaY * step),
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

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [activeKey, userZoom.scale, userZoom.x, userZoom.y]);

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

  const resetUserZoom = () => commitZoom({ scale: 1, x: 0, y: 0 }, ZOOM_MS);

  const canPan = true;

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onDoubleClick={resetUserZoom}
      // Deliberately unclipped: the page root clips instead, so a magnified
      // plan runs to the edges of the screen rather than to a hard rectangle.
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
              viewBox={plan.viewBox}
              preserveAspectRatio={
                fitMode === "contain" ? "xMidYMid meet" : "xMidYMid slice"
              }
              className="h-full w-full"
              // Clicking the scene — aerial, wash or sheet alike — backs out to
              // the whole floor. The unit outlines below stop their own clicks.
              onClick={() => {
                if (!wasDrag()) onSelectUnit?.(null);
              }}
            >
              {plan.sheetClip && (
                <defs>
                  <clipPath id={clipId}>
                    <path d={plan.sheetClip} />
                  </clipPath>
                </defs>
              )}

              {/* The whole scene sits inside the zoom, so the aerial, the wash
                and the sheet move as one page rather than as layers sliding
                over each other. */}
              <g
                transform={
                  rotation
                    ? `rotate(${rotation} ${plan.width / 2} ${plan.height / 2})`
                    : undefined
                }
              >
                {plan.backdrop && (
                  <g transform={plan.backdrop.rectTransform || undefined}>
                    <image
                      href={plan.backdrop.href}
                      width={plan.backdrop.width}
                      height={plan.backdrop.height}
                      transform={`matrix(${plan.backdrop.matrix.join(" ")})`}
                      preserveAspectRatio="none"
                    />
                  </g>
                )}

                {plan.wash > 0 && (
                  <rect
                    width={plan.width}
                    height={plan.height}
                    fill="black"
                    fillOpacity={plan.wash}
                  />
                )}

                {/* The floor-plan render, cut to the building's footprint. The clip
                  sits on the group so it is measured in plan coordinates, as the
                  export's mask was, rather than in the image's own transformed
                  space. */}
                {plan.sheets && plan.sheets.length > 0
                  ? plan.sheets.map((s, idx) => {
                      const sClipId = `${clipId}-sheet-${idx}`;
                      return (
                        <g key={idx}>
                          {s.clip && (
                            <defs>
                              <clipPath id={sClipId}>
                                <path d={s.clip} />
                              </clipPath>
                            </defs>
                          )}
                          <g clipPath={s.clip ? `url(#${sClipId})` : undefined}>
                            <g transform={s.image.rectTransform || undefined}>
                              <image
                                href={s.image.href}
                                width={s.image.width}
                                height={s.image.height}
                                transform={`matrix(${s.image.matrix.join(" ")})`}
                                preserveAspectRatio="none"
                              />
                            </g>
                          </g>
                        </g>
                      );
                    })
                  : plan.sheet && (
                      <g clipPath={plan.sheetClip ? `url(#${clipId})` : undefined}>
                        <g transform={plan.sheet.rectTransform || undefined}>
                          <image
                            href={plan.sheet.href}
                            width={plan.sheet.width}
                            height={plan.sheet.height}
                            transform={`matrix(${plan.sheet.matrix.join(" ")})`}
                            preserveAspectRatio="none"
                          />
                        </g>
                      </g>
                    )}

                {(() => {
                  const hasSelection = Array.isArray(activeUnitId)
                    ? activeUnitId.length > 0
                    : Boolean(activeUnitId);

                  return plan.units.map((unit) => {
                    const isActive = Array.isArray(activeUnitId)
                      ? activeUnitId.includes(unit.id)
                      : unit.id === activeUnitId;
                    const isOverlayHidden =
                      hiddenOverlayUnitIds?.includes(unit.id);
                    const isMasked =
                      hasSelection && !isOverlayHidden && !isActive;

                    return (
                      <path
                        key={unit.id}
                        d={unit.d}
                        fill="#CEC3AE"
                        fillOpacity={isMasked ? 0.7 : 0}
                        className={`transition-all duration-300 cursor-pointer ${
                          isActive
                            ? "cursor-zoom-out"
                            : isOverlayHidden
                            ? "hover:stroke-[#CEC3AE]/50 hover:stroke-[1px]"
                            : "cursor-zoom-in hover:fill-opacity-40"
                        }`}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (wasDrag()) return;
                          if (onSelectUnit) {
                            onSelectUnit(isActive ? null : unit.id);
                          } else if (onToggleUnit) {
                            onToggleUnit(unit.id);
                          }
                        }}
                      />
                    );
                  });
                })()}
              </g>
            </svg>
          )}
        </div>
      </div>

      {/* Measures the area a zoom should settle in. It draws nothing; the
          page hands it the same insets its chrome occupies. */}
      <div
        ref={frameRef}
        aria-hidden
        className={`pointer-events-none invisible ${
          frameClassName || "absolute inset-0"
        }`}
      />

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
});

export default TowerFloorPlan;
