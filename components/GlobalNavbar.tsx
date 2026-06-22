"use client";

import { useRouter } from "next/navigation";
import { Building2, RotateCcw } from "lucide-react";

interface GlobalNavbarProps {
  currentPage: string;
  onNavigate?: (view: string) => void;
  showReset?: boolean;
  onReset?: () => void;
  showRERA?: boolean;
}

export default function GlobalNavbar({
  currentPage,
  onNavigate,
  showReset = false,
  onReset,
  showRERA = false,
}: GlobalNavbarProps) {
  const router = useRouter();

  const handleNavigate = (view: string) => {
    if (view === currentPage) return;
    router.push(`/${view}`);
    onNavigate?.(view);
  };

  return (
    <>
      {/* LOGO */}
      <div className="absolute left-6 top-6 z-20 flex items-center gap-3">
        {/* Logo Box */}
        <div className="rounded-md flex items-center justify-center">
          <img
            src="/gallery/hoh.png"
            alt="Logo"
            className="h-18 w-18 object-contain"
          />
        </div>

        {/* Text Box */}
        <div className="">
          <img
            src="/gallery/hoh-og.png"
            alt="House Of Hiranandani"
            className="h-18 object-contain"
          />
        </div>
      </div>

      {/* TOP ACTIONS */}
      <div className="absolute right-6 top-5 z-20 flex items-center gap-2">
        <button
          onClick={() => handleNavigate("home")}
          className="rounded border border-white/10 bg-[#2B363D]/95 px-4 py-2 text-sm text-white backdrop-blur hover:bg-[#2B363D]/80 hover:border-white/20 transition duration-200 cursor-pointer"
        >
          ← Go Back
        </button>

        {showRERA && (
          <button className="rounded border border-white/10 bg-[#2B363D]/95 px-4 py-2 text-sm text-white backdrop-blur hover:bg-[#2B363D]/80 hover:border-white/20 transition duration-200 cursor-pointer">
            RERA
          </button>
        )}

        {showReset && onReset && (
          <button
            onClick={onReset}
            className="rounded-full border border-white/10 bg-[#2B363D]/95 p-2 flex items-center justify-center text-white backdrop-blur hover:bg-[#2B363D]/80 hover:border-white/20 transition duration-200 h-[38px] w-[38px] cursor-pointer"
            title="Reset View"
          >
            <RotateCcw size={18} />
          </button>
        )}
      </div>
    </>
  );
}
