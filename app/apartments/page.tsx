"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { RotateCcw, Building2, Grid3X3, Trees, Maximize2, Minimize2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import GlobalNavbar from "@/components/GlobalNavbar";
import BottomNavbar from "@/components/BottomNavbar";
import Sidebar, {
  createSidebarSections,
  createSidebarItems,
} from "@/components/Sidebar";

const isPhoneLandscape = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(orientation: landscape)").matches &&
  window.matchMedia("(pointer: coarse)").matches &&
  window.innerHeight <= 500;

const distance = (a: React.Touch, b: React.Touch) =>
  Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

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
  const [isFullscreenActive, setIsFullscreenActive] = useState(
    () => typeof document !== "undefined" && !!document.fullscreenElement,
  );
  const [zoom, setZoom] = useState({ scale: 1, x: 0, y: 0 });
  const [isImageLoading, setIsImageLoading] = useState(false);

  const currentTowerPlans = towerConfigs[selectedTower];
  const activePlan = currentTowerPlans[selectedPlanIndex];

  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const panRef = useRef<{ x: number; y: number; zoomX: number; zoomY: number } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);

  // Reset zoom whenever the displayed floor plan changes, and blur the
  // outgoing image until the new one finishes loading instead of leaving
  // the stale photo sitting there sharp while the new one fetches.
  useEffect(() => {
    setZoom({ scale: 1, x: 0, y: 0 });
    setIsImageLoading(true);
  }, [selectedTower, selectedPlanIndex]);

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

  // Phone-landscape pinch-to-zoom, double-tap-to-zoom, and drag-to-pan for
  // the floor plan image.
  const onImageTouchStart = (e: React.TouchEvent) => {
    if (!isPhoneLandscape()) return;

    if (e.touches.length === 2) {
      pinchRef.current = {
        dist: distance(e.touches[0], e.touches[1]),
        scale: zoom.scale,
      };
      panRef.current = null;
      return;
    }

    if (e.touches.length === 1) {
      if (zoom.scale > 1) {
        panRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          zoomX: zoom.x,
          zoomY: zoom.y,
        };
      }

      const touch = e.touches[0];
      const now = Date.now();
      const last = lastTapRef.current;
      if (
        last &&
        now - last.time < 300 &&
        Math.abs(touch.clientX - last.x) < 30 &&
        Math.abs(touch.clientY - last.y) < 30
      ) {
        setZoom((prev) =>
          prev.scale > 1 ? { scale: 1, x: 0, y: 0 } : { scale: 2.5, x: 0, y: 0 },
        );
        lastTapRef.current = null;
      } else {
        lastTapRef.current = { time: now, x: touch.clientX, y: touch.clientY };
      }
    }
  };

  const onImageTouchMove = (e: React.TouchEvent) => {
    if (pinchRef.current && e.touches.length === 2) {
      const newDist = distance(e.touches[0], e.touches[1]);
      const nextScale = Math.min(
        4,
        Math.max(1, pinchRef.current.scale * (newDist / pinchRef.current.dist)),
      );
      setZoom((prev) => ({ ...prev, scale: nextScale }));
      return;
    }

    if (panRef.current && e.touches.length === 1) {
      const { x: startX, y: startY, zoomX, zoomY } = panRef.current;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      setZoom((prev) => ({ ...prev, x: zoomX + dx, y: zoomY + dy }));
    }
  };

  const onImageTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) pinchRef.current = null;
    if (e.touches.length === 0) panRef.current = null;
  };

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
        isFullscreenActive={isFullscreenActive}
        header={{
          icon: Grid3X3,
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
      />

      {/* Fullscreen toggle */}
      <button
        onClick={toggleFullscreen}
        className="absolute right-6 bottom-32 z-20 w-10 h-10 rounded-lg bg-black/45 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/70 hover:text-[#C79A59] transition shadow-lg cursor-pointer phone-landscape:w-7 phone-landscape:h-7 phone-landscape:rounded-md"
        title={isFullscreenActive ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isFullscreenActive ? <Minimize2 size={20} className="phone-landscape:w-3.5 phone-landscape:h-3.5" /> : <Maximize2 size={20} className="phone-landscape:w-3.5 phone-landscape:h-3.5" />}
      </button>

      {/* Floorplan Area */}
      <div className="absolute top-[80px] bottom-[100px] left-4 lg:left-[360px] right-4 lg:right-8 flex items-center justify-center p-4 phone-landscape:top-14 phone-landscape:bottom-14 phone-landscape:left-4 phone-landscape:right-4 phone-landscape:p-1 phone-landscape:touch-none">
        <div
          className="relative w-full max-w-[1000px] max-h-full aspect-[1400/900] flex items-center justify-center overflow-hidden"
          onTouchStart={onImageTouchStart}
          onTouchMove={onImageTouchMove}
          onTouchEnd={onImageTouchEnd}
        >
          <div
            className="relative w-full h-full"
            style={{
              transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.scale})`,
              transition: pinchRef.current || panRef.current ? "none" : "transform 0.2s ease-out",
            }}
          >
            <Image
              src={activePlan.image}
              alt=""
              fill
              priority
              sizes="(max-width: 1000px) 100vw, 1000px"
              onLoad={() => setIsImageLoading(false)}
              className={`object-contain transition-[opacity,filter] duration-500 ${
                showOverlay ? "opacity-100" : "opacity-20"
              } ${isImageLoading ? "blur-md scale-105" : "blur-0 scale-100"}`}
            />
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavbar activeItem="apartments" />

      {/* Towers */}
      <div className="absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-2 phone-landscape:bottom-3 phone-landscape:gap-1">
        {(
          Object.keys(towerConfigs) as Array<"Tower 1" | "Tower 2" | "Tower 3">
        ).map((tower) => (
          <button
            key={tower}
            onClick={() => {
              setSelectedTower(tower);
              setSelectedPlanIndex(0);
            }}
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
    </div>
  );
}
