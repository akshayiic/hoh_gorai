"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Layers,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  Sunrise,
  Sunset,
} from "lucide-react";
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

// Time-of-day switcher, rendered as an icon row next to the fullscreen
// toggle instead of a full right-hand sidebar.
const timeOfDayOptions = [
  { id: "morning", label: "Morning", icon: Sunrise },
  { id: "afternoon", label: "Afternoon", icon: Sun },
  { id: "evening", label: "Evening", icon: Sunset },
  { id: "night", label: "Night", icon: Moon },
] as const;

// Marzipano pins a scene's first tile level in GPU memory for as long as the
// scene exists, even when it isn't visible. Keeping only a handful of scenes
// alive at once (instead of all 96 tower/time/floor combinations) keeps that
// pinned memory bounded so high-resolution tiles don't render as black boxes.
const MAX_CACHED_SCENES = 6;

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
  // directly against https://assets.vestate.io/hiranandani-gorai/... — the
  // asset layout is inconsistent per time slot. Afternoon Tower 1 renders
  // live under the hyphenated "Tower-1" folder; the unhyphenated "tower1"
  // and "Tower 1" folders exist too but serve lower-quality/blurred renders.
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
  // Scenes are created on demand instead of all 96 up front, and the cache is
  // capped so only a handful of scenes stay pinned in GPU memory at once.
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

      // Evict least-recently-used scenes beyond the cache cap. Marzipano
      // pins a scene's first tile level in GPU memory for its entire
      // lifetime, so leaving all visited scenes alive is what was starving
      // the high-resolution tiles of texture memory and rendering black.
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

  // Initialize the Marzipano Viewer once on mount. Scenes are created lazily
  // by getOrCreateScene as the user navigates, not all up front.
  useEffect(() => {
    let mounted = true;
    let viewer: any = null;

    const initializeMarzipano = async () => {
      try {
        // Dynamic import of Marzipano (requires window/document)
        const Marzipano = (await import("marzipano")).default;

        if (!mounted || !panoRef.current) return;

        marzipanoRef.current = Marzipano;

        // Create viewer instance
        viewer = new Marzipano.Viewer(panoRef.current, {
          controls: {
            mouseViewMode: "drag",
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

  // Handle scene switching. Rather than cutting instantly behind an opaque
  // loader, this waits only for the tiny pinned fallback level (a handful of
  // small tiles) to be ready and then lets Marzipano's own crossfade
  // transition play — the same thing the working Svelte page gets for free
  // by calling plain `scene.switchTo()`. Full-resolution tiles keep
  // streaming in progressively after the crossfade, same as Marzipano's
  // built-in behavior.
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
    const layer = sceneData.scene.layer();
    const textureStore = layer.textureStore();
    const geometry = layer.geometry();
    const level0Tiles =
      geometry && geometry.levelList && geometry.levelList[0]
        ? geometry.levelTiles(geometry.levelList[0])
        : [];

    const isFallbackReady = () =>
      level0Tiles.length > 0 &&
      level0Tiles.every((tile: any) => textureStore.query(tile).hasTexture);

    const activate = () => {
      if (cancelled) return;
      setIsLoading(false);
      setHasRenderedOnce(true);
      sceneData.scene.switchTo();
    };

    let pollInterval: ReturnType<typeof setInterval> | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let settled = false;

    const checkReady = () => {
      if (settled || !isFallbackReady()) return;
      settled = true;
      textureStore.removeEventListener("textureLoad", checkReady);
      clearInterval(pollInterval);
      clearTimeout(timeoutId);
      activate();
    };

    if (isFallbackReady()) {
      settled = true;
      activate();
    } else {
      setIsLoading(true);
      textureStore.addEventListener("textureLoad", checkReady);
      pollInterval = setInterval(checkReady, 100);
      // Safety timeout so a slow connection doesn't block navigation forever.
      timeoutId = setTimeout(() => {
        settled = true;
        textureStore.removeEventListener("textureLoad", checkReady);
        clearInterval(pollInterval);
        activate();
      }, 4000);
    }

    // Warm the neighboring floors' fallback tiles in the background so
    // clicking through the floor list (the common case) feels instant
    // instead of triggering a fresh fetch every time.
    const prefetchTimer = setTimeout(() => {
      [currentFloorIndex - 1, currentFloorIndex + 1].forEach((idx) => {
        const neighbor = towerFloors[idx];
        if (neighbor) getOrCreateScene(neighbor.id, selectedTower, selectedTime);
      });
    }, 500);

    return () => {
      cancelled = true;
      textureStore.removeEventListener("textureLoad", checkReady);
      clearInterval(pollInterval);
      clearTimeout(timeoutId);
      clearTimeout(prefetchTimer);
    };
  }, [isViewerReady, selectedTower, currentFloorIndex, selectedTime, getOrCreateScene]);

  const switchFloor = (index: number) => {
    setCurrentFloorIndex(index);
  };

  const handleTowerChange = (tower: "Tower 1" | "Tower 2" | "Tower 3") => {
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
                onClick={() => setSelectedTime(id)}
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

        {/* Full-screen splash only before anything has ever rendered — there's
            no prior frame to keep showing yet. */}
        <div
          className={`absolute inset-0 bg-black flex flex-col items-center justify-center z-50 ${
            !hasRenderedOnce && isLoading
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none transition-opacity duration-500 ease-in-out"
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-white animate-spin"></div>
            </div>
            <div className="text-white text-sm font-semibold tracking-widest uppercase animate-pulse">
              Loading 360° Panorama
            </div>
          </div>
        </div>

        {/* Once a scene has rendered at least once, subsequent floor/tower
            switches keep the previous frame visible and only show a small
            non-blocking indicator while the next scene's fallback warms up,
            matching the Svelte page's instant-feeling switchTo(). */}
        <div
          className={`absolute bottom-40 right-7 z-50 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 backdrop-blur-md transition-opacity duration-300 phone-landscape:bottom-24 phone-landscape:right-4 ${
            hasRenderedOnce && isLoading ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="relative h-4 w-4">
            <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-white animate-spin"></div>
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-white">
            Loading
          </span>
        </div>
      </div>

      {/* SIDEBAR — floors (left) */}
      {!isFullscreenActive && (
        <Sidebar
          isFullscreenActive={isFullscreenActive}
          side="left"
          width="w-[170px] phone-landscape:w-[120px]"
          activeItemRounded
          compact
          visibleItemCount={5}
          header={{
            icon: Layers,
            title: "Floors",
          }}
          sections={createSidebarSections([
            {
              id: "floors",
              items: createSidebarItems(
                allTowersFloors[selectedTime][selectedTower].map(
                  (floorData, index) => ({
                    id: `${selectedTime}_${floorData.id}`,
                    label: getFloorLabel(floorData.floor),
                    onClick: () => switchFloor(index),
                    isActive: currentFloorIndex === index,
                  }),
                ),
              ),
            },
          ])}
        />
      )}

      {/* Tower Selection Buttons */}
      {!isFullscreenActive && (
        <div className="absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-2 phone-landscape:bottom-3 phone-landscape:gap-1">
          {(
            Object.keys(allTowersFloors.morning) as Array<
              "Tower 1" | "Tower 2" | "Tower 3"
            >
          ).map((tower) => (
            <button
              key={tower}
              onClick={() => handleTowerChange(tower)}
              className={`rounded-lg px-6 h-8 text-xs font-bold uppercase tracking-wider border transition cursor-pointer  duration-200 phone-landscape:px-3 phone-landscape:h-6 phone-landscape:text-[9px] phone-landscape:rounded-md ${
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
