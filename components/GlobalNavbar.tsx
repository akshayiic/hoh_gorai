"use client";

import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

interface GlobalNavbarProps {
  currentPage: string;
  onNavigate?: (view: string) => void;
  showReset?: boolean;
  onReset?: () => void;
  resetTitle?: string;
  resetLabel?: string;
  showRERA?: boolean;
  /**
   * Handles the logo tap when the host page can restart the intro itself (the
   * home experience does). Everywhere else the logo navigates to `/`, which
   * mounts that experience fresh and plays it from the loading screen.
   */
  onLogoClick?: () => void;
}

export default function GlobalNavbar({
  currentPage,
  onNavigate,
  showReset = false,
  onReset,
  resetTitle,
  resetLabel,
  showRERA = false,
  onLogoClick,
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

  const handleStartOver = () => {
    if (onLogoClick) {
      onLogoClick();
      return;
    }
    // Home is a fresh start, so the back trail goes with it.
    sessionStorage.removeItem("nav_history");
    router.push("/");
  };

  const handleGoBack = () => {
    if (currentPage === "location") {
      router.push("/");
      onNavigate?.("");
      return;
    }
    if (history.length > 1) {
      const prevPage = history[history.length - 2];
      const newHistory = history.slice(0, history.length - 1);
      sessionStorage.setItem("nav_history", JSON.stringify(newHistory));

      router.push(prevPage ? `/${prevPage}` : "/");
      onNavigate?.(prevPage || "");
    } else {
      router.push("/");
      onNavigate?.("");
    }
  };

  return (
    <>
      <div className="font-app absolute right-6 top-6 z-20 flex items-start gap-2 phone-landscape:right-4 phone-landscape:top-3 phone-landscape:gap-1.5">
        {/* Back Button (Visible if there is history and not on /location, or if on /location, or if on /apartments) */}
        {((history.length > 1 && currentPage !== "location") ||
          currentPage === "location" ||
          currentPage === "apartments") && (
          <button
            onClick={handleGoBack}
            className="rounded-[10px] border border-[#40484B]/70 bg-[#2C3437]/65 px-5 py-2.5 text-[14px] font-medium text-[#E2E2E2] backdrop-blur-md hover:bg-[#2C3437]/85 hover:text-white transition duration-200 cursor-pointer flex items-center gap-1.5 shadow-lg phone-landscape:px-2.5 phone-landscape:py-1.5 phone-landscape:text-[10px] phone-landscape:rounded-[6px]"
          >
            <img
              src="/icons/back.svg"
              alt="Logo"
              className="h-3 w-3 object-contain phone-landscape:h-2 phone-landscape:w-2"
            />
            {currentPage === "location" ? "Go Home" : "Go Back"}
          </button>
        )}
        {showReset && onReset && (
          <button
            onClick={onReset}
            className={`rounded-[10px] border border-[#40484B]/70 bg-[#2C3437]/65 flex items-center justify-center text-[#E2E2E2] backdrop-blur-md hover:bg-[#2C3437]/85 hover:text-white transition duration-200 cursor-pointer shadow-lg ${
              resetLabel
                ? "px-5 py-2.5 text-[14px] font-medium gap-1.5 phone-landscape:px-2.5 phone-landscape:py-1.5 phone-landscape:text-[10px] phone-landscape:rounded-[6px]"
                : "p-2.5 h-[42px] w-[42px] phone-landscape:h-7 phone-landscape:w-7 phone-landscape:p-1.5 phone-landscape:rounded-[6px]"
            }`}
            title={resetTitle || "Reset View"}
          >
            <RotateCcw
              size={18}
              className="phone-landscape:w-3.5 phone-landscape:h-3.5"
            />
            {resetLabel && <span>{resetLabel}</span>}
          </button>
        )}
      </div>
    </>
  );
}
