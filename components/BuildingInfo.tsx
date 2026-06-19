"use client";

import { Building2, Ruler, Bed, Calendar, Award, MapPin, Map, Waves, Hotel } from "lucide-react";

interface BuildingInfoProps {
  onNavigate?: (view: string) => void;
}

const projectInfo = {
  name: "Maitri Park",
  developer: "House of Hiranandani",
  location: "Panvel, Mumbai",
  reraNumber: "P52000000000",
  configuration: ["1 BHK", "2 BHK", "3 BHK", "4 BHK"],
  sizes: {
    "1 BHK": "400 - 500 sq. ft.",
    "2 BHK": "600 - 750 sq. ft.",
    "3 BHK": "800 - 1200 sq. ft.",
    "4 BHK": "1200 - 1800 sq. ft.",
  },
  possession: "2026",
  features: [
    "Earthquake resistant structure",
    "24/7 security and surveillance",
    "Power backup for common areas",
    "Rainwater harvesting system",
    "Solar lighting for common areas",
    "Fire suppression system",
    "Waste management system",
    "Anti-termite treatment",
  ],
};

export default function BuildingInfo({ onNavigate }: BuildingInfoProps) {
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

      {/* MAIN CONTENT */}
      <div className="absolute left-1/2 top-1/2 z-20 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 px-4">
        <div className="rounded-lg border border-white/10 bg-[#2B363D]/90 backdrop-blur-md p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">{projectInfo.name}</h1>
            <p className="text-white/60 text-lg">{projectInfo.developer}</p>
          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-center gap-4 bg-white/5 rounded-lg p-4">
              <div className="rounded bg-white/10 p-3">
                <MapPin size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Location</p>
                <p className="text-white font-medium">{projectInfo.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/5 rounded-lg p-4">
              <div className="rounded bg-white/10 p-3">
                <Calendar size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Possession</p>
                <p className="text-white font-medium">{projectInfo.possession}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/5 rounded-lg p-4">
              <div className="rounded bg-white/10 p-3">
                <Bed size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Configurations</p>
                <p className="text-white font-medium">{projectInfo.configuration.join(", ")}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/5 rounded-lg p-4">
              <div className="rounded bg-white/10 p-3">
                <Award size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">RERA Number</p>
                <p className="text-white font-medium">{projectInfo.reraNumber}</p>
              </div>
            </div>
          </div>

          {/* Size Details */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Size Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(projectInfo.sizes).map(([config, size]) => (
                <div key={config} className="bg-white/5 rounded-lg p-4">
                  <p className="text-white font-medium">{config}</p>
                  <p className="text-white/60 text-sm mt-1">{size}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Project Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projectInfo.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                  <div className="rounded-full bg-green-500/20 p-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                  </div>
                  <p className="text-white/80 text-sm">{feature}</p>
                </div>
              ))}
            </div>
          </div>
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
            className="border-l border-white/10 flex items-center gap-2 bg-white px-6 py-4 text-sm text-black"
            onClick={() => onNavigate?.("building")}
          >
            <Building2 size={18} />
            Project
          </button>

          <button
            className="border-l border-white/10 flex items-center gap-2 px-6 py-4 text-white/70 hover:bg-white/5"
            onClick={() => onNavigate?.("amenities")}
          >
            <Bed size={18} />
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
