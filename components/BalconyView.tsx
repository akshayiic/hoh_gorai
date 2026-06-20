"use client";

import { useEffect, useRef, useState } from "react";
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

// Balcony view scenes configuration
const balconyScenes: BalconyScene[] = [
  {
    id: "scene1",
    name: "Aerial View",
    size: [
      { tileSize: 256, size: 256, fallbackOnly: true },
      { tileSize: 512, size: 512 },
      { tileSize: 512, size: 1024 },
      { tileSize: 512, size: 2048 },
      { tileSize: 512, size: 4096 },
    ],
    initialView: {
      yaw: 0,
      pitch: 0,
      fov: (130 * Math.PI) / 180,
    },
  },
];

export default function BalconyView() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const viewerRef = useRef<any>(null);
  const panoRef = useRef<HTMLDivElement>(null);
  const marzipanoRef = useRef<any>(null);
  const allScenesRef = useRef<any>({});

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

        // URL prefix for tiles
        const urlPrefix = "/balcony-shoots";

        // Create scene function matching the reference implementation
        const create360Scene = (name: string, size: any[], initialView: any) => {
          const source = Marzipano.ImageUrlSource.fromString(
            `${urlPrefix}/${name}/{z}/{f}/{y}/{x}.jpg`,
            { cubeMapPreviewUrl: `${urlPrefix}/${name}/preview.jpg` }
          );

          const geometry = new Marzipano.CubeGeometry(size);

          const limiter = Marzipano.RectilinearView.limit.traditional(
            3840,
            (130 * Math.PI) / 180
          );

          const view = new Marzipano.RectilinearView(initialView, limiter);

          const scene = viewer.createScene({
            source: source,
            geometry: geometry,
            view: view,
            pinFirstLevel: true,
          });

          allScenes[name] = {
            source,
            view,
            scene,
          };
        };

        // Initialize all scenes
        balconyScenes.forEach((sceneData) => {
          create360Scene(
            sceneData.id,
            sceneData.size,
            sceneData.initialView
          );
        });

        // Store scenes reference for switching
        marzipanoRef.current = balconyScenes.map((sceneData) => ({
          ...sceneData,
          scene: allScenes[sceneData.id].scene,
        }));

        // Load first scene
        if (allScenes[balconyScenes[0].id]) {
          allScenes[balconyScenes[0].id].scene
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
  }, []);

  const switchScene = (index: number) => {
    const sceneData = balconyScenes[index];
    if (sceneData && allScenesRef.current[sceneData.id]) {
      setCurrentScene(index);
      allScenesRef.current[sceneData.id].scene.switchTo();
    }
  };

  const nextScene = () => {
    const nextIndex = (currentScene + 1) % balconyScenes.length;
    switchScene(nextIndex);
  };

  const prevScene = () => {
    const prevIndex =
      (currentScene - 1 + balconyScenes.length) % balconyScenes.length;
    switchScene(prevIndex);
  };

  return (
    <div className="h-screen w-screen bg-black">
      {/* Global Navbar */}
      <GlobalNavbar currentPage="balcony" showRERA={true} />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-white text-2xl font-bold">Balcony View</h1>
          <p className="text-white/80 text-sm">360° Aerial Views</p>
        </div>
      </header>


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

        {/* Scene Name Badge */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-6 py-3 rounded-full">
          <h2 className="text-lg font-semibold">
            {balconyScenes[currentScene]?.name || "Scene"}
          </h2>
        </div>

        {/* Navigation Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
          <button
            onClick={prevScene}
            className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
            title="Previous Scene"
          >
            <Maximize2 size={24} className="rotate-180" />
          </button>
          <div className="flex gap-2">
            {balconyScenes.map((_, index) => (
              <button
                key={index}
                onClick={() => switchScene(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentScene ? "bg-white scale-125" : "bg-white/50"
                }`}
              />
            ))}
          </div>
          <button
            onClick={nextScene}
            className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
            title="Next Scene"
          >
            <Maximize2 size={24} />
          </button>
        </div>
      </div>

      {/* SIDEBAR */}
      <Sidebar
        header={{
          title: "Tower A",
          subtitle: "Balcony Views",
        }}
        sections={createSidebarSections([
          {
            id: "scenes",
            items: createSidebarItems(
              balconyScenes.map((scene, index) => ({
                id: scene.id,
                label: scene.name,
                onClick: () => {
                  switchScene(index);
                  setIsMenuOpen(false);
                },
                isActive: currentScene === index,
              }))
            ),
          },
        ])}
      />

      {/* Instructions */}
      <div className="absolute top-24 right-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm">
        Drag to look around
      </div>

      {/* Fullscreen Toggle */}
      <button
        onClick={() => document.documentElement.requestFullscreen()}
        className="absolute bottom-4 right-4 z-50 bg-black/50 text-white p-2 rounded-lg hover:bg-black/70"
        title="Fullscreen"
      >
        <Maximize2 size={20} />
      </button>

      {/* BOTTOM NAV */}
      <BottomNavbar activeItem="balcony" />
    </div>
  );
}
