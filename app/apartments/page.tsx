"use client";

import { useCallback, useState, useEffect } from "react";
import { Grid3X3, Maximize2, Minimize2 } from "lucide-react";
import Image from "next/image";
import GlobalNavbar from "@/components/GlobalNavbar";
import BottomNavbar from "@/components/BottomNavbar";
import Sidebar, {
  createSidebarSections,
  createSidebarItems,
} from "@/components/Sidebar";
import TowerFloorPlan from "@/components/TowerFloorPlan";

type TowerKey = "Tower 1" | "Tower 2" | "Tower 3";

interface TowerUnit {
  /**
   * Matches the ids TowerFloorPlan derives from the export — `unit-1`…`unit-N`
   * numbered clockwise from the plan's top-left corner.
   */
  id: string;
  /** Flat number(s) printed inside the outline on the sheet. */
  flat: string;
  type: string;
  /** RERA carpet area in sq.ft, straight off the sheet's area statement table. */
  carpet: string;
}

// One entry per outlined unit in each tower export, in the order the plan
// numbers them. Flat numbers come from the circled markers drawn at each unit's
// entrance; types and areas come from the AREA STATEMENT TABLE printed at the
// bottom of the same sheet, so the sidebar quotes the drawing it sits next to.
// Tower 1's units line up 1:1 with its flat numbers; in Towers 2 and 3 one
// outline covers a pair of flats that share a single table row.
const towerUnits: Record<TowerKey, TowerUnit[]> = {
  "Tower 1": [
    { id: "unit-1", flat: "01", type: "3 BHK", carpet: "1017.62" },
    { id: "unit-2", flat: "02", type: "2 BHK", carpet: "702.44" },
    { id: "unit-3", flat: "03", type: "2 BHK", carpet: "702.44" },
    { id: "unit-4", flat: "04", type: "3 BHK", carpet: "1010.97" },
    { id: "unit-5", flat: "05", type: "2 BHK", carpet: "725.85" },
    { id: "unit-6", flat: "06", type: "3 BHK", carpet: "1042.07" },
  ],
  "Tower 2": [
    { id: "unit-1", flat: "03", type: "3 BHK", carpet: "1013.00" },
    { id: "unit-2", flat: "04", type: "2 BHK", carpet: "702.17" },
    { id: "unit-3", flat: "05", type: "3 BHK", carpet: "1002.28" },
    { id: "unit-4", flat: "01 & 02", type: "2 BHK", carpet: "700.71" },
  ],
  "Tower 3": [
    { id: "unit-1", flat: "05", type: "2 BHK", carpet: "714.33" },
    { id: "unit-2", flat: "06", type: "2 BHK", carpet: "720.18" },
    { id: "unit-3", flat: "07", type: "2 BHK", carpet: "720.18" },
    { id: "unit-4", flat: "08", type: "3 BHK", carpet: "1013.60" },
    { id: "unit-5", flat: "01", type: "3 BHK", carpet: "1046.64" },
    { id: "unit-6", flat: "02", type: "2 BHK", carpet: "725.85" },
    { id: "unit-7", flat: "03 & 04", type: "2 BHK", carpet: "725.85" },
  ],
};

const towerPlans: Record<TowerKey, string> = {
  "Tower 1": "/gallery/Tower A/tower-a.svg",
  "Tower 2": "/gallery/Tower B/tower-b.svg",
  "Tower 3": "/gallery/Tower C/tower-c.svg",
};

const unitNumber = (unitId: string) => unitId.replace("unit-", "");

// The backdrop follows the plan's zoom by a fraction of it — enough that the
// whole scene feels like it moves together, not enough to pull focus.
const BACKDROP_ZOOM_SHARE = 0.03;
// Matches TowerFloorPlan's ZOOM_EASE so the backdrop drifts in step.
const BACKDROP_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
const NO_ZOOM = { scale: 1, ms: 0 };

