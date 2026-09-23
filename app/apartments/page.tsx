"use client";

import { useState, useEffect, useRef } from "react";
import {
  Building2,
  Home,
  Maximize2,
  Minimize2,
  Plus,
  Minus,
} from "lucide-react";
import GlobalNavbar from "@/components/GlobalNavbar";
import BottomNavbar from "@/components/BottomNavbar";
import Sidebar, {
  createSidebarItems,
  createSidebarSections,
} from "@/components/Sidebar";
import TowerFloorPlan, {
  TowerFloorPlanHandle,
} from "@/components/TowerFloorPlan";

type TowerKey = "Master Layout" | "Tower 2" | "Tower 3";

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

type BhkCategory = "3 BHK" | "2 BHK" | "Refuge";

type TowerBhkFlats = Partial<Record<BhkCategory, FlatItem[]>>;

const towerUnits: Record<TowerKey, TowerUnit[]> = {
  "Master Layout": [],
  "Tower 2": [
    { id: "unit-1", flat: "02", type: "2 BHK", carpet: "729" },
    { id: "unit-2", flat: "03", type: "Refuge", carpet: "1044" },
    { id: "unit-3", flat: "04", type: "3 BHK", carpet: "1044" },
    { id: "unit-4", flat: "05", type: "3 BHK", carpet: "1033" },
    { id: "unit-5", flat: "01", type: "2 BHK", carpet: "730" },
  ],
  "Tower 3": [
    { id: "unit-1", flat: "05", type: "2 BHK", carpet: "743" },
    { id: "unit-2", flat: "06", type: "2 BHK", carpet: "749" },
    { id: "unit-3", flat: "08", type: "Refuge", carpet: "1064" },
    { id: "unit-4", flat: "01", type: "3 BHK", carpet: "1097" },
    { id: "unit-5", flat: "02", type: "2 BHK", carpet: "754" },
    { id: "unit-6", flat: "03 & 04", type: "2 BHK", carpet: "754" },
  ],
};

const towerRotations: Record<TowerKey, number> = {
  "Master Layout": 0,
  "Tower 2": 0,
  "Tower 3": 0,
};

const towerPlans: Record<TowerKey, { standard: string; refuge: string }> = {
  "Master Layout": {
    standard: "/gallery/Tower A/master-layout.svg",
    refuge: "/gallery/Tower A/master-layout.svg",
  },
  "Tower 2": {
    standard: "/gallery/Tower B/tower-b.svg",
    refuge: "/gallery/Tower B/tower-b-refuge.svg",
  },
  "Tower 3": {
    standard: "/gallery/Tower C/tower-c.svg",
    refuge: "/gallery/Tower C/tower-c-refuge.svg",
  },
};

const towerStandardFlats: Record<TowerKey, TowerBhkFlats> = {
  "Master Layout": {},
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
        id: "t2-3bhk-1033",
        label: "3BHK - 1033 sqft",
        unitIds: ["unit-4"],
      },
      {
        id: "t2-3bhk-1044",
        label: "3BHK - 1044 sqft",
        unitIds: ["unit-2", "unit-3"],
      },
    ],
    Refuge: [
      {
        id: "t2-refuge-1044",
        label: "Refuge Area",
        unitIds: ["unit-2"],
      },
    ],
  },
  "Tower 3": {
    "2 BHK": [
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
      {
        id: "t3-2bhk-754",
        label: "2BHK - 754 sqft",
        unitIds: ["unit-6", "unit-7"],
      },
    ],
    "3 BHK": [
      {
        id: "t3-3bhk-1064",
        label: "3BHK - 1064 sqft",
        unitIds: ["unit-4"],
      },
      {
        id: "t3-3bhk-1097",
        label: "3BHK - 1097 sqft",
        unitIds: ["unit-5"],
      },
    ],
    Refuge: [
      {
        id: "t3-refuge-1064",
        label: "Refuge Area",
        unitIds: ["unit-3"],
      },
    ],
  },
};

const towerRefugeFlats: Record<TowerKey, TowerBhkFlats> = {
  "Master Layout": {},
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
        id: "t2-3bhk-1033",
        label: "3BHK - 1033 sqft",
        unitIds: ["unit-4"],
      },
      {
        id: "t2-3bhk-1044",
        label: "3BHK - 1044 sqft",
        unitIds: ["unit-3"],
      },
    ],
    Refuge: [
      {
        id: "t2-refuge-1044",
        label: "Refuge Area",
        unitIds: ["unit-2"],
      },
    ],
  },
  "Tower 3": {
    "2 BHK": [
      {
        id: "t3-2bhk-743",
        label: "2BHK - 743 sqft",
        unitIds: ["unit-1"],
      },
      {
        id: "t3-2bhk-749",
        label: "2BHK - 749 sqft",
        unitIds: ["unit-2"],
      },
      {
        id: "t3-2bhk-754",
        label: "2BHK - 754 sqft",
        unitIds: ["unit-5", "unit-6"],
      },
    ],
    "3 BHK": [
      {
        id: "t3-3bhk-1064",
        label: "3BHK - 1064 sqft",
        unitIds: ["unit-3"],
      },
      {
        id: "t3-3bhk-1097",
        label: "3BHK - 1097 sqft",
        unitIds: ["unit-4"],
      },
    ],
    Refuge: [
      {
        id: "t3-refuge-1064",
        label: "Refuge Area",
        unitIds: ["unit-3"],
      },
    ],
  },
};

