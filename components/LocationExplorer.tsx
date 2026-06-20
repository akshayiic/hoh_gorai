"use client";

import { useEffect, useRef, useState } from "react";
import {
  Map as MapIcon,
  Train,
  ShoppingBag,
  GraduationCap,
  Hotel,
  Hospital,
  CircleDot,
  Building2,
  Waves,
  Plus,
  Minus,
  Navigation,
  MapPin,
  ChevronDown,
  Trees,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import BottomNavbar from "@/components/BottomNavbar";
import GlobalNavbar from "@/components/GlobalNavbar";
import Sidebar, { createSidebarSections, createSidebarItems } from "@/components/Sidebar";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MaitriParkLocation = { lat: 19.23417, lng: 72.82783 }; // Maitri Park Site

const infrastructure = {
  current: [
    {
      title: "Education Institutes",
      icon: GraduationCap,
      locations: [
        {
          title: "VIBGYOR High School",
          name: "VIBGYOR High School - 9.3km (29 mins)",
          coordinates: { lat: 19.1594674, lng: 72.8355775 },
        },
        {
          title: "Swami Vivekanandand International",
          name: "Swami Vivekanandand International school - 6.1km (18 mins)",
          coordinates: { lat: 19.2096745, lng: 72.8472554 },
        },
        {
          title: "Orchids The International School",
          name: "Orchids The International School - 6.2km (18 mins)",
          coordinates: { lat: 19.1938196, lng: 72.8411626 },
        },
      ],
    },
    {
      title: "Banks",
      icon: Building2,
      locations: [
        {
          title: "HDFC Bank",
          name: "HDFC Bank - 550m (2 Mins)",
          coordinates: { lat: 19.235184, lng: 72.8284681 },
        },
        {
          title: "Axis Bank",
          name: "Axis Bank - 1.4km (5 Mins)",
          coordinates: { lat: 19.2270023, lng: 72.8242808 },
        },
        {
          title: "Union Bank of India",
          name: "Union Bank of India - 1km (4 Mins)",
          coordinates: { lat: 19.2270052, lng: 72.8280828 },
        },
      ],
    },
    {
      title: "Recreational",
      icon: Trees,
      locations: [
        {
          title: "Vipasana pagoda",
          name: "Vipasana pagoda - 29km (1hr 20 Mins)",
          coordinates: { lat: 19.2282034, lng: 72.8058891 },
        },
        {
          title: "Gorai beach",
          name: "Gorai Beach - 2-3km",
          coordinates: { lat: 19.2458, lng: 72.7845 },
        },
        {
          title: "National park",
          name: "National park - 6.4km (18 Mins)",
          coordinates: { lat: 19.2204535, lng: 72.9128422 },
        },
        {
          title: "Madh island",
          name: "Madh island - 14km (42 Mins)",
          coordinates: { lat: 19.1484913, lng: 72.7891606 },
        },
        {
          title: "iskon temple",
          name: "Iskon temple - 650m (2 Mins)",
          coordinates: { lat: 19.2302128, lng: 72.8264632 },
        },
      ],
    },
    {
      title: "Lifestyle & Social",
      icon: ShoppingBag,
      locations: [
        {
          title: "Sky City mall",
          name: "Sky City mall - 5.7km (17 Mins)",
          coordinates: { lat: 19.223302, lng: 72.8642378 },
        },
        {
          title: "Inorbit Mall",
          name: "Inorbit Mall - 8.8km (35 Mins)",
          coordinates: { lat: 19.1729281, lng: 72.8359056 },
        },
        {
          title: "Chroma",
          name: "Chroma - 3.2km (11 Mins)",
          coordinates: { lat: 19.2337106, lng: 72.8538108 },
        },
        {
          title: "Goregaon sports club",
          name: "Goregaon sports club - 7km (28 Mins)",
          coordinates: { lat: 19.1820887, lng: 72.8355377 },
        },
        {
          title: "Oberoi Mall",
          name: "Oberoi - goregaon mall - 12km (37 Mins)",
          coordinates: { lat: 19.1741983, lng: 72.8604101 },
        },
        {
          title: "Infinity Mall",
          name: "Infinity Mall - 12km (52 Mins)",
          coordinates: { lat: 19.14129, lng: 72.8311659 },
        },
        {
          title: "Nesco",
          name: "Nesco - 15km (43 Mins)",
          coordinates: { lat: 19.1490086, lng: 72.8536449 },
        },
      ],
    },
    {
      title: "Connectivity",
      icon: Train,
      locations: [
        {
          title: "Coastal Road",
          name: "Coastal Road - 27km (1hr 20 mins)",
          coordinates: { lat: 19.23417, lng: 72.82783 },
        },
        {
          title: "AIR & Doordarshan Station",
          name: "AIR & Doordarshan Receiving Station - 700m (2 Mins)",
          coordinates: { lat: 19.2316241, lng: 72.8298975 },
        },
        {
          title: "New link road",
          name: "New link road - 6.3km (23 Mins)",
          coordinates: { lat: 19.1898948, lng: 72.8354623 },
        },
        {
          title: "Wire Bridge",
          name: "Wire Bridge - 1.4km (5 Mins)",
          coordinates: { lat: 19.226091, lng: 72.827978 },
        },
        {
          title: "Borivali Thane Tunnel",
          name: "Borivali Thane twin Tunnel - 5.8km (19 Mins)",
          coordinates: { lat: 19.2217681, lng: 72.8691741 },
        },
        {
          title: "SV Road",
          name: "SV Road - 16km (48 Mins)",
          coordinates: { lat: 19.23417, lng: 72.82783 },
        },
        {
          title: "Gorai Metro",
          name: "Gorai Metro - 1.4km (5 Mins)",
          coordinates: { lat: 19.2259009, lng: 72.8280027 },
        },
        {
          title: "Mumbai Metro Line 9 & 7A",
          name: "Mumbai Metro Line 9 & 7A - 9km (26 Mins)",
          coordinates: { lat: 19.2712538, lng: 72.8808657 },
        },
        {
          title: "Western Express Highway",
          name: "Western Express Highway - 7km (20 Mins)",
          coordinates: { lat: 19.23417, lng: 72.82783 },
        },
      ],
    },
    {
      title: "Hospitals",
      icon: Hospital,
      locations: [
        {
          title: "APEX Hospital",
          name: "APEX Hospital - 2.2km (8 Mins)",
          coordinates: { lat: 19.2293416, lng: 72.8466084 },
        },
        {
          title: "Arihant Super Speciality",
          name: "Arihant Super Speciality - 4.3km (13 mins)",
          coordinates: { lat: 19.2189271, lng: 72.8523851 },
        },
        {
          title: "Phoenix Hospital",
          name: "Phoenix hospital - 3km (11 mins)",
          coordinates: { lat: 19.2195799, lng: 72.838099 },
        },
        {
          title: "Lotus Hospital",
          name: "Lotus Hospital - 2.4km (8 mins)",
          coordinates: { lat: 19.2270842, lng: 72.8460337 },
        },
        {
          title: "Zenith Hospital",
          name: "Zenith Hospital - 5.7km (22 mins)",
          coordinates: { lat: 19.1951084, lng: 72.8340496 },
        },
        {
          title: "Karuna Hospital",
          name: "Karuna Hospital - 4.8km (16 Mins)",
          coordinates: { lat: 19.2412571, lng: 72.8529326 },
        },
      ],
    },
    // {
    //   title: "Commercial Hubspots",
    //   icon: Hotel,
    //   locations: [
    //     {
    //       title: "Goregaon",
    //       name: "Goregaon - 12km (41 Mins)",
    //       coordinates: { lat: 19.1662566, lng: 72.8525696 },
    //     },
    //     {
    //       title: "Nariman Point",
    //       name: "Nariman Point - 44km (1hr 31 Mins)",
    //       coordinates: { lat: 18.9255728, lng: 72.8242221 },
    //     },
    //     {
    //       title: "Malad",
    //       name: "Malad - 8km (36 Mins)",
    //       coordinates: { lat: 19.1874459, lng: 72.8483689 },
    //     },
    //     {
    //       title: "CST",
    //       name: "CST - 43km (1hr 34 Mins)",
    //       coordinates: { lat: 18.9401131, lng: 72.8357207 },
    //     },
    //     {
    //       title: "BKC",
    //       name: "BKC - 26km (1hr)",
    //       coordinates: { lat: 19.0687893, lng: 72.8702647 },
    //     },
    //     {
    //       title: "Andheri",
    //       name: "Andheri - 19km (1 hr)",
    //       coordinates: { lat: 19.113645, lng: 72.8697339 },
    //     },
    //     {
    //       title: "Worli",
    //       name: "Worli - 34km (1 Hr 26 Mins)",
    //       coordinates: { lat: 18.9986406, lng: 72.8173599 },
    //     },
    //     {
    //       title: "Thane",
    //       name: "Thane - 28km (1hr 21 Mins)",
    //       coordinates: { lat: 19.2122949, lng: 72.9771661 },
    //     },
    //     {
    //       title: "Lower Parel",
    //       name: "Lower Parel - 35km (1hr 35 Mins)",
    //       coordinates: { lat: 18.9982461, lng: 72.8269646 },
    //     },
    //     {
    //       title: "Powai",
    //       name: "Powai - 21km (1hr 13 Mins)",
    //       coordinates: { lat: 19.1175993, lng: 72.9059747 },
    //     },
    //   ],
    // },
  ],
  upcoming: [],
};

const categoryDisplayNames: Record<string, string> = {
  "Education Institutes": "Education",
  Banks: "Banks",
  Recreational: "Recreational",
  "Lifestyle & Social": "Shopping & Lifestyle",
  Connectivity: "Connectivity",
  Hospitals: "Healthcare",
  "Commercial Hubspots": "Commercial Hub",
};

function parseLocationName(title: string, name: string) {
  const index = name.indexOf(" - ");
  if (index === -1) {
    return { title, distance: "", duration: "" };
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
    title: mainTitle || title,
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
  onNavigate?: (view: "location" | "balcony" | "apartments" | "amenities") => void;
}

export default function LocationExplorer({
  onNavigate,
}: LocationExplorerProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("Connectivity");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [originAddress, setOriginAddress] = useState(
    "Maitri Park, Borivali West, Mumbai",
  );
  const [destinationAddress, setDestinationAddress] = useState("");

  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [activeRoute, setActiveRoute] = useState<{
    distance: string;
    duration: string;
    destinationName: string;
  } | null>(null);

  const [isRouteLoading, setIsRouteLoading] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const labelMarkersRef = useRef<maplibregl.Marker[]>([]);
  const homeMarkerRef = useRef<maplibregl.Marker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hoverPopupRef = useRef<maplibregl.Popup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors, © CARTO",
          },
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [MaitriParkLocation.lng, MaitriParkLocation.lat],
      zoom: 13,
    });

    mapRef.current = map;

    // Initialize hover popup once
    const hoverPopup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: "luxury-hover-popup",
      anchor: "bottom",
      offset: 15,
    });
    hoverPopupRef.current = hoverPopup;

    map.on("load", () => {
      // Ensure dimensions are correct
      map.resize();

      // Add a distinct pulse marker for Maitri Park
      const el = document.createElement("div");
      el.className = "luxury-home-marker flex items-center justify-center";
      el.style.width = "48px";
      el.style.height = "48px";
      el.style.cursor = "pointer";

      el.innerHTML = `
        <div class="luxury-home-pulse-ring"></div>
        <div class="luxury-home-inner">
          <svg viewBox="0 0 100 100" width="24" height="24">
            <circle cx="50" cy="50" r="44" stroke="#ffffff" stroke-width="1" fill="none" opacity="0.3"/>
            <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="'Cinzel', 'Playfair Display', 'Didot', 'Georgia', serif" font-weight="bold" font-size="36" fill="#ffffff">H</text>
          </svg>
        </div>
      `;

      const homeMarker = new maplibregl.Marker({ element: el })
        .setLngLat([MaitriParkLocation.lng, MaitriParkLocation.lat])
        .setPopup(
          new maplibregl.Popup({
            offset: 25,
            closeButton: false,
            className: "luxury-hover-popup",
          }).setHTML(
            `<div class="luxury-mini-card" style="padding: 2px;">
                <div class="category">Hiranandani Project</div>
                <div class="title" style="margin-bottom: 0; font-family: serif; font-size: 14px;">Maitri Park Site</div>
              </div>`,
          ),
        )
        .addTo(map);

      homeMarkerRef.current = homeMarker;
      setMapLoaded(true);
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (hoverPopupRef.current) {
        hoverPopupRef.current.remove();
      }
      map.remove();
    };
  }, []);

  // Update Category Markers when category changes (created once per category)
  const updateCategoryMarkers = (
    map: maplibregl.Map | null,
    category: string,
  ) => {
    if (!map) return;

    // Clear old markers and labels
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    labelMarkersRef.current.forEach((m) => m.remove());
    labelMarkersRef.current = [];

    if (!category) return;

    const catData = infrastructure.current.find(
      (item) => item.title === category,
    );
    if (!catData) return;

    const iconMap: Record<string, string> = {
      "Education Institutes": `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/><path d="M21.5 12v6"/></svg>`,
      Banks: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V10"/><path d="M18 22V10"/><path d="M3 22h18"/><path d="M3 10h18"/><path d="M12 2v4"/><path d="m17 2-5 4-5-4M2 10l10-8 10 8"/><path d="M12 14v4"/><path d="M10 16h4"/></svg>`,
      Recreational: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 13v7"/><path d="M10 18h4"/><path d="M3 22h18"/><path d="m19 13-3-3h-4v3l3 3h4Z"/></svg>`,
      "Lifestyle & Social": `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
      Connectivity: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m16 19 2 3"/><path d="M8 15h.01"/><path d="M16 15h.01"/></svg>`,
      Hospitals: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>`,
      "Commercial Hubspots": `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 21V9h6v12"/><path d="M21 9H3"/><path d="M9 5h6"/></svg>`,
    };

    catData.locations.forEach((loc) => {
      if (loc.title === "Maitri Park Site") return;

      const parsed = parseLocationName(loc.title, loc.name);
      const displayCat = categoryDisplayNames[category] || category;

      // Create permanent label marker
      const markerEl = document.createElement("div");
      markerEl.className = "permanent-label";
      markerEl.style.cssText = `
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(8px);
        color: white;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 500;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.15);
        pointer-events: none;
      `;
      markerEl.textContent = parsed.title;

      // Add permanent label to map
      const labelMarker = new maplibregl.Marker({
        element: markerEl,
        anchor: "bottom",
        offset: [0, -8],
      })
        .setLngLat([loc.coordinates.lng, loc.coordinates.lat])
        .addTo(map);

      // Create icon marker
      const iconEl = document.createElement("div");
      iconEl.className = "luxury-poi-marker flex items-center justify-center";
      iconEl.innerHTML = iconMap[category] || "";

      const marker = new maplibregl.Marker({ element: iconEl })
        .setLngLat([loc.coordinates.lng, loc.coordinates.lat])
        .addTo(map);

      // Add label marker to ref for cleanup
      labelMarkersRef.current.push(labelMarker);

      // Store title and DOM ref on marker object
      (marker as any).locTitle = loc.title;
      (marker as any).elementRef = iconEl;

      // Click/Tap handler supporting both Desktop and Mobile
      iconEl.addEventListener("click", (e) => {
        e.stopPropagation();

        const isMobile =
          typeof window !== "undefined" && window.innerWidth < 1024;
        const isActive = iconEl.classList.contains("active");

        if (isMobile) {
          if (isActive) {
            // Second tap: draw route
            handleShowRoute(loc.coordinates, loc.title);
          } else {
            // First tap: select location and fly to it
            setSelectedLocation(loc);
            if (mapRef.current) {
              mapRef.current.flyTo({
                center: [loc.coordinates.lng, loc.coordinates.lat],
                zoom: 14,
                essential: true,
              });
            }
          }
        } else {
          // Desktop: immediately select and show route
          setSelectedLocation(loc);
          handleShowRoute(loc.coordinates, loc.title);
        }
      });

      markersRef.current.push(marker);
    });
  };

  // Sync Category Markers only when category changes or map finishes loading
  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      updateCategoryMarkers(mapRef.current, selectedCategory);
    }
  }, [selectedCategory, mapLoaded]);

  // Handle active marker styling changes in-place by adding/removing CSS classes
  useEffect(() => {
    markersRef.current.forEach((marker) => {
      const locTitle = (marker as any).locTitle;
      const el = (marker as any).elementRef as HTMLDivElement;
      if (!el) return;

      const isSelected = locTitle === selectedLocation?.title;
      if (isSelected) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });
  }, [selectedLocation?.title]);

  const handleCategoryChange = (category: string) => {
    const isClosing = selectedCategory === category;
    setSelectedCategory(isClosing ? "" : category);
    setSelectedLocation(null);
    clearRouteLayer();
  };

  const clearRouteLayer = () => {
    const map = mapRef.current;
    if (!map) return;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (map.getLayer("route")) map.removeLayer("route");
    if (map.getLayer("route-glow")) map.removeLayer("route-glow");
    if (map.getSource("route")) map.removeSource("route");
    if (map.getLayer("animated-marker")) map.removeLayer("animated-marker");
    if (map.getSource("animated-marker")) map.removeSource("animated-marker");

    setActiveRoute(null);
  };

  const handleShowRoute = (
    destCoordinates: { lat: number; lng: number },
    destName: string,
    originCoords = MaitriParkLocation,
  ) => {
    const map = mapRef.current;
    if (!map) {
      console.error("Map not initialized");
      return;
    }

    console.log("Showing route:", { originCoords, destCoordinates, destName });

    // Ensure map dimensions are correctly computed before fits
    map.resize();

    setIsRouteLoading(true);
    clearRouteLayer();

    fetch(
      `https://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.lat};${destCoordinates.lng},${destCoordinates.lat}?overview=full&geometries=geojson`,
    )
      .then((r) => r.json())
      .then((data) => {
        console.log("OSRM response:", data);
        if (data.routes && data.routes[0]) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates;

          const distanceKm = (route.distance / 1000).toFixed(1);
          const durationMin = Math.round(route.duration / 60);

          setActiveRoute({
            distance: `${distanceKm} km`,
            duration: `${durationMin} min`,
            destinationName: destName,
          });

          // Zoom to fit bounds
          const bounds = coords.reduce(
            (bounds: any, coord: number[]) => {
              return bounds.extend([coord[0], coord[1]]);
            },
            new maplibregl.LngLatBounds(coords[0], coords[0]),
          );

          // Prevent negative viewport size / NaN zoom by choosing safe padding on narrow displays
          const screenWidth =
            typeof window !== "undefined" ? window.innerWidth : 1200;
          const safePadding =
            screenWidth < 1024
              ? 40
              : { top: 120, bottom: 120, left: 360, right: 120 };

          map.fitBounds(bounds, {
            padding: safePadding,
            maxZoom: 15,
            duration: 2000, // Smooth 2s camera transition
            essential: true,
          });

          animateRouteDrawing(map, coords);
        } else {
          console.error("No routes found in OSRM response");
        }
        setIsRouteLoading(false);
      })
      .catch((e) => {
        console.error("OSRM Routing Error:", e);
        setIsRouteLoading(false);
      });
  };

  const animateRouteDrawing = (
    map: maplibregl.Map,
    coordinates: number[][],
  ) => {
    let currentIndex = 0;
    const animationSpeed = 3;

    map.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [],
        },
      },
    });

    // Add route glow under-layer
    map.addLayer({
      id: "route-glow",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#c79a59",
        "line-width": 14,
        "line-opacity": 0.4,
        "line-blur": 6,
      },
    });

    // Add main route line layer
    map.addLayer({
      id: "route",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#E5C158",
        "line-width": 6,
        "line-opacity": 0.95,
      },
    });

    const animate = () => {
      const nextIndex = Math.min(
        currentIndex + animationSpeed,
        coordinates.length,
      );
      const segmentCoordinates = coordinates.slice(0, nextIndex);

      const source = map.getSource("route") as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: segmentCoordinates,
          },
        });
      }

      if (segmentCoordinates.length > 0) {
        const lastCoord = segmentCoordinates[segmentCoordinates.length - 1];

        if (map.getLayer("animated-marker")) map.removeLayer("animated-marker");
        if (map.getSource("animated-marker"))
          map.removeSource("animated-marker");

        map.addSource("animated-marker", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Point",
              coordinates: lastCoord,
            },
          },
        });

        map.addLayer({
          id: "animated-marker",
          type: "circle",
          source: "animated-marker",
          paint: {
            "circle-radius": 9,
            "circle-color": "#ffffff",
            "circle-stroke-width": 3,
            "circle-stroke-color": "#E5C158",
          },
        });
      }

      currentIndex = nextIndex;

      if (currentIndex < coordinates.length) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animate();
  };

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
    setOriginAddress("Maitri Park, Borivali West, Mumbai");
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [MaitriParkLocation.lng, MaitriParkLocation.lat],
        zoom: 13,
        essential: true,
      });
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* MAP CONTAINER */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 h-full w-full premium-map-container"
        style={{ zIndex: 10 }}
      />

      {/* MAP OVERLAY (Subtle shadow gradient for panel readability) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-black/30 pointer-events-none z-15" />

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
      <div className="absolute right-6 bottom-32 z-20">
        <div className="flex flex-col gap-2 luxury-zoom-control">
          <button
            onClick={() => {
              if (mapRef.current) mapRef.current.zoomIn();
            }}
            className="w-10 h-10 rounded-lg bg-black/60 backdrop-blur border border-white/10 text-white flex items-center justify-center hover:bg-black/70 hover:text-[#C79A59] transition shadow-lg cursor-pointer"
            title="Zoom In"
          >
            <Plus size={20} />
          </button>
          <button
            onClick={() => {
              if (mapRef.current) mapRef.current.zoomOut();
            }}
            className="w-10 h-10 rounded-lg bg-black/60 backdrop-blur border border-white/10 text-white flex items-center justify-center hover:bg-black/70 hover:text-[#C79A59] transition shadow-lg cursor-pointer"
            title="Zoom Out"
          >
            <Minus size={20} />
          </button>
        </div>
      </div>

      {/* Global Navbar */}
      <GlobalNavbar currentPage="location" showReset={true} onReset={resetMap} />

      {/* SIDEBAR PANEL */}
      <Sidebar
        header={{
          icon: MapIcon,
          subtitle: "Click to Explore",
          title: "Locations"
        }}
        sections={createSidebarSections([
          {
            id: "current-infrastructure",
            title: "Current Infrastructure",
            items: createSidebarItems(
              infrastructure.current.map((item) => ({
                id: item.title,
                label: item.title,
                icon: item.icon,
                onClick: () => handleCategoryChange(item.title),
                isActive: selectedCategory === item.title
              }))
            )
          }
        ])}
      />

      {/* PREMIUM LARGE INFORMATION CARD */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute z-30 flex flex-row items-center justify-between gap-4 p-5 pr-10 rounded-[20px] bg-[#0c0c0c]/80 backdrop-blur-[20px] border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] left-4 right-4 bottom-28 md:w-[420px] md:bottom-32 md:left-1/2 md:-translate-x-1/2 lg:bottom-auto lg:top-6 lg:left-1/2 lg:-translate-x-1/2 lg:w-[480px] lg:max-w-none"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[#C79A59] text-[9px] sm:text-xs uppercase tracking-[0.2em] font-semibold">
                {selectedLocation
                  ? categoryDisplayNames[selectedCategory] || selectedCategory
                  : ""}
              </p>
              <h3 className="text-white text-base sm:text-2xl font-light font-serif tracking-wide truncate mt-0.5 sm:mt-1">
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
              <div className="flex flex-col items-end pl-4 border-l border-white/10 shrink-0">
                <p className="text-white text-sm sm:text-lg font-semibold tracking-wide">
                  {formatDurationForCard(
                    activeRoute
                      ? activeRoute.duration
                      : parseLocationName(
                          selectedLocation.title,
                          selectedLocation.name,
                        ).duration,
                  )}
                </p>
                <p className="text-white/50 text-[10px] sm:text-xs tracking-wider mt-0.5">
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
      <BottomNavbar activeItem="location" />

      {/* CUSTOM LUXURY STYLES */}
      <style>{`
        /* Premium custom style for map tiles */
        .premium-map-container .maplibregl-canvas-container {
          filter: saturate(0.85) contrast(1.05) brightness(0.95);
        }

        /* Luxury markers styles */
        .luxury-poi-marker {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #f3e5c8 0%, #c79a59 50%, #8c6227 100%);
          border: 1.5px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.45);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1a1204;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          z-index: 5;
        }

        .luxury-poi-marker:hover {
          transform: scale(1.15);
          background: linear-gradient(135deg, #ffffff 0%, #e8ca99 50%, #a27536 100%);
          box-shadow: 0 6px 16px rgba(199, 154, 89, 0.6), 0 0 0 3px rgba(199, 154, 89, 0.2);
          border-color: #ffffff;
          z-index: 10;
        }

        .luxury-poi-marker.active {
          transform: scale(1.25);
          background: linear-gradient(135deg, #ffffff 0%, #e8ca99 30%, #c79a59 100%);
          border: 2px solid #ffffff;
          box-shadow: 0 0 25px rgba(199, 154, 89, 0.9), 0 0 0 5px rgba(199, 154, 89, 0.4);
          color: #1a1204;
          z-index: 50;
          animation: active-glow 2s infinite ease-in-out;
        }

        @keyframes active-glow {
          0% {
            box-shadow: 0 0 15px rgba(199, 154, 89, 0.8), 0 0 0 4px rgba(199, 154, 89, 0.3);
          }
          50% {
            box-shadow: 0 0 25px rgba(199, 154, 89, 1), 0 0 0 8px rgba(199, 154, 89, 0.5);
          }
          100% {
            box-shadow: 0 0 15px rgba(199, 154, 89, 0.8), 0 0 0 4px rgba(199, 154, 89, 0.3);
          }
        }

        /* Luxury Main Home Marker Styles */
        .luxury-home-marker {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .luxury-home-inner {
          width: 48px;
          height: 48px;
          background: radial-gradient(circle at 35% 35%, #f6e3b4 0%, #d4af37 40%, #aa7c11 80%, #684803 100%);
          border: 2.5px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), inset 0 0 8px rgba(255, 255, 255, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          transition: all 0.3s ease;
        }

        .luxury-home-inner:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 30px rgba(199, 154, 89, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.5);
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
        .luxury-hover-popup .maplibregl-popup-content {
          background: rgba(12, 12, 12, 0.85) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          border-radius: 12px !important;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5) !important;
          padding: 10px 14px !important;
          pointer-events: none;
        }

        .luxury-hover-popup .maplibregl-popup-tip {
          display: none !important;
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
