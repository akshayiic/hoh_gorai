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
  Maximize2,
  Minimize2,
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
  loadGreenAreasOverlay,
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
          name: "ICICI - 400m (4 Mins)",
          coordinates: { lat: 19.2312, lng: 72.8290 },
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
          routeCoordinates: { lat: 19.214745, lng: 72.8117535 },
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
  const [isFullscreenActive, setIsFullscreenActive] = useState(
    () => typeof document !== "undefined" && !!document.fullscreenElement,
  );

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
  const sectionRef = useRef<HTMLElement>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(
    null,
  );
  const twoFingerStartYRef = useRef<{ y: number; time: number } | null>(null);

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
      loadGreenAreasOverlay(map);

      google.maps.event.addListenerOnce(map, "idle", () => {
        // Main Logo on map for Gorai Bayview (No outer ring, clean full fit, same size of circle)
        const el = document.createElement("div");
        el.className = "luxury-home-marker flex items-center justify-center";
        el.style.width = "44px";
        el.style.height = "44px";
        el.style.zIndex = "9999";
        el.style.transform = "translate(-50%, -50%)";

        el.innerHTML = `
          <div class="luxury-home-inner">
            <img src="/icons/hoh2.svg" class="luxury-home-logo-img" alt="Hiranandani Bayview" />
          </div>
        `;

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

  // Fullscreen helpers — usable from the explicit toggle button and from the
  // phone-landscape gestures below. Fullscreen no longer forces Clean View:
  // the navbar/sidebar/bottom-nav stay visible while fullscreen is active.
  //
  // Fullscreens `document.documentElement` (not this page's own section)
  // because that's the one element that survives client-side navigation —
  // fullscreening a per-page div means the browser auto-exits fullscreen the
  // instant that div unmounts on route change (BottomNavbar links, etc).
  const requestFullscreen = () => {
    if (document.fullscreenElement) return;
    const target = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => void;
    };
    if (target.requestFullscreen) target.requestFullscreen().catch(() => {});
    else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
  };

  const exitFullscreen = () => {
    if (!document.fullscreenElement) return;
    const doc = document as Document & {
      webkitExitFullscreen?: () => void;
    };
    if (doc.exitFullscreen) doc.exitFullscreen().catch(() => {});
    else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) exitFullscreen();
    else requestFullscreen();
  };

  // Phone-landscape fullscreen gestures: double-tap or a two-finger swipe up
  // requests fullscreen; exiting fullscreen (via the system back gesture,
  // Esc, etc.) is picked up by the fullscreenchange listener below.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const isPhoneLandscape = () =>
      window.matchMedia("(orientation: landscape)").matches &&
      window.matchMedia("(pointer: coarse)").matches &&
      window.innerHeight <= 500;

    const isFullscreen = () => !!document.fullscreenElement;

    const onFullscreenChange = () => {
      setIsFullscreenActive(isFullscreen());
    };

    const onTouchStart = (e: TouchEvent) => {
      if (!isPhoneLandscape()) return;
      if (e.touches.length === 2) {
        const avgY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        twoFingerStartYRef.current = { y: avgY, time: Date.now() };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!twoFingerStartYRef.current || e.touches.length !== 2) return;
      const avgY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const deltaY = twoFingerStartYRef.current.y - avgY;
      const elapsed = Date.now() - twoFingerStartYRef.current.time;
      if (deltaY > 60 && elapsed < 600) {
        requestFullscreen();
        twoFingerStartYRef.current = null;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      twoFingerStartYRef.current = null;
      if (!isPhoneLandscape()) return;
      if (e.touches.length !== 0 || e.changedTouches.length !== 1) return;

      const touch = e.changedTouches[0];
      const now = Date.now();
      const last = lastTapRef.current;

      if (
        last &&
        now - last.time < 300 &&
        Math.abs(touch.clientX - last.x) < 30 &&
        Math.abs(touch.clientY - last.y) < 30
      ) {
        if (isFullscreen()) exitFullscreen();
        else requestFullscreen();
        lastTapRef.current = null;
      } else {
        lastTapRef.current = { time: now, x: touch.clientX, y: touch.clientY };
      }
    };

    // Capture phase so this fires before Google Maps' own touch handling
    // (attached directly on the map div) can swallow/stop the gesture.
    el.addEventListener("touchstart", onTouchStart, {
      passive: true,
      capture: true,
    });
    el.addEventListener("touchmove", onTouchMove, {
      passive: true,
      capture: true,
    });
    el.addEventListener("touchend", onTouchEnd, {
      passive: true,
      capture: true,
    });
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      el.removeEventListener("touchstart", onTouchStart, { capture: true });
      el.removeEventListener("touchmove", onTouchMove, { capture: true });
      el.removeEventListener("touchend", onTouchEnd, { capture: true });
      document.removeEventListener("fullscreenchange", onFullscreenChange);
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
      const R = 15; // Small marker radius (30px diameter badge)
      const gap = 6; // Compact gap between circle marker and label text

      // Screen position and collision box for Home Marker
      const homeScreenPos = homeMarkerRef.current?.getScreenPosition();
      if (!homeScreenPos) return;
      const homeR = 24; // Radius around 44px home marker + padding

      const homeEl = homeMarkerRef.current?.element;
      const homeRect = homeEl?.getBoundingClientRect();
      const clientToOverlayX = homeRect ? homeScreenPos.x - homeRect.left : 0;
      const clientToOverlayY = homeRect ? homeScreenPos.y - homeRect.top : 0;

      const logoEl = document.querySelector(".main-logo-container");
      let logoOverlayRect: {
        left: number;
        right: number;
        top: number;
        bottom: number;
      } | null = null;
      if (logoEl && homeRect) {
        const r = logoEl.getBoundingClientRect();
        logoOverlayRect = {
          left: r.left + clientToOverlayX,
          right: r.right + clientToOverlayX,
          top: r.top + clientToOverlayY,
          bottom: r.bottom + clientToOverlayY,
        };
      }

      // Viewport boundaries
      const isMobile =
        typeof window !== "undefined" && window.innerWidth < 1024;
      const screenW = typeof window !== "undefined" ? window.innerWidth : 1200;
      const screenH = typeof window !== "undefined" ? window.innerHeight : 800;
      const leftPad = isMobile ? 12 : 310;
      const topPad = 65;
      const rightPad = 20;
      const bottomPad = isMobile ? 80 : 90;

      interface ResolvedLabel {
        title: string;
        rect: { left: number; right: number; top: number; bottom: number };
        circleX: number;
        circleY: number;
        hidden: boolean;
        segments: Array<{ x1: number; y1: number; x2: number; y2: number }>;
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

          // Temporarily remove hidden-label to get correct size if it is currently hidden
          const isHidden = el.classList.contains("hidden-label");
          if (isHidden) {
            el.classList.remove("hidden-label");
          }
          const textRect = textEl
            ? textEl.getBoundingClientRect()
            : { width: 0, height: 0 };
          if (isHidden) {
            el.classList.add("hidden-label");
          }

          let width = textRect.width;
          let height = textRect.height;

          // Fallback for first-render / hidden layout width
          if (!width || width < 5) {
            const estimatedWidth = locTitle.length * 6.5 + 14;
            width = Math.min(estimatedWidth, 95);
            const lines = Math.ceil(estimatedWidth / 95);
            height = lines * 13 + 6;
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

      // Geometry & Collision Helpers
      const cross = (
        ox: number,
        oy: number,
        px: number,
        py: number,
        qx: number,
        qy: number,
      ) => (qx - ox) * (py - oy) - (px - ox) * (qy - oy);

      const segmentsIntersect = (
        ax: number,
        ay: number,
        bx: number,
        by: number,
        cx: number,
        cy: number,
        dx: number,
        dy: number,
      ) => {
        const d1 = cross(cx, cy, dx, dy, ax, ay);
        const d2 = cross(cx, cy, dx, dy, bx, by);
        const d3 = cross(ax, ay, bx, by, cx, cy);
        const d4 = cross(ax, ay, bx, by, dx, dy);
        return (
          ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
          ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
        );
      };

      const segmentIntersectsRect = (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        rect: { left: number; right: number; top: number; bottom: number },
        padding = 3,
      ) => {
        const rL = rect.left - padding;
        const rR = rect.right + padding;
        const rT = rect.top - padding;
        const rB = rect.bottom + padding;

        if (
          Math.max(x1, x2) < rL ||
          Math.min(x1, x2) > rR ||
          Math.max(y1, y2) < rT ||
          Math.min(y1, y2) > rB
        ) {
          return false;
        }

        const inside = (px: number, py: number) =>
          px >= rL && px <= rR && py >= rT && py <= rB;
        if (inside(x1, y1) || inside(x2, y2)) return true;

        return (
          segmentsIntersect(x1, y1, x2, y2, rL, rT, rR, rT) ||
          segmentsIntersect(x1, y1, x2, y2, rR, rT, rR, rB) ||
          segmentsIntersect(x1, y1, x2, y2, rR, rB, rL, rB) ||
          segmentsIntersect(x1, y1, x2, y2, rL, rB, rL, rT)
        );
      };

      const segmentIntersectsCircle = (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        cx: number,
        cy: number,
        r: number,
      ) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) {
          const distSq = (x1 - cx) * (x1 - cx) + (y1 - cy) * (y1 - cy);
          return distSq <= r * r;
        }
        const t = Math.max(
          0,
          Math.min(1, ((cx - x1) * dx + (cy - y1) * dy) / lenSq),
        );
        const closestX = x1 + t * dx;
        const closestY = y1 + t * dy;
        const distSq =
          (closestX - cx) * (closestX - cx) + (closestY - cy) * (closestY - cy);
        return distSq <= r * r;
      };

      const checkOverlap = (
        r1: { left: number; right: number; top: number; bottom: number },
        r2: { left: number; right: number; top: number; bottom: number },
        padding = 4,
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
        return distanceSquared < (r + 3) * (r + 3);
      };

      const checkCirclesOverlap = (
        c1X: number,
        c1Y: number,
        r1: number,
        c2X: number,
        c2Y: number,
        r2: number,
        padding = 4,
      ) => {
        const dx = c1X - c2X;
        const dy = c1Y - c2Y;
        const minD = r1 + r2 + padding;
        return dx * dx + dy * dy < minD * minD;
      };

      // Deterministic pseudo-random number generator for stable organic line angles
      const pseudoRandom = (seedStr: string) => {
        let hash = 0;
        for (let i = 0; i < seedStr.length; i++) {
          hash = (hash * 31 + seedStr.charCodeAt(i)) | 0;
        }
        return (Math.abs(hash) % 10000) / 10000;
      };

      // Computes short, compact organic 2-segment angled/dogleg connector lines (matching attachment)
      const computeConnectorSegments = (
        offsetX: number,
        offsetY: number,
        styleIdx: number,
        seedStr: string,
      ): Array<{ x1: number; y1: number; x2: number; y2: number }> => {
        const dotRadius = 3.5;
        const circleGap = 1.5;
        const R_stop = R + circleGap;

        const totalDist = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
        if (totalDist < R_stop + dotRadius + 3) {
          const dirX = offsetX / (totalDist || 1);
          const dirY = offsetY / (totalDist || 1);
          return [
            {
              x1: dirX * dotRadius,
              y1: dirY * dotRadius,
              x2: offsetX - dirX * R_stop,
              y2: offsetY - dirY * R_stop,
            },
          ];
        }

        const randVal = pseudoRandom(seedStr);
        const frac = 0.4 + randVal * 0.25; // 0.40 .. 0.65

        let cornerX = 0;
        let cornerY = 0;
        const absX = Math.abs(offsetX);
        const absY = Math.abs(offsetY);
        const style = styleIdx % 4;

        if (style === 0 && absX >= 8) {
          // Style 0: Diagonal from dot then Horizontal into badge
          const horizDist = Math.max(8, absX * frac);
          cornerX = offsetX - Math.sign(offsetX) * horizDist;
          cornerY = offsetY;
        } else if (style === 1 && absY >= 8) {
          // Style 1: Diagonal from dot then Vertical into badge
          const vertDist = Math.max(8, absY * frac);
          cornerX = offsetX;
          cornerY = offsetY - Math.sign(offsetY) * vertDist;
        } else if (style === 2 && absX >= 8) {
          // Style 2: Horizontal from dot then Diagonal into badge
          cornerX = Math.sign(offsetX) * Math.max(8, absX * (1 - frac));
          cornerY = 0;
        } else {
          // Style 3: Angled Dogleg (Double Diagonal with angled break)
          const directAngle = Math.atan2(offsetY, offsetX);
          const angleShift = (randVal > 0.5 ? 1 : -1) * (0.3 + randVal * 0.2);
          const midDist = totalDist * frac;
          cornerX = midDist * Math.cos(directAngle + angleShift);
          cornerY = midDist * Math.sin(directAngle + angleShift);
        }

        // Segment 1: from dot edge to corner
        const dist1 = Math.sqrt(cornerX * cornerX + cornerY * cornerY);
        let startX = 0;
        let startY = 0;
        if (dist1 > dotRadius) {
          startX = (cornerX / dist1) * dotRadius;
          startY = (cornerY / dist1) * dotRadius;
        }

        // Segment 2: from corner to badge perimeter
        const dx2 = offsetX - cornerX;
        const dy2 = offsetY - cornerY;
        const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        let endX = offsetX;
        let endY = offsetY;
        if (dist2 > R_stop) {
          endX = offsetX - (dx2 / dist2) * R_stop;
          endY = offsetY - (dy2 / dist2) * R_stop;
        } else {
          endX = cornerX;
          endY = cornerY;
        }

        return [
          { x1: startX, y1: startY, x2: cornerX, y2: cornerY },
          { x1: cornerX, y1: cornerY, x2: endX, y2: endY },
        ];
      };

      const getLabelCenter = (
        x: number,
        y: number,
        offsetX: number,
        offsetY: number,
        pos: string,
        W_lbl: number,
        H_lbl: number,
      ) => {
        const badgeCenterX = x + offsetX;
        const badgeCenterY = y + offsetY;

        let cx = badgeCenterX;
        let cy = badgeCenterY;

        if (pos === "Right") {
          cx = badgeCenterX + R + gap + W_lbl;
          cy = badgeCenterY;
        } else if (pos === "Left") {
          cx = badgeCenterX - R - gap - W_lbl;
          cy = badgeCenterY;
        } else if (pos === "Top") {
          cx = badgeCenterX;
          cy = badgeCenterY - R - gap - H_lbl;
        } else if (pos === "Bottom") {
          cx = badgeCenterX;
          cy = badgeCenterY + R + gap + H_lbl;
        } else if (pos === "TopRight") {
          cx = badgeCenterX + R * 0.7 + gap + W_lbl;
          cy = badgeCenterY - R * 0.7 - gap - H_lbl;
        } else if (pos === "TopLeft") {
          cx = badgeCenterX - R * 0.7 - gap - W_lbl;
          cy = badgeCenterY - R * 0.7 - gap - H_lbl;
        } else if (pos === "BottomRight") {
          cx = badgeCenterX + R * 0.7 + gap + W_lbl;
          cy = badgeCenterY + R * 0.7 + gap + H_lbl;
        } else if (pos === "BottomLeft") {
          cx = badgeCenterX - R * 0.7 - gap - W_lbl;
          cy = badgeCenterY + R * 0.7 + gap + H_lbl;
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

      // Compact angle directions (in degrees) fanning around 360°
      const candidateBaseAngles = [
        -90, -70, -45, -20, 0, 20, 45, 70, 90, 110, 135, 160, 180, -160, -135,
        -110,
      ];
      // Short, compact line lengths matching the attachment image (16px to 76px)
      const lineLengths = [16, 24, 34, 46, 60, 76, 95];
      const elbowStyles = [0, 1, 2, 3];

      markerInfos.forEach((info) => {
        const W_lbl = info.width / 2;
        const H_lbl = info.height / 2;

        let bestPosition = "Right";
        let bestOffsetX = R + 24;
        let bestOffsetY = -18;
        let bestLocalSegments = computeConnectorSegments(
          bestOffsetX,
          bestOffsetY,
          0,
          `${info.title}|default`,
        );
        let found = false;

        // First circle offset that clears home marker / navbar logo / other
        // circles / other dots, even if no elbow style or label position
        // panned out for it. Used as a fallback below so an unresolved
        // marker's badge still lands somewhere collision-free instead of
        // stacking on the hardcoded default offset.
        let fallbackOffsetX: number | null = null;
        let fallbackOffsetY: number | null = null;
        let fallbackSegments: Array<{
          x1: number;
          y1: number;
          x2: number;
          y2: number;
        }> | null = null;

        const currentLineLengths = info.isSelected
          ? [20, 30, 42, 56, 72, 90]
          : lineLengths;

        for (let dIdx = 0; dIdx < currentLineLengths.length && !found; dIdx++) {
          const D = currentLineLengths[dIdx];

          for (
            let aIdx = 0;
            aIdx < candidateBaseAngles.length && !found;
            aIdx++
          ) {
            const baseAngleDeg = candidateBaseAngles[aIdx];
            const jitterDeg =
              (pseudoRandom(`${info.title}|${aIdx}`) * 2 - 1) * 12;
            const angleRad = ((baseAngleDeg + jitterDeg) * Math.PI) / 180;
            const offsetX = Math.round((R + D) * Math.cos(angleRad));
            const offsetY = Math.round((R + D) * Math.sin(angleRad));

            const candidateCircleX = info.x + offsetX;
            const candidateCircleY = info.y + offsetY;

            // 1. Quick circle viewport check
            if (
              candidateCircleX - R < leftPad ||
              candidateCircleX + R > screenW - rightPad ||
              candidateCircleY - R < topPad ||
              candidateCircleY + R > screenH - bottomPad
            ) {
              continue;
            }

            // 2. Check candidate circle overlap with Home Marker
            if (
              checkCirclesOverlap(
                candidateCircleX,
                candidateCircleY,
                R,
                homeScreenPos.x,
                homeScreenPos.y,
                homeR,
                6,
              )
            ) {
              continue;
            }

            // 3. Check candidate circle overlap with Main Navbar Logo Box
            if (
              logoOverlayRect &&
              checkCircleRectOverlap(
                candidateCircleX,
                candidateCircleY,
                R + 4,
                logoOverlayRect,
              )
            ) {
              continue;
            }

            // 4. Check candidate circle overlap with other resolved circles
            let circleOverlaps = false;
            for (let k = 0; k < resolvedLabels.length; k++) {
              if (
                checkCirclesOverlap(
                  candidateCircleX,
                  candidateCircleY,
                  R,
                  resolvedLabels[k].circleX,
                  resolvedLabels[k].circleY,
                  R,
                  8,
                )
              ) {
                circleOverlaps = true;
                break;
              }
            }
            if (circleOverlaps) continue;

            // 5. Check candidate circle overlap with other POI pinpoint dots
            let dotOverlaps = false;
            for (let k = 0; k < markerInfos.length; k++) {
              if (markerInfos[k].title === info.title) continue;
              if (
                checkCirclesOverlap(
                  candidateCircleX,
                  candidateCircleY,
                  R,
                  markerInfos[k].x,
                  markerInfos[k].y,
                  4,
                  6,
                )
              ) {
                dotOverlaps = true;
                break;
              }
            }
            if (dotOverlaps) continue;

            if (fallbackOffsetX === null) {
              fallbackOffsetX = offsetX;
              fallbackOffsetY = offsetY;
              fallbackSegments = computeConnectorSegments(
                offsetX,
                offsetY,
                0,
                `${info.title}|fallback`,
              );
            }

            // Try elbow styles
            for (let sIdx = 0; sIdx < elbowStyles.length && !found; sIdx++) {
              const styleIdx = elbowStyles[sIdx];
              const localSegments = computeConnectorSegments(
                offsetX,
                offsetY,
                styleIdx,
                `${info.title}|${aIdx}|${sIdx}`,
              );
              const absSegments = localSegments.map((s) => ({
                x1: info.x + s.x1,
                y1: info.y + s.y1,
                x2: info.x + s.x2,
                y2: info.y + s.y2,
              }));

              // Check connector line against Home Marker, Navbar Logo, and other POI dots
              let lineCollides = false;
              if (
                absSegments.some((s) =>
                  segmentIntersectsCircle(
                    s.x1,
                    s.y1,
                    s.x2,
                    s.y2,
                    homeScreenPos.x,
                    homeScreenPos.y,
                    homeR + 2,
                  ),
                )
              ) {
                lineCollides = true;
              }
              if (
                !lineCollides &&
                logoOverlayRect &&
                absSegments.some((s) =>
                  segmentIntersectsRect(
                    s.x1,
                    s.y1,
                    s.x2,
                    s.y2,
                    logoOverlayRect,
                    4,
                  ),
                )
              ) {
                lineCollides = true;
              }
              if (!lineCollides) {
                for (let k = 0; k < markerInfos.length; k++) {
                  if (markerInfos[k].title === info.title) continue;
                  if (
                    absSegments.some((s) =>
                      segmentIntersectsCircle(
                        s.x1,
                        s.y1,
                        s.x2,
                        s.y2,
                        markerInfos[k].x,
                        markerInfos[k].y,
                        4,
                      ),
                    )
                  ) {
                    lineCollides = true;
                    break;
                  }
                }
              }
              if (!lineCollides) {
                // Check connector line against previously resolved circles and lines
                for (let k = 0; k < resolvedLabels.length; k++) {
                  if (
                    absSegments.some((s) =>
                      segmentIntersectsCircle(
                        s.x1,
                        s.y1,
                        s.x2,
                        s.y2,
                        resolvedLabels[k].circleX,
                        resolvedLabels[k].circleY,
                        R + 2,
                      ),
                    )
                  ) {
                    lineCollides = true;
                    break;
                  }
                  if (
                    absSegments.some((sA) =>
                      resolvedLabels[k].segments.some((sB) =>
                        segmentsIntersect(
                          sA.x1,
                          sA.y1,
                          sA.x2,
                          sA.y2,
                          sB.x1,
                          sB.y1,
                          sB.x2,
                          sB.y2,
                        ),
                      ),
                    )
                  ) {
                    lineCollides = true;
                    break;
                  }
                }
              }
              if (lineCollides) continue;

              // Prioritize label positions relative to badge based on quadrant
              const candidateLabelPositions =
                offsetX >= 10
                  ? [
                      "Right",
                      "Top",
                      "Bottom",
                      "TopRight",
                      "BottomRight",
                      "Left",
                    ]
                  : offsetX <= -10
                    ? [
                        "Left",
                        "Top",
                        "Bottom",
                        "TopLeft",
                        "BottomLeft",
                        "Right",
                      ]
                    : offsetY < 0
                      ? [
                          "Top",
                          "Right",
                          "Left",
                          "TopRight",
                          "TopLeft",
                          "Bottom",
                        ]
                      : [
                          "Bottom",
                          "Right",
                          "Left",
                          "BottomRight",
                          "BottomLeft",
                          "Top",
                        ];

              for (
                let pIdx = 0;
                pIdx < candidateLabelPositions.length;
                pIdx++
              ) {
                const pos = candidateLabelPositions[pIdx];
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

                // Check label viewport
                if (
                  candidateRect.left < leftPad ||
                  candidateRect.right > screenW - rightPad ||
                  candidateRect.top < topPad ||
                  candidateRect.bottom > screenH - bottomPad
                ) {
                  continue;
                }

                // Check label vs Home Marker
                if (
                  checkCircleRectOverlap(
                    homeScreenPos.x,
                    homeScreenPos.y,
                    homeR + 4,
                    candidateRect,
                  )
                ) {
                  continue;
                }

                // Check label vs Navbar Logo
                if (
                  logoOverlayRect &&
                  checkOverlap(candidateRect, logoOverlayRect, 6)
                ) {
                  continue;
                }

                // Check label vs all POI dots
                let labelHitsDot = false;
                for (let k = 0; k < markerInfos.length; k++) {
                  if (
                    checkCircleRectOverlap(
                      markerInfos[k].x,
                      markerInfos[k].y,
                      6,
                      candidateRect,
                    )
                  ) {
                    labelHitsDot = true;
                    break;
                  }
                }
                if (labelHitsDot) continue;

                // Check label vs previously resolved badges & labels & lines
                let labelCollides = false;
                for (let k = 0; k < resolvedLabels.length; k++) {
                  if (!resolvedLabels[k].hidden) {
                    if (
                      checkOverlap(candidateRect, resolvedLabels[k].rect, 4)
                    ) {
                      labelCollides = true;
                      break;
                    }
                  }
                  if (
                    checkCircleRectOverlap(
                      resolvedLabels[k].circleX,
                      resolvedLabels[k].circleY,
                      R + 4,
                      candidateRect,
                    )
                  ) {
                    labelCollides = true;
                    break;
                  }
                  if (
                    checkCircleRectOverlap(
                      candidateCircleX,
                      candidateCircleY,
                      R + 4,
                      resolvedLabels[k].rect,
                    )
                  ) {
                    labelCollides = true;
                    break;
                  }
                  if (
                    resolvedLabels[k].segments.some((s) =>
                      segmentIntersectsRect(
                        s.x1,
                        s.y1,
                        s.x2,
                        s.y2,
                        candidateRect,
                        3,
                      ),
                    )
                  ) {
                    labelCollides = true;
                    break;
                  }
                  if (!resolvedLabels[k].hidden) {
                    if (
                      absSegments.some((s) =>
                        segmentIntersectsRect(
                          s.x1,
                          s.y1,
                          s.x2,
                          s.y2,
                          resolvedLabels[k].rect,
                          3,
                        ),
                      )
                    ) {
                      labelCollides = true;
                      break;
                    }
                  }
                }
                if (labelCollides) continue;

                // Success! Found collision-free placement
                bestPosition = pos;
                bestOffsetX = offsetX;
                bestOffsetY = offsetY;
                bestLocalSegments = localSegments;
                found = true;
                break;
              }
            }
          }
        }

        // No fully collision-free (circle + line + label) placement exists.
        if (!found) {
          if (info.isSelected) {
            // Selected marker's label must always be visible — prefer a
            // circle offset already known to clear other circles/dots.
            if (fallbackOffsetX !== null && fallbackSegments) {
              bestOffsetX = fallbackOffsetX;
              bestOffsetY = fallbackOffsetY as number;
              bestLocalSegments = fallbackSegments;
            } else {
              bestOffsetX = R + 45;
              bestOffsetY = -18;
              bestLocalSegments = computeConnectorSegments(
                bestOffsetX,
                bestOffsetY,
                0,
                `${info.title}|selected_fallback`,
              );
            }
            bestPosition = "Right";
            found = true;
          } else if (fallbackOffsetX !== null && fallbackSegments) {
            // Keep this marker's badge spaced away from every other circle
            // even though its label has to stay hidden — otherwise it falls
            // back to the same hardcoded offset as every other unresolved
            // marker and badges stack on top of one another.
            bestOffsetX = fallbackOffsetX;
            bestOffsetY = fallbackOffsetY as number;
            bestLocalSegments = fallbackSegments;
          }
        }

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

        const finalAbsSegments = bestLocalSegments.map((s) => ({
          x1: info.x + s.x1,
          y1: info.y + s.y1,
          x2: info.x + s.x2,
          y2: info.y + s.y2,
        }));

        resolvedLabels.push({
          title: info.title,
          rect: finalRect,
          circleX: info.x + bestOffsetX,
          circleY: info.y + bestOffsetY,
          hidden,
          segments: finalAbsSegments,
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
        [
          "pos-top",
          "pos-bottom",
          "pos-left",
          "pos-right",
          "pos-topleft",
          "pos-topright",
          "pos-bottomleft",
          "pos-bottomright",
        ].forEach((p) => info.el.classList.remove(p));
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
          pathEl.style.stroke = isSelected ? "#C79A59" : "#9A9186";
          pathEl.style.strokeWidth = isSelected ? "2.5px" : "2.2px";

          const cx_svg = 350;
          const cy_svg = 350;

          let dAttr = "";
          bestLocalSegments.forEach((seg, idx) => {
            const x1 = cx_svg + seg.x1;
            const y1 = cy_svg + seg.y1;
            const x2 = cx_svg + seg.x2;
            const y2 = cy_svg + seg.y2;
            dAttr +=
              idx === 0 ? `M ${x1},${y1} L ${x2},${y2}` : ` L ${x2},${y2}`;
          });
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

    // Clean, minimalist SVG icons in light cream #E5DDD0 matching reference
    const iconMap: Record<string, string> = {
      "Education Institutes": `<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: #E5DDD0;"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
      Banks: `<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: #E5DDD0;"><line x1="3" y1="22" x2="21" y2="22" /><line x1="6" y1="18" x2="6" y2="11" /><line x1="10" y1="18" x2="10" y2="11" /><line x1="14" y1="18" x2="14" y2="11" /><line x1="18" y1="18" x2="18" y2="11" /><polygon points="12 2 20 7 4 7" /></svg>`,
      Recreational: `<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: #E5DDD0;"><path d="M10 22v-5" /><path d="M10 17a4 4 0 0 1-4-4c0-2 2-3 2-3s0-1 1-2 2-1 2-1 1 0 2 1 1 2 1 2 2 1 2 3a4 4 0 0 1-4 4z" /><path d="M14 22v-4" /><path d="M14 18a3 3 0 0 0 3-3c0-1.5-1.5-2.25-1.5-2.25s0-.75-.75-1.5-1.5-.75-1.5-.75-.75 0-1.5.75-.75 1.5-.75 1.5-1.5.75-1.5 2.25a3 3 0 0 0 3 3z" /></svg>`,
      "Lifestyle & Social": `<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: #E5DDD0;"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
      Transport: `<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: #E5DDD0;"><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M8 15h.01"/><path d="M16 15h.01"/><path d="M6 19v2"/><path d="M18 19v2"/></svg>`,
      Hospitals: `<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: #E5DDD0;"><path d="M12 6v12"/><path d="M6 12h12"/><rect width="18" height="18" x="3" y="3" rx="2"/></svg>`,
      "Commercial Hubspots": `<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: #E5DDD0;"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /><rect width="20" height="14" x="2" y="6" rx="2" /></svg>`,
      "Upcoming Infrastructure": `<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: #E5DDD0;"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>`,
    };

    catData.locations.forEach((loc) => {
      if (loc.title === "Gorai Bayview Site") return;

      const parsed = parseLocationName(loc.title, loc.name);

      const markerEl = document.createElement("div");
      markerEl.className = "luxury-annotation-container";

      // 1. Create pinpoint dot (solid grey-brown dot)
      const dotEl = document.createElement("div");
      dotEl.className = "luxury-dot";
      markerEl.appendChild(dotEl);

      // 2. Create SVG and path programmatically (700x700 canvas)
      const svgEl = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
      );
      svgEl.setAttribute("class", "luxury-leader-svg");
      svgEl.setAttribute("width", "700");
      svgEl.setAttribute("height", "700");
      svgEl.style.cssText =
        "position: absolute; top: -350px; left: -350px; width: 700px; height: 700px; pointer-events: none; overflow: visible; z-index: 1;";

      const pathEl = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      pathEl.setAttribute("class", "luxury-leader-path");
      pathEl.setAttribute("fill", "none");
      pathEl.setAttribute("stroke", "#9A9186");
      pathEl.setAttribute("stroke-width", "2.2");
      pathEl.setAttribute("d", "");
      svgEl.appendChild(pathEl);
      markerEl.appendChild(svgEl);

      // 3. Create Circle Marker (Small 30px badge)
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

        setSelectedLocation(loc);
        handleShowRoute(loc.routeCoordinates || loc.coordinates, loc.title);
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
      const isBanks = category === "Banks";

      const padding = isMobile
        ? { top: 100, bottom: 60, left: 20, right: 20 }
        : { top: 80, bottom: 80, left: 340, right: 120 };

      if (isBanks) {
        // Banks are situated in the local Borivali/Gorai vicinity; zoom in closer to clearly show nearby banks
        fitBoundsWithMaxZoom(map, bounds, padding, 15);
        google.maps.event.addListenerOnce(map, "idle", () => {
          if ((map.getZoom() ?? 13) < 14) {
            map.setZoom(14);
          }
        });
      } else if (isTransport) {
        // Frame all transport connectivity hubs with clean padding and appropriate zoom
        fitBoundsWithMaxZoom(map, bounds, padding, 14);
      } else if (category === "Upcoming Infrastructure") {
        fitBoundsWithMaxZoom(map, bounds, padding, 13);
      } else {
        fitBoundsWithMaxZoom(map, bounds, padding, 13);
      }
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
    setTimeout(resolveLabelCollisions, 100);
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
        const safePadding =
          screenWidth < 1024
            ? { top: 100, bottom: 80, left: 30, right: 30 }
            : { top: 120, bottom: 120, left: 360, right: 120 };

        fitBoundsWithMaxZoom(map, bounds, safePadding, 15);

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
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-black"
    >
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4 phone-landscape:h-8 phone-landscape:w-8 phone-landscape:mb-2"></div>
            <p className="text-lg phone-landscape:text-sm">
              Calculating Route...
            </p>
          </div>
        </div>
      )}

      {/* MAP CONTROLS */}
      <div className="absolute right-6 bottom-32 z-20 flex flex-col gap-2 phone-landscape:right-4 phone-landscape:bottom-14 phone-landscape:gap-1.5">
        {/* Toggle UI clean view button (Feedback 13) */}
        <button
          onClick={() => setIsCleanView(!isCleanView)}
          className="w-10 h-10 rounded-lg bg-black/45 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/70 hover:text-[#C79A59] transition shadow-lg cursor-pointer phone-landscape:w-7 phone-landscape:h-7 phone-landscape:rounded-md"
          title={isCleanView ? "Show UI Panels" : "Hide UI Panels (Clean View)"}
        >
          {isCleanView ? (
            <Eye
              size={20}
              className="phone-landscape:w-3.5 phone-landscape:h-3.5"
            />
          ) : (
            <EyeOff
              size={20}
              className="phone-landscape:w-3.5 phone-landscape:h-3.5"
            />
          )}
        </button>

        {/* Fullscreen toggle */}
        <button
          onClick={toggleFullscreen}
          className="w-10 h-10 rounded-lg bg-black/45 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/70 hover:text-[#C79A59] transition shadow-lg cursor-pointer phone-landscape:w-7 phone-landscape:h-7 phone-landscape:rounded-md"
          title={isFullscreenActive ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreenActive ? (
            <Minimize2
              size={20}
              className="phone-landscape:w-3.5 phone-landscape:h-3.5"
            />
          ) : (
            <Maximize2
              size={20}
              className="phone-landscape:w-3.5 phone-landscape:h-3.5"
            />
          )}
        </button>

        <div className="flex flex-col gap-2 luxury-zoom-control phone-landscape:gap-1.5">
          <button
            onClick={() => {
              if (mapRef.current)
                mapRef.current.setZoom((mapRef.current.getZoom() ?? 13) + 1);
            }}
            className="w-10 h-10 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/70 hover:text-[#C79A59] transition shadow-lg cursor-pointer phone-landscape:w-7 phone-landscape:h-7 phone-landscape:rounded-md"
            title="Zoom In"
          >
            <Plus
              size={20}
              className="phone-landscape:w-3.5 phone-landscape:h-3.5"
            />
          </button>
          <button
            onClick={() => {
              if (mapRef.current)
                mapRef.current.setZoom((mapRef.current.getZoom() ?? 13) - 1);
            }}
            className="w-10 h-10 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/70 hover:text-[#C79A59] transition shadow-lg cursor-pointer phone-landscape:w-7 phone-landscape:h-7 phone-landscape:rounded-md"
            title="Zoom Out"
          >
            <Minus
              size={20}
              className="phone-landscape:w-3.5 phone-landscape:h-3.5"
            />
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
          isFullscreenActive={isFullscreenActive}
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
            className="absolute z-30 w-fit lg:w-[250px] flex flex-col items-start gap-3 p-4 rounded-[10px] bg-[#2C3437]/75 backdrop-blur-md border border-[#40484B]/70 shadow-[0_12px_40px_rgba(0,0,0,0.4)] left-4 right-4 bottom-28 md:bottom-32 md:left-1/2 md:-translate-x-1/2 lg:bottom-auto lg:top-[6.5rem] lg:right-6 lg:left-auto lg:translate-x-0 lg:max-w-none phone-landscape:w-[190px] phone-landscape:gap-1.5 phone-landscape:p-2.5 phone-landscape:rounded-[8px] phone-landscape:left-auto phone-landscape:right-4 phone-landscape:top-14 phone-landscape:bottom-auto phone-landscape:translate-x-0"
          >
            <div className="w-full pr-8 min-w-0 phone-landscape:pr-5">
              <p className="text-[#C79A59] text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold phone-landscape:text-[8px] phone-landscape:tracking-wider">
                {selectedLocation
                  ? categoryDisplayNames[selectedCategory] || selectedCategory
                  : ""}
              </p>
              <h3 className="text-white text-base sm:text-lg font-light font-sans tracking-wide truncate mt-1 phone-landscape:text-[12px] phone-landscape:mt-0.5">
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
              <div className="flex flex-row items-center gap-4 w-full border-t border-[#40484B]/30 pt-3 shrink-0 phone-landscape:gap-3 phone-landscape:pt-1.5">
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-white/40 text-[9px] uppercase tracking-widest font-medium phone-landscape:text-[7px]">
                    Duration
                  </span>
                  <p className="text-white text-xs sm:text-sm font-semibold tracking-wide mt-0.5 phone-landscape:text-[10px]">
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
                <div className="h-6 w-px bg-[#40484B]/50 phone-landscape:h-4" />
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-[#C79A59] text-[9px] uppercase tracking-widest font-medium phone-landscape:text-[7px]">
                    Distance
                  </span>
                  <p className="text-white text-xs sm:text-sm font-semibold tracking-wide mt-0.5 phone-landscape:text-[10px]">
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
              className="absolute top-4 right-4 text-white/40 hover:text-white transition duration-200 cursor-pointer p-1 phone-landscape:top-2 phone-landscape:right-2 phone-landscape:p-0.5"
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

        /* Coordinate Spot: solid grey pinpoint dot matching Image #3 */
        .luxury-dot {
          position: absolute;
          width: 7px;
          height: 7px;
          background-color: #9A9186;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
          transform: translate(-50%, -50%);
          z-index: 50;
          transition: transform 250ms ease, box-shadow 250ms ease, background-color 250ms ease;
        }

        .luxury-annotation-container.active .luxury-dot {
          transform: translate(-50%, -50%) scale(1.3);
          background-color: #C79A59 !important;
          box-shadow: 0 0 8px rgba(199, 154, 89, 0.8), 0 1px 3px rgba(0, 0, 0, 0.4);
        }

        /* Marker Container: small solid dark-brown circular badge matching reference */
        .luxury-marker-circle {
          position: absolute;
          width: 30px;
          height: 30px;
          top: 50%;
          left: 50%;
          transform: translate(calc(-50% + var(--offset-x, 0px)), calc(-50% + var(--offset-y, -30px)));
          background: #5B4A3D;
          border: none;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
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
          width: 15px;
          height: 15px;
          background: transparent;
        }
        .luxury-marker-icon svg {
          width: 15px;
          height: 15px;
          stroke: #E5DDD0 !important;
          color: #E5DDD0 !important;
        }

        /* On selection: enlarge 1.15x with gold glow shadow */
        .luxury-annotation-container.active .luxury-marker-circle {
          transform: translate(calc(-50% + var(--offset-x, 0px)), calc(-50% + var(--offset-y, -30px))) scale(1.15);
          box-shadow: 0 0 12px rgba(199, 154, 89, 0.8), 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        /* Leader Line SVG */
        .luxury-leader-svg {
          position: absolute;
          top: -350px;
          left: -350px;
          width: 700px;
          height: 700px;
          pointer-events: none;
          overflow: visible;
          z-index: 1;
        }

        /* Leader Line: thick and light grey-tan line matching attachment */
        .luxury-leader-path {
          stroke: #9A9186;
          stroke-width: 2.2px;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          transition: stroke 200ms ease, stroke-width 200ms ease;
        }
        .luxury-annotation-container.active .luxury-leader-path {
          stroke: #C79A59 !important;
          stroke-width: 2.5px !important;
        }

        /* Label Text: sits directly on the map, no background pill — a
           cream text-shadow halo keeps it legible over both light and dark
           map tiles instead of masking the map underneath. */
        .luxury-label-text-wrapper {
          position: absolute;
          pointer-events: none;
          font-family: inherit;
          font-size: 10.5px;
          font-weight: 700;
          color: #5B4230;
          text-shadow:
            0 0 3px rgba(245, 240, 230, 0.9),
            0 0 3px rgba(245, 240, 230, 0.9),
            0 1px 2px rgba(245, 240, 230, 0.9);
          line-height: 1.2;
          width: max-content;
          max-width: 95px;
          white-space: normal;
          z-index: 10;
          text-align: center;
        }

        /* Hide overlapping labels. !important is required: this selector ties
           in specificity with the later .pos-* rules that set display: flex
           on the same element, and without it the tie-break (source order)
           lets the pos-* rule win, silently un-hiding "hidden" labels. */
        .hidden-label .luxury-label-text-wrapper {
          display: none !important;
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
          text-shadow:
            0 0 3px rgba(245, 240, 230, 0.95),
            0 0 3px rgba(245, 240, 230, 0.95),
            0 1px 2px rgba(245, 240, 230, 0.95);
        }

        /* Position mapping of text label relative to circle marker */
        /* Top position (label sits above the circle) */
        .pos-top .luxury-label-text-wrapper {
          bottom: 100%;
          left: 50%;
          transform: translate(-50%, -6px);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Bottom position (label sits below the circle) */
        .pos-bottom .luxury-label-text-wrapper {
          top: 100%;
          left: 50%;
          transform: translate(-50%, 6px);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Left position (label sits on the left of the circle) */
        .pos-left .luxury-label-text-wrapper {
          right: 100%;
          top: 50%;
          transform: translate(-6px, -50%);
          text-align: right;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        /* Right position (label sits on the right of the circle) */
        .pos-right .luxury-label-text-wrapper {
          left: 100%;
          top: 50%;
          transform: translate(6px, -50%);
          text-align: left;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        /* TopRight position (label sits above and right of circle) */
        .pos-topright .luxury-label-text-wrapper {
          bottom: 60%;
          left: 60%;
          transform: translate(6px, -6px);
          text-align: left;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        /* TopLeft position (label sits above and left of circle) */
        .pos-topleft .luxury-label-text-wrapper {
          bottom: 60%;
          right: 60%;
          transform: translate(-6px, -6px);
          text-align: right;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        /* BottomRight position (label sits below and right of circle) */
        .pos-bottomright .luxury-label-text-wrapper {
          top: 60%;
          left: 60%;
          transform: translate(6px, 6px);
          text-align: left;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        /* BottomLeft position (label sits below and left of circle) */
        .pos-bottomleft .luxury-label-text-wrapper {
          top: 60%;
          right: 60%;
          transform: translate(-6px, 6px);
          text-align: right;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        /* Luxury Main Home Marker Styles (No outer ring, clean full fit, 44px circle) */
        .luxury-home-marker {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          cursor: pointer;
        }

        .luxury-home-inner {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #5B4A3D;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.45);
          border: none;
          outline: none;
          overflow: hidden;
          z-index: 2;
        }

        .luxury-home-inner img,
        .luxury-home-logo-img {
          width: 26px;
          height: 26px;
          object-fit: contain;
          transform: none;
        }
      `}</style>
    </section>
  );
}
