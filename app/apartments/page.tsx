"use client";

import { useState, useEffect } from "react";
import { Building2, Home, Maximize2, Minimize2 } from "lucide-react";
import GlobalNavbar from "@/components/GlobalNavbar";
import BottomNavbar from "@/components/BottomNavbar";
import Sidebar, {
  createSidebarItems,
  createSidebarSections,
} from "@/components/Sidebar";
import TowerFloorPlan from "@/components/TowerFloorPlan";

type TowerKey = "Tower 2" | "Tower 3";

interface TowerUnit {
  id: string;
  flat: string;
  type: string;
  carpet: string;
}

interface FlatItem {
  id: string;
  label: string;
  unitIds: string[];
}

interface TowerBhkFlats {
  "2 BHK": FlatItem[];
  "3 BHK": FlatItem[];
}

const towerUnits: Record<TowerKey, TowerUnit[]> = {
  "Tower 2": [
    { id: "unit-1", flat: "02", type: "2 BHK", carpet: "729" },
    { id: "unit-2", flat: "03", type: "3 BHK", carpet: "1044" },
    { id: "unit-3", flat: "04", type: "2 BHK", carpet: "730" },
    { id: "unit-4", flat: "05", type: "3 BHK", carpet: "1033" },
    { id: "unit-5", flat: "01", type: "2 BHK", carpet: "729" },
  ],
  "Tower 3": [
    { id: "unit-1", flat: "05", type: "2 BHK", carpet: "743" },
    { id: "unit-2", flat: "06", type: "2 BHK", carpet: "749" },
    { id: "unit-3", flat: "07", type: "2 BHK", carpet: "749" },
    { id: "unit-4", flat: "08", type: "3 BHK", carpet: "1064" },
    { id: "unit-5", flat: "01", type: "3 BHK", carpet: "1097" },
    { id: "unit-6", flat: "02", type: "2 BHK", carpet: "754" },
    { id: "unit-7", flat: "03 & 04", type: "2 BHK", carpet: "754" },
  ],
};

const towerRotations: Record<TowerKey, number> = {
  "Tower 2": 0,
  "Tower 3": 0,
};

const towerPlans: Record<TowerKey, string> = {
  "Tower 2": "/gallery/Tower B/tower-b.svg",
  "Tower 3": "/gallery/Tower C/tower-c.svg",
};

const towerFlats: Record<TowerKey, TowerBhkFlats> = {
  "Tower 2": {
    "2 BHK": [
      {
        id: "t2-2bhk-729",
        label: "2BHK - 729 sqft",
        unitIds: ["unit-1"],
      },
      {
        id: "t2-2bhk-730",
        label: "2BHK - 730 sqft",
        unitIds: ["unit-5"],
      },
    ],
    "3 BHK": [
      {
        id: "t2-3bhk-1044",
        label: "3BHK - 1044 sqft",
        unitIds: ["unit-2"],
      },
      {
        id: "t2-3bhk-1033",
        label: "3BHK - 1033 sqft",
        unitIds: ["unit-4"],
      },
    ],
  },
  "Tower 3": {
    "2 BHK": [
      {
        id: "t3-2bhk-754",
        label: "2BHK - 754 sqft",
        unitIds: ["unit-6", "unit-7"],
      },
      {
        id: "t3-2bhk-743",
        label: "2BHK - 743 sqft",
        unitIds: ["unit-1"],
      },
      {
        id: "t3-2bhk-749",
        label: "2BHK - 749 sqft",
        unitIds: ["unit-2", "unit-3"],
      },
    ],
    "3 BHK": [
      {
        id: "t3-3bhk-1097",
        label: "3BHK - 1097 sqft",
        unitIds: ["unit-5"],
      },
      {
        id: "t3-3bhk-1064",
        label: "3BHK - 1064 sqft",
        unitIds: ["unit-4"],
      },
    ],
  },
};

const towerSectionOrder: Record<TowerKey, ("3 BHK" | "2 BHK")[]> = {
  "Tower 2": ["3 BHK", "2 BHK"],
  "Tower 3": ["3 BHK", "2 BHK"],
};

const towerZoomMultipliers: Record<TowerKey, Record<string, number>> = {
  "Tower 2": {},
  "Tower 3": {},
};

const PLAN_FRAME =
  "absolute top-[80px] bottom-[72px] left-4 lg:left-[270px] right-4 lg:right-8 phone-landscape:top-14 phone-landscape:bottom-14 phone-landscape:left-[170px] phone-landscape:right-4";

