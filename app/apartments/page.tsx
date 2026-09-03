"use client";

import { useState, useEffect } from "react";
import { Grid3X3, Maximize2, Minimize2 } from "lucide-react";
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

// The area the plan frames a selected unit in: everything the navbar, the
// sidebar and the bottom bar leave clear. The plan itself covers the screen
// behind all of them.
const PLAN_FRAME =
  "absolute top-[80px] bottom-[72px] left-4 lg:left-[340px] right-4 lg:right-8 phone-landscape:top-14 phone-landscape:bottom-14 phone-landscape:left-[184px] phone-landscape:right-4";

export default function ApartmentsPage() {
  const [selectedTower, setSelectedTower] = useState<TowerKey>("Tower 1");
  // null = the whole floor; otherwise the unit zoomed into on the plan.
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [isFullscreenActive, setIsFullscreenActive] = useState(
    () => typeof document !== "undefined" && !!document.fullscreenElement,
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
      {/* Floorplan Area — full-bleed. Each export now carries the project
          aerial and its wash baked in, so the plan *is* the page's background
          and covers the screen behind the chrome; only a zoomed unit is held
          inside PLAN_FRAME, clear of the sidebar and the bars. */}
      <div className="absolute inset-0 phone-landscape:touch-none">
        <TowerFloorPlan
          key={planSrc}
          src={planSrc}
          activeUnitId={activeUnitId}
          onSelectUnit={setActiveUnitId}
          frameClassName={PLAN_FRAME}
        />
      </div>

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
