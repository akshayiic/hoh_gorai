"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Maximize2,
  Minimize2,
  Sun,
  Sunrise,
  Sunset,
} from "lucide-react";
import BottomNavbar from "@/components/BottomNavbar";
import GlobalNavbar from "@/components/GlobalNavbar";

type TowerName = "Tower 2" | "Tower 3";

const allTowersFloors: Record<
  "morning" | "afternoon" | "evening",
  Record<TowerName, { id: string; floor: number }[]>
> = {
  morning: {
    "Tower 2": [{ id: "5-48", floor: 48 }],
    "Tower 3": [{ id: "5-48", floor: 48 }],
  },
  afternoon: {
    "Tower 2": [{ id: "9-48", floor: 48 }],
    "Tower 3": [{ id: "9-48", floor: 48 }],
  },
  evening: {
    "Tower 2": [{ id: "9-48", floor: 48 }],
    "Tower 3": [{ id: "9-48", floor: 48 }],
  },
};

// Time-of-day switcher, rendered as an icon row next to the fullscreen
// toggle instead of a full right-hand sidebar.
const timeOfDayOptions = [
  { id: "morning", label: "Morning", icon: Sunrise },
  { id: "afternoon", label: "Afternoon", icon: Sun },
  { id: "evening", label: "Evening", icon: Sunset },
] as const;

// Marzipano pins a scene's first tile level in GPU memory for as long as the
// scene exists, even when it isn't visible.
const MAX_CACHED_SCENES = 12;