export default function ApartmentsPage() {
  const [selectedTower, setSelectedTower] = useState<TowerKey>("Tower 1");
  // null = the whole floor; otherwise the unit zoomed into on the plan.
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [isFullscreenActive, setIsFullscreenActive] = useState(
    () => typeof document !== "undefined" && !!document.fullscreenElement,
  );
  // Mirrors the plan's zoom, timing included, so the backdrop moves with it
  // rather than on its own clock.
  const [planZoom, setPlanZoom] = useState(NO_ZOOM);
  // Stable identity: TowerFloorPlan reports through an effect.
  const handleZoomChange = useCallback(
    (scale: number, ms: number) => setPlanZoom({ scale, ms }),
    [],
  );

  const units = towerUnits[selectedTower];
  const planSrc = towerPlans[selectedTower];

  // Fullscreens `document.documentElement`, not this page's own div — that's
  // the one element that survives client-side navigation, so switching pages
  // (BottomNavbar links, etc) no longer forces an exit from fullscreen.
  const requestFullscreen = () => {
    if (document.fullscreenElement) return;
    const target = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
    if (target.requestFullscreen) target.requestFullscreen().catch(() => {});
    else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
  };

  const exitFullscreen = () => {
    if (!document.fullscreenElement) return;
    const doc = document as Document & { webkitExitFullscreen?: () => void };
    if (doc.exitFullscreen) doc.exitFullscreen().catch(() => {});
    else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) exitFullscreen();
    else requestFullscreen();
  };

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreenActive(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Background — the project aerial, drifting with the plan's zoom */}
      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${1 + (planZoom.scale - 1) * BACKDROP_ZOOM_SHARE})`,
          transformOrigin: "center",
          transition: `transform ${planZoom.ms}ms ${BACKDROP_EASE}`,
          willChange: "transform",
        }}
      >
        <Image
          src="/gallery/hoh_layout.webp"
          alt=""
          fill
          priority
          className="object-cover"
        />
      </div>

      <div className="absolute inset-0 bg-black/45" />

      {/* Global Navbar */}
      <GlobalNavbar currentPage="apartments" showRERA={false} />

      {/* Sidebar — the same units the plan outlines, so picking one here zooms
          it there, and picking one there highlights it here */}
      <Sidebar
        isFullscreenActive={isFullscreenActive}
        header={{
          icon: Grid3X3,
          title: selectedTower,
          subtitle: "Floor Plans",
        }}
        sections={createSidebarSections([
          {
            id: "units",
            items: createSidebarItems([
              {
                id: "whole-floor",
                label: "Master Floor Plan",
                onClick: () => setActiveUnitId(null),
                isActive: activeUnitId === null,
              },
              ...units.map((unit) => ({
                id: unit.id,
                label: `Unit ${unitNumber(unit.id)} - ${unit.type} - ${unit.carpet} sq.ft`,
                onClick: () => setActiveUnitId(unit.id),
                isActive: activeUnitId === unit.id,
              })),
            ]),
          },
        ])}
      />

      {/* Fullscreen toggle */}
      <button
        onClick={toggleFullscreen}
        className="absolute right-6 bottom-32 z-20 w-10 h-10 rounded-lg bg-black/45 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/70 hover:text-[#C79A59] transition shadow-lg cursor-pointer phone-landscape:w-7 phone-landscape:h-7 phone-landscape:rounded-md"
        title={isFullscreenActive ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isFullscreenActive ? (
          <Minimize2
            size={20}
            className="phone-landscape:w-3.5 phone-landscape:h-3.5"
          />
        ) : (
          <Maximize2
            size={20}
            className="phone-landscape:w-3.5 phone-landscape:h-3.5"
          />
        )}
      </button>

      {/* Floorplan Area — inset past the sidebar on every size (the phone
          sidebar ends at 176px), so a zoomed unit fills a frame that is
          actually visible instead of sliding under the panel. The plan is
          height-bound at these sizes, so the inset costs it no size. */}
      <div className="absolute top-[80px] bottom-[72px] left-4 lg:left-[340px] right-4 lg:right-8 flex items-center justify-center p-2 phone-landscape:top-14 phone-landscape:bottom-14 phone-landscape:left-[184px] phone-landscape:right-4 phone-landscape:p-1 phone-landscape:touch-none">
        <div className="relative w-full max-w-[1400px] max-h-full aspect-[3900/2700]">
          <TowerFloorPlan
            key={planSrc}
            src={planSrc}
            activeUnitId={activeUnitId}
            onSelectUnit={setActiveUnitId}
            onZoomChange={handleZoomChange}
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavbar activeItem="apartments" />

      {/* Towers */}
      <div className="absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-2 phone-landscape:bottom-3 phone-landscape:gap-1">
        {(Object.keys(towerUnits) as TowerKey[]).map((tower) => (
          <button
            key={tower}
            onClick={() => {
              setSelectedTower(tower);
              setActiveUnitId(null);
            }}
            className={`rounded-lg px-6 h-8 text-xs font-bold uppercase tracking-wider border transition cursor-pointer duration-200 phone-landscape:px-3 phone-landscape:h-6 phone-landscape:text-[9px] phone-landscape:rounded-md ${
              selectedTower === tower
                ? "bg-white text-black border-transparent"
                : "bg-black/40 text-white border-white/10 backdrop-blur-md hover:bg-black/60 hover:border-white/20"
            }`}
          >
            {tower}
          </button>
        ))}
      </div>
    </div>
  );
}
