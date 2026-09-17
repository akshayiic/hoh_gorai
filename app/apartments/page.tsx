"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Building2,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Home,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GlobalNavbar from "@/components/GlobalNavbar";
import BottomNavbar from "@/components/BottomNavbar";
import Sidebar, {
  createSidebarSections,
  createSidebarItems,
} from "@/components/Sidebar";

interface FlatOption {
  id: string;
  tower: "Tower A" | "Tower B" | "Tower C";
  label: string;
  imageSrc: string;
  bhk?: string;
}
 

const TOWER_B_FLATS: FlatOption[] = [
     {
    id: "tower-b-flat-6",
    tower: "Tower B",
    label: "Master Plan",
    imageSrc: "/gallery/Tower B/flat1.webp",
  },
       {
    id: "tower-b-flat-1",
    tower: "Tower B",
    label: "2 BHK",
    imageSrc: "/gallery/Tower B/flat2.webp",
  },
       {
    id: "tower-b-flat-2",
    tower: "Tower B",
    label: "3 BHK",
    imageSrc: "/gallery/Tower B/flat3.webp",
  },
  {
    id: "tower-b-refuge-area",
    tower: "Tower B",
    label: "Refuge Area",
    imageSrc: "/gallery/Tower B/flat6.webp",
  },
];

const TOWER_C_FLATS: FlatOption[] = [
       {
    id: "tower-c-flat-6",
    tower: "Tower C",
    label: "Master Plan",
    imageSrc: "/gallery/Tower C/flat1.webp",
  },
       {
    id: "tower-c-flat-1",
    tower: "Tower C",
    label: "2 BHK",
    imageSrc: "/gallery/Tower C/flat3.webp",
  },
       {
    id: "tower-c-flat-2",
    tower: "Tower C",
    label: "3 BHK",
    imageSrc: "/gallery/Tower C/flat2.webp",
  },
  {
    id: "tower-c-refuge-area",
    tower: "Tower C",
    label: "Refuge Area",
    imageSrc: "/gallery/Tower C/flat7.webp",
  },
];

