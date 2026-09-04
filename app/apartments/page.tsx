"use client";

import { useState, useEffect } from "react";
import { Building2, Maximize2, Minimize2, Check } from "lucide-react";
import GlobalNavbar from "@/components/GlobalNavbar";
import BottomNavbar from "@/components/BottomNavbar";
import Sidebar from "@/components/Sidebar";
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
    { id: "unit-1", flat: "01", type: "3 BHK", carpet: "1072.80" },
    { id: "unit-2", flat: "02", type: "2 BHK", carpet: "734.40" },
    { id: "unit-3", flat: "03", type: "2 BHK", carpet: "734.40" },
    { id: "unit-4", flat: "04", type: "3 BHK", carpet: "1045.00" },
    { id: "unit-5", flat: "05", type: "2 BHK", carpet: "757.80" },
    { id: "unit-6", flat: "06", type: "3 BHK", carpet: "1097.30" },
  ],
  "Tower 2": [
    { id: "unit-1", flat: "03", type: "3 BHK", carpet: "1047.10" },
    { id: "unit-2", flat: "04", type: "2 BHK", carpet: "734.10" },
    { id: "unit-3", flat: "05", type: "3 BHK", carpet: "1036.40" },
    { id: "unit-4", flat: "01 & 02", type: "2 BHK", carpet: "732.70" },
  ],
  "Tower 3": [
    { id: "unit-1", flat: "05", type: "2 BHK", carpet: "746.50" },
    { id: "unit-2", flat: "06", type: "2 BHK", carpet: "752.10" },
    { id: "unit-3", flat: "07", type: "2 BHK", carpet: "752.10" },
    { id: "unit-4", flat: "08", type: "3 BHK", carpet: "1068.80" },
    { id: "unit-5", flat: "01", type: "3 BHK", carpet: "1101.90" },
    { id: "unit-6", flat: "02", type: "2 BHK", carpet: "757.80" },
    { id: "unit-7", flat: "03 & 04", type: "2 BHK", carpet: "757.80" },
  ],
};

const towerSubtitles: Record<TowerKey, string> = {
  "Tower 1": "Tower 1",
  "Tower 2": "Tower 2",
  "Tower 3": "Tower 3",
};

const towerRotations: Record<TowerKey, number> = {
  "Tower 1": 0,
  "Tower 2": 0,
  "Tower 3": 180,
};

const towerPlans: Record<TowerKey, string> = {
  "Tower 1": "/gallery/Tower A/tower-a.svg",
  "Tower 2": "/gallery/Tower B/tower-b.svg",
  "Tower 3": "/gallery/Tower C/tower-c.svg",
};

const bhkTypes = ["3 BHK", "2 BHK"];

const bhkOptions = [
  { type: "3 BHK", label: "3 BHK Classic Apartment" },
  { type: "2 BHK", label: "2 BHK Classic Apartment" },
];

// The area the plan frames a selected unit in: everything the navbar, the
// sidebar and the bottom bar leave clear. The plan itself covers the screen
// behind all of them.
const PLAN_FRAME =
  "absolute top-[80px] bottom-[72px] left-4 lg:left-[340px] right-4 lg:right-8 phone-landscape:top-14 phone-landscape:bottom-14 phone-landscape:left-[184px] phone-landscape:right-4";

