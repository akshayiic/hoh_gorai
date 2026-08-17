"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface CompactSidebarItem {
  id: string;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface CompactSidebarProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  items: CompactSidebarItem[];
  className?: string;
  onItemClick?: (itemId: string) => void;
}

export default function CompactSidebar({
  icon: Icon,
  title,
  subtitle,
  items,
  className = "",
  onItemClick,
}: CompactSidebarProps) {
  return (
    <aside className={`absolute left-7 top-1/2 -translate-y-1/2 z-20 w-[280px] max-h-[80vh] rounded-lg border border-[#40484B]/70 bg-[#2C3437]/65 backdrop-blur-md flex flex-col phone-landscape:left-3 phone-landscape:w-[170px] phone-landscape:max-h-[85vh] phone-landscape:rounded-md ${className}`}>
      <div className="p-5 flex flex-col h-full phone-landscape:p-3">
        <div className="mb-6 flex items-center gap-3 shrink-0 phone-landscape:mb-3 phone-landscape:gap-2">
          {Icon && (
            <div className="rounded bg-white/5 p-2 phone-landscape:p-1.5">
              <Icon size={18} className="text-white phone-landscape:w-3.5 phone-landscape:h-3.5" />
            </div>
          )}

          <div>
            {subtitle && (
              <p className="text-[10px] uppercase tracking-wide text-white/40 phone-landscape:text-[8px]">
                {subtitle}
              </p>
            )}
            <h3 className="text-lg text-white phone-landscape:text-[12px]">{title}</h3>
          </div>
        </div>

        <div className="space-y-1 flex-1 overflow-y-auto scrollbar-hide pr-1 phone-landscape:space-y-0.5">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                item.onClick?.();
                onItemClick?.(item.id);
              }}
              className={`flex w-full items-center gap-3 rounded px-3 py-3 text-left transition capitalize phone-landscape:px-2 phone-landscape:py-1.5 ${
                item.isActive
                  ? "bg-black/35 text-white font-medium shadow-inner"
                  : "text-white/60 hover:bg-black/15"
              }`}
            >
              <span className="text-sm phone-landscape:text-[10.5px]">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
