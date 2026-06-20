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
    <aside className={`absolute left-7 top-[140px] bottom-[110px] z-20 w-[280px] rounded-lg border border-white/10 bg-[#2B363D]/85 backdrop-blur-md flex flex-col ${className}`}>
      <div className="p-5 flex flex-col h-full">
        <div className="mb-6 flex items-center gap-3 shrink-0">
          {Icon && (
            <div className="rounded bg-white/5 p-2">
              <Icon size={18} className="text-white" />
            </div>
          )}

          <div>
            {subtitle && (
              <p className="text-[10px] uppercase tracking-wide text-white/40">
                {subtitle}
              </p>
            )}
            <h3 className="text-lg text-white">{title}</h3>
          </div>
        </div>

        <div className="space-y-1 flex-1 overflow-y-auto scrollbar-hide pr-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                item.onClick?.();
                onItemClick?.(item.id);
              }}
              className={`flex w-full items-center gap-3 rounded px-3 py-3 text-left transition capitalize ${
                item.isActive
                  ? "bg-white/8 text-white"
                  : "text-white/60 hover:bg-white/5"
              }`}
            >
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
