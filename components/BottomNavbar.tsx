"use client";

import { useRouter } from "next/navigation";
import { Map, Building2, Waves, Hotel } from "lucide-react";

interface BottomNavbarProps {
  activeItem: "location" | "apartments" | "balcony" | "amenities";
}

const navItems = [
  { id: "location", label: "Location", icon: Map, path: "/location" },
  { id: "balcony", label: "Balcony View", icon: Waves, path: "/balcony" },

  {
    id: "apartments",
    label: "Apartments",
    icon: Building2,
    path: "/apartments",
  },
];

export default function BottomNavbar({ activeItem }: BottomNavbarProps) {
  const router = useRouter();

  return (
    <div className="fixed bottom-6 left-7 z-40">
      <nav className="flex overflow-hidden rounded-lg border border-white/10 bg-[#29343B]/95 backdrop-blur-sm shadow-2xl">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (!isActive) {
                  router.push(item.path);
                }
              }}
              className={`flex items-center justify-center transition-all duration-300 ${
                isActive
                  ? "bg-white text-black px-6 h-14 text-xs font-bold uppercase tracking-wider gap-2"
                  : `text-white/70 hover:bg-white/5 hover:text-white w-14 h-14 ${
                      idx !== 0 ? "border-l border-white/10" : ""
                    }`
              }`}
            >
              <Icon
                size={18}
                className={isActive ? "text-black" : "text-white/70"}
              />
              {isActive && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
