"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WelcomeExperience() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Show loading screen for 2.5 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // 2.5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative font-sans text-white">
      <AnimatePresence mode="wait">
        {loading ? (
          // FIGMA FRAME: "Loading screen" (ID: 2136:406)
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 bg-[#162026] flex flex-col items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/10 border border-white/20 mb-4 shadow-lg shadow-black/35">
                <Building2 size={36} className="text-white" />
              </div>
              <p className="text-xs tracking-[0.4em] text-white/50 mb-2 uppercase">House Of</p>
              <h1 className="text-3xl font-bold tracking-wider text-white">HIRANANDANI</h1>
              <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent mt-4" />
            </motion.div>

            <div className="absolute bottom-20 flex flex-col items-center gap-3">
              <div className="h-1.5 w-48 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.2, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
                />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-white/40 animate-pulse">
                Initializing 360° Tour...
              </span>
            </div>
          </motion.div>
        ) : (
          // FIGMA FRAME: "Welcome page" (ID: 2136:418)
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Background image with parallax overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center scale-105"
              style={{ 
                backgroundImage: `url('/gallery/building.jpg')`,
                filter: "brightness(0.4)"
              }}
            />

            {/* Luxurious gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 pointer-events-none" />

            {/* Central glassmorphism card */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
              className="relative z-10 w-[90%] max-w-xl text-center rounded-2xl border border-white/10 bg-black/40 p-8 md:p-12 backdrop-blur-md shadow-2xl shadow-black/80"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 mb-6">
                <Building2 size={28} className="text-amber-500" />
              </div>

              <span className="text-xs uppercase tracking-[0.3em] text-amber-500/80 font-medium">
                Maitri Park, Chembur
              </span>
              
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mt-2 mb-4">
                House of Hiranandani
              </h2>
              
              <p className="text-sm text-white/70 leading-relaxed max-w-md mx-auto mb-8">
                Welcome to a virtual journey of unmatched architecture and layout design. Experience our premium 360° tours, interactive plans, and explore the neighbourhood infrastructure.
              </p>

              <button
                onClick={() => {
                  router.push("/home");
                }}
                className="group relative mx-auto flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-4 text-sm font-semibold text-black shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition duration-300"
              >
                <span className="relative z-10">Start Tour Experience</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform relative z-10" />
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-white/20 transition-transform duration-300 ease-out" />
              </button>
            </motion.div>

            {/* Footer branding */}
            <div className="absolute bottom-6 left-0 right-0 text-center z-10">
              <p className="text-[10px] uppercase tracking-widest text-white/30">
                © 2026 House of Hiranandani. All rights reserved.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
