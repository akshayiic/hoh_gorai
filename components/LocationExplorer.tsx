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
  MapPin
} from "lucide-react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MaitriParkLocation = { lat: 19.23417, lng: 72.82783 }; // Maitri Park Site

const infrastructure = {
  current: [
    {
      title: "Connectivity",
      icon: Train,
      locations: [
        {
          title: "Borivali Railway Station",
          name: "Borivali Railway Station, Borivali West, Mumbai",
          coordinates: { lat: 19.2292, lng: 72.8573 }
        },
        {
          title: "Western Express Highway",
          name: "Western Express Highway, Borivali, Mumbai",
          coordinates: { lat: 19.2285, lng: 72.8631 }
        },
        {
          title: "Link Road",
          name: "Link Road, Borivali West, Mumbai",
          coordinates: { lat: 19.2312, lng: 72.8354 }
        },
        {
          title: "CSM International Airport",
          name: "Chhatrapati Shivaji Maharaj International Airport, Mumbai",
          coordinates: { lat: 19.0922, lng: 72.8656 }
        },
      ],
    },
    {
      title: "Shopping",
      icon: ShoppingBag,
      locations: [
        {
          title: "Growel's 101 Mall",
          name: "Growel's 101 Mall, Kandivali East, Mumbai",
          coordinates: { lat: 19.2064, lng: 72.8728 }
        },
        {
          title: "Indraprastha Mall",
          name: "Indraprastha Shopping Center, Borivali West, Mumbai",
          coordinates: { lat: 19.2284, lng: 72.8519 }
        },
        {
          title: "Sanjay Gandhi National Park",
          name: "Sanjay Gandhi National Park, Borivali East, Mumbai",
          coordinates: { lat: 19.2215, lng: 72.9124 }
        },
      ],
    },
    {
      title: "Education",
      icon: GraduationCap,
      locations: [
        {
          title: "St. Francis D'Assisi High School",
          name: "St. Francis D'Assisi High School, Borivali West, Mumbai",
          coordinates: { lat: 19.2372, lng: 72.8513 }
        },
        {
          title: "Vibgyor High School",
          name: "Vibgyor High, Borivali West, Mumbai",
          coordinates: { lat: 19.2458, lng: 72.8546 }
        },
      ],
    },
    {
      title: "Hotels Restaurant",
      icon: Hotel,
      locations: [
        {
          title: "Veg Treat Restaurant",
          name: "Veg Treat, Borivali West, Mumbai",
          coordinates: { lat: 19.2324, lng: 72.8504 }
        },
        {
          title: "Urban Tadka",
          name: "Urban Tadka, Borivali West, Mumbai",
          coordinates: { lat: 19.2268, lng: 72.8345 }
        },
      ],
    },
    {
      title: "Hospitals",
      icon: Hospital,
      locations: [
        {
          title: "Karuna Hospital",
          name: "Karuna Hospital, Borivali West, Mumbai",
          coordinates: { lat: 19.2382, lng: 72.8453 }
        },
        {
          title: "Apex Superspeciality",
          name: "Apex Superspeciality Hospital, Borivali West, Mumbai",
          coordinates: { lat: 19.2301, lng: 72.8488 }
        },
      ],
    },
    {
      title: "Others",
      icon: CircleDot,
      locations: [
        {
          title: "Maitri Park Site",
          name: "Maitri Park, Borivali West, Mumbai",
          coordinates: { lat: 19.23417, lng: 72.82783 }
        }
      ],
    },
  ],

  upcoming: [
    {
      title: "Metro Route",
      icon: Train,
      locations: [],
    },
    {
      title: "Highway Route",
      icon: Train,
      locations: [],
    },
  ],
};

interface LocationExplorerProps {
  onNavigate?: (view: "location" | "drone" | "building" | "amenities") => void;
}

