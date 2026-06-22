"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Maximize2 } from "lucide-react";
import BottomNavbar from "@/components/BottomNavbar";
import GlobalNavbar from "@/components/GlobalNavbar";
import Sidebar, {
  createSidebarSections,
  createSidebarItems,
} from "@/components/Sidebar";


interface BalconyScene {
  id: string;
  name: string;
  size: Array<{ tileSize: number; size: number; fallbackOnly?: boolean }>;
  initialView: {
    yaw: number;
    pitch: number;
    fov: number;
  };
}

// Floor data extracted from folder structure
// Each folder name is like "0-43" where first number is sr_number, second is floor number
// We extract floor number and sort by it
const extractFloorsFromStructure = () => {
  const towers = {
    "Tower 1": [
      { id: "0-43", floor: 43 },
      { id: "10-2", floor: 2 },
      { id: "1-38", floor: 38 },
      { id: "2-28", floor: 28 },
      { id: "3-23", floor: 23 },
      { id: "4-48", floor: 48 },
      { id: "5-8", floor: 8 },
      { id: "6-18", floor: 18 },
      { id: "7-33", floor: 33 },
      { id: "8-13", floor: 13 },
    ],
    "Tower 2": [
      { id: "0-33", floor: 33 },
      { id: "10-38", floor: 38 },
      { id: "1-8", floor: 8 },
      { id: "2-2", floor: 2 },
      { id: "3-28", floor: 28 },
      { id: "4-43", floor: 43 },
      { id: "5-48", floor: 48 },
      { id: "6-13", floor: 13 },
      { id: "7-23", floor: 23 },
      { id: "8-18", floor: 18 },
    ],
    "Tower 3": [
      { id: "0-33", floor: 33 },
      { id: "10-38", floor: 38 },
      { id: "2-8", floor: 8 },
      { id: "3-23", floor: 23 },
      { id: "4-18", floor: 18 },
      { id: "5-48", floor: 48 },
      { id: "6-43", floor: 43 },
      { id: "7-13", floor: 13 },
      { id: "8-2", floor: 2 },
      { id: "9-28", floor: 28 },
    ],
  };

  // Sort floors by floor number
  Object.keys(towers).forEach(towerKey => {
    towers[towerKey as keyof typeof towers].sort((a, b) => a.floor - b.floor);
  });

  return towers;
};

const towerFloors = extractFloorsFromStructure();