export default function ApartmentsPage() {
  const [selectedFlat, setSelectedFlat] = useState<FlatOption>(
    TOWER_B_FLATS[0],
  );
  const [expandedTowers, setExpandedTowers] = useState<Record<string, boolean>>(
    {
      "Tower A": true,
      "Tower B": false,
    },
  );
  const [isFullscreenActive, setIsFullscreenActive] = useState(
    () => typeof document !== "undefined" && !!document.fullscreenElement,
  );

  // Pan and Zoom state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const posStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(1);

  const toggleTowerAccordion = (tower: "Tower A" | "Tower B") => {
    setExpandedTowers((prev) => ({
      ...prev,
      [tower]: !prev[tower],
    }));
  };

  const handleSelectFlat = (flat: FlatOption) => {
    setSelectedFlat(flat);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.3, 3.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.3, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    setScale((prev) => {
      const next = Math.min(Math.max(prev + delta, 1), 3.5);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Drag to pan (Mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    posStartRef.current = { ...position };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || scale <= 1) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPosition({
      x: posStartRef.current.x + dx,
      y: posStartRef.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag and pinch-to-zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      posStartRef.current = { ...position };
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      touchStartDistRef.current = dist;
      touchStartScaleRef.current = scale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && scale > 1) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      setPosition({
        x: posStartRef.current.x + dx,
        y: posStartRef.current.y + dy,
      });
    } else if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const factor = dist / touchStartDistRef.current;
      const next = Math.min(
        Math.max(touchStartScaleRef.current * factor, 1),
        3.5,
      );
      setScale(next);
      if (next === 1) setPosition({ x: 0, y: 0 });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistRef.current = null;
  };

  // Fullscreen
  const requestFullscreen = () => {
    if (document.fullscreenElement) return;
    const target = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => void;
    };
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
    const onFullscreenChange = () =>
      setIsFullscreenActive(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#111618] select-none">
      {/* Blurred Background Layout Image */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none scale-105 filter blur-md"
        style={{
          backgroundImage: `url('/gallery/hoh_layout.webp')`,
        }}
      />
      {/* Dark Overlay with subtle gradient */}
      <div className="absolute inset-0 bg-black/55 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

      {/* Main Image Viewport with Pan and Zoom */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`absolute inset-0 flex items-center justify-center p-6 lg:pl-[300px] lg:pr-16 pt-16 pb-20 phone-landscape:pl-[190px] phone-landscape:pt-10 phone-landscape:pb-14 ${
          scale > 1
            ? isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
            : "cursor-default"
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedFlat.imageSrc}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full h-full flex items-center justify-center"
          >
            <div
              style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
                transition: isDragging ? "none" : "transform 0.15s ease-out",
                transformOrigin: "center center",
              }}
              className="max-w-full max-h-full flex items-center justify-center"
            >
              <img
                src={selectedFlat.imageSrc}
                alt={`${selectedFlat.tower} - ${selectedFlat.label}`}
                className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl pointer-events-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Global Navbar */}
      <GlobalNavbar currentPage="apartments" showRERA={false} />

      {/* Sidebar with Accordions for Tower A and Tower B */}
      <Sidebar
        isFullscreenActive={isFullscreenActive}
        width="w-[260px] phone-landscape:w-[170px]"
        header={{
          icon: Building2,
          subtitle: "Floor Plans",
          title: "Apartments",
        }}
        sections={createSidebarSections([
             {
            id: "tower-a",
            title: "Tower 2",
            isCollapsible: true,
            isExpanded: !!expandedTowers["Tower A"],
            onHeaderClick: () => toggleTowerAccordion("Tower A"),
            items: createSidebarItems(
              TOWER_B_FLATS.map((flat) => ({
                id: flat.id,
                label: flat.label,
                icon: Home,
                onClick: () => handleSelectFlat(flat),
                isActive: selectedFlat.id === flat.id,
              })),
            ),
          },
          {
            id: "tower-b",
            title: "Tower 3",
            isCollapsible: true,
            isExpanded: !!expandedTowers["Tower B"],
            onHeaderClick: () => toggleTowerAccordion("Tower B"),
            items: createSidebarItems(
              TOWER_C_FLATS.map((flat) => ({
                id: flat.id,
                label: flat.label,
                icon: Home,
                onClick: () => handleSelectFlat(flat),
                isActive: selectedFlat.id === flat.id,
              })),
            ),
          },
       
        ])}
      />

      {/* Right Controls (Zoom In, Zoom Out, Reset, Fullscreen) */}
      <div className="absolute right-6 bottom-32 z-20 flex flex-col gap-2 phone-landscape:right-4 phone-landscape:bottom-14 phone-landscape:gap-1.5">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-lg bg-black/45 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/70 hover:text-[#C79A59] transition shadow-lg cursor-pointer phone-landscape:w-7 phone-landscape:h-7 phone-landscape:rounded-md"
          title="Zoom In"
        >
          <ZoomIn
            size={18}
            className="phone-landscape:w-3.5 phone-landscape:h-3.5"
          />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-lg bg-black/45 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/70 hover:text-[#C79A59] transition shadow-lg cursor-pointer phone-landscape:w-7 phone-landscape:h-7 phone-landscape:rounded-md"
          title="Zoom Out"
        >
          <ZoomOut
            size={18}
            className="phone-landscape:w-3.5 phone-landscape:h-3.5"
          />
        </button>
        {scale > 1 && (
          <button
            type="button"
            onClick={resetZoom}
            className="w-10 h-10 rounded-lg bg-black/45 backdrop-blur-md border border-white/10 text-[#C79A59] flex items-center justify-center hover:bg-black/70 transition shadow-lg cursor-pointer phone-landscape:w-7 phone-landscape:h-7 phone-landscape:rounded-md"
            title="Reset Zoom"
          >
            <RotateCcw
              size={18}
              className="phone-landscape:w-3.5 phone-landscape:h-3.5"
            />
          </button>
        )}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="w-10 h-10 rounded-lg bg-black/45 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/70 hover:text-[#C79A59] transition shadow-lg cursor-pointer phone-landscape:w-7 phone-landscape:h-7 phone-landscape:rounded-md"
          title={isFullscreenActive ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreenActive ? (
            <Minimize2
              size={18}
              className="phone-landscape:w-3.5 phone-landscape:h-3.5"
            />
          ) : (
            <Maximize2
              size={18}
              className="phone-landscape:w-3.5 phone-landscape:h-3.5"
            />
          )}
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNavbar activeItem="apartments" />
    </div>
  );
}
