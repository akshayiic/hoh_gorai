"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WelcomeExperience() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  // Circular progress math
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

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
    <div className="h-screen w-screen bg-black overflow-hidden relative font-sans text-white">
      <AnimatePresence mode="wait">
        {loading ? (
          // LOADING SCREEN (Reflecting the screenshot design)
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 bg-[#111111] flex flex-col items-center justify-center z-50"
          >
            <div className="relative flex items-center justify-center mb-8">
              {/* Circular SVG Progress */}
              <svg className="w-36 h-36 transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="text-white/5"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  fill="transparent"
                />
                {/* Active Progress Ring */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="text-amber-500/80 transition-all duration-75"
                  strokeWidth="1.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              {/* Central Serif Percentage */}
              <span className="absolute text-3xl font-serif italic font-normal tracking-wide text-white/90">
                {progress}%
              </span>
            </div>

            {/* Labels */}
            <div className="text-center space-y-1">
              <h2 className="text-sm uppercase tracking-[0.2em] font-medium text-white/80">
                Loading Experience
              </h2>
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/40">
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
                backgroundImage: `url('/gallery/explore_bg.png')`,
              }}
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/45" />

            {/* Vignette */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at center, transparent 15%, rgba(0,0,0,.85) 100%)",
              }}
            />

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
              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <img
                  src="/gallery/hoh-logo.png"
                  alt=""
                  className="h-30 object-contain"
                />
              </div>

              {/* Intro */}
              <p className="text-white/70 text-lg md:text-2xl font-light mb-2">
                In the Heart of
              </p>

              {/* Heading */}
              <h1 className="text-white font-light leading-none">
                <span className="block text-5xl md:text-7xl">
                  Discover{" "}
                  <span className="font-serif italic font-normal">Life</span> at
                </span>

                <span className="block mt-2 text-5xl md:text-7xl">
                  House of Hiranandani
                </span>
              </h1>

              {/* Description */}
              <p className="text-white/80 text-lg md:text-2xl font-light mb-4">
                Journey to Iconic Skylines Shaped by Timeless Design
              </p>

              {/* CTA */}
              <button
                onClick={() => router.push("/location")}
                className="group   text-white font-semibold text-2xl absolute bottom-[15rem] cursor-pointer "
              >
                <span className="relative z-10">Explore Now</span>

                {/* Decorative corners */}
                <span className="absolute -right-6 -top-3 w-8 h-8 border-r-2 border-t-2 border-[#C79A59] " />
                <span className="absolute -left-6 -bottom-3 w-8 h-8 border-l-2 border-b-2 border-[#C79A59] " />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
