"use client";

import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

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
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("nav_history");
      let navHistory: string[] = stored ? JSON.parse(stored) : [];

      // Prevent consecutive duplicate entries of the same page in history
      if (navHistory[navHistory.length - 1] !== currentPage) {
        navHistory.push(currentPage);
        sessionStorage.setItem("nav_history", JSON.stringify(navHistory));
      }
      setHistory(navHistory);
    }
  }, [currentPage]);

  const handleGoBack = () => {
    if (history.length > 1) {
      const prevPage = history[history.length - 2];
      const newHistory = history.slice(0, history.length - 1);
      sessionStorage.setItem("nav_history", JSON.stringify(newHistory));

      router.push(`/${prevPage}`);
      onNavigate?.(prevPage);
    }
  };

  return (
    <>
      {/* LOGO & TITLE BOX */}
      <div className="absolute left-6 top-6 z-20 flex items-center gap-3">
        {/* Logo Box */}
        <div className="flex items-center justify-center w-[58px] h-[58px] bg-[#2C3437]/65 backdrop-blur-md border border-[#40484B]/70 rounded-[5px] shadow-lg">
          <img
            src="/icons/hoh2.svg"
            alt="Logo"
            className="h-8 w-8 object-contain"
          />
        </div>

        {/* Project Name Box (Sidebar themed UI style) */}
        <div className="flex flex-col justify-center h-[58px] px-4 bg-[#2C3437]/65 backdrop-blur-md border border-[#40484B]/70 rounded-[5px] shadow-lg">
          <h1 className="text-[22px] font-bold text-white leading-tight tracking-wide">
            Hiranandani Bay View
          </h1>
          <p className="text-[14px] font-medium text-[#BBBBBB] leading-none mt-1">
            Gorai, Mumbai
          </p>
        </div>
      </div>

      {/* TOP ACTIONS */}
      <div className="absolute right-6 top-8 z-20 flex items-center gap-2">
        {/* Back Button (Only visible if the user has visited a page previously in history, and not on /location) */}
        {history.length > 1 && currentPage !== "location" && (
          <button
            onClick={handleGoBack}
            className="rounded-[10px] border border-[#40484B]/70 bg-[#2C3437]/65 px-5 py-2.5 text-[14px] font-medium text-[#E2E2E2] backdrop-blur-md hover:bg-[#2C3437]/85 hover:text-white transition duration-200 cursor-pointer flex items-center gap-1.5 shadow-lg"
          >
            <img
              src="/icons/back.svg"
              alt="Logo"
              className="h-3 w-3 object-contain"
            />
            Go Back
          </button>
        )}
        {showReset && onReset && (
          <button
            onClick={onReset}
            className="rounded-[10px] border border-[#40484B]/70 bg-[#2C3437]/65 p-2.5 flex items-center justify-center text-[#E2E2E2] backdrop-blur-md hover:bg-[#2C3437]/85 hover:text-white transition duration-200 h-[42px] w-[42px] cursor-pointer shadow-lg"
            title="Reset View"
          >
            <RotateCcw size={18} />
          </button>
        )}

        <div className="flex items-center justify-center p-2">
          <img
            src="/icons/powered.png"
            alt="Logo"
            className="h-12 object-contain"
          />
        </div>
      </div>
    </>
  );
}