export default function BalconyView() {
  const [selectedTower, setSelectedTower] = useState<"Tower 1" | "Tower 2" | "Tower 3">("Tower 1");
  const [currentFloorIndex, setCurrentFloorIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const viewerRef = useRef<any>(null);
  const panoRef = useRef<HTMLDivElement>(null);
  const marzipanoRef = useRef<any>(null);
  const allScenesRef = useRef<any>({});

  const currentTowerFloors = towerFloors[selectedTower];
  const currentFloor = currentTowerFloors[currentFloorIndex];

  useEffect(() => {
    let mounted = true;

    const initializeMarzipano = async () => {
      try {
        // Dynamic import of Marzipano
        const Marzipano = (await import("marzipano")).default;

        if (!mounted || !panoRef.current) return;

        // Create viewer
        const viewer = new Marzipano.Viewer(panoRef.current, {
          controls: {
            mouseViewMode: "drag", // drag|qtvr
          },
        });

        viewerRef.current = viewer;

        // Store scenes reference
        const allScenes: any = {};
        allScenesRef.current = allScenes;

        // URL prefix for tiles based on selected tower
        const getTowerPath = (tower: string) => {
          if (tower === "Tower 1") return "tower1";
          if (tower === "Tower 2") return "tower2";
          if (tower === "Tower 3") return "tower3";
          return "tower1";
        };

        // Create scene function matching the reference implementation
        const create360Scene = (sceneId: string, towerPath: string) => {
          const scenePath = `morning/${towerPath}/app-files/tiles/${sceneId}`;

          const source = Marzipano.ImageUrlSource.fromString(
            `/balcony-shoots/${scenePath}/{z}/{f}/{y}/{x}.jpg`,
            { cubeMapPreviewUrl: `/balcony-shoots/${scenePath}/preview.jpg` }
          );

          const size = [
            { tileSize: 256, size: 256, fallbackOnly: true },
            { tileSize: 512, size: 512 },
            { tileSize: 512, size: 1024 },
            { tileSize: 512, size: 2048 },
            { tileSize: 512, size: 4096 },
          ];

          const geometry = new Marzipano.CubeGeometry(size);

          const limiter = Marzipano.RectilinearView.limit.traditional(
            3840,
            (130 * Math.PI) / 180
          );

          const initialView = {
            yaw: 0,
            pitch: 0,
            fov: (130 * Math.PI) / 180,
          };

          const view = new Marzipano.RectilinearView(initialView, limiter);

          const scene = viewer.createScene({
            source: source,
            geometry: geometry,
            view: view,
            pinFirstLevel: true,
          });

          allScenes[sceneId] = {
            source,
            view,
            scene,
          };
        };

        // Initialize scenes for all towers and floors
        Object.entries(towerFloors).forEach(([towerName, floors]) => {
          const towerPath = getTowerPath(towerName);
          floors.forEach((floorData) => {
            create360Scene(floorData.id, towerPath);
          });
        });

        // Load current floor scene
        const currentSceneId = currentFloor?.id;
        if (currentSceneId && allScenes[currentSceneId]) {
          allScenes[currentSceneId].scene
            .switchTo()
            .then(() => {
              if (mounted) setIsLoading(false);
            })
            .catch(() => {
              if (mounted) setIsLoading(false);
            });
        } else {
          if (mounted) setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to initialize Marzipano:", error);
        if (mounted) setIsLoading(false);
      }
    };

    initializeMarzipano();

    return () => {
      mounted = false;
    };
  }, [selectedTower, currentFloorIndex]);

  const switchFloor = (index: number) => {
    const floorData = currentTowerFloors[index];
    if (floorData && allScenesRef.current[floorData.id]) {
      setCurrentFloorIndex(index);
      allScenesRef.current[floorData.id].scene.switchTo();
    }
  };

  const handleTowerChange = (tower: "Tower 1" | "Tower 2" | "Tower 3") => {
    setSelectedTower(tower);
    setCurrentFloorIndex(0);
  };

  return (
    <div className="h-screen w-screen bg-black">
      {/* Global Navbar */}
      <GlobalNavbar currentPage="balcony" showRERA={false} />

      {/* Main Marzipano Viewer */}
      <div className="h-full w-full relative">
        <div
          ref={panoRef}
          id="balcony-pano"
          className="w-full h-full"
          style={{ width: "100%", height: "100%" }}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
            <div className="text-white text-lg">Loading Balcony View...</div>
          </div>
        )}
      </div>

      {/* SIDEBAR */}
      <Sidebar
        header={{
          title: selectedTower,
          subtitle: "Balcony Views - Floors",
        }}
        sections={createSidebarSections([
          {
            id: "floors",
            items: createSidebarItems(
              currentTowerFloors.map((floorData, index) => ({
                id: floorData.id,
                label: `Floor ${floorData.floor}`,
                onClick: () => {
                  switchFloor(index);
                },
                isActive: currentFloorIndex === index,
              }))
            ),
          },
        ])}
      />

      {/* Fullscreen Toggle */}
      <button
        onClick={() => document.documentElement.requestFullscreen()}
        className="absolute bottom-4 right-4 z-50 bg-black/50 text-white p-2 rounded-lg hover:bg-black/70"
        title="Fullscreen"
      >
        <Maximize2 size={20} />
      </button>

      {/* Tower Selection Buttons */}
      <div className="absolute bottom-24 left-1/2 z-40 flex -translate-x-1/2 gap-2">
        {(Object.keys(towerFloors) as Array<"Tower 1" | "Tower 2" | "Tower 3">).map((tower) => (
          <button
            key={tower}
            onClick={() => handleTowerChange(tower)}
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

      {/* BOTTOM NAV */}
      <BottomNavbar activeItem="balcony" />
    </div>
  );
}
