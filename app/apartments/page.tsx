"use client";

import { useState, useMemo } from "react";
import { RotateCcw, Building2, Grid3X3, Trees } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import GlobalNavbar from "@/components/GlobalNavbar";
import BottomNavbar from "@/components/BottomNavbar";
import Sidebar, {
  createSidebarSections,
  createSidebarItems,
} from "@/components/Sidebar";

// Tower configurations based on actual folder structure
const towerConfigs = {
  "Tower A": [
    {
      id: "flat-1",
      title: "Flat 1 - 3 BHK",
      area: "824 sq.ft",
      image: "/gallery/Tower A/tower1-flat-1-3bhk.jpg",
      type: "3bhk",
    },
    {
      id: "flat-2_3",
      title: "Flat 2 & 3 - 2 BHK",
      area: "756 sq.ft",
      image: "/gallery/Tower A/tower1-flat-2_3-2bhk.jpg",
      type: "2bhk",
    },
    {
      id: "flat-4",
      title: "Flat 4 - 3 BHK",
      area: "824 sq.ft",
      image: "/gallery/Tower A/tower1-flat-4-3bhk.jpg",
      type: "3bhk",
    },
    {
      id: "flat-5",
      title: "Flat 5 - 2 BHK",
      area: "756 sq.ft",
      image: "/gallery/Tower A/tower1-flat-5-2bhk.jpg",
      type: "2bhk",
    },
    {
      id: "flat-6",
      title: "Flat 6 - 3 BHK",
      area: "824 sq.ft",
      image: "/gallery/Tower A/tower1-flat-6-3bhk.jpg",
      type: "3bhk",
    },
    {
      id: "master",
      title: "Master Floor Plan",
      area: "Complete Tower",
      image: "/gallery/Tower A/tower1-floor.jpg",
      type: "master",
    },
  ],
  "Tower B": [
    {
      id: "flat-1_2",
      title: "Flat 1 & 2 - 2 BHK",
      area: "756 sq.ft",
      image: "/gallery/Tower B/tower2-flat-1_2-2bhk.jpg",
      type: "2bhk",
    },
    {
      id: "flat-3",
      title: "Flat 3 - 3 BHK",
      area: "810 sq.ft",
      image: "/gallery/Tower B/tower2-flat-3-3bhk.jpg",
      type: "3bhk",
    },
    {
      id: "flat-4",
      title: "Flat 4 - 2 BHK",
      area: "756 sq.ft",
      image: "/gallery/Tower B/tower2-flat-4-2bhk.jpg",
      type: "2bhk",
    },
    {
      id: "flat-5",
      title: "Flat 5 - 3 BHK",
      area: "810 sq.ft",
      image: "/gallery/Tower B/tower2-flat-5-3bhk.jpg",
      type: "3bhk",
    },
    {
      id: "master",
      title: "Master Floor Plan",
      area: "Complete Tower",
      image: "/gallery/Tower B/tower2-floorplan.jpg",
      type: "master",
    },
  ],
  "Tower C": [
    {
      id: "flat-1",
      title: "Flat 1 - 3 BHK",
      area: "835 sq.ft",
      image: "/gallery/Tower C/tower3-flat-1-3bhk.jpg",
      type: "3bhk",
    },
    {
      id: "flat-2_3_4",
      title: "Flat 2, 3 & 4 - 2 BHK",
      area: "756 sq.ft",
      image: "/gallery/Tower C/tower3-flat-2_3_4-2bhk.jpg",
      type: "2bhk",
    },
    {
      id: "flat-5",
      title: "Flat 5 - 2 BHK",
      area: "756 sq.ft",
      image: "/gallery/Tower C/tower3-flat-5-2bhk.jpg",
      type: "2bhk",
    },
    {
      id: "flat-6_7",
      title: "Flat 6 & 7 - 2 BHK",
      area: "756 sq.ft",
      image: "/gallery/Tower C/tower3-flat-6_7-2bhk.jpg",
      type: "2bhk",
    },
    {
      id: "flat-8",
      title: "Flat 8 - 3 BHK",
      area: "835 sq.ft",
      image: "/gallery/Tower C/tower3-flat-8-3bhk.jpg",
      type: "3bhk",
    },
    {
      id: "master",
      title: "Master Floor Plan",
      area: "Complete Tower",
      image: "/gallery/Tower C/tower3-floorplan.jpg",
      type: "master",
    },
  ],
};

