"use client";

import { useEffect, useRef, useState } from "react";
import BottomNavbar from "@/components/BottomNavbar";
import GlobalNavbar from "@/components/GlobalNavbar";
import Sidebar, {
  createSidebarSections,
  createSidebarItems,
} from "@/components/Sidebar";

const allTowersFloors = {
  morning: {
    "Tower 1": [
      { id: "8-13", floor: 13 },
      { id: "6-18", floor: 18 },
      { id: "3-23", floor: 23 },
      { id: "2-28", floor: 28 },
      { id: "7-33", floor: 33 },
      { id: "1-38", floor: 38 },
      { id: "0-43", floor: 43 },
      { id: "4-48", floor: 48 },
    ],
    "Tower 2": [
      { id: "6-13", floor: 13 },
      { id: "8-18", floor: 18 },
      { id: "7-23", floor: 23 },
      { id: "3-28", floor: 28 },
      { id: "0-33", floor: 33 },
      { id: "10-38", floor: 38 },
      { id: "4-43", floor: 43 },
      { id: "5-48", floor: 48 },
    ],
    "Tower 3": [
      { id: "7-13", floor: 13 },
      { id: "4-18", floor: 18 },
      { id: "3-23", floor: 23 },
      { id: "9-28", floor: 28 },
      { id: "0-33", floor: 33 },
      { id: "10-38", floor: 38 },
      { id: "6-43", floor: 43 },
      { id: "5-48", floor: 48 },
    ],
  },
  afternoon: {
    "Tower 1": [
      { id: "2-13", floor: 13 },
      { id: "3-18", floor: 18 },
      { id: "4-23", floor: 23 },
      { id: "5-28", floor: 28 },
      { id: "6-33", floor: 33 },
      { id: "7-38", floor: 38 },
      { id: "8-43", floor: 43 },
      { id: "9-48", floor: 48 },
    ],
    "Tower 2": [
      { id: "2-13", floor: 13 },
      { id: "3-18", floor: 18 },
      { id: "4-23", floor: 23 },
      { id: "5-28", floor: 28 },
      { id: "6-33", floor: 33 },
      { id: "7-38", floor: 38 },
      { id: "8-43", floor: 43 },
      { id: "9-48", floor: 48 },
    ],
    "Tower 3": [
      { id: "2-13", floor: 13 },
      { id: "3-18", floor: 18 },
      { id: "4-23", floor: 23 },
      { id: "5-28", floor: 28 },
      { id: "6-33", floor: 33 },
      { id: "7-38", floor: 38 },
      { id: "8-43", floor: 43 },
      { id: "9-48", floor: 48 },
    ]
  },
  evening: {
    "Tower 1": [
      { id: "2-13", floor: 13 },
      { id: "3-18", floor: 18 },
      { id: "4-23", floor: 23 },
      { id: "5-28", floor: 28 },
      { id: "6-33", floor: 33 },
      { id: "7-38", floor: 38 },
      { id: "8-43", floor: 43 },
      { id: "9-48", floor: 48 },
    ],
    "Tower 2": [
      { id: "2-13", floor: 13 },
      { id: "3-18", floor: 18 },
      { id: "4-23", floor: 23 },
      { id: "5-28", floor: 28 },
      { id: "6-33", floor: 33 },
      { id: "7-38", floor: 38 },
      { id: "8-43", floor: 43 },
      { id: "9-48", floor: 48 },
    ],
    "Tower 3": [
      { id: "2-13", floor: 13 },
      { id: "3-18", floor: 18 },
      { id: "4-23", floor: 23 },
      { id: "5-28", floor: 28 },
      { id: "6-33", floor: 33 },
      { id: "7-38", floor: 38 },
      { id: "8-43", floor: 43 },
      { id: "9-48", floor: 48 },
    ]
  },
  night: {
    "Tower 1": [
      { id: "2-13", floor: 13 },
      { id: "3-18", floor: 18 },
      { id: "4-23", floor: 23 },
      { id: "5-28", floor: 28 },
      { id: "6-33", floor: 33 },
      { id: "7-38", floor: 38 },
      { id: "8-43", floor: 43 },
      { id: "9-48", floor: 48 },
    ],
    "Tower 2": [
      { id: "2-13", floor: 13 },
      { id: "3-18", floor: 18 },
      { id: "4-23", floor: 23 },
      { id: "5-28", floor: 28 },
      { id: "6-33", floor: 33 },
      { id: "7-38", floor: 38 },
      { id: "8-43", floor: 43 },
      { id: "9-48", floor: 48 },
    ],
    "Tower 3": [
      { id: "2-13", floor: 13 },
      { id: "3-18", floor: 18 },
      { id: "4-23", floor: 23 },
      { id: "5-28", floor: 28 },
      { id: "6-33", floor: 33 },
      { id: "7-38", floor: 38 },
      { id: "8-43", floor: 43 },
      { id: "9-48", floor: 48 },
    ]
  }
};

