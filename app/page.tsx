"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const isPhoneLandscape = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(orientation: landscape)").matches &&
  window.matchMedia("(pointer: coarse)").matches &&
  window.innerHeight <= 500;

export default function WelcomeExperience() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isFullscreenActive, setIsFullscreenActive] = useState(
    () => typeof document !== "undefined" && !!document.fullscreenElement,
  );
  const router = useRouter();
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

  useEffect(() => {
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
        setLoading(false);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-screen w-screen bg-black overflow-hidden relative font-sans text-white"
    >
      {/* Preload background image to cache it during the loading screen */}
      <img
        src="/gallery/explore_bg.webp"
        className="hidden"
        aria-hidden="true"
        alt=""
      />

      <AnimatePresence mode="wait">
        {loading ? (
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
        ) : (
          // WELCOME SCREEN (Reflecting the Home Screen screenshot design)
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 overflow-hidden"
          >
            {/* Background */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('/gallery/explore_bg.webp')`,
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

              {/* Heading */}
              <h1 className="text-white font-light leading-none">
                <span className="block text-5xl md:text-7xl phone-landscape:text-2xl">
                  Discover{" "}
                  <span className="font-serif italic font-normal">Life</span> at
                </span>

                <span className="block mt-2 text-5xl md:text-7xl phone-landscape:text-2xl phone-landscape:mt-1">
                  The Westward Shift
                </span>
              </h1>

              {/* Description */}
              <p className="text-white/80 text-lg md:text-2xl font-light mb-4 mt-6 phone-landscape:text-xs phone-landscape:mt-2 phone-landscape:mb-2">
                Journey to Iconic Skylines Shaped by Timeless Design
              </p>

              {/* CTA */}
              <button
                onClick={() => {
                  setIsNavigating(true);
                  router.push("/location");
                }}
                disabled={isNavigating}
                className="group text-white font-semibold text-2xl absolute bottom-[10rem] cursor-pointer phone-landscape:text-sm phone-landscape:bottom-6 disabled:cursor-wait"
              >
                <span className="relative z-10 inline-flex items-center gap-2">
                  {isNavigating && (
                    <Loader2 className="w-5 h-5 animate-spin phone-landscape:w-4 phone-landscape:h-4" />
                  )}
                  {isNavigating ? "Loading..." : "Explore Now"}
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

            {/* Fullscreen toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="absolute top-6 right-6 z-20 w-10 h-10 rounded-lg bg-black/45 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/70 hover:text-[#C79A59] transition shadow-lg cursor-pointer phone-landscape:w-7 phone-landscape:h-7 phone-landscape:rounded-md phone-landscape:top-2 phone-landscape:right-2"
              title={isFullscreenActive ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreenActive ? (
                <Minimize2 size={20} className="phone-landscape:w-3.5 phone-landscape:h-3.5" />
              ) : (
                <Maximize2 size={20} className="phone-landscape:w-3.5 phone-landscape:h-3.5" />
              )}
            </button>

            {/* Full-screen transition overlay while the location page loads */}
            <AnimatePresence>
              {isNavigating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                >
                  <Loader2 className="w-10 h-10 text-white animate-spin phone-landscape:w-7 phone-landscape:h-7" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
