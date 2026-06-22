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
  "Tower 1": [
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
  "Tower 2": [
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
  "Tower 3": [
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
    "Tower 1" | "Tower 2" | "Tower 3"
  >("Tower 1");

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
      <GlobalNavbar currentPage="apartments" showRERA={false} />

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
      <div className="absolute top-[80px] bottom-[100px] left-4 lg:left-[360px] right-4 lg:right-8 flex items-center justify-center p-4">
        <div className="relative w-full max-w-[1000px] max-h-full aspect-[1400/900] flex items-center justify-center">
          <Image
            src={activePlan.image}
            alt=""
            fill
            priority
            sizes="(max-width: 1000px) 100vw, 1000px"
            className={`object-contain transition-all duration-500 ${
              showOverlay ? "opacity-100" : "opacity-20"
            }`}
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavbar activeItem="apartments" />

      {/* Towers */}
      <div className="absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-2">
        {(
          Object.keys(towerConfigs) as Array<"Tower 1" | "Tower 2" | "Tower 3">
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
