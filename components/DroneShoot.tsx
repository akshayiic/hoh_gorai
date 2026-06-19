"use client";

import { useEffect, useRef, useState } from "react";
import {
  Home,
  Map,
  Images,
  Maximize2,
  Menu,
  X,
  Building2,
  Waves,
  Hotel,
} from "lucide-react";

interface DroneShootProps {
  onNavigate?: (view: string) => void;
}

interface DroneScene {
  id: string;
  name: string;
  initialView: {
    yaw: number;
    pitch: number;
    fov: number;
  };
}

// Drone shoot scenes - will be populated from Marzipano tiles
const droneScenes: DroneScene[] = [
  {
    id: "scene1",
    name: "Aerial View",
    initialView: {
      yaw: 0,
      pitch: 0,
      fov: (130 * Math.PI) / 180,
    },
  },
];

export default function DroneShoot({ onNavigate }: DroneShootProps) {
  const [currentScene, setCurrentScene] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const viewerRef = useRef<any>(null);
  const panoRef = useRef<HTMLDivElement>(null);
  const marzipanoRef = useRef<any>(null);

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

        // Create scenes from tiles
        const urlPrefix = "/drone-shoots"; // Update with your actual path

        const scenes = droneScenes.map((sceneData) => {
          const source = Marzipano.ImageUrlSource.fromString(
            `${urlPrefix}/${sceneData.id}/{z}/{face}/{y}/{x}.jpg`,
            {
              cubeMapPreviewUrl: `${urlPrefix}/${sceneData.id}/preview.jpg`,
            },
          );

          const geometry = new Marzipano.CubeGeometry([
            { tileSize: 256, size: 256, fallbackOnly: true },
            { tileSize: 512, size: 512 },
            { tileSize: 512, size: 1024 },
            { tileSize: 512, size: 2048 },
            { tileSize: 512, size: 4096 },
          ]);

          const limiter = Marzipano.RectilinearView.limit.traditional(
            3840,
            (130 * Math.PI) / 180,
          );

          const view = new Marzipano.RectilinearView(
            sceneData.initialView,
            limiter,
          );

          const scene = viewer.createScene({
            source: source,
            geometry: geometry,
            view: view,
            pinFirstLevel: true,
          });

          return {
            ...sceneData,
            scene,
          };
        });

        marzipanoRef.current = scenes;

        // Load first scene
        if (scenes[0]) {
          scenes[0].scene
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
    if (
      marzipanoRef.current &&
      marzipanoRef.current[index] &&
      viewerRef.current
    ) {
      setCurrentScene(index);
      marzipanoRef.current[index].scene.switchTo();
    }
  };

  const nextScene = () => {
    const nextIndex = (currentScene + 1) % droneScenes.length;
    switchScene(nextIndex);
  };

  const prevScene = () => {
    const prevIndex =
      (currentScene - 1 + droneScenes.length) % droneScenes.length;
    switchScene(prevIndex);
  };

  return (
    <div className="h-screen w-screen bg-black">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-white text-2xl font-bold">Drone Shoot</h1>
          <p className="text-white/80 text-sm">360° Aerial Views</p>
        </div>
      </header>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="lg:hidden absolute top-20 right-4 z-50 bg-black/50 text-white p-2 rounded-lg hover:bg-black/70"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Main Marzipano Viewer */}
      <div className="h-full w-full relative">
        <div
          ref={panoRef}
          id="drone-pano"
          className="w-full h-full"
          style={{ width: "100%", height: "100%" }}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
            <div className="text-white text-lg">Loading 360° view...</div>
          </div>
        )}

        {/* Scene Name Badge */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-6 py-3 rounded-full">
          <h2 className="text-lg font-semibold">
            {droneScenes[currentScene]?.name || "Scene"}
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
            {droneScenes.map((_, index) => (
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

      {/* Scene List Sidebar */}
      <nav
        className={`
        fixed left-0 top-20 bottom-0 z-40 bg-black/80 backdrop-blur-sm max-h-[30vh] overflow-auto
        transform transition-transform duration-300 ease-in-out
        ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        <div className="flex flex-col gap-2 p-4 w-64">
          <h3 className="text-white text-sm font-semibold mb-2 px-3">
            Aerial Views
          </h3>
          {droneScenes.map((scene, index) => (
            <button
              key={scene.id}
              onClick={() => {
                switchScene(index);
                setIsMenuOpen(false);
              }}
              className={`
                flex w-full items-center gap-3 px-4 py-3 rounded-lg text-left transition-all
                ${
                  currentScene === index
                    ? "bg-white text-black"
                    : "text-white hover:bg-white/10"
                }
              `}
            >
              <div className="flex-1">
                <div className="font-medium">{scene.name}</div>
              </div>
            </button>
          ))}
        </div>
      </nav>

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
      <div className="absolute bottom-6 left-7 z-20">
        <div className="flex overflow-hidden rounded-lg border border-white/10 bg-[#29343B]/95 backdrop-blur">
          <button
            className="flex items-center gap-2 px-6 py-4 text-white/70 hover:bg-white/5"
            onClick={() => onNavigate?.("location")}
          >
            <Map size={18} />
            Location
          </button>

          <button
            className="border-l border-white/10 flex items-center gap-2 px-6 py-4 text-white/70 hover:bg-white/5"
            onClick={() => onNavigate?.("building")}
          >
            <Building2 size={18} />
            Building
          </button>

          <button
            className="border-l border-white/10 flex items-center gap-2 bg-white px-6 py-4 text-sm text-black"
            onClick={() => onNavigate?.("drone")}
          >
            <Waves size={18} />
            Drone View
          </button>

          <button
            className="border-l border-white/10 flex items-center gap-2 px-6 py-4 text-white/70 hover:bg-white/5"
            onClick={() => onNavigate?.("amenities")}
          >
            <Hotel size={18} />
            Amenities
          </button>
        </div>
      </div>
    </div>
  );
}
