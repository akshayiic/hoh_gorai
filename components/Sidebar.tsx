"use client";

import { ReactNode, useEffect, useState } from "react";
import { LucideIcon, ChevronDown } from "lucide-react";

interface SidebarHeader {
  icon?: LucideIcon;
  subtitle?: string;
  title: string;
  description?: string;
}

interface SidebarItem {
  id: string;
  label: string;
  icon?: any;
  onClick?: () => void;
  isActive?: boolean;
}

export interface SidebarSection {
  id: string;
  title?: string;
  items: SidebarItem[];
  isCollapsible?: boolean;
  isExpanded?: boolean;
  onHeaderClick?: () => void;
}

interface SidebarIconProps {
  src: string;
  isActive: boolean;
}

function SidebarIcon({ src, isActive }: SidebarIconProps) {
  const [svgContent, setSvgContent] = useState<string>("");

  useEffect(() => {
    fetch(src)
      .then((res) => res.text())
      .then((text) => {
        // Strip figma background circles, group borders, and foreignObject elements
        let clean = text.replace(/<circle[^>]*>/g, "");
        clean = clean.replace(/<\/circle>/g, "");
        clean = clean.replace(
          /<foreignObject[^>]*>[\s\S]*?<\/foreignObject>/g,
          "",
        );
        clean = clean.replace(/<g opacity="0.6">[\s\S]*?<\/g>/g, "");

        // Make width and height relative
        clean = clean.replace(/width="\d+"/, 'width="100%"');
        clean = clean.replace(/height="\d+"/, 'height="100%"');

        // Replace solid fills with currentColor to dynamically match text styling
        clean = clean.replace(/fill="white"/g, 'fill="currentColor"');
        clean = clean.replace(/fill="#FBFBFB"/g, 'fill="currentColor"');

        setSvgContent(clean);
      })
      .catch((err) => console.error(err));
  }, [src]);

  return (
    <div className="w-5 h-5 shrink-0 overflow-hidden flex items-center justify-center phone-landscape:w-3.5 phone-landscape:h-3.5">
      <div
        className={`w-full h-full flex items-center justify-center transition-all duration-150`}
        style={{
          transform: isActive ? "scale(2.4)" : "scale(2.2)",
          transformOrigin: "center",
        }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
}

interface SidebarProps {
  header?: SidebarHeader;
  sections?: SidebarSection[];
  footer?: ReactNode;
  className?: string;
  isFullscreenActive?: boolean;
  side?: "left" | "right";
  width?: string;
  activeItemRounded?: boolean;
  /** Tighter vertical rhythm: less padding on the panel and fixed-height rows. */
  compact?: boolean;
  /**
   * Caps each section's list to this many rows and scrolls the rest behind a
   * visible scrollbar. Rows get a fixed height so the cap lands exactly on a
   * row boundary.
   */
  visibleItemCount?: number;
}

export default function Sidebar({
  header,
  sections = [],
  footer,
  className = "",
  isFullscreenActive = false,
  side = "left",
  width = "w-[250px] phone-landscape:w-[160px]",
  activeItemRounded = false,
  compact = false,
  visibleItemCount,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const HeaderIcon = header?.icon;
  // Rows are `space-y-[2px]` apart, so N visible rows measure
  // N * row height + (N - 1) * 2px. --sidebar-row-h is set on the panel below
  // and re-declared for phone-landscape, keeping the cap breakpoint-aware.
  const itemsScrollStyle = visibleItemCount
    ? {
        maxHeight: `calc(var(--sidebar-row-h) * ${visibleItemCount} + 2px * ${
          visibleItemCount - 1
        })`,
      }
    : undefined;
  const sidePosition =
    side === "right"
      ? "right-10 phone-landscape:right-4"
      : "left-6 phone-landscape:left-4";

  return (
    <>
      {/* Collapsed pill — tap to re-expand */}
      {HeaderIcon && (
        <button
          onClick={() => setIsCollapsed(false)}
          aria-label="Expand categories"
          className={`absolute ${sidePosition} top-[6.5rem] phone-landscape:top-14 z-20 ${
            isCollapsed ? "flex" : "hidden"
          } items-center justify-center w-9 h-9 rounded-full bg-[rgba(32,38,42,0.72)] border border-white/[0.08] shadow-[0_12px_30px_rgba(0,0,0,0.18)] text-[#E2E2E2] cursor-pointer`}
        >
          <HeaderIcon size={18} strokeWidth={1.8} />
        </button>
      )}

      <aside
        className={`absolute ${sidePosition} top-[6.5rem] z-20 ${
          isCollapsed ? "hidden" : "hidden lg:block phone-landscape:block"
        } phone-landscape:top-14 ${className}`}
      >
        <div
          className={`
    ${width}
    rounded-[10px]
    overflow-hidden

    bg-[rgba(32,38,42,0.72)]
    border border-white/[0.08]

    shadow-[0_12px_30px_rgba(0,0,0,0.18)]
    phone-landscape:rounded-[8px]
    [--sidebar-row-h:30px]
    phone-landscape:[--sidebar-row-h:24px]
  `}
        >
          <div
            className={`${
              visibleItemCount
                ? ""
                : `phone-landscape:overflow-y-auto phone-landscape:scrollbar-hide ${
                    isFullscreenActive
                      ? "phone-landscape:max-h-[60vh]"
                      : "phone-landscape:max-h-[40vh]"
                  }`
            }`}
          >
            {/* Header — the only block that keeps the panel's padding. Rows
                below carry their own, so a selected row runs edge to edge. */}
            {header && (
              <div
                className={
                  compact
                    ? "px-4 pt-2 phone-landscape:px-3 phone-landscape:pt-1.5"
                    : "px-4 pt-3 phone-landscape:px-3 phone-landscape:pt-2"
                }
              >
                <div className="flex items-start gap-3 phone-landscape:gap-2">
                  {header.icon && (
                    <button
                      onClick={() => setIsCollapsed(true)}
                      aria-label="Collapse categories"
                      className="shrink-0 cursor-pointer bg-transparent border-0  flex items-center justify-center phone-landscape:px-2"
                    >
                      <header.icon
                        size={24}
                        strokeWidth={1.8}
                        className="text-[#E2E2E2] mt-[4px] phone-landscape:w-4 phone-landscape:h-4"
                      />
                    </button>
                  )}

                  <div>
                    {header.subtitle && (
                      <div className="text-[13px] text-[#BBBBBB] leading-none font-medium phone-landscape:text-[9px]">
                        {header.subtitle}
                      </div>
                    )}

                    <h2 className="text-[16px] leading-none font-semibold text-white mt-1 phone-landscape:text-[12px]">
                      {header.title}
                    </h2>
                  </div>
                </div>

                {header.description && (
                  <p
                    className="
                    mt-4
                    text-[14px]
                    leading-[22px]
                    text-[#C7C7C7]
                    font-medium
                    phone-landscape:mt-2
                    phone-landscape:text-[11px]
                    phone-landscape:leading-[16px]
                  "
                  >
                    {header.description}
                  </p>
                )}

                <hr
                  className={`border-[#596164]/50 phone-landscape:mt-1.5 phone-landscape:mb-1.5 ${
                    compact ? "mt-1.5 mb-1.5" : "mt-2 mb-2"
                  }`}
                />
              </div>
            )}

            {/* Sections */}
            <div
              className={`${
                compact
                  ? "pb-2 phone-landscape:pb-1.5"
                  : "pb-3 phone-landscape:pb-2"
              } ${
                header
                  ? ""
                  : compact
                    ? "pt-2 phone-landscape:pt-1.5"
                    : "pt-3 phone-landscape:pt-2"
              }`}
            >
              {sections.map((section, index) => (
              <div key={section.id}>
                {section.title &&
                  (section.isCollapsible ? (
                    <button
                      onClick={section.onHeaderClick}
                      className="w-full flex items-center justify-between px-4 text-[14px] font-semibold text-[#E2E2E2] mb-2 cursor-pointer hover:text-white transition-colors text-left phone-landscape:px-3 phone-landscape:text-[11px] phone-landscape:mb-1"
                    >
                      <span>{section.title}</span>
                      <span
                        className={`transform transition-transform duration-200 ${section.isExpanded ? "rotate-180" : ""}`}
                      >
                        <ChevronDown
                          size={14}
                          className="text-[#C7C7C7] phone-landscape:w-3 phone-landscape:h-3"
                        />
                      </span>
                    </button>
                  ) : (
                    <h3
                      className="
                      px-4
                      text-[14px]
                      font-semibold
                      text-[#E2E2E2]
                      mb-2
                      phone-landscape:px-3
                      phone-landscape:text-[11px]
                      phone-landscape:mb-1
                    "
                    >
                      {section.title}
                    </h3>
                  ))}

                <div
                  style={
                    section.isCollapsible && !section.isExpanded
                      ? undefined
                      : itemsScrollStyle
                  }
                  className={`space-y-[2px] transition-all duration-300 ${
                    visibleItemCount
                      ? "overflow-y-auto overflow-x-hidden sidebar-scroll"
                      : "overflow-hidden"
                  } ${
                    section.isCollapsible && !section.isExpanded
                      ? "max-h-0 opacity-0"
                      : `opacity-100 ${visibleItemCount ? "" : "max-h-[500px]"}`
                  }`}
                >
                  {section.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => item.onClick?.()}
                        className={`
                        w-full
                        px-3
                        pl-6
                        flex
                        items-center
                        gap-3
                        text-left
                        transition-all
                        duration-150
                        rounded-[6px]
                        cursor-pointer
                        phone-landscape:pl-5
                        phone-landscape:gap-2
                        ${
                          compact
                            ? "h-[var(--sidebar-row-h)] py-0 shrink-0"
                            : "py-[8px] phone-landscape:py-[5px]"
                        }
                        ${
                          item.isActive
                            ? `bg-black/35 text-white font-medium shadow-inner ${activeItemRounded ? "rounded-[20px]" : ""}`
                            : "text-[#D2D2D2] hover:bg-black/15 hover:text-white"
                        }
                      `}
                      >
                        {item.icon &&
                          (typeof item.icon === "string" ? (
                            <SidebarIcon
                              src={item.icon}
                              isActive={!!item.isActive}
                            />
                          ) : (
                            <Icon
                              size={15}
                              strokeWidth={1.8}
                              className={`shrink-0 phone-landscape:w-3 phone-landscape:h-3 ${item.isActive ? "text-white" : "text-[#D2D2D2]"}`}
                            />
                          ))}

                        <span className="text-[14px] font-normal phone-landscape:text-[10.5px]">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                  {index !== sections.length - 1 && (
                    <hr className="border-[#596164]/50 my-4 phone-landscape:my-2" />
                  )}
                </div>
              ))}

              {/* Footer */}
              {footer && (
                <>
                  <hr className="border-[#596164]/50 my-4 phone-landscape:my-2" />

                  <div className="px-4 phone-landscape:px-3">{footer}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export function createSidebarItems(
  items: Array<{
    id: string;
    label: string;
    icon?: any;
    onClick?: () => void;
    isActive?: boolean;
  }>,
) {
  return items;
}

export function createSidebarSections(sections: SidebarSection[]) {
  return sections;
}
