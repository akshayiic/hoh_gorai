"use client";

import { useEffect, useRef, useState } from "react";
import { Navigation, X, MapPin } from "lucide-react";
import { loadGoogleMaps, createMap, fetchGoogleRoute } from "@/lib/googleMaps";

interface DirectionsMapProps {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  destinationName: string;
  onClose: () => void;
}

export default function DirectionsMap({
  origin,
  destination,
  destinationName,
  onClose,
}: DirectionsMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [distance, setDistance] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const headMarkerRef = useRef<google.maps.Marker | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;
    let cancelled = false;

    setIsLoading(true);

    loadGoogleMaps().then(() => {
      if (cancelled || !mapContainerRef.current) return;

      const map = createMap(mapContainerRef.current, {
        center: origin,
        zoom: 12,
      });
      mapRef.current = map;

      fetchGoogleRoute(origin, destination, google.maps.TravelMode.DRIVING)
        .then(({ path, distanceMeters, durationSeconds }) => {
          if (cancelled) return;

          const distanceKm = (distanceMeters / 1000).toFixed(1);
          const durationMin = Math.round(durationSeconds / 60);
          setDistance(`${distanceKm} km`);
          setDuration(`${durationMin} min`);

          new google.maps.Marker({
            map,
            position: origin,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#4CAF50",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          }).addListener("click", function (this: google.maps.Marker) {
            new google.maps.InfoWindow({
              content: "Gorai Bayview (Start)",
            }).open(map, this);
          });

          new google.maps.Marker({
            map,
            position: destination,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#f44336",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          }).addListener("click", function (this: google.maps.Marker) {
            new google.maps.InfoWindow({ content: destinationName }).open(
              map,
              this,
            );
          });

          const bounds = new google.maps.LatLngBounds();
          path.forEach(([lng, lat]) => bounds.extend({ lat, lng }));
          map.fitBounds(bounds, 100);

          animateRouteDrawing(map, path);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching route:", error);
          setIsLoading(false);
        });
    });

    return () => {
      cancelled = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
      if (headMarkerRef.current) {
        headMarkerRef.current.setMap(null);
      }
      if (mapRef.current) {
        google.maps.event.clearInstanceListeners(mapRef.current);
        mapRef.current = null;
      }
    };
  }, [isClient, origin, destination, destinationName]);

  const animateRouteDrawing = (
    map: google.maps.Map,
    coordinates: [number, number][],
  ) => {
    let currentIndex = 0;
    const animationSpeed = 0.8;

    const polyline = new google.maps.Polyline({
      map,
      path: [],
      strokeColor: "#3b82f6",
      strokeWeight: 5,
      strokeOpacity: 0.8,
    });
    polylineRef.current = polyline;

    const headMarker = new google.maps.Marker({
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#ffffff",
        fillOpacity: 1,
        strokeColor: "#3b82f6",
        strokeWeight: 3,
      },
    });
    headMarkerRef.current = headMarker;

    const animate = () => {
      const nextIndex = Math.min(
        currentIndex + animationSpeed,
        coordinates.length,
      );
      const segment = coordinates
        .slice(0, nextIndex)
        .map(([lng, lat]) => ({ lat, lng }));

      polyline.setPath(segment);

      if (segment.length > 0) {
        headMarker.setPosition(segment[segment.length - 1]);
      }

      currentIndex = nextIndex;

      if (currentIndex < coordinates.length) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animate();
  };

  if (!isClient) return null;

  return (
    <div className="absolute inset-0 z-30">
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{ zIndex: 10, background: "#f0f0f0" }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-35 flex items-center justify-center bg-gray-900/80">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Loading route...</p>
          </div>
        </div>
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-20 right-6 z-40 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        title="Close Directions"
      >
        <X size={16} />
        Close Directions
      </button>

      {/* Route info */}
      <div className="absolute bottom-24 left-6 z-40 bg-black/80 backdrop-blur text-white px-4 py-3 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Navigation size={16} className="text-green-400" />
          <span className="font-semibold">
            Route from Gorai Bayview to {destinationName}
          </span>
        </div>
        {(distance || duration) && (
          <div className="flex items-center gap-4 text-sm">
            {distance && (
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{distance}</span>
              </div>
            )}
            {duration && (
              <div className="flex items-center gap-1">
                <span>⏱️ {duration}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute top-24 left-6 z-40 bg-black/60 backdrop-blur text-white px-3 py-2 rounded-lg text-sm">
        Drag to pan • Scroll to zoom
      </div>
    </div>
  );
}