export default function ApartmentsPage() {
  const [selectedTower, setSelectedTower] = useState<TowerKey>("Tower 1");
  const [selectedBhks, setSelectedBhks] = useState<string[]>([]);
  const [isFullscreenActive, setIsFullscreenActive] = useState(
    () => typeof document !== "undefined" && !!document.fullscreenElement,
  );

  const units = towerUnits[selectedTower];
  const planSrc = towerPlans[selectedTower];
  const rotation = towerRotations[selectedTower];

  // Minimum carpet area per BHK type for the current tower
  const getBhkMinArea = (bhk: string) => {
    const matchingUnits = units.filter((u) => u.type === bhk);
    if (!matchingUnits.length) return "";
    const min = Math.min(...matchingUnits.map((u) => parseFloat(u.carpet)));
    return `from ${Math.round(min)} sq.ft`;
  };

  const toggleBhk = (bhkType: string) => {
    setSelectedBhks((prev) =>
      prev.includes(bhkType)
        ? prev.filter((t) => t !== bhkType)
        : [...prev, bhkType],
    );
  };

  const hiddenOverlayUnitIds = units
    .filter((unit) => selectedBhks.includes(unit.type))
    .map((unit) => unit.id);

  // Fullscreens `document.documentElement`, not this page's own div — that's
  // the one element that survives client-side navigation, so switching pages
  // (BottomNavbar links, etc) no longer forces an exit from fullscreen.
  const requestFullscreen = () => {
    if (document.fullscreenElement) return;
    const target = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => void;
    };
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
    const onFullscreenChange = () =>
      setIsFullscreenActive(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Floorplan Area — full-bleed. Each export now carries the project
          aerial and its wash baked in, so the plan *is* the page's background
          and covers the screen behind the chrome; only a zoomed unit is held
          inside PLAN_FRAME, clear of the sidebar and the bars. */}
      <div className="absolute inset-0 phone-landscape:touch-none">
        <TowerFloorPlan
          key={`${planSrc}-${rotation}`}
          src={planSrc}
          rotation={rotation}
          hiddenOverlayUnitIds={hiddenOverlayUnitIds}
          onToggleUnit={(unitId) => {
            const unit = units.find((u) => u.id === unitId);
            if (unit) toggleBhk(unit.type);
          }}
          frameClassName={PLAN_FRAME}
        />
      </div>

      {/* Global Navbar */}
      <GlobalNavbar currentPage="apartments" showRERA={false} />

      {/* Sidebar — shows unique BHK start-from areas and BHK selection checkboxes */}
      <Sidebar
        isFullscreenActive={isFullscreenActive}
        width="w-[280px] phone-landscape:w-[170px]"
        header={{
          icon: Building2,
          subtitle: towerSubtitles[selectedTower],
          title: "Floor Plans",
          description:
            "Explore our diverse offerings and find your ideal living space.",
        }}
      >
        {/* Starting from (Unique BHKs, non-clickable) */}
        <div className="space-y-2 py-0.5">
          {bhkTypes.map((type) => (
            <div
              key={type}
              className="flex items-center justify-between text-[14px] font-medium phone-landscape:text-[10.5px]"
            >
              <span className="text-white">{type}</span>
              <span className="text-[#C7C7C7] font-normal">
                {getBhkMinArea(type)}
              </span>
            </div>
          ))}
        </div>

        <hr className="border-[#596164]/50 my-3 phone-landscape:my-2" />

        {/* Selectable BHK options (refer ui for select box ui) */}
        <div className="space-y-1.5">
          {bhkOptions.map((bhk) => {
            const isSelected = selectedBhks.includes(bhk.type);
            return (
              <button
                key={bhk.type}
                type="button"
                onClick={() => toggleBhk(bhk.type)}
                className={`w-full px-3 py-2 flex items-center gap-3 text-left transition-all duration-150 rounded-[6px] cursor-pointer phone-landscape:px-2 phone-landscape:py-1.5 phone-landscape:gap-2 ${
                  isSelected
                    ? "bg-black/35 text-white font-medium shadow-inner"
                    : "text-[#D2D2D2] hover:bg-black/15 hover:text-white"
                }`}
              >
                <div
                  className={`w-[18px] h-[18px] rounded-[4px] shrink-0 flex items-center justify-center transition-all phone-landscape:w-3.5 phone-landscape:h-3.5 ${
                    isSelected
                      ? "bg-[#CEC3AE] text-black shadow-sm"
                      : "bg-[#A69279]/60 border border-[#A69279]"
                  }`}
                >
                  {isSelected && (
                    <Check
                      size={12}
                      className="text-black stroke-[3] phone-landscape:w-2.5 phone-landscape:h-2.5"
                    />
                  )}
                </div>
                <span className="text-[14px] font-normal phone-landscape:text-[10.5px]">
                  {bhk.label}
                </span>
              </button>
            );
          })}
        </div>
      </Sidebar>

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
