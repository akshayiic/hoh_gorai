"use client";

import { useEffect, useRef, useState } from "react";
import { Navigation, X, MapPin } from "lucide-react";
import maplibregl from "maplibre-gl";

interface DirectionsMapProps {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  destinationName: string;
  onClose: () => void;
}

export default function DirectionsMap({ origin, destination, destinationName, onClose }: DirectionsMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [distance, setDistance] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    setIsLoading(true);

    // Initialize MapLibre GL
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        'version': 8,
        'sources': {
          'osm': {
            'type': 'raster',
            'tiles': ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            'tileSize': 256,
            'attribution': '© OpenStreetMap contributors'
          }
        },
        'layers': [
          {
            'id': 'osm-tiles',
            'type': 'raster',
            'source': 'osm',
            'minzoom': 0,
            'maxzoom': 19
          }
        ]
      },
      center: [origin.lng, origin.lat],
      zoom: 12,
    });

    mapRef.current = map;

    // Add navigation controls
    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    // Wait for map to load
    map.on('load', () => {
      map.resize();
      console.log('Map loaded successfully');
      // Fetch route from OSRM
      fetch(`https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`)
        .then(response => response.json())
        .then(data => {
          console.log('Route data received:', data);
          if (data.routes && data.routes[0]) {
            const route = data.routes[0];
            const coordinates = route.geometry.coordinates;

            // Set distance and duration
            const distanceKm = (route.distance / 1000).toFixed(1);
            const durationMin = Math.round(route.duration / 60);
            setDistance(`${distanceKm} km`);
            setDuration(`${durationMin} min`);

            // Add origin marker
            new maplibregl.Marker({ color: '#4CAF50' })
              .setLngLat([origin.lng, origin.lat])
              .setPopup(new maplibregl.Popup({ offset: 25 }).setText('Maitri Park (Start)'))
              .addTo(map);

            // Add destination marker
            new maplibregl.Marker({ color: '#f44336' })
              .setLngLat([destination.lng, destination.lat])
              .setPopup(new maplibregl.Popup({ offset: 25 }).setText(destinationName))
              .addTo(map);

            // Calculate bounds
            const bounds = coordinates.reduce((bounds: any, coord: number[]) => {
              return bounds.extend([coord[0], coord[1]]);
            }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

            map.fitBounds(bounds, { padding: 100 });

            // Animate route drawing
            animateRouteDrawing(map, coordinates);
            setIsLoading(false);
          }
        })
        .catch(error => {
          console.error('Error fetching route:', error);
          setIsLoading(false);
        });
    });

    map.on('error', (e) => {
      console.error('Map error:', e);
      setIsLoading(false);
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [isClient, origin, destination, destinationName]);

  const animateRouteDrawing = (map: maplibregl.Map, coordinates: number[][]) => {
    let currentIndex = 0;
    const animationSpeed = 2; // Number of coordinates to add per frame

    // Add source and layer for the route
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
        'line-width': 5,
        'line-opacity': 0.8
      }
    });

    // Animate the route
    const animate = () => {
      const nextIndex = Math.min(currentIndex + animationSpeed, coordinates.length);
      const segmentCoordinates = coordinates.slice(0, nextIndex);

      // Update the route data
      const source = map.getSource('route') as maplibregl.GeoJSONSource;
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: segmentCoordinates
        }
      });

      // Add animated marker at the front
      if (segmentCoordinates.length > 0) {
        const lastCoord = segmentCoordinates[segmentCoordinates.length - 1];

        // Remove existing animated marker if any
        if (map.getLayer('animated-marker')) {
          map.removeLayer('animated-marker');
        }
        if (map.getSource('animated-marker')) {
          map.removeSource('animated-marker');
        }

        // Add animated marker
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
            'circle-radius': 8,
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

  if (!isClient) return null;

  return (
    <div className="absolute inset-0 z-30">
      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 10, background: '#f0f0f0' }} />

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
          <span className="font-semibold">Route from Maitri Park to {destinationName}</span>
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
