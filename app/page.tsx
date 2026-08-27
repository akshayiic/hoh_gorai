"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GlobalNavbar from "@/components/GlobalNavbar";
import BottomNavbar from "@/components/BottomNavbar";

const isPhoneLandscape = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(orientation: landscape)").matches &&
  window.matchMedia("(pointer: coarse)").matches &&
  window.innerHeight <= 500;

// The three screens served from `/`: the progress ring, the welcome spread, and
// the project layout the visitor picks a section from. None of them changes the
// URL, so the stage is kept in sessionStorage — returning to `/` from Location
// (or any other page) lands back on the layout instead of replaying the intro.
type Stage = "loading" | "welcome" | "layout";
const STAGE_KEY = "hoh_stage";

function FullscreenButton({
  isActive,
  onToggle,
  className = "",
}: {
  isActive: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`absolute z-20 w-10 h-10 rounded-lg bg-black/45 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/70 hover:text-[#C79A59] transition shadow-lg cursor-pointer phone-landscape:w-7 phone-landscape:h-7 phone-landscape:rounded-md ${className}`}
      title={isActive ? "Exit Fullscreen" : "Enter Fullscreen"}
    >
      {isActive ? (
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
  );
}

export default function WelcomeExperience() {
  // Null until the stage is decided — either by the stored value (below) or by
  // the visitor moving themselves.
  const [stage, setStage] = useState<Stage | null>(null);
  const activeStage = stage ?? "loading";
  const [progress, setProgress] = useState(0);
  const [isFullscreenActive, setIsFullscreenActive] = useState(
    () => typeof document !== "undefined" && !!document.fullscreenElement,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(
    null,
  );
  const twoFingerStartYRef = useRef<{ y: number; time: number } | null>(null);

  // Fullscreens `document.documentElement`, not this page's own div — that's
  // the one element that survives client-side navigation, so switching pages
  // no longer forces an exit from fullscreen.
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

  // Phone-landscape fullscreen gestures: double-tap or a two-finger swipe up
  // requests fullscreen; exiting fullscreen (via the system back gesture,
  // Esc, etc.) is picked up by the fullscreenchange listener below.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const isFullscreen = () => !!document.fullscreenElement;

    const onFullscreenChange = () => setIsFullscreenActive(isFullscreen());

    const onTouchStart = (e: TouchEvent) => {
      if (!isPhoneLandscape()) return;
      if (e.touches.length === 2) {
        const avgY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        twoFingerStartYRef.current = { y: avgY, time: Date.now() };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!twoFingerStartYRef.current || e.touches.length !== 2) return;
      const avgY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const deltaY = twoFingerStartYRef.current.y - avgY;
      const elapsed = Date.now() - twoFingerStartYRef.current.time;
      if (deltaY > 60 && elapsed < 600) {
        requestFullscreen();
        twoFingerStartYRef.current = null;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      twoFingerStartYRef.current = null;
      if (!isPhoneLandscape()) return;
      if (e.touches.length !== 0 || e.changedTouches.length !== 1) return;

      const touch = e.changedTouches[0];
      const now = Date.now();
      const last = lastTapRef.current;

      if (
        last &&
        now - last.time < 300 &&
        Math.abs(touch.clientX - last.x) < 30 &&
        Math.abs(touch.clientY - last.y) < 30
      ) {
        if (isFullscreen()) exitFullscreen();
        else requestFullscreen();
        lastTapRef.current = null;
      } else {
        lastTapRef.current = { time: now, x: touch.clientX, y: touch.clientY };
      }
    };

    el.addEventListener("touchstart", onTouchStart, {
      passive: true,
      capture: true,
    });
    el.addEventListener("touchmove", onTouchMove, {
      passive: true,
      capture: true,
    });
    el.addEventListener("touchend", onTouchEnd, {
      passive: true,
      capture: true,
    });
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      el.removeEventListener("touchstart", onTouchStart, { capture: true });
      el.removeEventListener("touchmove", onTouchMove, { capture: true });
      el.removeEventListener("touchend", onTouchEnd, { capture: true });
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  // Circular progress math
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const angle = (progress / 100) * 2 * Math.PI;
  const dotX = 72 + radius * Math.cos(angle);
  const dotY = 72 + radius * Math.sin(angle);

  // Resume the layout for a visitor who has already been through the intro this
  // session. sessionStorage can't be read while rendering (the server has none),
  // and setting state straight from an effect body is a cascading render, so the
  // read is queued — it lands before the first frame the visitor could act on.
  useEffect(() => {
    if (sessionStorage.getItem(STAGE_KEY) !== "layout") return;
    queueMicrotask(() => setStage((current) => current ?? "layout"));
  }, []);

  useEffect(() => {
    if (activeStage !== "loading") return;

    const duration = 2500; // 2.5 seconds total loading
    const intervalTime = 25; // 25ms increments
    const totalSteps = duration / intervalTime;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const currentProgress = Math.min(
        Math.round((step / totalSteps) * 100),
        100,
      );
      setProgress(currentProgress);

      if (step >= totalSteps) {
        clearInterval(timer);
        setStage((current) => current ?? "welcome");
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [activeStage]);

  const enterLayout = () => {
    sessionStorage.setItem(STAGE_KEY, "layout");
    setStage("layout");
  };

  return (
    <div
      ref={containerRef}
      className="h-screen w-screen bg-black overflow-hidden relative font-sans text-white"
    >
      {/* Preload the screens that follow so they're cached by the time the
          progress ring finishes */}
      <img
        src="/gallery/hero_bg-trimmed.png"
        className="hidden"
        aria-hidden="true"
        alt=""
      />
      <img
        src="/gallery/hoh_layout.webp"
        className="hidden"
        aria-hidden="true"
        alt=""
      />

      <AnimatePresence mode="wait">
        {activeStage === "loading" && (
          // LOADING SCREEN (Reflecting the screenshot design)
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background:
                "radial-gradient(circle at center, #222 0%, #1a1a1a 45%, #121212 100%)",
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0   flex flex-col items-center justify-center z-50"
          >
            <div className="relative flex items-center justify-center mb-8 phone-landscape:mb-4 phone-landscape:scale-75">
              {/* Circular SVG Progress */}
              <svg className="w-36 h-36 transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="text-white/30"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  fill="transparent"
                />
                {/* Active Progress Ring */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="text-white transition-all duration-75"
                  strokeWidth="1.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
                {/* Glowing dot in front of active progress ring */}
                {progress > 0 && (
                  <circle
                    cx={dotX}
                    cy={dotY}
                    r="3.5"
                    fill="#ffffff"
                    style={{
                      filter: "drop-shadow(0 0 4px rgba(255, 255, 255, 0.95))",
                    }}
                  />
                )}
              </svg>
              {/* Central Serif Percentage */}
              <span className="absolute text-3xl font-serif italic font-normal tracking-wide text-white/90 phone-landscape:text-xl">
                {progress}%
              </span>
            </div>

            {/* Labels */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl uppercase tracking-[0.2em] font-medium text-white/80 phone-landscape:text-base phone-landscape:tracking-[0.12em]">
                Loading Experience
              </h2>
              <p className="text-[10px] uppercase tracking-[0.15em] mt-2 text-white/40 phone-landscape:text-[8px] phone-landscape:mt-1">
                Please Wait
              </p>
            </div>
          </motion.div>
        )}

        {activeStage === "welcome" && (
          // WELCOME SCREEN (Reflecting the Home Screen screenshot design)
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 overflow-hidden"
          >
            {/* Background — fills the screen and is pinned to the top edge, so
                any crop a wide viewport forces comes off the bottom (forest)
                rather than cutting into the spread's heading. The trimmed copy
                is hero_bg.png with its grey page margin cropped off; the
                original leaves grey bands down both sides at full screen. */}
            <div
              className="absolute inset-0 bg-cover bg-top bg-no-repeat"
              style={{
                backgroundImage: `url('/gallery/hero_bg-trimmed.png')`,
              }}
            />

            {/* Vignette */}
            {/* <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at center, transparent 15%, rgba(0,0,0,.85) 100%)",
              }}
            /> */}

            {/* Warm center glow */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(193,140,71,.18), transparent 50%)",
              }}
            />

            {/* Grid */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Vertical */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:60px_60px]" />

              {/* Horizontal */}
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            {/* Center Cross Glow */}
            <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/20 to-transparent -translate-x-1/2" />
            <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-y-1/2" />

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-6">
              {/* Logo */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 phone-landscape:top-2">
                <img
                  src="/gallery/hoh-logo.png"
                  alt=""
                  className="h-30 object-contain phone-landscape:h-14"
                />
              </div>

              {/* CTA */}
              <button
                onClick={enterLayout}
                className="group text-white font-semibold text-2xl absolute bottom-[10rem] cursor-pointer phone-landscape:text-sm phone-landscape:bottom-6"
              >
                <span className="relative z-10 inline-flex items-center gap-2">
                  Explore Now
                </span>

                {/* Decorative corners */}
                <img
                  src="/icons/top.svg"
                  className="absolute -right-4 -top-2 w-8 h-8 pointer-events-none transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 phone-landscape:w-5 phone-landscape:h-5 phone-landscape:-right-2 phone-landscape:-top-1.5"
                  alt=""
                />
                <img
                  src="/icons/left.svg"
                  className="absolute -left-4 -bottom-3 w-8 h-8 pointer-events-none transition-transform duration-300 group-hover:-translate-x-1 group-hover:translate-y-1 phone-landscape:w-5 phone-landscape:h-5 phone-landscape:-left-2 phone-landscape:-bottom-2"
                  alt=""
                />
              </button>
            </div>

            <FullscreenButton
              isActive={isFullscreenActive}
              onToggle={toggleFullscreen}
              className="top-6 right-6 phone-landscape:top-2 phone-landscape:right-2"
            />
          </motion.div>
        )}

        {activeStage === "layout" && (
          // PROJECT LAYOUT — the hub the visitor picks a section from. Stays on
          // `/`; the header and bottom navbar are what carry them onward.
          <motion.div
            key="layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            className="absolute inset-0 overflow-hidden bg-black"
          >
            {/* Pinned to the top edge so the tower's crown is never what a
                wide viewport crops. */}
            <img
              src="/gallery/hoh_layout.webp"
              alt="Hiranandani Bayview project layout"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />

            <GlobalNavbar currentPage="" />
            <BottomNavbar activeItem="home" />

            <FullscreenButton
              isActive={isFullscreenActive}
              onToggle={toggleFullscreen}
              className="right-6 bottom-32 phone-landscape:right-4 phone-landscape:bottom-12"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