export default function ApartmentsPage() {
  const router = useRouter();

  const [selectedTower, setSelectedTower] = useState<
    "Tower A" | "Tower B" | "Tower C"
  >("Tower A");

  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);

  const [showOverlay, setShowOverlay] = useState(true);

  const currentTowerPlans = towerConfigs[selectedTower];
  const activePlan = currentTowerPlans[selectedPlanIndex];

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Background Masterplan */}
      <Image
        src="/gallery/apartment-bg.png"
        alt=""
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/45" />

      {/* Global Navbar */}
      <GlobalNavbar currentPage="apartments" showRERA={true} />

      {/* Sidebar */}
      <Sidebar
        header={{
          title: selectedTower,
          subtitle: "Floor Plans",
        }}
        sections={createSidebarSections([
          {
            id: "floor-plans",
            items: createSidebarItems(
              currentTowerPlans.map((plan, index) => ({
                id: plan.id,
                label: `${plan.title} - ${plan.area}`,
                onClick: () => setSelectedPlanIndex(index),
                isActive: selectedPlanIndex === index,
              })),
            ),
          },
        ])}
        footer={
          <label className="flex items-center gap-3 text-white cursor-pointer">
            <input
              type="checkbox"
              checked={showOverlay}
              onChange={() => setShowOverlay(!showOverlay)}
              className="cursor-pointer"
            />
            Show Floor Overlay
          </label>
        }
      />

      {/* Floorplan Area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[1000px]">
          <Image
            src={activePlan.image}
            alt=""
            width={1400}
            height={900}
            className={`transition-all duration-500 ${
              showOverlay ? "opacity-100" : "opacity-20"
            }`}
          />

          {/* Dynamic Unit Buttons based on selected plan */}
          {activePlan.type !== "master" && (
            <>
              {(() => {
                // Parse the plan ID to determine unit numbers
                const unitMatch = activePlan.id.match(/flat-(\d+)(?:_|$)/);
                const baseUnit = unitMatch ? unitMatch[1] : "1";

                // Check if it's a range (like flat-2_3)
                const isRange = activePlan.id.includes("_");
                const rangeMatch = activePlan.id.match(/flat-(\d+)_(\d+)/);

                let units: number[] = [];
                if (isRange && rangeMatch) {
                  // Create range of units
                  const start = parseInt(rangeMatch[1]);
                  const end = parseInt(rangeMatch[2]);
                  for (let i = start; i <= end; i++) {
                    units.push(i);
                  }
                } else {
                  // Single unit
                  units = [parseInt(baseUnit)];
                }

                const unitPositions = [
                  { top: "35%", left: "30%" },
                  { top: "36%", right: "28%" },
                  { bottom: "26%", right: "30%" },
                  { bottom: "28%", left: "35%" },
                  {
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  },
                ];

                return units.slice(0, 4).map((unitNum, index) => (
                  <button
                    key={unitNum}
                    className="absolute rounded-full bg-black/90 px-5 py-2 text-white"
                    style={
                      unitPositions[index]?.transform
                        ? {
                            top: unitPositions[index].top,
                            left: unitPositions[index].left,
                            transform: unitPositions[index].transform as string,
                          }
                        : {
                            top: unitPositions[index]?.top,
                            right: unitPositions[index]?.right,
                            bottom: unitPositions[index]?.bottom,
                            left: unitPositions[index]?.left,
                          }
                    }
                  >
                    Flat {unitNum}
                  </button>
                ));
              })()}
            </>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavbar activeItem="apartments" />

      {/* Towers */}
      <div className="absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-2">
        {(
          Object.keys(towerConfigs) as Array<"Tower A" | "Tower B" | "Tower C">
        ).map((tower) => (
          <button
            key={tower}
            onClick={() => {
              setSelectedTower(tower);
              setSelectedPlanIndex(0);
            }}
            className={`rounded-lg px-8 py-4 ${
              selectedTower === tower
                ? "bg-white text-black"
                : "bg-black/80 text-white"
            }`}
          >
            {tower}
          </button>
        ))}
      </div>
    </div>
  );
}
