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
}

export default function Sidebar({
  header,
  sections = [],
  footer,
  className = "",
  isFullscreenActive = false,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const HeaderIcon = header?.icon;

  return (
    <>
      {/* Collapsed pill (phone-landscape only) — tap to re-expand */}
      {HeaderIcon && (
        <button
          onClick={() => setIsCollapsed(false)}
          aria-label="Expand categories"
          className={`absolute left-4 top-14 z-20 hidden ${
            isCollapsed ? "phone-landscape:flex" : ""
          } items-center justify-center w-9 h-9 rounded-full bg-[rgba(32,38,42,0.72)] border border-white/[0.08] shadow-[0_12px_30px_rgba(0,0,0,0.18)] text-[#E2E2E2] cursor-pointer`}
        >
          <HeaderIcon size={16} strokeWidth={1.8} />
        </button>
      )}

      <aside
        className={`absolute left-10 top-[6.5rem] z-20 hidden lg:block ${
          isCollapsed ? "" : "phone-landscape:block"
        } phone-landscape:left-4 phone-landscape:top-14 ${className}`}
      >
        <div
          className="
    w-[250px]
    rounded-[10px]
    overflow-hidden

    bg-[rgba(32,38,42,0.72)]
    border border-white/[0.08]

    shadow-[0_12px_30px_rgba(0,0,0,0.18)]
    phone-landscape:w-[160px]
    phone-landscape:rounded-[8px]
  "
        >
          <div
            className={`px-6 py-4 phone-landscape:px-3 phone-landscape:py-2 phone-landscape:overflow-y-auto phone-landscape:scrollbar-hide ${
              isFullscreenActive
                ? "phone-landscape:max-h-[60vh]"
                : "phone-landscape:max-h-[40vh]"
            }`}
          >
            {/* Header */}
            {header && (
              <>
                <div className="flex items-start gap-3 phone-landscape:gap-2">
                  {header.icon && (
                    <button
                      onClick={() => setIsCollapsed(true)}
                      aria-label="Collapse categories"
                      className="shrink-0 cursor-pointer bg-transparent border-0 p-0 flex items-center justify-center"
                    >
                      <header.icon
                        size={24}
                        strokeWidth={1.8}
                        className="text-[#E2E2E2] mt-[2px] phone-landscape:w-4 phone-landscape:h-4"
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

                <hr className="border-[#596164]/50 mt-2 mb-2 phone-landscape:mt-1.5 phone-landscape:mb-1.5" />
              </>
            )}

            {/* Sections */}
            {sections.map((section, index) => (
              <div key={section.id}>
                {section.title &&
                  (section.isCollapsible ? (
                    <button
                      onClick={section.onHeaderClick}
                      className="w-full flex items-center justify-between text-[14px] font-semibold text-[#E2E2E2] mb-2 cursor-pointer hover:text-white transition-colors text-left phone-landscape:text-[11px] phone-landscape:mb-1"
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
                      text-[14px]
                      font-semibold
                      text-[#E2E2E2]
                      mb-2
                      phone-landscape:text-[11px]
                      phone-landscape:mb-1
                    "
                    >
                      {section.title}
                    </h3>
                  ))}

                <div
                  className={`space-y-[2px] overflow-hidden transition-all duration-300 ${
                    section.isCollapsible && !section.isExpanded
                      ? "max-h-0 opacity-0"
                      : "max-h-[500px] opacity-100"
                  }`}
                >
                  {section.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          item.onClick?.();
                          setIsCollapsed(true);
                        }}
                        className={`
                        w-[calc(100%+1.5rem)]
                        -mx-3
                        px-3
                        pl-6
                        py-[8px]
                        flex
                        items-center
                        gap-3
                        text-left
                        transition-all
                        duration-150
                        rounded-[6px]
                        cursor-pointer
                        phone-landscape:pl-5
                        phone-landscape:py-[5px]
                        phone-landscape:gap-2
                        ${
                          item.isActive
                            ? "bg-black/35 text-white font-medium shadow-inner"
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

                <div>{footer}</div>
              </>
            )}
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
