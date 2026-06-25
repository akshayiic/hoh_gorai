"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Map, Building2, Waves, Hotel, Home, HelpCircle } from "lucide-react";
import dynamic from "next/dynamic";

const InteriorTour = dynamic(() => import("./InteriorTour"), { ssr: false });
import BottomNavbar from "@/components/BottomNavbar";
import GlobalNavbar from "@/components/GlobalNavbar";

interface HotspotConfig {
  pitch: number;
  yaw: number;
  targetScene: string;
  label: string;
}

interface SceneConfig {
  name: string;
  image: string;
  yaw: number;
  pitch: number;
  hotspots: HotspotConfig[];
}

const scenes: Record<string, SceneConfig> = {
  "entrance": {
    name: "Main Entrance",
    image: "/panoramas/entrance.jpg",
    yaw: 0,
    pitch: 0,
    hotspots: [
      { pitch: -5, yaw: 30, targetScene: "living-room", label: "Walk to Living Room" }
    ]
  },
  "living-room": {
    name: "Spacious Living Room",
    image: "/panoramas/living-room.jpg",
    yaw: 0,
    pitch: 0,
    hotspots: [
      { pitch: -5, yaw: 180, targetScene: "entrance", label: "Go to Entrance" },
      { pitch: -5, yaw: -90, targetScene: "kitchen", label: "Go to Kitchen" },
      { pitch: -5, yaw: 90, targetScene: "bedroom", label: "Go to Master Bedroom" },
      { pitch: -8, yaw: 0, targetScene: "balcony", label: "Step out to Balcony" }
    ]
  },
  "kitchen": {
    name: "Modern Kitchen",
    image: "/panoramas/kitchen.jpg",
    yaw: 0,
    pitch: 0,
    hotspots: [
      { pitch: -5, yaw: 90, targetScene: "living-room", label: "Back to Living Room" }
    ]
  },
  "bedroom": {
    name: "Master Bedroom",
    image: "/panoramas/bedroom.jpg",
    yaw: 0,
    pitch: 0,
    hotspots: [
      { pitch: -5, yaw: -90, targetScene: "living-room", label: "Back to Living Room" }
    ]
  },
  "balcony": {
    name: "Scenic Balcony",
    image: "/panoramas/balcony.jpg",
    yaw: 0,
    pitch: 0,
    hotspots: [
      { pitch: -5, yaw: 180, targetScene: "living-room", label: "Back to Living Room" }
    ]
  }
};

const miniPlanRooms = [
  { id: "entrance", name: "Entrance", x: 10, y: 55, width: 20, height: 25, color: "#3b82f6" },
  { id: "living-room", name: "Living", x: 32, y: 55, width: 30, height: 25, color: "#10b981" },
  { id: "kitchen", name: "Kitchen", x: 64, y: 55, width: 20, height: 25, color: "#f59e0b" },
  { id: "bedroom", name: "Bedroom", x: 32, y: 20, width: 30, height: 30, color: "#8b5cf6" },
  { id: "balcony", name: "Balcony", x: 64, y: 20, width: 25, height: 25, color: "#ec4899" },
];

interface VirtualTourViewerProps {
  sceneId: string;
}

export default function VirtualTourViewer({ sceneId }: VirtualTourViewerProps) {
  const router = useRouter();
  const currentSceneId = scenes[sceneId] ? sceneId : "entrance";
  const scene = scenes[currentSceneId];
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleNavigate = (view: string) => {
    router.push(`/${view}`);
  };

  const handleSceneChange = (targetScene: string) => {
    router.push(`/tour/${targetScene}`);
  };

  if (!isClient) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center text-white">
        <p className="text-lg">Initializing Virtual Tour...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden font-sans text-white">
      {/* Dynamic 360 Panorama */}
      <div className="absolute inset-0 h-full w-full">
        <InteriorTour scene={scene} onSceneChange={handleSceneChange} />
      </div>

      {/* Global Navbar */}
      <GlobalNavbar currentPage="tour" />

      {/* Tour Information */}
      <div className="absolute top-20 left-7 z-20 flex items-center gap-3 rounded-md border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md">
        <div className="flex h-10 w-10 items-center justify-center rounded bg-white/10">
          <Building2 size={20} className="text-white" />
        </div>
        <div>
          <p className="text-xs tracking-[0.3em] text-amber-500 font-semibold uppercase">360° Interior Tour</p>
          <h3 className="text-lg font-semibold text-white">{scene.name}</h3>
        </div>
      </div>

      {/* MINI FLOOR PLAN IN CORNER */}
      <div className="absolute bottom-24 right-6 z-20 bg-black/40 border border-white/10 rounded-xl p-4 w-[240px] backdrop-blur-md shadow-2xl">
        <h4 className="text-xs text-white/50 uppercase tracking-widest mb-3 font-semibold text-center">Mini Floor Plan</h4>
        <div className="relative aspect-[4/3] w-full bg-slate-900/50 rounded-lg border border-white/5 overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Grid */}
            <defs>
              <pattern id="mini-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.05" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#mini-grid)" />
            
            {/* Rooms */}
            {miniPlanRooms.map((room) => {
              const isCurrent = room.id === currentSceneId;
              return (
                <g 
                  key={room.id} 
                  onClick={() => handleSceneChange(room.id)}
                  className="cursor-pointer"
                >
                  <rect
                    x={room.x}
                    y={room.y}
                    width={room.width}
                    height={room.height}
                    fill={room.color}
                    fillOpacity={isCurrent ? 0.8 : 0.25}
                    stroke={isCurrent ? "#f59e0b" : "#4b5563"}
                    strokeWidth={isCurrent ? 1.5 : 0.8}
                    className="transition-all hover:fill-opacity-50"
                  />
                  <text
                    x={room.x + room.width / 2}
                    y={room.y + room.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isCurrent ? "#ffffff" : "#cbd5e1"}
                    fontSize="5"
                    fontWeight={isCurrent ? "bold" : "normal"}
                    className="pointer-events-none select-none"
                  >
                    {room.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <p className="text-[10px] text-white/40 text-center mt-2">
          Click any room above to jump directly
        </p>
      </div>

      {/* Instructions */}
      <div className="absolute top-24 left-7 z-20 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5">
        <HelpCircle size={14} className="text-amber-500" />
        <span>Drag to pan 360° view • Scroll to zoom</span>
      </div>

      {/* BOTTOM NAV */}
      <BottomNavbar activeItem="apartments" />
    </div>
  );
}
