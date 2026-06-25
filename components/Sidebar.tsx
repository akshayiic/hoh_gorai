"use client";

import { ReactNode, useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";

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

interface SidebarSection {
  id: string;
  title?: string;
  items: SidebarItem[];
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
    <div className="w-5 h-5 shrink-0 overflow-hidden flex items-center justify-center">
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
}

export default function Sidebar({
  header,
  sections = [],
  footer,
  className = "",
}: SidebarProps) {
  return (
    <aside
      className={`absolute left-6 top-1/2 -translate-y-1/2 z-20 hidden lg:block ${className}`}
    >
      <div
        className="
    w-[250px]
    rounded-[10px]
    overflow-hidden

    bg-[rgba(32,38,42,0.72)]
    border border-white/[0.08]

    shadow-[0_12px_30px_rgba(0,0,0,0.18)]
  "
      >
        <div className="px-6 py-4">
          {/* Header */}
          {header && (
            <>
              <div className="flex items-start gap-3 ">
                {header.icon && (
                  <header.icon
                    size={24}
                    strokeWidth={1.8}
                    className="text-[#E2E2E2] mt-[2px]"
                  />
                )}

                <div>
                  {header.subtitle && (
                    <div className="text-[13px] text-[#BBBBBB] leading-none font-medium">
                      {header.subtitle}
                    </div>
                  )}

                  <h2 className="text-[16px] leading-none font-semibold text-white mt-1">
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
                  "
                >
                  {header.description}
                </p>
              )}

              <hr className="border-[#596164]/50 mt-2 mb-2" />
            </>
          )}

          {/* Sections */}
          {sections.map((section, index) => (
            <div key={section.id}>
              {section.title && (
                <h3
                  className="
                    text-[14px]
                    font-semibold
                    text-[#E2E2E2]
                    mb-2
                  "
                >
                  {section.title}
                </h3>
              )}

              <div className="space-y-[2px]">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={item.onClick}
                      className={`
                        w-[calc(100%+1.5rem)]
                        -mx-3
                        px-3
                        py-[8px]
                        flex
                        items-center
                        gap-3
                        text-left
                        transition-all
                        duration-150
                        rounded-[6px]
                        cursor-pointer
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
                            className={`shrink-0 ${item.isActive ? "text-white" : "text-[#D2D2D2]"}`}
                          />
                        ))}

                      <span className="text-[14px] font-normal">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {index !== sections.length - 1 && (
                <hr className="border-[#596164]/50 my-4" />
              )}
            </div>
          ))}

          {/* Footer */}
          {footer && (
            <>
              <hr className="border-[#596164]/50 my-4" />

              <div>{footer}</div>
            </>
          )}
        </div>
      </div>
    </aside>
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

export function createSidebarSections(
  sections: Array<{
    id: string;
    title?: string;
    items: SidebarItem[];
  }>,
) {
  return sections;
}
