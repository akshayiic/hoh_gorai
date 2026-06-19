"use client";

import { useState } from "react";
import {
  Waves,
  Hotel,
  Building2,
  GraduationCap,
  ShoppingBag,
  Train,
  Hospital,
  Trees,
  Dumbbell,
  Map,
} from "lucide-react";

interface AmenitiesProps {
  onNavigate?: (view: string) => void;
}

const amenities = {
  outdoor: [
    {
      title: "Swimming Pool",
      icon: Waves,
      description: "Infinity pool with city views",
      available: true,
    },
    {
      title: "Garden Areas",
      icon: Trees,
      description: "Landscaped gardens and walking paths",
      available: true,
    },
    {
      title: "Sports Facilities",
      icon: Dumbbell,
      description: "Fully equipped gymnasium",
      available: true,
    },
  ],
  indoor: [
    {
      title: "Club House",
      icon: Hotel,
      description: "Premium clubhouse with recreational facilities",
      available: true,
    },
    {
      title: "Indoor Games",
      icon: Building2,
      description: "Table tennis, carrom, and board games",
      available: true,
    },
    {
      title: "Multi-purpose Hall",
      icon: Building2,
      description: "For events and gatherings",
      available: true,
    },
  ],
  convenience: [
    {
      title: "Shopping Complex",
      icon: ShoppingBag,
      description: "On-site retail outlets",
      available: true,
    },
    {
      title: "Educational Institutions",
      icon: GraduationCap,
      description: "Nearby schools and colleges",
      available: true,
    },
    {
      title: "Healthcare Facilities",
      icon: Hospital,
      description: "24/7 medical assistance",
      available: true,
    },
    {
      title: "Transport Connectivity",
      icon: Train,
      description: "Close to metro and bus stations",
      available: true,
    },
  ],
};

export default function Amenities({ onNavigate }: AmenitiesProps) {
  const [selectedCategory, setSelectedCategory] = useState("outdoor");

  return (
    <section className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* LOGO */}
      <div className="absolute left-7 top-5 z-20">
        <div className="flex items-center gap-3 rounded-md bg-[#29343B]/90 px-4 py-3 backdrop-blur-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-white/10">
            <Building2 size={20} className="text-white" />
          </div>

          <div>
            <p className="text-xs tracking-[0.3em] text-white/60">HOUSE OF</p>
            <h3 className="text-lg font-semibold text-white">HIRANANDANI</h3>
          </div>
        </div>
      </div>

      {/* TOP ACTIONS */}
      <div className="absolute right-6 top-5 z-20 flex items-center gap-2">
        <button className="rounded bg-black/60 px-4 py-2 text-sm text-white backdrop-blur hover:bg-black/70">
          ← Go Back
        </button>
        <button className="rounded bg-black/60 px-4 py-2 text-sm text-white backdrop-blur hover:bg-black/70">
          RERA
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className="absolute left-7 top-1/2 z-20 w-[280px] -translate-y-1/2 rounded-lg border border-white/10 bg-[#2B363D]/85 backdrop-blur-md">
        <div className="p-5">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded bg-white/5 p-2">
              <Building2 size={18} className="text-white" />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide text-white/40">
                Explore
              </p>
              <h3 className="text-lg text-white">Amenities</h3>
            </div>
          </div>

          <div className="space-y-1">
            {Object.keys(amenities).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex w-full items-center gap-3 rounded px-3 py-3 text-left transition capitalize ${
                  selectedCategory === category
                    ? "bg-white/8 text-white"
                    : "text-white/60 hover:bg-white/5"
                }`}
              >
                <span className="text-sm">{category}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* AMENITIES LIST PANEL */}
      <div className="absolute left-[330px] top-1/2 z-20 w-[400px] -translate-y-1/2 rounded-lg border border-white/10 bg-[#2B363D]/90 backdrop-blur-md">
        <div className="border-b border-white/10 px-5 py-4">
          <h4 className="text-white capitalize">{selectedCategory} Amenities</h4>
        </div>

        <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
          {amenities[selectedCategory as keyof typeof amenities]?.map((amenity) => {
            const Icon = amenity.icon;
            return (
              <div
                key={amenity.title}
                className="rounded-md bg-white/5 p-4 hover:bg-white/10 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded bg-white/10 p-2">
                    <Icon size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-white font-medium">{amenity.title}</h5>
                    <p className="text-white/60 text-sm mt-1">{amenity.description}</p>
                    {amenity.available && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                          Available
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
            Project
          </button>

          <button
            className="border-l border-white/10 flex items-center gap-2 bg-white px-6 py-4 text-sm text-black"
            onClick={() => onNavigate?.("amenities")}
          >
            <Hotel size={18} />
            Amenities
          </button>

          <button
            className="border-l border-white/10 flex items-center gap-2 px-6 py-4 text-white/70 hover:bg-white/5"
            onClick={() => onNavigate?.("drone")}
          >
            <Waves size={18} />
            Drone View
          </button>
        </div>
      </div>
    </section>
  );
}
