"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Map, Building2, Waves, Hotel } from "lucide-react";
import Amenities from "@/components/Amenities";
import Gallery from "@/components/Gallery";
import BottomNavbar from "@/components/BottomNavbar";

export default function AmenitiesPage() {
  const [activeTab, setActiveTab] = useState<"amenities" | "gallery">("amenities");
  const router = useRouter();

  const handleNavigate = (view: string) => {
    if (view === "amenities") return;
    router.push(`/${view}`);
  };

  return (
    <div className="relative h-screen w-screen bg-[#111827] overflow-hidden flex flex-col justify-between">
      {/* Top Tab Bar Wrapper */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30 bg-black/60 border border-white/10 backdrop-blur rounded-full p-1 flex">
        <button
          onClick={() => setActiveTab("amenities")}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
            activeTab === "amenities"
              ? "bg-amber-500 text-black shadow-lg"
              : "text-white/70 hover:text-white"
          }`}
        >
          Key Amenities
        </button>
        <button
          onClick={() => setActiveTab("gallery")}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
            activeTab === "gallery"
              ? "bg-amber-500 text-black shadow-lg"
              : "text-white/70 hover:text-white"
          }`}
        >
          Photo Gallery
        </button>
      </div>

      {/* Main View Area */}
      <div className="flex-1 w-full h-full">
        {activeTab === "amenities" ? (
          <Amenities onNavigate={handleNavigate} />
        ) : (
          <div className="h-full w-full relative bg-gray-900">
            <Gallery />
            
            {/* Center Navigation for Gallery */}
            <BottomNavbar activeItem="amenities" />
          </div>
        )}
      </div>
    </div>
  );
}
