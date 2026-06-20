"use client";

import Link from "next/link";
import {
  Building2,
  Map,
  Waves,
  Hotel,
  Compass,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  {
    title: "Interactive Map",
    description:
      "Explore connectivity, schools, shopping and infrastructure surrounding Maitri Park.",
    icon: Map,
    href: "/location",
    color: "from-blue-500/20 to-cyan-500/20",
    hoverColor: "group-hover:text-cyan-400",
  },
  {
    title: "Floor Plan & Apartments",
    description:
      "Navigate rooms, view dimensions, and jump straight into 360° room panorama tours.",
    icon: Building2,
    href: "/apartments",
    color: "from-purple-500/20 to-indigo-500/20",
    hoverColor: "group-hover:text-indigo-400",
  },
  {
    title: "360° Balcony View",
    description:
      "Soar above the landscape and check out beautiful 360° aerial panoramas of the area.",
    icon: Waves,
    href: "/balcony",
    color: "from-emerald-500/20 to-teal-500/20",
    hoverColor: "group-hover:text-teal-400",
  },
];

export default function HomeDashboard() {
  return (
    <div className="min-h-screen w-screen bg-[#0F172A] text-white font-sans overflow-x-hidden relative flex flex-col justify-between">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 scale-105 pointer-events-none"
        style={{ backgroundImage: `url('/gallery/lobby.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/90 via-[#0F172A] to-[#0F172A] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 p-6 border-b border-white/5 bg-black/10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-amber-500/10 border border-amber-500/20">
              <Building2 size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] tracking-[0.3em] text-white/50 uppercase">
                HOUSE OF
              </p>
              <h3 className="text-lg font-bold text-white tracking-wider">
                HIRANANDANI
              </h3>
            </div>
          </div>
          <span className="text-xs uppercase tracking-widest text-amber-500/80 bg-amber-500/5 border border-amber-500/10 px-3 py-1 rounded-full">
            Maitri Park Tour
          </span>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto px-6 py-12 flex flex-col justify-center w-full">
        <div className="mb-12 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-2 text-amber-500 text-sm font-semibold mb-2"
          >
            <Sparkles size={16} />
            <span>Interactive Virtual Experience</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4"
          >
            Welcome Home
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-white/60 text-sm md:text-base leading-relaxed"
          >
            Navigate through our comprehensive tour module. Select one of the
            categories below to explore the location, apartment details, aerial
            balcony view, or walk straight inside the 360° interior walkthrough.
          </motion.p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.1 * index + 0.3,
                  duration: 0.8,
                  ease: "easeOut",
                }}
              >
                <Link
                  href={item.href}
                  className="group block h-full rounded-2xl border border-white/5 bg-slate-900/60 p-6 md:p-8 backdrop-blur-sm hover:bg-slate-900/80 hover:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-black/25"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${item.color} border border-white/5 mb-4`}
                    >
                      <Icon
                        size={24}
                        className="text-white group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all duration-300"
                    />
                  </div>
                  <h3
                    className={`text-xl font-semibold mb-2 transition-colors duration-300 ${item.hoverColor}`}
                  >
                    {item.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Big CTA for walk-in tour */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex gap-4 items-start text-left">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mt-1">
              <Compass size={24} className="text-amber-500 animate-spin-slow" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1">
                Ready for the Walkthrough?
              </h4>
              <p className="text-white/60 text-sm max-w-xl">
                Enter the premium 360° interior virtual tour of Maitri Park.
                Directly walk through the entrance, living room, master bedroom,
                kitchen and balcony.
              </p>
            </div>
          </div>
          <Link
            href="/tour/entrance"
            className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-black px-6 py-4 rounded-xl text-center text-sm font-semibold shadow-lg shadow-amber-500/10 hover:shadow-amber-500/30 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span>Explore Interior (360°)</span>
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 border-t border-white/5 text-center text-xs text-white/30">
        <p>
          © 2026 House of Hiranandani. All rights reserved. Created for Maitri
          Park Virtual Tour.
        </p>
      </footer>
    </div>
  );
}