export default function BalconyView() {
  const [selectedTower, setSelectedTower] = useState<TowerName>("Tower 2");
  const [currentFloorIndex, setCurrentFloorIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState<
    "morning" | "afternoon" | "evening"
  >("morning");
  const [isViewerReady, setIsViewerReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRenderedOnce, setHasRenderedOnce] = useState(false);
  const [isFullscreenActive, setIsFullscreenActive] = useState(
    () => typeof document !== "undefined" && !!document.fullscreenElement,
  );
  const viewerRef = useRef<any>(null);
  const panoRef = useRef<HTMLDivElement>(null);
  const marzipanoRef = useRef<any>(null);
  const allScenesRef = useRef<any>({});
  const sceneOrderRef = useRef<string[]>([]);

  // URL prefix for tiles based on selected tower and time of day. Verified
  // directly against https://assets.vestate.io/hiranandani-gorai/...
  const getTowerPath = useCallback((tower: string, time: string) => {
    if (time === "morning") {
      if (tower === "Tower 1") return "tower1";
      if (tower === "Tower 2") return "tower2";
      if (tower === "Tower 3") return "tower3";
    } else if (time === "afternoon") {
      if (tower === "Tower 1") return "Tower-1";
      if (tower === "Tower 2") return "Tower 2";
      if (tower === "Tower 3") return "Tower 3";
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
  }, []);

  // Lazily creates (and caches) the scene for a given tower/time/floor combo.
  const getOrCreateScene = useCallback(
    (sceneId: string, towerName: string, time: string) => {
      const Marzipano = marzipanoRef.current;
      const viewer = viewerRef.current;
      if (!Marzipano || !viewer) return null;

      const sceneKey = `${time}_${towerName}_${sceneId}`;
      const allScenes = allScenesRef.current;

      if (allScenes[sceneKey]) {
        sceneOrderRef.current = sceneOrderRef.current.filter((key) => key !== sceneKey);
        sceneOrderRef.current.push(sceneKey);
        return allScenes[sceneKey];
      }

      const towerPath = getTowerPath(towerName, time);
      const scenePath = `${towerPath}/app-files/tiles/${sceneId}`;
      const baseUrl = `https://assets.vestate.io/hiranandani-gorai/${time}/${scenePath}`;

      // Preload preview.jpg into browser cache immediately
      if (typeof Image !== "undefined") {
        const preloadImg = new Image();
        preloadImg.crossOrigin = "anonymous";
        preloadImg.src = `${baseUrl}/preview.jpg`;
      }

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

      const sceneData = { source, view, scene };
      allScenes[sceneKey] = sceneData;
      sceneOrderRef.current.push(sceneKey);

      // Evict least-recently-used scenes beyond the cache cap.
      while (sceneOrderRef.current.length > MAX_CACHED_SCENES) {
        const evictKey = sceneOrderRef.current.shift();
        if (!evictKey || evictKey === sceneKey) continue;
        const evictData = allScenes[evictKey];
        if (evictData) {
          viewer.destroyScene(evictData.scene);
          delete allScenes[evictKey];
        }
      }

      return sceneData;
    },
    [getTowerPath],
  );

  // Initialize the Marzipano Viewer once on mount with progressive rendering enabled.
  useEffect(() => {
    let mounted = true;
    let viewer: any = null;

    const initializeMarzipano = async () => {
      try {
        const Marzipano = (await import("marzipano")).default;

        if (!mounted || !panoRef.current) return;

        marzipanoRef.current = Marzipano;

        // Create viewer instance with progressive rendering on the WebGL stage
        // so fallback textures render seamlessly during high-res tile downloads
        viewer = new Marzipano.Viewer(panoRef.current, {
          controls: {
            mouseViewMode: "drag",
          },
          stage: {
            progressive: true,
          },
        });

        viewerRef.current = viewer;
        allScenesRef.current = {};
        sceneOrderRef.current = [];

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

  // Handle scene switching. Activates the scene immediately behind the opaque loader
  // and only fades the loader once Marzipano reports renderComplete with stable === true
  // (guaranteeing that all visible tiles are loaded and drawn with zero black boxes).
  useEffect(() => {
    if (!isViewerReady || !viewerRef.current) return;

    const towerFloors = allTowersFloors[selectedTime][selectedTower];
    const currentFloor = currentFloorIndex < towerFloors.length
      ? towerFloors[currentFloorIndex]
      : towerFloors[0];
    if (!currentFloor) return;

    const sceneData = getOrCreateScene(currentFloor.id, selectedTower, selectedTime);
    if (!sceneData) return;

    let cancelled = false;
    setIsLoading(true);

    const viewer = viewerRef.current;
    const scene = sceneData.scene;
    const layer = scene.layer();
    const stage = viewer.stage();

    // Switch scene immediately with 0 duration so the layer is attached to the stage
    // and begins loading tiles and rendering behind the opaque black loader
    scene.switchTo({ transitionDuration: 0 });

    let settled = false;

    const finishLoading = () => {
      if (settled || cancelled) return;
      settled = true;
      cleanup();
      // Ensure two animation frames so the WebGL front buffer is completely presented
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) {
            setIsLoading(false);
            setHasRenderedOnce(true);
          }
        });
      });
    };

    // stable === true means every single tile in the active camera viewport
    // has been fully downloaded and painted on the canvas with zero missing tiles.
    const handleRenderComplete = (stable: boolean) => {
      if (stable) {
        finishLoading();
      }
    };

    layer.addEventListener("renderComplete", handleRenderComplete);
    if (stage) {
      stage.addEventListener("renderComplete", handleRenderComplete);
    }

    // Safety timeout: If connection is exceptionally slow, force whatever rendered frame
    // is available after 10s so navigation is never permanently blocked.
    const timeoutId = setTimeout(() => {
      if (!settled && !cancelled) {
        if (stage) {
          try {
            stage.render();
          } catch {
            // Ignore potential synchronous render error on timeout
          }
        }
        finishLoading();
      }
    }, 10000);

    const cleanup = () => {
      layer.removeEventListener("renderComplete", handleRenderComplete);
      if (stage) {
        stage.removeEventListener("renderComplete", handleStageRenderComplete);
      }
      clearTimeout(timeoutId);
    };

    const handleStageRenderComplete = (stable: boolean) => {
      if (stable) {
        finishLoading();
      }
    };

    // Warm the other tower's scene in the background so switching towers feels instant
    const prefetchTimer = setTimeout(() => {
      if (cancelled) return;
      const otherTower: TowerName =
        selectedTower === "Tower 2" ? "Tower 3" : "Tower 2";
      const otherFloor = allTowersFloors[selectedTime][otherTower]?.[0];
      if (otherFloor) {
        getOrCreateScene(otherFloor.id, otherTower, selectedTime);
      }
    }, 600);

    return () => {
      cancelled = true;
      cleanup();
      clearTimeout(prefetchTimer);
    };
  }, [isViewerReady, selectedTower, currentFloorIndex, selectedTime, getOrCreateScene]);

  const handleTimeChange = (time: "morning" | "afternoon" | "evening") => {
    if (time === selectedTime) return;
    setIsLoading(true);
    setSelectedTime(time);
  };

  const handleTowerChange = (tower: TowerName) => {
    if (tower === selectedTower) return;
    setIsLoading(true);
    setSelectedTower(tower);
    setCurrentFloorIndex(0);
  };

  // Fullscreens `document.documentElement`, not this page's own div — that's
  // the one element that survives client-side navigation, so switching pages
  // (BottomNavbar links, etc) no longer forces an exit from fullscreen.
  const requestFullscreen = () => {
    if (document.fullscreenElement) return;
    const target = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
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
    const onFullscreenChange = () => setIsFullscreenActive(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  return (
    <div className="h-screen w-screen bg-black">
      {/* Global Navbar */}
      {!isFullscreenActive && (
        <GlobalNavbar currentPage="balcony" showRERA={false} />
      )}

      {/* Main Marzipano Viewer */}
      <div className="h-full w-full relative">
        <div
          ref={panoRef}
          id="balcony-pano"
          className="w-full h-full touch-none"
          style={{ width: "100%", height: "100%" }}
        />

        {/* Time-of-day icons + fullscreen toggle, aligned horizontally just
            above the Vestate watermark in the bottom-right corner. */}
        <div
          className={`absolute right-7 z-20 flex items-center gap-2 phone-landscape:right-4 phone-landscape:gap-1.5 ${
            isFullscreenActive
              ? "bottom-6"
              : "bottom-24 phone-landscape:bottom-12"
          }`}
        >
          {!isFullscreenActive &&
            timeOfDayOptions.map(({ id, label, icon: TimeIcon }) => (
              <button
                key={id}
                onClick={() => handleTimeChange(id)}
                title={label}
                aria-label={label}
                className={`w-10 h-10 rounded-lg border flex items-center justify-center transition shadow-lg cursor-pointer phone-landscape:w-7 phone-landscape:h-7 phone-landscape:rounded-md ${
                  selectedTime === id
                    ? "bg-white text-black border-transparent"
                    : "bg-black/45 backdrop-blur-md border-white/10 text-white hover:bg-black/70 hover:text-[#C79A59]"
                }`}
              >
                <TimeIcon
                  size={20}
                  className="phone-landscape:w-3.5 phone-landscape:h-3.5"
                />
              </button>
            ))}

          <button
            onClick={toggleFullscreen}
            className="w-10 h-10 rounded-lg bg-black/45 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/70 hover:text-[#C79A59] transition shadow-lg cursor-pointer phone-landscape:w-7 phone-landscape:h-7 phone-landscape:rounded-md"
            title={isFullscreenActive ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreenActive ? (
              <Minimize2
                size={20}
                className="phone-landscape:w-3.5 phone-landscape:h-3.5"
              />
            ) : (
              <Maximize2
                size={20}
                className="phone-landscape:w-3.5 phone-landscape:h-3.5"
              />
            )}
          </button>
        </div>

        {/* Full-screen panorama loader — 100% opaque black until scene is fully rendered, completely preventing black blocks */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center z-50 bg-black transition-opacity duration-300 ${
            isLoading
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <div className="relative w-14 h-14 phone-landscape:w-9 phone-landscape:h-9">
              <div className="absolute inset-0 rounded-full border-4 border-white/10 phone-landscape:border-3" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#C79A59] border-r-white animate-spin phone-landscape:border-3" />
            </div>
            <div>
              <div className="text-white text-sm font-semibold tracking-widest uppercase phone-landscape:text-xs">
                Loading 360° Panorama
              </div>
              <div className="text-white/60 text-xs mt-1 font-medium phone-landscape:text-[10px]">
                {selectedTower} • Floor 48 • {selectedTime.charAt(0).toUpperCase() + selectedTime.slice(1)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tower Selection Buttons — Tower 2 and Tower 3 only */}
      {!isFullscreenActive && (
        <div className="absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-2 phone-landscape:bottom-3 phone-landscape:gap-1">
          {(["Tower 2", "Tower 3"] as const).map((tower) => (
            <button
              key={tower}
              onClick={() => handleTowerChange(tower)}
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
      )}

      {/* BOTTOM NAV */}
      {!isFullscreenActive && <BottomNavbar activeItem="balcony" />}
    </div>
  );
}
