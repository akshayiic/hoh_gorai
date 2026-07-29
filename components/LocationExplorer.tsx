"use client";

import { useEffect, useRef, useState } from "react";
import {
  Map as MapIcon,
  Plus,
  Minus,
  Landmark,
  Briefcase,
  Trees,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import BottomNavbar from "@/components/BottomNavbar";
import GlobalNavbar from "@/components/GlobalNavbar";
import Sidebar, {
  createSidebarSections,
  createSidebarItems,
} from "@/components/Sidebar";
import {
  loadGoogleMaps,
  createMap,
  createDomOverlay,
  fitBoundsWithMaxZoom,
  fetchGoogleRoute,
  DomOverlayHandle,
} from "@/lib/googleMaps";

const GoraiBayviewLocation = { lat: 19.2341126, lng: 72.8291472 }; // Gorai Bayview Site

interface LocationItem {
  title: string;
  name: string;
  coordinates: { lat: number; lng: number };
  routeCoordinates?: { lat: number; lng: number };
}

const infrastructure: {
  current: {
    title: string;
    icon: any;
    locations: LocationItem[];
  }[];
} = {
  current: [
    {
      title: "Education Institutes",
      icon: "/icons/education.svg",
      locations: [
        {
          title: "VIBGYOR",
          name: "VIBGYOR - 4.4km (13 Mins)",
          coordinates: { lat: 19.2508934, lng: 72.8506325 },
        },
        {
          title: "ORCHIDS",
          name: "ORCHIDS - 1.7km (7 Mins)",
          coordinates: { lat: 19.227209, lng: 72.8345879 },
        },
        {
          title: "DON BOSCO",
          name: "DON BOSCO - 1.7km (5 Mins)",
          coordinates: { lat: 19.230664, lng: 72.8415354 },
        },
        {
          title: "Swami Vivekanandand International school",
          name: "Swami Vivekanandand International school  - 5.8km (19 Mins)",
          coordinates: { lat: 19.2096745, lng: 72.8472554 },
        },
      ],
    },
    {
      title: "Banks",
      icon: Landmark,
      locations: [
        {
          title: "HDFC",
          name: "HDFC  - 3km (10 Mins)",
          coordinates: { lat: 19.230887, lng: 72.8512622 },
        },
        {
          title: "bank of baroda",
          name: "bank of baroda - 3.2km (12 Mins)",
          coordinates: { lat: 19.2263277, lng: 72.8531056 },
        },
        {
          title: "Axis Bank",
          name: "Axis Bank  - 6.2km (20 Mins)",
          coordinates: { lat: 19.2285996, lng: 72.8636277 },
        },
        {
          title: "CKP Bank",
          name: "CKP Bank - 600m (8 Mins)",
          coordinates: { lat: 19.2301197, lng: 72.8289677 },
        },
        {
          title: "Uco Bank",
          name: "Uco Bank - 5.6km (18 Mins)",
          coordinates: { lat: 19.2293833, lng: 72.8588835 },
        },
        {
          title: "Union Bank of India",
          name: "Union Bank of India  - 3.7km (11 Mins)",
          coordinates: { lat: 19.2464863, lng: 72.8495949 },
        },
        {
          title: "bank of maharashtra",
          name: "bank of maharashtra  - 2.8km (10 Mins)",
          coordinates: { lat: 19.2127887, lng: 72.8283273 },
        },
        {
          title: "ICICI",
          name: "ICICI - 300m (4 Mins)",
          coordinates: { lat: 19.2322104, lng: 72.8287817 },
        },
      ],
    },
    {
      title: "Recreational",
      icon: Trees,
      locations: [
        {
          title: "Vipasana pagoda",
          name: "Vipasana pagoda - 4.2km (31 Mins)",
          coordinates: { lat: 19.2282034, lng: 72.8058891 },
          routeCoordinates: { lat: 19.228763, lng: 72.804391 },
        },
        {
          title: "gorai beach",
          name: "gorai beach - 5.4km (35 Mins)",
          coordinates: { lat: 19.2419548, lng: 72.7808269 },
        },
        {
          title: "Sanjay Gandhi National park",
          name: "Sanjay Gandhi National park - 6.4km (21 Mins)",
          coordinates: { lat: 19.2314868, lng: 72.8636083 },
        },
        {
          title: "uttan beach",
          name: "uttan beach - 10.9km (48 Mins)",
          coordinates: { lat: 19.281841, lng: 72.784661 },
        },
        {
          title: "Madh island",
          name: "Madh island  - 14.4km (38 Mins)",
          coordinates: { lat: 19.1484913, lng: 72.7891606 },
        },
        {
          title: "water kingdom",
          name: "water kingdom - 3.9km (35 Mins)",
          coordinates: { lat: 19.2314893, lng: 72.7819392 },
        },
      ],
    },
    {
      title: "Lifestyle & Social",
      icon: "/icons/lifestyle.svg",
      locations: [
        {
          title: "Sky City mall",
          name: "Sky City mall - 5.6km (21 Mins)",
          coordinates: { lat: 19.223302, lng: 72.8642378 },
        },
        {
          title: "inorbit mall",
          name: "inorbit mall  - 9km (31 Mins)",
          coordinates: { lat: 19.1729281, lng: 72.8359056 },
        },
        {
          title: "Croma",
          name: "Croma - 3.2km (11 Mins)",
          coordinates: { lat: 19.2337106, lng: 72.8538108 },
        },
        {
          title: "Goregaon sports club",
          name: "Goregaon sports club - 6.9km (25 Mins)",
          coordinates: { lat: 19.1820887, lng: 72.8355377 },
        },
        {
          title: "Oberoi  mall",
          name: "Oberoi  mall - 12.4km (39 Mins)",
          coordinates: { lat: 19.1741983, lng: 72.8604101 },
        },
        {
          title: "vijay sales",
          name: "vijay sales - 4.1km (14 Mins)",
          coordinates: { lat: 19.2169591, lng: 72.8514918 },
        },
        {
          title: "infinity mall",
          name: "infinity mall - 6.8km (25 Mins)",
          coordinates: { lat: 19.184753, lng: 72.8341927 },
        },
        {
          title: "nesco",
          name: "nesco - 12.8km (48 Mins)",
          coordinates: { lat: 19.150269, lng: 72.8530249 },
        },
        {
          title: "Reliance",
          name: "Reliance - 2.4km (8 Mins)",
          coordinates: { lat: 19.2302534, lng: 72.8477749 },
        },
      ],
    },
    {
      title: "Transport",
      icon: "/icons/connectivity.svg",
      locations: [
        {
          title: "western express highway",
          name: "western express highway - 11.9km (36 Mins)",
          coordinates: { lat: 19.1663509, lng: 72.8586328 },
        },
        {
          title: "borivali Metro",
          name: "borivali Metro - 1.7km (5 Mins)",
          coordinates: { lat: 19.231312, lng: 72.840864 },
        },
        {
          title: "Mumbai Metro Line 9 & 7A",
          name: "Mumbai Metro Line 9 & 7A - 8.9km (23 Mins)",
          coordinates: { lat: 19.2712538, lng: 72.8808657 },
        },
        {
          title: "New link road",
          name: "New link road - 5.9km (20 Mins)",
          coordinates: { lat: 19.1898948, lng: 72.8354623 },
        },
        {
          title: "SV Road",
          name: "SV Road - 9.8km (35 Mins)",
          coordinates: { lat: 19.1734416, lng: 72.8541016 },
        },
      ],
    },
    {
      title: "Hospitals",
      icon: "/icons/hospital.svg",
      locations: [
        {
          title: "Apex Hospital",
          name: "Apex Hospital - 2.5km (8 Mins)",
          coordinates: { lat: 19.231218, lng: 72.8494247 },
        },
        {
          title: "Zenith Hospital",
          name: "Zenith Hospital - 5.3km (18 Mins)",
          coordinates: { lat: 19.1951084, lng: 72.8340496 },
        },
        {
          title: "Pheonix hospital",
          name: "Pheonix hospital - 4.8km (13 Mins)",
          coordinates: { lat: 19.2522023, lng: 72.8509017 },
        },
        {
          title: "Lotus Hospital",
          name: "Lotus Hospital - 3.1km (9 Mins)",
          coordinates: { lat: 19.2405126, lng: 72.8451783 },
        },
        {
          title: "Arihant Super Speciality",
          name: "Arihant Super Speciality - 4.3km (13 Mins)",
          coordinates: { lat: 19.2189271, lng: 72.8523851 },
        },
        {
          title: "Karuna Hospital",
          name: "Karuna Hospital- 4.7km (14 Mins)",
          coordinates: { lat: 19.2412571, lng: 72.8529326 },
        },
      ],
    },
    {
      title: "Commercial Hubspots",
      icon: Briefcase,
      locations: [
        {
          title: "Goregaon",
          name: "Goregaon - 10.6km (37 Mins)",
          coordinates: { lat: 19.1662566, lng: 72.8525696 },
        },
        {
          title: "Worli",
          name: "Worli  - 34.3km (1hr 25 Mins)",
          coordinates: { lat: 18.9986406, lng: 72.8173599 },
        },
        {
          title: "malad",
          name: "malad - 6km (20 Mins)",
          coordinates: { lat: 19.1889541, lng: 72.835543 },
        },
        {
          title: "Lower Parel",
          name: "Lower Parel - 33.3km (1 hr 21 Mins)",
          coordinates: { lat: 18.9982461, lng: 72.8269646 },
        },
        {
          title: "BKC",
          name: "BKC - 26.8km (1hr 9 Mins)",
          coordinates: { lat: 19.0687893, lng: 72.8702647 },
        },
        {
          title: "Powai",
          name: "Powai - 21.6km (59 Mins)",
          coordinates: { lat: 19.1175993, lng: 72.9059747 },
        },
        {
          title: "Thane",
          name: "Thane - 28.4km (1hr 19 Mins)",
          coordinates: { lat: 19.2122949, lng: 72.9771661 },
        },
        {
          title: "CST",
          name: "CST - 43.8km (1hr 35 Mins)",
          coordinates: { lat: 18.9401131, lng: 72.8357207 },
        },
        {
          title: "Andheri",
          name: "Andheri - 18.6km (52 Mins)",
          coordinates: { lat: 19.1178548, lng: 72.8631304 },
        },
        {
          title: "Nariman Point",
          name: "Nariman Point - 44km (1hr 31 Mins)",
          coordinates: { lat: 18.9257027, lng: 72.8186357 },
        },
      ],
    },
    {
      title: "Upcoming Infrastructure",
      icon: "/icons/connectivity.svg",
      locations: [
        {
          title: "Coastal Road",
          name: "Coastal Road - upcoming - 4km (13 Mins)",
          coordinates: { lat: 19.214745, lng: 72.8117535 },
        },
        {
          title: "Borivali Thane twin Tunnel",
          name: "Borivali Thane twin Tunnel - upcoming - 5.8km (22 Mins)",
          coordinates: { lat: 19.2217681, lng: 72.8691741 },
        },
      ],
    },
  ],
};

const categoryDisplayNames: Record<string, string> = {
  "Education Institutes": "Education Institutes",
  Banks: "Bank",
  Recreational: "Recreational",
  "Lifestyle & Social": "Lifestyle & Social",
  Transport: "Transport",
  Hospitals: "Hospital",
  "Commercial Hubspots": "Commercial Hubspot",
  "Upcoming Infrastructure": "Upcoming Infrastructure",
};

function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1),
  );
}

