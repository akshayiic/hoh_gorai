"use client";

import { useEffect, useRef, useState } from "react";
import { Map as MapIcon, Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import BottomNavbar from "@/components/BottomNavbar";
import GlobalNavbar from "@/components/GlobalNavbar";
import Sidebar, {
  createSidebarSections,
  createSidebarItems,
} from "@/components/Sidebar";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

const GoraiBayviewLocation = { lat: 19.23417, lng: 72.82783 }; // Gorai Bayview Site

const infrastructure = {
  current: [
    {
      title: "Education Institutes",
      icon: "/icons/education.svg",
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
      icon: "/icons/hotel.svg",
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
      icon: "/icons/paint.svg",
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
      icon: "/icons/lifestyle.svg",
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
      icon: "/icons/connectivity.svg",
      locations: [
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
          title: "Mahindra Company Gate",
          name: "Mahindra Company Gate (B.H.A.D. Colony) - 16km (48 Mins)",
          coordinates: { lat: 19.212009, lng: 72.861557 },
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
          coordinates: { lat: 19.167753, lng: 72.858787 },
        },
      ],
    },
    {
      title: "Hospitals",
      icon: "/icons/hospital.svg",
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

interface LocationItem {
  title: string;
  name: string;
  coordinates: { lat: number; lng: number };
}

interface CustomMarker extends mapboxgl.Marker {
  locTitle?: string;
  elementRef?: HTMLDivElement;
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
  const [selectedCategory, setSelectedCategory] = useState("Hospitals");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [originAddress, setOriginAddress] = useState(
    "Gorai Bayview, Borivali West, Mumbai",
  );
  const [destinationAddress, setDestinationAddress] = useState("");

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
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const labelMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const homeMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hoverPopupRef = useRef<mapboxgl.Popup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // const map = new maplibregl.Map({
    //   container: mapContainerRef.current,
    //   style: {
    //     version: 8,
    //     sources: {
    //       carto: {
    //         type: "raster",
    //         tiles: [
    //           "https://basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png",
    //         ],
    //         tileSize: 256,
    //         attribution: "© OpenStreetMap contributors, © CARTO",
    //       },
    //     },
    //     layers: [
    //       {
    //         id: "carto-tiles",
    //         type: "raster",
    //         source: "carto",
    //         minzoom: 0,
    //         maxzoom: 20,
    //       },
    //     ],
    //   },
    //   center: [GoraiBayviewLocation.lng, GoraiBayviewLocation.lat],
    //   zoom: 13,
    // });

    // const map = new maplibregl.Map({
    //   container: mapContainerRef.current,
    //   style: {
    //     version: 8,
    //     sources: {
    //       google: {
    //         type: "raster",
    //         tiles: [
    //           "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&apistyle=s.t%3A0%7Cs.e%3Al%7Cp.v%3Aoff",
    //         ],
    //         tileSize: 256,
    //         attribution: "© Google Maps",
    //       },
    //     },
    //     layers: [
    //       {
    //         id: "google-tiles",
    //         type: "raster",
    //         source: "google",
    //         minzoom: 0,
    //         maxzoom: 22,
    //       },
    //     ],
    //   },
    //   center: [GoraiBayviewLocation.lng, GoraiBayviewLocation.lat],
    //   zoom: 13,
    // });

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [GoraiBayviewLocation.lng, GoraiBayviewLocation.lat],
      zoom: 13,
    });

    mapRef.current = map;

    // Initialize hover popup once
    const hoverPopup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: "luxury-hover-popup",
      anchor: "bottom",
      offset: 15,
    });
    hoverPopupRef.current = hoverPopup;

    map.on("load", () => {
      map.resize();

      // Hide all default symbol/label layers to keep map clean
      map.getStyle().layers?.forEach((layer) => {
        if (layer.type === "symbol") {
          map.setLayoutProperty(layer.id, "visibility", "none");
        }
      });

      // Add a distinct pulse marker for Gorai Bayview
      const el = document.createElement("div");
      el.className = "luxury-home-marker flex items-center justify-center";
      el.style.width = "48px";
      el.style.height = "48px";
      el.style.cursor = "pointer";

      el.innerHTML = `
        <div class="luxury-home-pulse-ring"></div>
        <div class="luxury-home-inner">
          <img src="/icons/hoh.svg" class="w-12 h-12 object-contain animate-gentle-bounce" alt="Hiranandani Site" />
        </div>
      `;

      const homeMarker = new mapboxgl.Marker({ element: el })
        .setLngLat([GoraiBayviewLocation.lng, GoraiBayviewLocation.lat])
        .setPopup(
          new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
            className: "luxury-hover-popup",
          }).setHTML(
            `<div class="luxury-mini-card" style="padding: 2px;">
                <div class="category">Hiranandani Project</div>
                <div class="title" style="margin-bottom: 0; font-family: serif; font-size: 14px;">Gorai Bayview</div>
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
    map: mapboxgl.Map | null,
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
      "Education Institutes": `<img src="/icons/education.svg" class="w-10 h-10 object-contain" alt="Education" />`,
      Banks: `<img src="/icons/hotel.svg" class="w-10 h-10 object-contain" alt="Banks" />`,
      Recreational: `<img src="/icons/paint.svg" class="w-10 h-10 object-contain" alt="Recreational" />`,
      "Lifestyle & Social": `<img src="/icons/lifestyle.svg" class="w-10 h-10 object-contain" alt="Lifestyle" />`,
      Connectivity: `<img src="/icons/connectivity.svg" class="w-10 h-10 object-contain" alt="Connectivity" />`,
      Hospitals: `<img src="/icons/hospital.svg" class="w-10 h-10 object-contain" alt="Hospitals" />`,
      "Commercial Hubspots": `<img src="/icons/hotel.svg" class="w-10 h-10 object-contain" alt="Commercial" />`,
    };

    catData.locations.forEach((loc) => {
      if (loc.title === "Gorai Bayview Site") return;

      const parsed = parseLocationName(loc.title, loc.name);
      const displayCat = categoryDisplayNames[category] || category;

      // Create permanent label marker
      const markerEl = document.createElement("div");
      markerEl.className = "permanent-label";
      markerEl.style.cssText = `
        background: rgba(44, 52, 55, 0.65);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        color: white;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 500;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(64, 72, 75, 0.7);
        pointer-events: none;
      `;
      markerEl.textContent = parsed.title;

      // Add permanent label to map
      const labelMarker = new mapboxgl.Marker({
        element: markerEl,
        anchor: "bottom",
        offset: [0, -8],
      })
        .setLngLat([loc.coordinates.lng, loc.coordinates.lat])
        .addTo(map);

      // Create wrapper element for MapLibre positioning (avoids transition conflicts with transforms)
      const wrapperEl = document.createElement("div");
      wrapperEl.className =
        "luxury-poi-marker-wrapper flex items-center justify-center";
      wrapperEl.style.width = "40px";
      wrapperEl.style.height = "40px";
      wrapperEl.style.cursor = "pointer";

      // Create icon marker
      const iconEl = document.createElement("div");
      iconEl.className = "luxury-poi-marker flex items-center justify-center";
      iconEl.innerHTML = iconMap[category] || "";

      wrapperEl.appendChild(iconEl);

      const marker = new mapboxgl.Marker({ element: wrapperEl })
        .setLngLat([loc.coordinates.lng, loc.coordinates.lat])
        .addTo(map);

      // Add label marker to ref for cleanup
      labelMarkersRef.current.push(labelMarker);

      // Store title and DOM ref on marker object
      (marker as CustomMarker).locTitle = loc.title;
      (marker as CustomMarker).elementRef = iconEl;

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
      const locTitle = (marker as CustomMarker).locTitle;
      const el = (marker as CustomMarker).elementRef as HTMLDivElement;
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

  function clearRouteLayer() {
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
            (acc: mapboxgl.LngLatBounds, coord: number[]) => {
              return acc.extend([coord[0], coord[1]] as [number, number]);
            },
            new mapboxgl.LngLatBounds(coords[0], coords[0]),
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
  }

  function animateRouteDrawing(map: mapboxgl.Map, coordinates: number[][]) {
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

      const source = map.getSource("route") as mapboxgl.GeoJSONSource;
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
      mapRef.current.flyTo({
        center: [GoraiBayviewLocation.lng, GoraiBayviewLocation.lat],
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
            className="w-10 h-10 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/70 hover:text-[#C79A59] transition shadow-lg cursor-pointer"
            title="Zoom In"
          >
            <Plus size={20} />
          </button>
          <button
            onClick={() => {
              if (mapRef.current) mapRef.current.zoomOut();
            }}
            className="w-10 h-10 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/70 hover:text-[#C79A59] transition shadow-lg cursor-pointer"
            title="Zoom Out"
          >
            <Minus size={20} />
          </button>
        </div>
      </div>

      {/* Global Navbar */}
      <GlobalNavbar
        currentPage="location"
        showReset={true}
        onReset={resetMap}
      />

      {/* SIDEBAR PANEL */}
      <Sidebar
        header={{
          icon: MapIcon,
          subtitle: "Click to Explore",
          title: "Locations",
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
                isActive: selectedCategory === item.title,
              })),
            ),
          },
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
            className="absolute z-30 flex flex-row items-center justify-between gap-4 p-2 px-4 pr-10 rounded-[10px] bg-[#2C3437]/65 backdrop-blur-md border border-[#40484B]/70 shadow-[0_12px_40px_rgba(0,0,0,0.4)] left-4 right-4 bottom-28 md:w-[420px] md:bottom-32 md:left-1/2 md:-translate-x-1/2 lg:bottom-auto lg:top-6 lg:left-1/2 lg:-translate-x-1/2 lg:w-[480px] lg:max-w-none"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[#C79A59] text-[9px] sm:text-xs uppercase tracking-[0.2em] font-semibold">
                {selectedLocation
                  ? categoryDisplayNames[selectedCategory] || selectedCategory
                  : ""}
              </p>
              <h3 className="text-white text-base sm:text-xl font-light font-serif tracking-wide truncate mt-0.5 sm:mt-1">
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
              <div className="flex flex-col items-end pl-4 border-l border-[#40484B]/50 shrink-0">
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
        .premium-map-container .mapboxgl-canvas-container {
          filter: saturate(1.25) contrast(1.05) brightness(0.98);
        }

        /* Luxury markers styles */
        .luxury-poi-marker {
          width: 40px;
          height: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          z-index: 5;
        }

        .luxury-poi-marker img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .luxury-poi-marker:hover {
          transform: scale(1.15);
          z-index: 10;
        }

        .luxury-poi-marker:hover img {
          filter: drop-shadow(0 6px 12px rgba(199, 154, 89, 0.7)) brightness(1.05);
        }

        .luxury-poi-marker.active {
          transform: scale(1.25);
          z-index: 50;
        }

        .luxury-poi-marker.active img {
          animation: active-glow-img 2s infinite ease-in-out;
        }

        @keyframes active-glow-img {
          0% {
            filter: drop-shadow(0 0 12px rgba(199, 154, 89, 0.8)) brightness(1.05);
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(199, 154, 89, 1)) brightness(1.15);
          }
          100% {
            filter: drop-shadow(0 0 12px rgba(199, 154, 89, 0.8)) brightness(1.05);
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
        .luxury-hover-popup .mapboxgl-popup-content {
          background: rgba(44, 52, 55, 0.65) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(64, 72, 75, 0.7) !important;
          border-radius: 12px !important;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5) !important;
          padding: 10px 14px !important;
          pointer-events: none;
        }

        .luxury-hover-popup .mapboxgl-popup-tip {
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
