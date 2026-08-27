"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { ChevronLeft, ScanSearch } from "lucide-react";

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
  className = "",
}: TowerFloorPlanProps) {
  // The parse cache is the source of truth, read straight through during render
  // so a cached export shows immediately — including right after a tower switch.
  // The reducer exists only to re-render once a fetch lands.
  const [, onPlanLoaded] = useReducer((count: number) => count + 1, 0);
  const plan = planCache.get(src) ?? null;
  const [size, setSize] = useState({ w: 0, h: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

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

  const transform = useMemo(() => {
    if (!activeUnit || !fit || !view) return "none";

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

    return `translate(${tx}px, ${ty}px) scale(${k})`;
  }, [activeUnit, fit, size, view]);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden ${className}`}
    >
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out"
        style={{ transform, transformOrigin: "center", willChange: "transform" }}
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
                onClick={() => onSelectUnit(null)}
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
                  className={`transition-opacity duration-300 ${
                    isActive
                      ? "cursor-zoom-out opacity-0"
                      : "cursor-zoom-in opacity-70 hover:opacity-40"
                  }`}
                  onClick={() => onSelectUnit(isActive ? null : unit.id)}
                />
              );
            })}
          </svg>
        )}
      </div>

      {/* Unit pills, pinned to each detected unit's centre */}
      {plan &&
        fit &&
        !activeUnit &&
        plan.units.map((unit) => (
          <button
            key={unit.id}
            onClick={() => onSelectUnit(unit.id)}
            style={{
              left: fit.offX + (unit.box.x + unit.box.w / 2) * fit.scale,
              top: fit.offY + (unit.box.y + unit.box.h / 2) * fit.scale,
            }}
            className="absolute z-10 flex mt-4 -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/80 px-3 h-8 text-[12px] font-medium text-white shadow-lg backdrop-blur-md transition hover:bg-black hover:text-[#C79A59] cursor-pointer phone-landscape:h-[18px] phone-landscape:gap-0 phone-landscape:px-1.5 phone-landscape:text-[8px] phone-landscape:font-semibold phone-landscape:tracking-tight"
          >
            <ScanSearch size={14} className="shrink-0 phone-landscape:hidden" />
            <span>{unit.label}</span>
          </button>
        ))}

      {/* Back out of a zoomed unit */}
      {activeUnit && (
        <button
          onClick={() => onSelectUnit(null)}
          className="absolute left-0 top-0 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/80 px-3 h-8 text-[12px] font-medium text-white shadow-lg backdrop-blur-md transition hover:bg-black hover:text-[#C79A59] cursor-pointer phone-landscape:h-[18px] phone-landscape:gap-0.5 phone-landscape:px-1.5 phone-landscape:text-[8px] phone-landscape:font-semibold"
        >
          <ChevronLeft
            size={14}
            className="shrink-0 phone-landscape:w-2.5 phone-landscape:h-2.5"
          />
          <span>{activeUnit.label}</span>
        </button>
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