const towerSectionOrder: Record<TowerKey, BhkCategory[]> = {
  "Master Layout": [],
  "Tower 2": ["2 BHK", "3 BHK", "Refuge"],
  "Tower 3": ["2 BHK", "3 BHK", "Refuge"],
};

const towerZoomMultipliers: Record<
  TowerKey,
  { standard: Record<string, number>; refuge: Record<string, number> }
> = {
  "Master Layout": { standard: {}, refuge: {} },
  "Tower 2": {
    standard: {
      "unit-1": 1,
      "unit-5": 1,
      "unit-2": 1,
      "unit-3": 1,
      "unit-4": 1,
    },
    refuge: {
      "unit-1": 1.3,
      "unit-5": 1.3,
      "unit-2": 1.3,
      "unit-3": 1.0,
      "unit-4": 1.3,
    },
  },
  "Tower 3": {
    standard: {
      "unit-1": 1.25,
      "unit-2": 1.25,
      "unit-3": 1.25,
      "unit-4": 1.25,
      "unit-5": 1.15,
      "unit-6": 1.15,
      "unit-7": 1.15,
    },
    refuge: {
      "unit-1": 1.25,
      "unit-2": 1.25,
      "unit-3": 0.5,
      "unit-4": 1.25,
      "unit-5": 1.25,
      "unit-6": 1.25,
    },
  },
};

const towerDefaultTransforms: Record<
  TowerKey,
  { scale: number; shiftX?: number; shiftY?: number; autoCenter?: boolean }
> = {
  "Master Layout": {
    scale: 1,
    shiftX: 0,
    shiftY: 0,
  },
  "Tower 2": {
    scale: 1,
    shiftX: 0,
    shiftY: 0,
  },
  "Tower 3": {
    scale: 1.15,
    autoCenter: true,
    shiftX: -80,
  },
};

const PLAN_FRAME =
  "absolute top-[80px] bottom-[72px] left-4 lg:left-[270px] right-4 lg:right-8 phone-landscape:top-14 phone-landscape:bottom-14 phone-landscape:left-[170px] phone-landscape:right-4";

