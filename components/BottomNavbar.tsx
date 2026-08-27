"use client";

import { useRouter } from "next/navigation";
import { Map, Building2, Waves, Hotel } from "lucide-react";

interface BottomNavbarProps {
  // "home" is the project-layout hub on `/`: the bar is shown, but none of the
  // destinations is the current one, so every item stays an unlabelled icon.
  activeItem: "location" | "apartments" | "balcony" | "amenities" | "home";
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
    <>
      <div className="fixed bottom-6 left-7 z-40 phone-landscape:bottom-3 phone-landscape:left-4">
        <nav className="flex overflow-hidden rounded-lg border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl phone-landscape:rounded-md">
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
                className={`flex items-center justify-center transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-white text-black px-6 h-8 text-xs font-bold uppercase tracking-wider gap-2 phone-landscape:px-3 phone-landscape:h-6 phone-landscape:text-[9px] phone-landscape:gap-1"
                    : `text-white/70 hover:bg-white/5 hover:text-white w-14 h-8 phone-landscape:w-9 phone-landscape:h-6 ${
                        idx !== 0 ? "border-l border-white/10" : ""
                      }`
                }`}
              >
                <Icon
                  size={18}
                  className={`phone-landscape:w-3.5 phone-landscape:h-3.5 ${isActive ? "text-black" : "text-white/70"}`}
                />
                {isActive && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* RERA button in the right bottom corner */}
      <div className="fixed bottom-6 right-7 z-40 phone-landscape:bottom-3 phone-landscape:right-4">
          <img
            src="/icons/powered.png"
            alt="Logo"
            className="h-12 object-contain phone-landscape:h-7"
          />

      </div>
    </>
  );
}
