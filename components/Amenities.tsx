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
import { useRouter } from "next/navigation";
import BottomNavbar from "@/components/BottomNavbar";
import GlobalNavbar from "@/components/GlobalNavbar";
import CompactSidebar from "@/components/CompactSidebar";

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
  const router = useRouter();
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

      {/* Global Navbar */}
      <GlobalNavbar currentPage="amenities" showRERA={true} />

      {/* SIDEBAR */}
      <CompactSidebar
        icon={Building2}
        title="Amenities"
        subtitle="Explore"
        items={Object.keys(amenities).map((category) => ({
          id: category,
          label: category,
          onClick: () => setSelectedCategory(category),
          isActive: selectedCategory === category
        }))}
      />

      {/* AMENITIES LIST PANEL */}
      <div className="absolute left-[330px] top-[140px] bottom-[110px] z-20 w-[400px] rounded-lg border border-white/10 bg-[#2B363D]/90 backdrop-blur-md flex flex-col">
        <div className="border-b border-white/10 px-5 py-4 shrink-0">
          <h4 className="text-white capitalize">{selectedCategory} Amenities</h4>
        </div>

        <div className="p-4 space-y-3 flex-1 overflow-y-auto scrollbar-hide">
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
      <BottomNavbar activeItem="amenities" />
    </section>
  );
}