function parseLocationName(title: string, name: string) {
  const index = name.indexOf(" - ");
  if (index === -1) {
    return { title: toTitleCase(title), distance: "", duration: "" };
  }
  const mainTitle = name.substring(0, index).trim();
  const info = name.substring(index + 3).trim();

  const infoParts = info.split("(");
  const distance = infoParts[0].trim();
  let duration = "";
  if (infoParts.length > 1) {
    duration = infoParts[1].replace(")", "").trim();
  }
  return {
    title: toTitleCase(mainTitle || title),
    distance: distance ? `${distance}` : "",
    duration: duration ? `${duration}` : "",
  };
}

function formatDurationForCard(dur: string) {
  if (!dur) return "";
  const clean = dur
    .toLowerCase()
    .replace("drive", "")
    .replace("mins", "mins")
    .replace("min", "mins")
    .trim();
  return `Reach in ${clean}`;
}

function formatDistanceForCard(dist: string) {
  if (!dist) return "";
  const clean = dist.toLowerCase().replace("away", "").trim();
  return `${clean} away`;
}

interface LocationExplorerProps {
  onNavigate?: (
    view: "location" | "balcony" | "apartments" | "amenities",
  ) => void;
}

export default function LocationExplorer({
  onNavigate,
}: LocationExplorerProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(
    "Education Institutes",
  );
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [originAddress, setOriginAddress] = useState(
    "Gorai Bayview, Borivali West, Mumbai",
  );
  const [destinationAddress, setDestinationAddress] = useState("");
  const [isCleanView, setIsCleanView] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(
    null,
  );
  const [activeRoute, setActiveRoute] = useState<{
    distance: string;
    duration: string;
    destinationName: string;
  } | null>(null);

  const [isRouteLoading, setIsRouteLoading] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<DomOverlayHandle[]>([]);
  const labelMarkersRef = useRef<DomOverlayHandle[]>([]);
  const homeMarkerRef = useRef<DomOverlayHandle | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const routePolylineRef = useRef<google.maps.Polyline | null>(null);
  const routeGlowPolylineRef = useRef<google.maps.Polyline | null>(null);
  const routeHeadMarkerRef = useRef<DomOverlayHandle | null>(null);

  const collisionTimeoutRef = useRef<number | null>(null);
  const selectedLocationRef = useRef<LocationItem | null>(null);

  useEffect(() => {
    selectedLocationRef.current = selectedLocation;
    resolveLabelCollisions();
  }, [selectedLocation]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    let cancelled = false;

    loadGoogleMaps().then(() => {
      if (cancelled || !mapContainerRef.current) return;

      const map = createMap(mapContainerRef.current, {
        center: GoraiBayviewLocation,
        zoom: 13,
      });
      mapRef.current = map;

      google.maps.event.addListenerOnce(map, "idle", () => {
        // Add a distinct pulse marker for Gorai Bayview
        const el = document.createElement("div");
        el.className = "luxury-home-marker flex items-center justify-center";
        el.style.width = "48px";
        el.style.height = "48px";
        el.style.cursor = "pointer";
        el.style.zIndex = "9999";
        el.style.transform = "translate(-50%, -50%)";

        el.innerHTML = `
          <div class="luxury-home-pulse-ring"></div>
          <div class="luxury-home-inner">
            <img src="/icons/hoh.svg" class="w-12 h-12 object-contain animate-gentle-bounce" alt="Hiranandani Site" />
          </div>
          <div class="luxury-hover-popup luxury-home-popup" style="display: none;">
            <div class="luxury-mini-card" style="padding: 2px;">
                <div class="category">Hiranandani Project</div>
                <div class="title" style="margin-bottom: 0; font-family: sans-serif; font-size: 14px; font-weight: 600;">Gorai Bayview</div>
              </div>
          </div>
        `;

        const popupEl = el.querySelector(
          ".luxury-home-popup",
        ) as HTMLDivElement;
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          if (popupEl) {
            popupEl.style.display =
              popupEl.style.display === "none" ? "block" : "none";
          }
        });

        const homeMarker = createDomOverlay(GoraiBayviewLocation, el);
        homeMarker.setMap(map);

        homeMarkerRef.current = homeMarker;
        setMapLoaded(true);
      });
    });

    return () => {
      cancelled = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (homeMarkerRef.current) {
        homeMarkerRef.current.setMap(null);
        homeMarkerRef.current = null;
      }
      if (mapRef.current) {
        google.maps.event.clearInstanceListeners(mapRef.current);
        mapRef.current = null;
      }
    };
  }, []);

  const resolveLabelCollisions = () => {
    if (collisionTimeoutRef.current) {
      cancelAnimationFrame(collisionTimeoutRef.current);
    }

    collisionTimeoutRef.current = requestAnimationFrame(() => {
      const map = mapRef.current;
      if (!map) return;

      const labelMarkers = labelMarkersRef.current;
      if (labelMarkers.length === 0) return;

      const selectedTitle = selectedLocationRef.current?.title;
      const R = 15; // Marker radius (since diameter is 30px, R = 15)
      const gap = 10; // Gap between circle marker and label text

      // Screen position and collision box for Home Marker
      const homeScreenPos = homeMarkerRef.current?.getScreenPosition();
      if (!homeScreenPos) return;
      const homeR = 26; // Radius around home monogram (48px / 2 + padding)

      interface ResolvedLabel {
        title: string;
        rect: { left: number; right: number; top: number; bottom: number };
        circleX: number;
        circleY: number;
        hidden: boolean;
      }
      const resolvedLabels: ResolvedLabel[] = [];

      // Sort markers: active selected marker first
      const markerInfos = labelMarkers
        .map((marker) => {
          const el = marker.element;
          const locTitle = marker.locTitle || "";
          const isSelected = locTitle === selectedTitle;
          const screenPos = marker.getScreenPosition();
          if (!screenPos) return null;

          const textEl = el.querySelector(
            ".luxury-label-text-wrapper",
          ) as HTMLDivElement;
          const textRect = textEl
            ? textEl.getBoundingClientRect()
            : { width: 0, height: 0 };
          let width = textRect.width;
          let height = textRect.height;

          // Fallback for first-render / hidden layout width
          if (!width || width < 5) {
            width = locTitle.length * 6.5 + 10;
          }
          if (!height || height < 5) {
            height = 14;
          }

          return {
            marker,
            el,
            title: locTitle,
            isSelected,
            x: screenPos.x,
            y: screenPos.y,
            width,
            height,
          };
        })
        .filter((info): info is NonNullable<typeof info> => info !== null);

      markerInfos.sort(
        (a, b) => (b.isSelected ? 1 : 0) - (a.isSelected ? 1 : 0),
      );

      const positionsOrder = [
        "Top",
        "TopRight",
        "Right",
        "BottomRight",
        "Bottom",
        "BottomLeft",
        "Left",
        "TopLeft",
      ];

      const lineLengths = [30, 55, 80, 110, 145, 180, 220];

      const getLabelCenter = (
        x: number,
        y: number,
        offsetX: number,
        offsetY: number,
        pos: string,
        W_lbl: number,
        H_lbl: number,
      ) => {
        let cx = x + offsetX;
        let cy = y + offsetY;

        if (pos === "Left") {
          cx = x + offsetX - R - gap - W_lbl;
        } else if (pos === "Right") {
          cx = x + offsetX + R + gap + W_lbl;
        } else if (pos.includes("Top")) {
          cy = y + offsetY - R - gap - H_lbl;
        } else if (pos.includes("Bottom")) {
          cy = y + offsetY + R + gap + H_lbl;
        }
        return { cx, cy };
      };

      const getLabelRect = (
        cx: number,
        cy: number,
        W_lbl: number,
        H_lbl: number,
      ) => {
        return {
          left: cx - W_lbl,
          right: cx + W_lbl,
          top: cy - H_lbl,
          bottom: cy + H_lbl,
        };
      };

      const checkOverlap = (
        r1: { left: number; right: number; top: number; bottom: number },
        r2: { left: number; right: number; top: number; bottom: number },
        padding = 6,
      ) => {
        return !(
          r1.right + padding < r2.left ||
          r2.right + padding < r1.left ||
          r1.bottom + padding < r2.top ||
          r2.bottom + padding < r1.top
        );
      };

      const checkCircleRectOverlap = (
        cx: number,
        cy: number,
        r: number,
        rect: { left: number; right: number; top: number; bottom: number },
      ) => {
        const closestX = Math.max(rect.left, Math.min(cx, rect.right));
        const closestY = Math.max(rect.top, Math.min(cy, rect.bottom));
        const distanceX = cx - closestX;
        const distanceY = cy - closestY;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;
        return distanceSquared < (r + 4) * (r + 4);
      };

      markerInfos.forEach((info) => {
        const W_lbl = info.width / 2;
        const H_lbl = info.height / 2;

        let bestPosition = "Top";
        let bestOffsetX = 0;
        let bestOffsetY = -R - 24;
        let bestD = 24;
        let found = false;

        const currentLineLengths = info.isSelected
          ? [55, 80, 110, 145, 180, 220]
          : lineLengths;

        for (let dIdx = 0; dIdx < currentLineLengths.length && !found; dIdx++) {
          const D = currentLineLengths[dIdx];

          for (let pIdx = 0; pIdx < positionsOrder.length; pIdx++) {
            const pos = positionsOrder[pIdx];
            let offsetX = 0;
            let offsetY = 0;

            const diag = Math.round((R + D) * 0.707);

            switch (pos) {
              case "Top":
                offsetX = 0;
                offsetY = -R - D;
                break;
              case "TopRight":
                offsetX = diag;
                offsetY = -diag;
                break;
              case "Right":
                offsetX = R + D;
                offsetY = 0;
                break;
              case "BottomRight":
                offsetX = diag;
                offsetY = diag;
                break;
              case "Bottom":
                offsetX = 0;
                offsetY = R + D;
                break;
              case "BottomLeft":
                offsetX = -diag;
                offsetY = diag;
                break;
              case "Left":
                offsetX = -R - D;
                offsetY = 0;
                break;
              case "TopLeft":
                offsetX = -diag;
                offsetY = -diag;
                break;
            }

            const { cx, cy } = getLabelCenter(
              info.x,
              info.y,
              offsetX,
              offsetY,
              pos,
              W_lbl,
              H_lbl,
            );
            const candidateRect = getLabelRect(cx, cy, W_lbl, H_lbl);
            const candidateCircleX = info.x + offsetX;
            const candidateCircleY = info.y + offsetY;
            let hasCollision = false;

            // 1. Check label overlap with Home Marker
            const distToHome = Math.sqrt(
              (cx - homeScreenPos.x) * (cx - homeScreenPos.x) +
                (cy - homeScreenPos.y) * (cy - homeScreenPos.y),
            );
            if (distToHome < homeR + W_lbl + 8) {
              hasCollision = true;
            }

            // 2. Check label overlap with other resolved labels
            if (!hasCollision) {
              for (let k = 0; k < resolvedLabels.length; k++) {
                if (resolvedLabels[k].hidden) continue;
                if (checkOverlap(candidateRect, resolvedLabels[k].rect, 8)) {
                  hasCollision = true;
                  break;
                }
              }
            }

            // 3. Check label overlap with any POI dot (original coordinate positions)
            if (!hasCollision) {
              for (let k = 0; k < markerInfos.length; k++) {
                if (markerInfos[k].title === info.title) continue;
                if (
                  checkCircleRectOverlap(
                    markerInfos[k].x,
                    markerInfos[k].y,
                    R + 4,
                    candidateRect,
                  )
                ) {
                  hasCollision = true;
                  break;
                }
              }
            }

            // 4. Check label overlap with resolved OFFSET circles (critical: prevents text overlapping other markers' circles)
            if (!hasCollision) {
              for (let k = 0; k < resolvedLabels.length; k++) {
                if (resolvedLabels[k].hidden) continue;
                if (
                  checkCircleRectOverlap(
                    resolvedLabels[k].circleX,
                    resolvedLabels[k].circleY,
                    R + 6,
                    candidateRect,
                  )
                ) {
                  hasCollision = true;
                  break;
                }
              }
            }

            // 5. Check candidate circle overlap with other resolved circles
            if (!hasCollision) {
              for (let k = 0; k < resolvedLabels.length; k++) {
                if (resolvedLabels[k].hidden) continue;
                const dx = candidateCircleX - resolvedLabels[k].circleX;
                const dy = candidateCircleY - resolvedLabels[k].circleY;
                const distCircles = Math.sqrt(dx * dx + dy * dy);
                if (distCircles < 2 * R + 14) {
                  hasCollision = true;
                  break;
                }
              }
            }

            // 6. Check candidate circle overlap with Home Marker
            if (!hasCollision) {
              const distCircleToHome = Math.sqrt(
                (candidateCircleX - homeScreenPos.x) *
                  (candidateCircleX - homeScreenPos.x) +
                  (candidateCircleY - homeScreenPos.y) *
                    (candidateCircleY - homeScreenPos.y),
              );
              if (distCircleToHome < homeR + R + 8) {
                hasCollision = true;
              }
            }

            // 7. Check candidate circle overlap with resolved label rects (prevents circle sitting on top of other text)
            if (!hasCollision) {
              for (let k = 0; k < resolvedLabels.length; k++) {
                if (resolvedLabels[k].hidden) continue;
                if (
                  checkCircleRectOverlap(
                    candidateCircleX,
                    candidateCircleY,
                    R + 4,
                    resolvedLabels[k].rect,
                  )
                ) {
                  hasCollision = true;
                  break;
                }
              }
            }

            if (!hasCollision) {
              bestPosition = pos;
              bestOffsetX = offsetX;
              bestOffsetY = offsetY;
              bestD = D;
              found = true;
              break;
            }
          }
        }

        // Fallback for selected marker if no collision-free position was found
        if (info.isSelected && !found) {
          bestPosition = "Right";
          bestD = 80;
          bestOffsetX = R + 80;
          bestOffsetY = 0;
          found = true;
        }

        // Hide label if no collision-free position was found
        const hidden = !found && !info.isSelected;
        const { cx: finalCx, cy: finalCy } = getLabelCenter(
          info.x,
          info.y,
          bestOffsetX,
          bestOffsetY,
          bestPosition,
          W_lbl,
          H_lbl,
        );
        const finalRect = getLabelRect(finalCx, finalCy, W_lbl, H_lbl);

        resolvedLabels.push({
          title: info.title,
          rect: finalRect,
          circleX: info.x + bestOffsetX,
          circleY: info.y + bestOffsetY,
          hidden,
        });

        const circleEl = info.el.querySelector(
          ".luxury-marker-circle",
        ) as HTMLDivElement;
        const pathEl = info.el.querySelector(
          ".luxury-leader-path",
        ) as SVGPathElement;

        if (hidden) {
          info.el.classList.add("hidden-label");
        } else {
          info.el.classList.remove("hidden-label");
        }

        const posClass = `pos-${bestPosition.toLowerCase()}`;
        positionsOrder.forEach((p) =>
          info.el.classList.remove(`pos-${p.toLowerCase()}`),
        );
        info.el.classList.add(posClass);

        const isSelected = info.title === selectedTitle;
        if (isSelected) {
          info.el.classList.add("active");
        } else {
          info.el.classList.remove("active");
        }

        if (circleEl) {
          circleEl.style.opacity = "1";
          circleEl.style.pointerEvents = "auto";
          circleEl.style.setProperty("--offset-x", `${bestOffsetX}px`);
          circleEl.style.setProperty("--offset-y", `${bestOffsetY}px`);
        }

        if (pathEl) {
          // Apply stroke & stroke-width inline (using brown (#5B4A3D) as baseline color)
          pathEl.style.stroke = isSelected ? "#C79A59" : "#5B4A3D";
          pathEl.style.strokeWidth = isSelected ? "2px" : "1.5px";

          const cx_svg = 250;
          const cy_svg = 250;
          const dotRadius = 5; // 5px radius for 10px diameter dot

          let startX = 0;
          let startY = 0;
          let endX = bestOffsetX;
          let endY = bestOffsetY;
          let cornerX = 0;
          let cornerY = 0;
          let hasCorner = false;

          const absX = Math.abs(bestOffsetX);
          const absY = Math.abs(bestOffsetY);

          if (absX < 5 || absY < 5) {
            // Purely vertical or horizontal straight line
            const dist = Math.sqrt(
              bestOffsetX * bestOffsetX + bestOffsetY * bestOffsetY,
            );
            if (dist > R + dotRadius) {
              startX = bestOffsetX * (dotRadius / dist);
              startY = bestOffsetY * (dotRadius / dist);
              endX = bestOffsetX * ((dist - R) / dist);
              endY = bestOffsetY * ((dist - R) / dist);
            }
          } else if (Math.abs(absX - absY) < 5) {
            // Purely 45-degree straight line
            const dist = Math.sqrt(
              bestOffsetX * bestOffsetX + bestOffsetY * bestOffsetY,
            );
            if (dist > R + dotRadius) {
              startX = bestOffsetX * (dotRadius / dist);
              startY = bestOffsetY * (dotRadius / dist);
              endX = bestOffsetX * ((dist - R) / dist);
              endY = bestOffsetY * ((dist - R) / dist);
            }
          } else {
            // 45-degree diagonal segment first, then horizontal/vertical segment
            hasCorner = true;
            if (absY > absX) {
              // Vertical segment at the end
              cornerX = bestOffsetX;
              cornerY = Math.sign(bestOffsetY) * absX;
            } else {
              // Horizontal segment at the end
              cornerX = Math.sign(bestOffsetX) * absY;
              cornerY = bestOffsetY;
            }

            // Clip start of Segment A (from 0,0 to cornerX,cornerY)
            const lenA = Math.sqrt(cornerX * cornerX + cornerY * cornerY);
            if (lenA > dotRadius) {
              startX = cornerX * (dotRadius / lenA);
              startY = cornerY * (dotRadius / lenA);
            }

            // Clip end of Segment B (from cornerX,cornerY to bestOffsetX,bestOffsetY)
            if (cornerX === bestOffsetX) {
              // Vertical segment
              const lenB = Math.abs(bestOffsetY - cornerY);
              if (lenB > R) {
                endX = bestOffsetX;
                endY = bestOffsetY - Math.sign(bestOffsetY - cornerY) * R;
              } else {
                endX = cornerX;
                endY = cornerY;
              }
            } else {
              // Horizontal segment
              const lenB = Math.abs(bestOffsetX - cornerX);
              if (lenB > R) {
                endX = bestOffsetX - Math.sign(bestOffsetX - cornerX) * R;
                endY = bestOffsetY;
              } else {
                endX = cornerX;
                endY = cornerY;
              }
            }
          }

          // Adjust to SVG coordinates (centered at 250, 250)
          const sX = cx_svg + startX;
          const sY = cy_svg + startY;
          const eX = cx_svg + endX;
          const eY = cx_svg + endY;

          let dAttr = "";
          if (hasCorner) {
            const cX = cx_svg + cornerX;
            const cY = cy_svg + cornerY;
            dAttr = `M ${sX},${sY} L ${cX},${cY} L ${eX},${eY}`;
          } else {
            dAttr = `M ${sX},${sY} L ${eX},${eY}`;
          }
          pathEl.setAttribute("d", dAttr);
        }
      });
    });
  };

  // Update Category Markers when category changes (created once per category)
  const updateCategoryMarkers = (
    map: google.maps.Map | null,
    category: string,
  ) => {
    if (!map) return;

    // Clear old markers and labels
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    labelMarkersRef.current.forEach((m) => m.setMap(null));
    labelMarkersRef.current = [];

    if (!category) return;

    const catData = infrastructure.current.find(
      (item) => item.title === category,
    );
    if (!catData) return;

    const iconMap: Record<string, string> = {
      "Education Institutes": `<img src="/icons/education.svg" class="w-[22px] h-[22px] object-contain" alt="Education" />`,
      Banks: `<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: #ffffff;"><line x1="3" y1="22" x2="21" y2="22" /><line x1="6" y1="18" x2="6" y2="11" /><line x1="10" y1="18" x2="10" y2="11" /><line x1="14" y1="18" x2="14" y2="11" /><line x1="18" y1="18" x2="18" y2="11" /><polygon points="12 2 20 7 4 7" /></svg>`,
      Recreational: `<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: #ffffff;"><path d="M10 22v-5" /><path d="M10 17a4 4 0 0 1-4-4c0-2 2-3 2-3s0-1 1-2 2-1 2-1 1 0 2 1 1 2 1 2 2 1 2 3a4 4 0 0 1-4 4z" /><path d="M14 22v-4" /><path d="M14 18a3 3 0 0 0 3-3c0-1.5-1.5-2.25-1.5-2.25s0-.75-.75-1.5-1.5-.75-1.5-.75-.75 0-1.5.75-.75 1.5-.75 1.5-1.5.75-1.5 2.25a3 3 0 0 0 3 3z" /></svg>`,
      "Lifestyle & Social": `<img src="/icons/lifestyle.svg" class="w-[22px] h-[22px] object-contain" alt="Lifestyle" />`,
      Transport: `<img src="/icons/connectivity.svg" class="w-[22px] h-[22px] object-contain" alt="Transport" />`,
      Hospitals: `<img src="/icons/hospital.svg" class="w-[22px] h-[22px] object-contain" alt="Hospitals" />`,
      "Commercial Hubspots": `<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: #ffffff;"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /><rect width="20" height="14" x="2" y="6" rx="2" /></svg>`,
      "Upcoming Infrastructure": `<img src="/icons/connectivity.svg" class="w-[22px] h-[22px] object-contain" alt="Upcoming Infrastructure" />`,
    };

    catData.locations.forEach((loc) => {
      if (loc.title === "Gorai Bayview Site") return;

      const parsed = parseLocationName(loc.title, loc.name);

      const markerEl = document.createElement("div");
      markerEl.className = "luxury-annotation-container";

      // 1. Create pinpoint ring (hollow brown circle dot)
      const dotEl = document.createElement("div");
      dotEl.className = "luxury-dot";
      dotEl.style.cssText =
        "position: absolute; width: 10px; height: 10px; border: 2px solid #5B4A3D; background-color: transparent; border-radius: 50%; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35); transform: translate(-50%, -50%); z-index: 50; transition: transform 250ms ease;";
      markerEl.appendChild(dotEl);

      // 2. Create SVG and path programmatically (namespace-safe)
      const svgEl = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
      );
      svgEl.setAttribute("class", "luxury-leader-svg");
      svgEl.setAttribute("width", "500");
      svgEl.setAttribute("height", "500");
      svgEl.style.cssText =
        "position: absolute; top: -250px; left: -250px; width: 500px; height: 500px; pointer-events: none; overflow: visible; z-index: 1;";

      const pathEl = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      pathEl.setAttribute("class", "luxury-leader-path");
      pathEl.setAttribute("fill", "none");
      pathEl.setAttribute("stroke", "#5B4A3D");
      pathEl.setAttribute("stroke-width", "1.5");
      pathEl.setAttribute("d", "");
      svgEl.appendChild(pathEl);
      markerEl.appendChild(svgEl);

      // 3. Create Circle Marker
      const circleEl = document.createElement("div");
      circleEl.className = "luxury-marker-circle";
      circleEl.innerHTML = `
        <div class="luxury-marker-icon">${iconMap[category] || ""}</div>
          <div class="luxury-label-text-wrapper">
            <span class="luxury-label-text">${toTitleCase(parsed.title)}</span>
          </div>
      `;
      markerEl.appendChild(circleEl);

      const labelMarker = createDomOverlay(loc.coordinates, markerEl);
      labelMarker.setMap(map);

      // Click/Tap handler directly on circle wrapper
      circleEl.addEventListener("click", (e) => {
        e.stopPropagation();

        const isMobile =
          typeof window !== "undefined" && window.innerWidth < 1024;
        const isActive = markerEl.classList.contains("active");

        if (isMobile) {
          if (isActive) {
            handleShowRoute(loc.routeCoordinates || loc.coordinates, loc.title);
          } else {
            setSelectedLocation(loc);
            if (mapRef.current) {
              mapRef.current.panTo(loc.coordinates);
              mapRef.current.setZoom(14);
            }
          }
        } else {
          setSelectedLocation(loc);
          handleShowRoute(loc.routeCoordinates || loc.coordinates, loc.title);
        }
      });

      labelMarker.locTitle = loc.title;

      labelMarkersRef.current.push(labelMarker);
      markersRef.current.push(labelMarker);
    });

    // Auto-fit bounds to encompass all locations in the category plus the main site
    if (catData.locations.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(GoraiBayviewLocation);
      catData.locations.forEach((loc) => {
        if (loc.title !== "Gorai Bayview Site") {
          bounds.extend(loc.coordinates);
        }
      });

      const isMobile =
        typeof window !== "undefined" && window.innerWidth < 1024;
      const isTransport = category === "Transport";

      const padding = isTransport
        ? (isMobile
            ? { top: 220, bottom: 80, left: 40, right: 40 }
            : { top: 260, bottom: 120, left: 380, right: 140 })
        : (isMobile
            ? { top: 100, bottom: 60, left: 20, right: 20 }
            : { top: 80, bottom: 80, left: 340, right: 120 });

      const maxZoom = isTransport ? 11 : 13;

      fitBoundsWithMaxZoom(
        map,
        bounds,
        padding,
        maxZoom,
      );
    }

    // Solve collisions immediately
    setTimeout(resolveLabelCollisions, 100);
  };

  // Sync Category Markers only when category changes or map finishes loading
  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      updateCategoryMarkers(mapRef.current, selectedCategory);
    }
  }, [selectedCategory, mapLoaded]);

  // Bind map event listeners for real-time collision recalculation
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const onZoomOrMove = () => {
      resolveLabelCollisions();
    };

    const zoomListener = map.addListener("zoom_changed", onZoomOrMove);
    const boundsListener = map.addListener("bounds_changed", onZoomOrMove);
    // "idle" fires once after pan/zoom/tiles fully settle. zoom_changed and
    // bounds_changed can fire mid-animation (e.g. during fitBoundsWithMaxZoom's
    // zoom clamp), so a resolve triggered by them can compute offsets against
    // a projection that shifts again before the map actually comes to rest —
    // leaving markers positioned a few px off from where collisions were
    // last resolved. Re-resolving on "idle" guarantees a final, accurate pass.
    const idleListener = map.addListener("idle", onZoomOrMove);

    return () => {
      zoomListener.remove();
      boundsListener.remove();
      idleListener.remove();
    };
  }, [mapLoaded]);

  // Handle active marker styling changes in-place by adding/removing CSS classes
  useEffect(() => {
    markersRef.current.forEach((marker) => {
      const el = marker.element;
      if (!el) return;

      const isSelected = marker.locTitle === selectedLocation?.title;
      if (isSelected) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });
  }, [selectedLocation?.title]);

  const handleCategoryChange = (category: string) => {
    // If the same category is clicked again, keep it active (don't toggle off)
    if (selectedCategory === category) return;
    setSelectedCategory(category);
    setSelectedLocation(null);
    clearRouteLayer();
  };

  function clearRouteLayer() {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
      routePolylineRef.current = null;
    }
    if (routeGlowPolylineRef.current) {
      routeGlowPolylineRef.current.setMap(null);
      routeGlowPolylineRef.current = null;
    }
    if (routeHeadMarkerRef.current) {
      routeHeadMarkerRef.current.setMap(null);
      routeHeadMarkerRef.current = null;
    }

    setActiveRoute(null);
  }

  function handleShowRoute(
    destCoordinates: { lat: number; lng: number },
    destName: string,
    originCoords = GoraiBayviewLocation,
  ) {
    const map = mapRef.current;
    if (!map) {
      console.error("Map not initialized");
      return;
    }

    setIsRouteLoading(true);
    clearRouteLayer();

    // Vipassana Pagoda, Gorai Beach, Uttan Beach and Water Kingdom sit across
    // the creek from Gorai — the only crossing is a passenger ferry, so
    // DRIVING mode routes cars ~1hr the long way around via Uttan Rd.
    // WALKING mode natively finds the ferry crossing (Google's own "best"
    // route for these is a two-wheeler via that same ferry, which the
    // classic Directions API doesn't expose as a mode).
    const titleLower = destName.toLowerCase();
    const isFerryRoute =
      titleLower.includes("pagoda") ||
      titleLower.includes("beach") ||
      titleLower.includes("water kingdom");

    const travelMode = isFerryRoute
      ? "TWO_WHEELER"
      : google.maps.TravelMode.DRIVING;

    fetchGoogleRoute(originCoords, destCoordinates, travelMode)
      .then(({ path, distanceMeters, durationSeconds, actualTravelMode }) => {
        const distanceKm = (distanceMeters / 1000).toFixed(1);
        let durationMin = Math.round(durationSeconds / 60);
        if (
          isFerryRoute &&
          actualTravelMode === google.maps.TravelMode.WALKING
        ) {
          // Walking-mode duration fallback: approximates the two-wheeler ferry
          // crossing: roughly 2.5x faster than the ~5km/h walking pace.
          durationMin = Math.max(1, Math.round(durationMin / 2.5));
        }

        setActiveRoute({
          distance: `${distanceKm} km`,
          duration: `${durationMin} min`,
          destinationName: destName,
        });

        const bounds = new google.maps.LatLngBounds();
        path.forEach(([lng, lat]) => bounds.extend({ lat, lng }));

        const screenWidth =
          typeof window !== "undefined" ? window.innerWidth : 1200;
        const isTransport = selectedCategory === "Transport";
        const safePadding =
          screenWidth < 1024
            ? (isTransport
                ? { top: 220, bottom: 80, left: 40, right: 40 }
                : 40)
            : (isTransport
                ? { top: 260, bottom: 140, left: 380, right: 140 }
                : { top: 120, bottom: 120, left: 360, right: 120 });

        const maxZoom = isTransport ? 11 : 15;
        fitBoundsWithMaxZoom(map, bounds, safePadding, maxZoom);

        animateRouteDrawing(map, path);
        setIsRouteLoading(false);
      })
      .catch((e) => {
        console.error("Google Directions Error:", e);
        setIsRouteLoading(false);
      });
  }

  function animateRouteDrawing(
    map: google.maps.Map,
    coordinates: [number, number][],
  ) {
    let currentIndex = 0;
    const animationSpeed = 0.8;

    const glowPolyline = new google.maps.Polyline({
      map,
      path: [],
      strokeColor: "#c79a59",
      strokeOpacity: 0.4,
      strokeWeight: 8,
    });

    const mainPolyline = new google.maps.Polyline({
      map,
      path: [],
      strokeColor: "#E5C158",
      strokeOpacity: 0.95,
      strokeWeight: 3,
    });

    routeGlowPolylineRef.current = glowPolyline;
    routePolylineRef.current = mainPolyline;

    const headEl = document.createElement("div");
    headEl.style.cssText =
      "width: 8px; height: 8px; border-radius: 50%; background: #ffffff; border: 2px solid #E5C158; transform: translate(-50%, -50%);";
    const headMarker = createDomOverlay(
      { lat: coordinates[0][1], lng: coordinates[0][0] },
      headEl,
    );
    headMarker.setMap(map);
    routeHeadMarkerRef.current = headMarker;

    const animate = () => {
      const nextIndex = Math.min(
        currentIndex + animationSpeed,
        coordinates.length,
      );
      const segmentCoordinates = coordinates.slice(0, nextIndex);
      const segmentLatLng = segmentCoordinates.map(([lng, lat]) => ({
        lat,
        lng,
      }));

      glowPolyline.setPath(segmentLatLng);
      mainPolyline.setPath(segmentLatLng);

      if (segmentLatLng.length > 0) {
        headMarker.setPosition(segmentLatLng[segmentLatLng.length - 1]);
      }

      currentIndex = nextIndex;

      if (currentIndex < coordinates.length) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation finished: remove the animating marker dot so it doesn't coincide/overlap with destination marker
        headMarker.setMap(null);
        if (routeHeadMarkerRef.current === headMarker) {
          routeHeadMarkerRef.current = null;
        }
      }
    };

    animate();
  }

  const handleRouteSearch = () => {
    if (originAddress && destinationAddress) {
      setIsRouteLoading(true);
      Promise.all([
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(originAddress)}`,
        ).then((r) => r.json()),
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationAddress)}`,
        ).then((r) => r.json()),
      ])
        .then(([originData, destData]) => {
          if (originData[0] && destData[0]) {
            const orig = {
              lat: parseFloat(originData[0].lat),
              lng: parseFloat(originData[0].lon),
            };
            const dest = {
              lat: parseFloat(destData[0].lat),
              lng: parseFloat(destData[0].lon),
            };
            handleShowRoute(dest, destinationAddress, orig);
          } else {
            alert(
              "Could not find one or both locations. Please try more specific addresses.",
            );
            setIsRouteLoading(false);
          }
        })
        .catch((err) => {
          console.error("Geocoding Error:", err);
          alert("Error searching for locations. Please try again.");
          setIsRouteLoading(false);
        });
    }
  };

  const resetMap = () => {
    clearRouteLayer();
    setSelectedLocation(null);
    setDestinationAddress("");
    setOriginAddress("Gorai Bayview, Borivali West, Mumbai");
    if (mapRef.current) {
      mapRef.current.panTo(GoraiBayviewLocation);
      mapRef.current.setZoom(13);
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* MAP CONTAINER */}
      <div
        className="absolute inset-0 h-full w-full premium-map-container"
        style={{ zIndex: 10 }}
      >
        <div ref={mapContainerRef} className="w-full h-full" />
        {/* Animated Moving Clouds Overlay */}
        <div className="luxury-clouds-overlay pointer-events-none" />
      </div>

      {/* MAP OVERLAY (Subtle shadow gradient for panel readability) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/15 pointer-events-none z-15" />

      {/* LOADING OVERLAY */}
      {isRouteLoading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Calculating Route...</p>
          </div>
        </div>
      )}

      {/* MAP CONTROLS */}
      <div className="absolute right-6 bottom-32 z-20 flex flex-col gap-2">
        {/* Toggle UI clean view button (Feedback 13) */}
        <button
          onClick={() => setIsCleanView(!isCleanView)}
          className="w-10 h-10 rounded-lg bg-black/45 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/70 hover:text-[#C79A59] transition shadow-lg cursor-pointer"
          title={isCleanView ? "Show UI Panels" : "Hide UI Panels (Clean View)"}
        >
          {isCleanView ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>

        <div className="flex flex-col gap-2 luxury-zoom-control">
          <button
            onClick={() => {
              if (mapRef.current)
                mapRef.current.setZoom((mapRef.current.getZoom() ?? 13) + 1);
            }}
            className="w-10 h-10 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/70 hover:text-[#C79A59] transition shadow-lg cursor-pointer"
            title="Zoom In"
          >
            <Plus size={20} />
          </button>
          <button
            onClick={() => {
              if (mapRef.current)
                mapRef.current.setZoom((mapRef.current.getZoom() ?? 13) - 1);
            }}
            className="w-10 h-10 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/70 hover:text-[#C79A59] transition shadow-lg cursor-pointer"
            title="Zoom Out"
          >
            <Minus size={20} />
          </button>
        </div>
      </div>

      {/* Global Navbar */}
      {!isCleanView && (
        <GlobalNavbar
          currentPage="location"
          showReset={true}
          onReset={resetMap}
        />
      )}

      {/* SIDEBAR PANEL */}
      {!isCleanView && (
        <Sidebar
          header={{
            icon: MapIcon,
            subtitle: "Click to Explore",
            title: "Locations",
          }}
          sections={createSidebarSections([
            {
              id: "infrastructure-categories",
              title: "Nearby Infrastructure",
              items: createSidebarItems(
                infrastructure.current.map((item) => ({
                  id: item.title,
                  label: item.title,
                  icon: item.icon,
                  onClick: () => handleCategoryChange(item.title),
                  isActive: selectedCategory === item.title,
                })),
              ),
            },
          ])}
        />
      )}

      {/* PREMIUM LARGE INFORMATION CARD (moved to the right on desktop for Feedback 1) */}
      <AnimatePresence>
        {!isCleanView && selectedLocation && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute z-30 w-fit lg:w-[250px] flex flex-col items-start gap-3 p-4 rounded-[10px] bg-[#2C3437]/75 backdrop-blur-md border border-[#40484B]/70 shadow-[0_12px_40px_rgba(0,0,0,0.4)] left-4 right-4 bottom-28 md:bottom-32 md:left-1/2 md:-translate-x-1/2 lg:bottom-auto lg:top-[6.5rem] lg:right-6 lg:left-auto lg:translate-x-0 lg:max-w-none"
          >
            <div className="w-full pr-8 min-w-0">
              <p className="text-[#C79A59] text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold">
                {selectedLocation
                  ? categoryDisplayNames[selectedCategory] || selectedCategory
                  : ""}
              </p>
              <h3 className="text-white text-base sm:text-lg font-light font-sans tracking-wide truncate mt-1">
                {selectedLocation
                  ? parseLocationName(
                      selectedLocation.title,
                      selectedLocation.name,
                    ).title
                  : ""}
              </h3>
            </div>

            {(activeRoute ||
              (selectedLocation &&
                parseLocationName(selectedLocation.title, selectedLocation.name)
                  .distance)) && (
              <div className="flex flex-row items-center gap-4 w-full border-t border-[#40484B]/30 pt-3 shrink-0">
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-white/40 text-[9px] uppercase tracking-widest font-medium">
                    Duration
                  </span>
                  <p className="text-white text-xs sm:text-sm font-semibold tracking-wide mt-0.5">
                    {formatDurationForCard(
                      activeRoute
                        ? activeRoute.duration
                        : parseLocationName(
                            selectedLocation.title,
                            selectedLocation.name,
                          ).duration,
                    )}
                  </p>
                </div>
                <div className="h-6 w-px bg-[#40484B]/50" />
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-[#C79A59] text-[9px] uppercase tracking-widest font-medium">
                    Distance
                  </span>
                  <p className="text-white text-xs sm:text-sm font-semibold tracking-wide mt-0.5">
                    {formatDistanceForCard(
                      activeRoute
                        ? activeRoute.distance
                        : parseLocationName(
                            selectedLocation.title,
                            selectedLocation.name,
                          ).distance,
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLocation(null);
                clearRouteLayer();
              }}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition duration-200 cursor-pointer p-1"
              aria-label="Close card"
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                stroke="currentColor"
                stroke-width="2.5"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM NAV */}
      {!isCleanView && <BottomNavbar activeItem="location" />}

      {/* CUSTOM LUXURY STYLES */}
      <style>{`
        /* Animated Moving Clouds Overlay (Feedback) */
        .luxury-clouds-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1; /* Floats above canvas but below custom markers */
          opacity: 0.18;
          mix-blend-mode: soft-light;
          overflow: hidden;
          background: transparent;
        }

        .luxury-clouds-overlay::before,
        .luxury-clouds-overlay::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 200%;
          height: 100%;
          background: url('/icons/clouds.svg') repeat-x;
          background-size: 50% 100%;
        }

        .luxury-clouds-overlay::before {
          animation: floatClouds1 140s linear infinite;
        }

        .luxury-clouds-overlay::after {
          animation: floatClouds2 95s linear infinite;
          opacity: 0.65;
        }

        @keyframes floatClouds1 {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes floatClouds2 {
          0% { transform: translateX(-25%); }
          100% { transform: translateX(-75%); }
        }

        .luxury-annotation-container {
          position: absolute;
          width: 0;
          height: 0;
          pointer-events: none;
          z-index: 100;
        }

        .luxury-annotation-container.active {
          z-index: 10005;
        }

        /* Coordinate Spot: Hollow Brown Circle Ring (Feedback 3) */
        .luxury-dot {
          position: absolute;
          width: 10px;
          height: 10px;
          border: 2px solid #5B4A3D;
          background-color: transparent;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          transform: translate(-50%, -50%);
          z-index: 50;
          transition: transform 250ms ease, box-shadow 250ms ease;
        }

        .luxury-annotation-container.active .luxury-dot {
          transform: translate(-50%, -50%) scale(1.25);
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        /* Marker Container: solid brown background (#5B4A3D), size reduced to 30px (Feedback 3) */
        .luxury-marker-circle {
          position: absolute;
          width: 30px;
          height: 30px;
          top: 50%;
          left: 50%;
          transform: translate(calc(-50% + var(--offset-x, 0px)), calc(-50% + var(--offset-y, -45px)));
          background: #5B4A3D;
          border: none;
          border-radius: 50%;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto; /* enable click */
          cursor: pointer;
          transition: transform 250ms cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 250ms ease;
          z-index: 100;
        }

        .luxury-marker-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
        }
        .luxury-marker-icon img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .luxury-marker-icon svg {
          width: 15px;
          height: 15px;
          stroke: #ffffff !important;
          color: #ffffff !important;
        }

        /* On selection: enlarge 1.15x with gold glow shadow */
        .luxury-annotation-container.active .luxury-marker-circle {
          transform: translate(calc(-50% + var(--offset-x, 0px)), calc(-50% + var(--offset-y, -45px))) scale(1.15);
          box-shadow: 0 0 15px rgba(199, 154, 89, 0.8), 0 4px 12px rgba(0, 0, 0, 0.45);
        }

        /* Leader Line SVG */
        .luxury-leader-svg {
          position: absolute;
          top: -250px;
          left: -250px;
          width: 500px;
          height: 500px;
          pointer-events: none;
          overflow: visible;
          z-index: 1;
        }

        /* Leader Line stroke is brown (#5B4A3D) instead of black (Feedback 3) */
        .luxury-leader-path {
          stroke: #5B4A3D;
          stroke-width: 1.5px;
          fill: none;
          filter: drop-shadow(0px 1px 1px rgba(255, 255, 255, 0.75));
          transition: stroke 200ms ease, stroke-width 200ms ease;
        }
        .luxury-annotation-container.active .luxury-leader-path {
          stroke: #C79A59;
          stroke-width: 2px;
          filter: drop-shadow(0px 1px 2px rgba(255, 255, 255, 0.8));
        }

        /* Label Text: Dark brown text with subtle shadow for readability on warm map */
        .luxury-label-text-wrapper {
          position: absolute;
          pointer-events: none;
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          color: #5B4230;
          text-shadow: 0 0 4px rgba(221, 208, 192, 0.9), 0 1px 2px rgba(221, 208, 192, 0.7);
          line-height: 1.25;
          width: max-content;
          max-width: 90px;
          white-space: normal;
          z-index: 10;
        }

        /* Hide overlapping labels */
        .hidden-label .luxury-label-text-wrapper {
          display: none;
        }

        .hidden-label .luxury-marker-circle {
          opacity: 0.6;
        }

        .luxury-label-text {
          display: block;
        }

        .luxury-annotation-container.active .luxury-label-text-wrapper {
          color: #1A1510;
          font-weight: 800;
          text-shadow: 0 0 6px rgba(221, 208, 192, 1), 0 1px 3px rgba(221, 208, 192, 0.8);
        }

        /* Position mapping of text label relative to circle marker */
        /* Top, TopLeft, TopRight positions (label sits above the circle) */
        .pos-top .luxury-label-text-wrapper,
        .pos-topleft .luxury-label-text-wrapper,
        .pos-topright .luxury-label-text-wrapper {
          bottom: 100%;
          left: 50%;
          transform: translate(-50%, -10px);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Bottom, BottomLeft, BottomRight positions (label sits below the circle) */
        .pos-bottom .luxury-label-text-wrapper,
        .pos-bottomleft .luxury-label-text-wrapper,
        .pos-bottomright .luxury-label-text-wrapper {
          top: 100%;
          left: 50%;
          transform: translate(-50%, 10px);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Left position (label sits on the left of the circle) */
        .pos-left .luxury-label-text-wrapper {
          right: 100%;
          top: 50%;
          transform: translate(-10px, -50%);
          text-align: right;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        /* Right position (label sits on the right of the circle) */
        .pos-right .luxury-label-text-wrapper {
          left: 100%;
          top: 50%;
          transform: translate(10px, -50%);
          text-align: left;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        /* Luxury Main Home Marker Styles */
        .luxury-home-marker {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .luxury-home-inner {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          transition: all 0.3s ease;
        }

        .luxury-home-inner img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.5));
          transition: all 0.3s ease;
        }

        .luxury-home-inner:hover {
          transform: scale(1.15);
        }

        .luxury-home-inner:hover img {
          filter: drop-shadow(0 8px 16px rgba(199, 154, 89, 0.7));
        }

        .luxury-home-pulse-ring {
          position: absolute;
          width: 72px;
          height: 72px;
          border: 1.5px solid rgba(212, 175, 55, 0.6);
          border-radius: 50%;
          z-index: 1;
          animation: luxury-pulse 3s infinite cubic-bezier(0.215, 0.610, 0.355, 1.000);
          pointer-events: none;
        }

        @keyframes luxury-pulse {
          0% {
            transform: scale(0.6);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        /* Hover popup card styles */
        .luxury-hover-popup {
          background: rgba(44, 52, 55, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(64, 72, 75, 0.7);
          border-radius: 12px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
          padding: 10px 14px;
          pointer-events: none;
        }

        .luxury-home-popup {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 10px;
          white-space: nowrap;
          z-index: 10000;
        }

        .luxury-mini-card {
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          text-align: left;
        }

        .luxury-mini-card .category {
          color: #c79a59;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          line-height: 1;
          margin-bottom: 4px;
        }

        .luxury-mini-card .title {
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 4px;
          line-height: 1.2;
        }

        .luxury-mini-card .metrics {
          display: flex;
          align-items: center;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 400;
        }

        .luxury-mini-card .separator {
          margin: 0 4px;
          color: rgba(199, 154, 89, 0.4);
        }
      `}</style>
    </section>
  );
}