export default function ApartmentsPage() {
  const planRef = useRef<TowerFloorPlanHandle>(null);
  const [selectedTower, setSelectedTower] = useState<TowerKey>("Master Layout");
  const [activeUnitIds, setActiveUnitIds] = useState<string[] | null>(null);
  const [selectedFlatId, setSelectedFlatId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    "2-bhk": true,
    "3-bhk": true,
  });
  const [isPlanInteracted, setIsPlanInteracted] = useState(false);
  const [resetKey, setResetKey] = useState<number>(0);
  const [isFullscreenActive, setIsFullscreenActive] = useState(
    () => typeof document !== "undefined" && !!document.fullscreenElement
  );

  const isRefugeSelected =
    selectedFlatId !== null && selectedFlatId.includes("refuge");

  const planSrc = isRefugeSelected
    ? towerPlans[selectedTower].refuge
    : towerPlans[selectedTower].standard;
  const rotation = towerRotations[selectedTower];
  const currentTowerFlats = isRefugeSelected
    ? towerRefugeFlats[selectedTower]
    : towerStandardFlats[selectedTower];
  const currentZoomMultipliers = isRefugeSelected
    ? towerZoomMultipliers[selectedTower].refuge
    : towerZoomMultipliers[selectedTower].standard;
  const currentHiddenOverlayUnitIds = isRefugeSelected
    ? selectedTower === "Tower 2"
      ? ["unit-2"]
      : ["unit-3"]
    : [];

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleSelectUnit = (unitId: string | null) => {
    if (!unitId) {
      setActiveUnitIds(null);
      setSelectedFlatId(null);
      return;
    }
    const allFlats = Object.values(currentTowerFlats)
      .filter((flats): flats is FlatItem[] => Array.isArray(flats))
      .flat();
    const matchedFlat = allFlats.find((f) => f.unitIds.includes(unitId));
    if (!matchedFlat) {
      setActiveUnitIds([unitId]);
      setSelectedFlatId(null);
      return;
    }

    const isAlreadyActive = selectedFlatId === matchedFlat.id;

    if (isAlreadyActive) {
      setActiveUnitIds(null);
      setSelectedFlatId(null);
    } else {
      setSelectedFlatId(matchedFlat.id);
      setActiveUnitIds(matchedFlat.unitIds);
      for (const [sectionKey, flats] of Object.entries(currentTowerFlats)) {
        if (flats?.some((f) => f.id === matchedFlat.id)) {
          const slug = sectionKey.toLowerCase().replace(/\s+/g, "-");
          setExpandedSections((prev) => ({
            ...prev,
            [slug]: true,
          }));
          break;
        }
      }
    }
  };

  const handleSelectFlat = (flat: FlatItem) => {
    const isAlreadyActive = selectedFlatId === flat.id;

    if (isAlreadyActive) {
      setActiveUnitIds(null);
      setSelectedFlatId(null);
    } else {
      const willBeRefuge = flat.id.includes("refuge");
      const targetFlats = (
        willBeRefuge ? towerRefugeFlats : towerStandardFlats
      )[selectedTower];
      const allTargetFlats = Object.values(targetFlats)
        .filter((flats): flats is FlatItem[] => Array.isArray(flats))
        .flat();
      const matched = allTargetFlats.find((f) => f.id === flat.id);
      setSelectedFlatId(flat.id);
      setActiveUnitIds(matched ? matched.unitIds : flat.unitIds);
    }
  };

  const isFlatActive = (flat: FlatItem) => {
    if (selectedFlatId) return selectedFlatId === flat.id;
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
          ref={planRef}
          key={`${planSrc}-${rotation}`}
          src={planSrc}
          rotation={rotation}
          fitMode={selectedTower === "Master Layout" ? "contain" : "cover"}
          activeUnitId={activeUnitIds}
          hiddenOverlayUnitIds={currentHiddenOverlayUnitIds}
          onSelectUnit={handleSelectUnit}
          resetKey={resetKey}
          onPlanInteractedChange={setIsPlanInteracted}
          unitZoomMultipliers={currentZoomMultipliers}
          defaultTransform={towerDefaultTransforms[selectedTower]}
          frameClassName={PLAN_FRAME}
          disableUnitZoom={isRefugeSelected}
        />
      </div>

      {/* Global Navbar with Go Back and Reset (Show Master Plan) */}
      <GlobalNavbar
        currentPage="apartments"
        showRERA={false}
        showReset={
          selectedFlatId !== null ||
          (activeUnitIds !== null && activeUnitIds.length > 0) ||
          isPlanInteracted
        }
        onReset={() => {
          setActiveUnitIds(null);
          setSelectedFlatId(null);
          setIsPlanInteracted(false);
          setResetKey((k) => k + 1);
        }}
        resetTitle="Show Master Plan"
        resetLabel="Reset"
      />

      {/* Sidebar */}
      <Sidebar
        isFullscreenActive={isFullscreenActive}
        width="w-[230px] phone-landscape:w-[155px]"
        header={{
          icon: Building2,
          title: "Explore Inventory",
        }}
        sections={
          selectedTower === "Master Layout"
            ? createSidebarSections([
                {
                  id: "master-layout-section",
                  items: createSidebarItems([
                    {
                      id: "master-layout-opt",
                      label: "Master Layout",
                      icon: Home,
                      isActive: true,
                      onClick: () => {
                        setActiveUnitIds(null);
                        setSelectedFlatId(null);
                        setIsPlanInteracted(false);
                        setResetKey((k) => k + 1);
                      },
                    },
                  ]),
                },
              ])
            : createSidebarSections(
                towerSectionOrder[selectedTower].map((bhkKey) => {
                  const sectionId = bhkKey.toLowerCase().replace(/\s+/g, "-");
                  const flats = currentTowerFlats[bhkKey] || [];
                  const isRefuge = bhkKey === "Refuge";
                  return {
                    id: sectionId,
                    title: isRefuge ? undefined : bhkKey,
                    isCollapsible: !isRefuge,
                    isExpanded: isRefuge
                      ? true
                      : expandedSections[sectionId] ?? true,
                    className: isRefuge
                      ? "mt-1 pt-1 border-t border-white/[0.08]"
                      : undefined,
                    onHeaderClick: isRefuge
                      ? undefined
                      : () => toggleSection(sectionId),
                    items: createSidebarItems(
                      flats.map((flat) => ({
                        id: flat.id,
                        label: flat.label,
                        icon: Home,
                        onClick: () => handleSelectFlat(flat),
                        isActive: isFlatActive(flat),
                      }))
                    ),
                  };
                })
              )
        }
      />

      {/* Bottom Navigation */}
      <BottomNavbar activeItem="apartments" />

      {/* Towers */}
      <div className="absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-2 phone-landscape:bottom-3 phone-landscape:gap-1">
        {(Object.keys(towerUnits) as TowerKey[]).map((tower) => (
          <button
            key={tower}
            onClick={() => {
              setSelectedTower(tower);
              setActiveUnitIds(null);
              setSelectedFlatId(null);
              setIsPlanInteracted(false);
              setResetKey((k) => k + 1);
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