export default function LocationExplorer({ onNavigate }: LocationExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState("Connectivity");
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [originAddress, setOriginAddress] = useState("Maitri Park, Borivali West, Mumbai");
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
  const homeMarkerRef = useRef<maplibregl.Marker | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors, © CARTO'
          }
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [MaitriParkLocation.lng, MaitriParkLocation.lat],
      zoom: 13,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    map.on('load', () => {
      // Ensure dimensions are correct
      map.resize();

      // Add a distinct pulse marker for Maitri Park
      const el = document.createElement('div');
      el.className = 'custom-home-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.background = 'radial-gradient(circle, #f59e0b 0%, #d97706 70%, #92400e 100%)';
      el.style.border = '3px solid white';
      el.style.borderRadius = '50%';
      el.style.boxShadow = '0 0 15px rgba(245, 158, 11, 0.7)';
      el.style.cursor = 'pointer';

      const homeMarker = new maplibregl.Marker({ element: el })
        .setLngLat([MaitriParkLocation.lng, MaitriParkLocation.lat])
        .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML('<strong style="color: black;">Maitri Park (Site)</strong>'))
        .addTo(map);

      homeMarkerRef.current = homeMarker;

      // Initial category loading
      updateCategoryMarkers(map, "Connectivity");
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      map.remove();
    };
  }, []);

  // Update Category Markers when category changes
  const updateCategoryMarkers = (map: maplibregl.Map | null, category: string) => {
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const catData = infrastructure.current.find(item => item.title === category);
    if (!catData) return;

    catData.locations.forEach(loc => {
      // Avoid placing duplicate marker on Maitri Park if it matches coordinates exactly
      if (loc.title === "Maitri Park Site") return;

      const el = document.createElement('div');
      el.className = 'custom-loc-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.background = '#3b82f6';
      el.style.border = '2px solid white';
      el.style.borderRadius = '50%';
      el.style.boxShadow = '0 0 8px rgba(59, 130, 246, 0.6)';
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([loc.coordinates.lng, loc.coordinates.lat])
        .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="color: black; font-family: sans-serif; padding: 2px;">
            <strong style="font-size: 13px;">${loc.title}</strong><br/>
            <span style="color: #666; font-size: 11px; display: block; margin-top: 4px;">${loc.name}</span>
          </div>
        `))
        .addTo(map);

      el.addEventListener('click', () => {
        setSelectedLocation(loc);
        handleShowRoute(loc.coordinates, loc.title);
      });

      markersRef.current.push(marker);
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedLocation(null);
    clearRouteLayer();
    updateCategoryMarkers(mapRef.current, category);
  };

  const clearRouteLayer = () => {
    const map = mapRef.current;
    if (!map) return;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (map.getLayer('route')) map.removeLayer('route');
    if (map.getSource('route')) map.removeSource('route');
    if (map.getLayer('animated-marker')) map.removeLayer('animated-marker');
    if (map.getSource('animated-marker')) map.removeSource('animated-marker');

    setActiveRoute(null);
  };

  const handleShowRoute = (destCoordinates: { lat: number, lng: number }, destName: string, originCoords = MaitriParkLocation) => {
    const map = mapRef.current;
    if (!map) return;

    // Ensure map dimensions are correctly computed before fits
    map.resize();

    setIsRouteLoading(true);
    clearRouteLayer();

    fetch(`https://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.lat};${destCoordinates.lng},${destCoordinates.lat}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .then(data => {
        if (data.routes && data.routes[0]) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates;

          const distanceKm = (route.distance / 1000).toFixed(1);
          const durationMin = Math.round(route.duration / 60);

          setActiveRoute({
            distance: `${distanceKm} km`,
            duration: `${durationMin} min`,
            destinationName: destName
          });

          // Zoom to fit bounds
          const bounds = coords.reduce((bounds: any, coord: number[]) => {
            return bounds.extend([coord[0], coord[1]]);
          }, new maplibregl.LngLatBounds(coords[0], coords[0]));

          // Prevent negative viewport size / NaN zoom by choosing safe padding on narrow displays
          const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
          const safePadding = screenWidth < 1024 
            ? 40 
            : { top: 120, bottom: 120, left: 360, right: 120 };

          map.fitBounds(bounds, {
            padding: safePadding,
            maxZoom: 16
          });

          animateRouteDrawing(map, coords);
        }
        setIsRouteLoading(false);
      })
      .catch(e => {
        console.error("OSRM Routing Error:", e);
        setIsRouteLoading(false);
      });
  };

  const animateRouteDrawing = (map: maplibregl.Map, coordinates: number[][]) => {
    let currentIndex = 0;
    const animationSpeed = 3;

    map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      }
    });

    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 6,
        'line-opacity': 0.85
      }
    });

    const animate = () => {
      const nextIndex = Math.min(currentIndex + animationSpeed, coordinates.length);
      const segmentCoordinates = coordinates.slice(0, nextIndex);

      const source = map.getSource('route') as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: segmentCoordinates
          }
        });
      }

      if (segmentCoordinates.length > 0) {
        const lastCoord = segmentCoordinates[segmentCoordinates.length - 1];

        if (map.getLayer('animated-marker')) map.removeLayer('animated-marker');
        if (map.getSource('animated-marker')) map.removeSource('animated-marker');

        map.addSource('animated-marker', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: lastCoord
            }
          }
        });

        map.addLayer({
          id: 'animated-marker',
          type: 'circle',
          source: 'animated-marker',
          paint: {
            'circle-radius': 9,
            'circle-color': '#ffffff',
            'circle-stroke-width': 3,
            'circle-stroke-color': '#3b82f6'
          }
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
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(originAddress)}`).then(r => r.json()),
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationAddress)}`).then(r => r.json())
      ]).then(([originData, destData]) => {
        if (originData[0] && destData[0]) {
          const orig = {
            lat: parseFloat(originData[0].lat),
            lng: parseFloat(originData[0].lon)
          };
          const dest = {
            lat: parseFloat(destData[0].lat),
            lng: parseFloat(destData[0].lon)
          };
          handleShowRoute(dest, destinationAddress, orig);
        } else {
          alert('Could not find one or both locations. Please try more specific addresses.');
          setIsRouteLoading(false);
        }
      }).catch(err => {
        console.error("Geocoding Error:", err);
        alert('Error searching for locations. Please try again.');
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
        essential: true
      });
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* MAP CONTAINER */}
      <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" style={{ zIndex: 10 }} />

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

      {/* ROUTE PLANNING PANEL (In sync with sidebar, doesn't hide sidebar) */}
      <div className="absolute right-6 top-20 z-20 w-80">
        <div className="rounded-lg border border-white/10 bg-[#2B363D]/90 backdrop-blur-md">
          <div className="border-b border-white/10 px-4 py-3">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-semibold">Route Planner</h4>
              <button
                onClick={() => setShowRoutePanel(!showRoutePanel)}
                className="text-white/60 hover:text-white"
              >
                {showRoutePanel ? "−" : "+"}
              </button>
            </div>
          </div>

          {showRoutePanel && (
            <div className="p-4 space-y-3">
              <div>
                <label className="text-white/60 text-xs mb-1 block">
                  Starting Point (A)
                </label>
                <input
                  type="text"
                  value={originAddress}
                  onChange={(e) => setOriginAddress(e.target.value)}
                  placeholder="Enter starting location"
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/40"
                />
              </div>

              <div className="flex justify-center">
                <div className="h-8 w-0.5 bg-white/20" />
              </div>

              <div>
                <label className="text-white/60 text-xs mb-1 block">
                  Destination (B)
                </label>
                <input
                  type="text"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  placeholder="Enter destination"
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/40"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRouteSearch}
                  disabled={!originAddress || !destinationAddress}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded text-sm font-medium transition"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Navigation size={16} />
                    Show Route
                  </div>
                </button>
                <button
                  onClick={resetMap}
                  className="px-3 bg-white/10 hover:bg-white/20 text-white py-2 rounded text-sm transition"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MAP CONTROLS */}
      <div className="absolute right-6 bottom-32 z-20">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              if (mapRef.current) mapRef.current.zoomIn();
            }}
            className="w-10 h-10 rounded bg-black/60 backdrop-blur text-white flex items-center justify-center hover:bg-black/70 transition"
            title="Zoom In"
          >
            <Plus size={20} />
          </button>
          <button
            onClick={() => {
              if (mapRef.current) mapRef.current.zoomOut();
            }}
            className="w-10 h-10 rounded bg-black/60 backdrop-blur text-white flex items-center justify-center hover:bg-black/70 transition"
            title="Zoom Out"
          >
            <Minus size={20} />
          </button>
        </div>
      </div>

      {/* LOGO */}
      <div className="absolute left-7 top-5 z-20">
        <div className="flex items-center gap-3 rounded-md bg-[#29343B]/90 px-4 py-3 backdrop-blur-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-white/10">
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs tracking-[0.3em] text-white/60">HOUSE OF</p>
            <h3 className="text-lg font-semibold text-white">HIRANANDANI</h3>
          </div>
        </div>
      </div>

      {/* TOP ACTIONS */}
      <div className="absolute right-6 top-5 z-20 flex items-center gap-2">
        <button 
          onClick={resetMap}
          className="rounded bg-black/60 px-4 py-2 text-sm text-white backdrop-blur hover:bg-black/80 transition"
        >
          Reset Map View
        </button>
        <button className="rounded bg-black/60 px-4 py-2 text-sm text-white backdrop-blur">
          RERA
        </button>
      </div>

      {/* SIDEBAR PANEL */}
      <aside className="absolute left-7 top-1/2 z-20 w-[280px] -translate-y-1/2 rounded-lg border border-white/10 bg-[#2B363D]/85 backdrop-blur-md">
        <div className="p-5">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded bg-white/5 p-2">
              <MapIcon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-white/40">
                Click To Explore
              </p>
              <h3 className="text-lg text-white">Locations</h3>
            </div>
          </div>

          <div className="mb-4 text-xs uppercase tracking-wider text-white/40">
            Current Infrastructure
          </div>

          <div className="space-y-1">
            {infrastructure.current.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  onClick={() => handleCategoryChange(item.title)}
                  className={`flex w-full items-center gap-3 rounded px-3 py-3 text-left transition ${
                    selectedCategory === item.title
                      ? "bg-white/10 text-white font-semibold"
                      : "text-white/60 hover:bg-white/5"
                  }`}
                >
                  <Icon size={15} />
                  <span className="text-sm">{item.title}</span>
                </button>
              );
            })}
          </div>

          <div className="my-6 border-t border-white/10" />

          <div className="mb-3 text-xs uppercase tracking-wider text-white/40">
            Upcoming Infrastructure
          </div>

          <div className="space-y-1">
            {infrastructure.upcoming.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  className="flex w-full items-center gap-3 rounded px-3 py-3 text-left text-white/40 cursor-not-allowed"
                  disabled
                >
                  <Icon size={15} />
                  <span className="text-sm">{item.title} (Soon)</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* LOCATION LIST PANEL */}
      <div className="absolute left-[330px] top-1/2 z-20 w-[265px] -translate-y-1/2 rounded-lg border border-white/10 bg-[#2B363D]/90 backdrop-blur-md">
        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-semibold">{selectedCategory}</h4>
            {activeRoute && (
              <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                Active Route
              </span>
            )}
          </div>
        </div>

        <div className="p-4 max-h-[300px] overflow-y-auto scrollbar-hide">
          {infrastructure.current
            .find((item) => item.title === selectedCategory)
            ?.locations.map((loc) => (
              <button
                key={loc.title}
                onClick={() => {
                  setSelectedLocation(loc);
                  handleShowRoute(loc.coordinates, loc.title);
                }}
                className={`mb-2 flex w-full items-center justify-between rounded-md px-4 py-3 text-left transition ${
                  selectedLocation?.title === loc.title
                    ? "bg-blue-600 text-white"
                    : "bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Navigation size={14} className={selectedLocation?.title === loc.title ? "text-white" : "text-green-400"} />
                  <span className="text-sm truncate max-w-[150px]">{loc.title}</span>
                </div>
                <span className={`text-[10px] ${selectedLocation?.title === loc.title ? "text-white/80" : "text-white/60"}`}>
                  Show Route
                </span>
              </button>
            ))}
          <div className="mt-3 text-white/40 text-[11px] text-center">
            Select an infrastructure location to render its route on the map.
          </div>
        </div>
      </div>

      {/* ROUTE INFO PANEL (Overlay on map when route is drawing) */}
      {activeRoute && (
        <div className="absolute bottom-24 left-[330px] z-20 bg-[#2B363D]/95 border border-white/10 backdrop-blur text-white px-4 py-3 rounded-lg w-[265px] animate-fade-in shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Navigation size={16} className="text-green-400 animate-pulse" />
              <span className="font-semibold text-sm truncate max-w-[180px]">{activeRoute.destinationName}</span>
            </div>
            <button 
              onClick={clearRouteLayer} 
              className="text-white/40 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
          <div className="flex items-center justify-between text-xs text-white/80 border-t border-white/10 pt-2 mt-2">
            <div className="flex items-center gap-1">
              <MapPin size={12} className="text-red-400" />
              <span>Distance: <strong>{activeRoute.distance}</strong></span>
            </div>
            <div>
              <span>Est. Time: <strong>{activeRoute.duration}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div className="absolute bottom-6 left-7 z-20">
        <div className="flex overflow-hidden rounded-lg border border-white/10 bg-[#29343B]/95 backdrop-blur">
          <button
            className="flex items-center gap-2 bg-white px-6 py-4 text-sm text-black"
            onClick={() => onNavigate?.("location")}
          >
            <MapIcon size={18} />
            Location
          </button>

          <button
            className="border-l border-white/10 flex items-center gap-2 px-6 py-4 text-white/70 hover:bg-white/5"
            onClick={() => onNavigate?.("building")}
          >
            <Building2 size={18} />
            Building
          </button>

          <button
            className="border-l border-white/10 flex items-center gap-2 px-6 py-4 text-white/70 hover:bg-white/5"
            onClick={() => onNavigate?.("drone")}
          >
            <Waves size={18} />
            Drone View
          </button>

          <button
            className="border-l border-white/10 flex items-center gap-2 px-6 py-4 text-white/70 hover:bg-white/5"
            onClick={() => onNavigate?.("amenities")}
          >
            <Hotel size={18} />
            Amenities
          </button>
        </div>
      </div>
    </section>
  );
}
