"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarHeader {
  icon?: LucideIcon;
  subtitle?: string;
  title: string;
}

interface SidebarSection {
  id: string;
  title?: string;
  items: SidebarItem[];
}

interface SidebarItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  isActive?: boolean;
  children?: SidebarItem[];
}

interface SidebarProps {
  header?: SidebarHeader;
  sections?: SidebarSection[];
  footer?: ReactNode;
  className?: string;
}

export default function Sidebar({
  header,
  sections = [],
  footer,
  className = "",
}: SidebarProps) {
  return (
    <aside className={`absolute left-8 top-[12rem] z-20 hidden lg:block ${className}`}>
      <div className="rounded-2xl bg-[#0a0a0a]/80 backdrop-blur-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.7)] border border-white/8 w-80 max-h-[calc(100vh-14rem)]">
        <div className="p-5 overflow-y-auto max-h-[calc(100vh-14rem)]">
          {/* Header */}
          {header && (
            <div className="flex items-start gap-4 mb-8">
              {header.icon && (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-white/12 to-white/6 shrink-0 border border-white/10">
                  <header.icon size={22} className="text-white/90" />
                </div>
              )}

              <div className={`${header.icon ? 'flex-1 pt-2' : 'flex-1'}`}>
                {header.subtitle && (
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 leading-none mb-2">
                    {header.subtitle}
                  </p>
                )}

                <h3 className="text-white text-[17px] font-semibold tracking-wide">
                  {header.title}
                </h3>
              </div>
            </div>
          )}

          {/* Sections */}
          {sections.map((section) => (
            <div key={section.id} className="mb-6">
              {section.title && (
                <h4 className="text-white/85 text-[11px] uppercase tracking-[0.15em] font-semibold mb-6 pb-3 border-b border-white/8">
                  {section.title}
                </h4>
              )}

              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="space-y-1">
                      <button
                        onClick={item.onClick}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-300 cursor-pointer rounded-xl ${
                          item.isActive
                            ? "bg-gradient-to-r from-white/18 to-white/12 text-white shadow-lg font-semibold border border-white/8"
                            : "text-white/75 hover:bg-white/8 hover:text-white border border-transparent"
                        }`}
                      >
                        {Icon && <Icon size={17} className="shrink-0" />}
                        <span className="text-[13px] font-medium tracking-wide">
                          {item.label}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Footer */}
          {footer && (
            <div className="mt-8 pt-5 border-t border-white/8">
              {footer}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// Helper function to create sidebar items
export function createSidebarItems(
  items: Array<{
    id: string;
    label: string;
    icon?: LucideIcon;
    onClick?: () => void;
    isActive?: boolean;
  }>
): SidebarItem[] {
  return items;
}

// Helper function to create sidebar sections
export function createSidebarSections(
  sections: Array<{
    id: string;
    title?: string;
    items: SidebarItem[];
  }>
): SidebarSection[] {
  return sections;
}