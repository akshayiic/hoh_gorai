"use client";

import { Building2, Ruler, Bed, Calendar, MapPin, Map, Waves, Hotel } from "lucide-react";
import { useRouter } from "next/navigation";
import BottomNavbar from "@/components/BottomNavbar";
import GlobalNavbar from "@/components/GlobalNavbar";

interface BuildingInfoProps {
  onNavigate?: (view: string) => void;
}

const projectInfo = {
  name: "Gorai Bayview",
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
  const router = useRouter();
  return (
    <section className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Global Navbar */}
      <GlobalNavbar currentPage="apartments" showRERA={false} />

      {/* MAIN CONTENT */}
      <div className="absolute left-1/2 top-1/2 z-20 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 px-4">
        <div className="rounded-lg border border-white/10 bg-black/40 backdrop-blur-md p-8">
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
      <BottomNavbar activeItem="apartments" />
    </section>
  );
}