export default function ApartmentsPage() {
  const [selectedTower, setSelectedTower] = useState<TowerKey>("Tower 2");
  const [activeUnitIds, setActiveUnitIds] = useState<string[] | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    "2-bhk": true,
    "3-bhk": true,
  });
  const [resetKey, setResetKey] = useState<number>(0);
  const [isFullscreenActive, setIsFullscreenActive] = useState(
    () => typeof document !== "undefined" && !!document.fullscreenElement
  );

  const planSrc = towerPlans[selectedTower];
  const rotation = towerRotations[selectedTower];
  const currentTowerFlats = towerFlats[selectedTower];

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleSelectUnit = (unitId: string | null) => {
    if (!unitId) {
      setActiveUnitIds(null);
      return;
    }
    const allFlats = [
      ...currentTowerFlats["2 BHK"],
      ...currentTowerFlats["3 BHK"],
    ];
    const matchedFlat = allFlats.find((f) => f.unitIds.includes(unitId));
    if (!matchedFlat) {
      setActiveUnitIds([unitId]);
      return;
    }

    const isAlreadyActive =
      activeUnitIds !== null &&
      activeUnitIds.length === matchedFlat.unitIds.length &&
      matchedFlat.unitIds.every((id) => activeUnitIds.includes(id));

    if (isAlreadyActive) {
      setActiveUnitIds(null);
    } else {
      setActiveUnitIds(matchedFlat.unitIds);
      const is2Bhk = currentTowerFlats["2 BHK"].some(
        (f) => f.id === matchedFlat.id
      );
      setExpandedSections((prev) => ({
        ...prev,
        [is2Bhk ? "2-bhk" : "3-bhk"]: true,
      }));
    }
  };

  const handleSelectFlat = (flat: FlatItem) => {
    const isAlreadyActive =
      activeUnitIds !== null &&
      activeUnitIds.length === flat.unitIds.length &&
      flat.unitIds.every((id) => activeUnitIds.includes(id));

    setActiveUnitIds(isAlreadyActive ? null : flat.unitIds);
  };

  const isFlatActive = (flat: FlatItem) => {
    if (!activeUnitIds) return false;
    return flat.unitIds.some((id) => activeUnitIds.includes(id));
  };

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
      {/* Floorplan Area — full-bleed clean master layout */}
      <div className="absolute inset-0 phone-landscape:touch-none">
        <TowerFloorPlan
          key={`${planSrc}-${rotation}`}
          src={planSrc}
          rotation={rotation}
          activeUnitId={activeUnitIds}
          onSelectUnit={handleSelectUnit}
          resetKey={resetKey}
          unitZoomMultipliers={towerZoomMultipliers[selectedTower]}
          frameClassName={PLAN_FRAME}
        />
      </div>

      {/* Global Navbar with Go Back and Reset (Show Master Plan) */}
      <GlobalNavbar
        currentPage="apartments"
        showRERA={false}
        showReset={true}
        onReset={() => {
          setActiveUnitIds(null);
          setResetKey((k) => k + 1);
        }}
        resetTitle="Show Master Plan"
        resetLabel="Reset"
      />

      {/* Sidebar — 2 BHK & 3 BHK collapsible accordions with Explore Inventory subtitle above Apartments */}
      <Sidebar
        isFullscreenActive={isFullscreenActive}
        width="w-[230px] phone-landscape:w-[155px]"
        header={{
          icon: Building2,
          title: "Explore Inventory",
        }}
        sections={createSidebarSections(
          towerSectionOrder[selectedTower].map((bhkKey) => {
            const sectionId = bhkKey === "2 BHK" ? "2-bhk" : "3-bhk";
            return {
              id: sectionId,
              title: bhkKey,
              isCollapsible: true,
              isExpanded: expandedSections[sectionId] ?? true,
              onHeaderClick: () => toggleSection(sectionId),
              items: createSidebarItems(
                currentTowerFlats[bhkKey].map((flat) => ({
                  id: flat.id,
                  label: flat.label,
                  icon: Home,
                  onClick: () => handleSelectFlat(flat),
                  isActive: isFlatActive(flat),
                }))
              ),
            };
          })
        )}
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

      {/* Towers — Only Tower 2 and Tower 3 */}
      <div className="absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-2 phone-landscape:bottom-3 phone-landscape:gap-1">
        {(Object.keys(towerUnits) as TowerKey[]).map((tower) => (
          <button
            key={tower}
            onClick={() => {
              setSelectedTower(tower);
              setActiveUnitIds(null);
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