const getFloorLabel = (floor: number | string) => {
  if (typeof floor === "number") return `Floor ${floor}`;
  const fLower = floor.toLowerCase();
  if (fLower === "lmr") return "LMR";
  if (fLower.startsWith("terac") || fLower.startsWith("terrac")) return "Terrace";
  return floor;
};

export default function BalconyView() {
  const [selectedTower, setSelectedTower] = useState<
    "Tower 1" | "Tower 2" | "Tower 3"
  >("Tower 1");
  const [currentFloorIndex, setCurrentFloorIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState<
    "morning" | "afternoon" | "evening" | "night"
  >("morning");
  const [expandedTime, setExpandedTime] = useState<
    "morning" | "afternoon" | "evening" | "night"
  >("morning");
  const [isViewerReady, setIsViewerReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const viewerRef = useRef<any>(null);
  const panoRef = useRef<HTMLDivElement>(null);
  const allScenesRef = useRef<any>({});

  const currentTowerFloors = allTowersFloors[selectedTime][selectedTower];
  const currentFloor = currentFloorIndex < currentTowerFloors.length 
    ? currentTowerFloors[currentFloorIndex] 
    : currentTowerFloors[0];

  // Initialize Marzipano Viewer and All Scenes once on mount
  useEffect(() => {
    let mounted = true;
    let viewer: any = null;

    const initializeMarzipano = async () => {
      try {
        // Dynamic import of Marzipano (requires window/document)
        const Marzipano = (await import("marzipano")).default;

        if (!mounted || !panoRef.current) return;

        // Create viewer instance
        viewer = new Marzipano.Viewer(panoRef.current, {
          controls: {
            mouseViewMode: "drag",
          },
        });

        viewerRef.current = viewer;

        const allScenes: any = {};
        allScenesRef.current = allScenes;

        // URL prefix for tiles based on selected tower and time of day
        const getTowerPath = (tower: string, time: string) => {
          if (time === "morning") {
            if (tower === "Tower 1") return "tower1";
            if (tower === "Tower 2") return "tower2";
            if (tower === "Tower 3") return "tower3";
          } else if (time === "evening") {
            if (tower === "Tower 1") return "TOWER 1";
            if (tower === "Tower 2") return "TOWER 2";
            if (tower === "Tower 3") return "TOWER 3";
          } else {
            if (tower === "Tower 1") return "Tower 1";
            if (tower === "Tower 2") return "Tower 2";
            if (tower === "Tower 3") return "Tower 3";
          }
          return "tower1";
        };

        // Create scene helper
        const create360Scene = (sceneId: string, towerName: string, time: string) => {
          const towerPath = getTowerPath(towerName, time);
          const scenePath = `${towerPath}/app-files/tiles/${sceneId}`;
          const baseUrl = `https://assets.vestate.io/hiranandani-gorai/${time}/${scenePath}`;

          const source = Marzipano.ImageUrlSource.fromString(
            `${baseUrl}/{z}/{f}/{y}/{x}.jpg`,
            { cubeMapPreviewUrl: `${baseUrl}/preview.jpg` },
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
            (130 * Math.PI) / 180,
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

          const sceneKey = `${time}_${towerName}_${sceneId}`;
          allScenes[sceneKey] = {
            source,
            view,
            scene,
          };
        };

        // Initialize all 96 scenes (4 times * 3 towers * custom floors)
        const timesOfDay = ["morning", "afternoon", "evening", "night"] as const;
        timesOfDay.forEach((time) => {
          Object.entries(allTowersFloors[time]).forEach(([towerName, floors]) => {
            floors.forEach((floorData) => {
              create360Scene(floorData.id, towerName, time);
            });
          });
        });

        if (mounted) {
          setIsViewerReady(true);
        }
      } catch (error) {
        console.error("Failed to initialize Marzipano:", error);
      }
    };

    initializeMarzipano();

    return () => {
      mounted = false;
      if (viewer) {
        viewer.destroy();
      }
    };
  }, []);

  // Handle scene switching, transitions, and loading states
  useEffect(() => {
    if (!isViewerReady || !viewerRef.current) return;

    const currentTowerFloors = allTowersFloors[selectedTime][selectedTower];
    const currentFloor = currentFloorIndex < currentTowerFloors.length 
      ? currentTowerFloors[currentFloorIndex] 
      : currentTowerFloors[0];
    if (!currentFloor) return;

    const sceneKey = `${selectedTime}_${selectedTower}_${currentFloor.id}`;
    const sceneData = allScenesRef.current[sceneKey];
    if (sceneData) {
      setIsLoading(true);

      // Perform a smooth fade transition (600ms) to avoid visual glitch/abrupt swap
      sceneData.scene.switchTo({ transitionDuration: 600 });

      // Track texture loading state to hide spinner once visible tiles are loaded
      const layer = sceneData.scene.layer();
      const textureStore = layer.textureStore();

      const checkLoaded = () => {
        const tileList: any[] = [];
        layer.visibleTiles(tileList);

        if (tileList.length === 0) {
          // If no tiles are visible in layout yet, we are still preparing the scene
          return;
        }

        let allLoaded = true;
        for (let i = 0; i < tileList.length; i++) {
          if (!textureStore.query(tileList[i]).hasTexture) {
            allLoaded = false;
            break;
          }
        }

        if (allLoaded) {
          setIsLoading(false);
          clearInterval(pollInterval);
        }
      };

      // Add event listener for loading progress
      textureStore.addEventListener("textureLoad", checkLoaded);
      
      // Poll every 100ms to check if visible tiles have been determined and loaded
      const pollInterval = setInterval(checkLoaded, 100);

      // Fallback safety timeout (4 seconds) so slow connections don't block the user forever
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
        clearInterval(pollInterval);
      }, 4000);

      return () => {
        textureStore.removeEventListener("textureLoad", checkLoaded);
        clearInterval(pollInterval);
        clearTimeout(timeoutId);
      };
    }
  }, [isViewerReady, selectedTower, currentFloorIndex, selectedTime]);

  const switchFloor = (index: number) => {
    setCurrentFloorIndex(index);
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

        {/* Loading Overlay with premium design and animations */}
        <div
          className={`absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 transition-opacity duration-500 ease-in-out ${
            isLoading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            {/* Custom high-end dual-ring loading spinner */}
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-white animate-spin"></div>
            </div>
            <div className="text-white text-sm font-semibold tracking-widest uppercase animate-pulse">
              Loading 360° Panorama
            </div>
          </div>
        </div>
      </div>

      {/* SIDEBAR */}
      <Sidebar
        header={{
          title: selectedTower,
          subtitle: "Balcony Views",
        }}
        sections={createSidebarSections(
          (["morning", "afternoon", "evening", "night"] as const).map((time) => ({
            id: time,
            title: time.charAt(0).toUpperCase() + time.slice(1),
            isCollapsible: true,
            isExpanded: expandedTime === time,
            onHeaderClick: () => {
              setExpandedTime(expandedTime === time ? "morning" : time);
            },
            items: createSidebarItems(
              allTowersFloors[time][selectedTower].map((floorData, index) => ({
                id: `${time}_${floorData.id}`,
                label: getFloorLabel(floorData.floor),
                onClick: () => {
                  setSelectedTime(time);
                  switchFloor(index);
                },
                isActive: selectedTime === time && currentFloorIndex === index,
              })),
            ),
          }))
        )}
      />

      {/* Tower Selection Buttons */}
      <div className="absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-2">
        {(
          Object.keys(allTowersFloors.morning) as Array<"Tower 1" | "Tower 2" | "Tower 3">
        ).map((tower) => (
          <button
            key={tower}
            onClick={() => handleTowerChange(tower)}
            className={`rounded-lg px-6 h-8 text-xs font-bold uppercase tracking-wider border transition cursor-pointer  duration-200 ${
              selectedTower === tower
                ? "bg-white text-black border-transparent"
                : "bg-black/40 text-white border-white/10 backdrop-blur-md hover:bg-black/60 hover:border-white/20"
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
