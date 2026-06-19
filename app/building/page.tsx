"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Map, Building2, Waves, Hotel } from "lucide-react";
import FloorPlan from "@/components/FloorPlan";
import BuildingInfo from "@/components/BuildingInfo";

export default function BuildingPage() {
  const [activeTab, setActiveTab] = useState<"floorplan" | "specs">("floorplan");
  const router = useRouter();

  const handleNavigate = (view: string) => {
    if (view === "building") return;
    router.push(`/${view}`);
  };

  return (
    <div className="relative h-screen w-screen bg-[#111827] overflow-hidden flex flex-col justify-between">
      {/* Top Tab Bar Wrapper */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30 bg-black/60 border border-white/10 backdrop-blur rounded-full p-1 flex">
        <button
          onClick={() => setActiveTab("floorplan")}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
            activeTab === "floorplan"
              ? "bg-amber-500 text-black shadow-lg"
              : "text-white/70 hover:text-white"
          }`}
        >
          Interactive Floor Plan
        </button>
        <button
          onClick={() => setActiveTab("specs")}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
            activeTab === "specs"
              ? "bg-amber-500 text-black shadow-lg"
              : "text-white/70 hover:text-white"
          }`}
        >
          Project Details
        </button>
      </div>

      {/* Main View Area */}
      <div className="flex-1 w-full h-full">
        {activeTab === "floorplan" ? (
          <div className="h-full w-full relative">
            <FloorPlan />
            
            {/* Overlay Navigation for FloorPlan */}
            <div className="absolute bottom-6 left-7 z-20">
              <div className="flex overflow-hidden rounded-lg border border-white/10 bg-[#29343B]/95 backdrop-blur">
                <button
                  className="flex items-center gap-2 px-6 py-4 text-white/70 hover:bg-white/5"
                  onClick={() => handleNavigate("location")}
                >
                  <Map size={18} />
                  Location
                </button>

                <button
                  className="border-l border-white/10 flex items-center gap-2 bg-white px-6 py-4 text-sm text-black"
                  onClick={() => handleNavigate("building")}
                >
                  <Building2 size={18} />
                  Building
                </button>

                <button
                  className="border-l border-white/10 flex items-center gap-2 px-6 py-4 text-white/70 hover:bg-white/5"
                  onClick={() => handleNavigate("drone")}
                >
                  <Waves size={18} />
                  Drone View
                </button>

                <button
                  className="border-l border-white/10 flex items-center gap-2 px-6 py-4 text-white/70 hover:bg-white/5"
                  onClick={() => handleNavigate("amenities")}
                >
                  <Hotel size={18} />
                  Amenities
                </button>
              </div>
            </div>
          </div>
        ) : (
          <BuildingInfo onNavigate={handleNavigate} />
        )}
      </div>
    </div>
  );
}
