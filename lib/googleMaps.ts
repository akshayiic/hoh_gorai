import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

let loadPromise: Promise<typeof google> | null = null;

export function loadGoogleMaps(): Promise<typeof google> {
  if (!loadPromise) {
    setOptions({
      key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
      v: "weekly",
    });
    // "maps" covers Map/OverlayView/Marker/Polyline/LatLngBounds; "geometry"
    // is needed to decode the encoded polylines the Routes API returns.
    loadPromise = Promise.all([
      importLibrary("maps"),
      importLibrary("geometry"),
    ]).then(() => google);
  }
  return loadPromise;
}

// Brochure-style JSON map style: cream land, sage parks, soft blue water,
// brown roads, no labels/POIs/transit/admin boundaries. Mirrors the look
// previously produced by hand-iterating Mapbox vector-tile layers.
export const brochureMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#ade0ee" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#ebe3cd" }] },
  { featureType: "landscape.man_made", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#a4cd91" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#d8b290" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#dfd2af" }] },
  { featureType: "road.local", elementType: "geometry", stylers: [{ color: "#dfd2af" }] },
];

export function createMap(
  container: HTMLDivElement,
  options: google.maps.MapOptions,
): google.maps.Map {
  return new google.maps.Map(container, {
    styles: brochureMapStyle,
    disableDefaultUI: true,
    clickableIcons: false,
    gestureHandling: "greedy",
    backgroundColor: "#E5D8C8",
    ...options,
  });
}

// Analog of mapboxgl.Marker({ element }) — positions an arbitrary DOM
// element at a lat/lng using the map's screen-pixel projection, and keeps
// it in sync on every pan/zoom redraw.
//
// The class body is only constructed lazily (via createDomOverlay), because
// `extends google.maps.OverlayView` would otherwise evaluate at module
// import time, before the async Google Maps script load has populated the
// `google` global.
export interface DomOverlayHandle {
  element: HTMLDivElement;
  locTitle?: string;
  setMap(map: google.maps.Map | null): void;
  setPosition(position: google.maps.LatLngLiteral): void;
  getScreenPosition(): { x: number; y: number } | null;
}

let DomOverlayCtor:
  | (new (position: google.maps.LatLngLiteral, element: HTMLDivElement) => DomOverlayHandle)
  | null = null;

function getDomOverlayCtor() {
  if (!DomOverlayCtor) {
    class Impl extends google.maps.OverlayView implements DomOverlayHandle {
      element: HTMLDivElement;
      position: google.maps.LatLng;
      locTitle?: string;

      constructor(position: google.maps.LatLngLiteral, element: HTMLDivElement) {
        super();
        this.position = new google.maps.LatLng(position);
        this.element = element;
        this.element.style.position = "absolute";
      }

      onAdd() {
        this.getPanes()!.overlayMouseTarget.appendChild(this.element);
      }

      draw() {
        const projection = this.getProjection();
        if (!projection) return;
        const point = projection.fromLatLngToDivPixel(this.position);
        if (!point) return;
        this.element.style.left = `${point.x}px`;
        this.element.style.top = `${point.y}px`;
      }

      onRemove() {
        this.element.remove();
      }

      setPosition(position: google.maps.LatLngLiteral) {
        this.position = new google.maps.LatLng(position);
        this.draw();
      }

      getScreenPosition(): { x: number; y: number } | null {
        const projection = this.getProjection();
        if (!projection) return null;
        const point = projection.fromLatLngToDivPixel(this.position);
        return point ? { x: point.x, y: point.y } : null;
      }
    }
    DomOverlayCtor = Impl;
  }
  return DomOverlayCtor;
}

export function createDomOverlay(
  position: google.maps.LatLngLiteral,
  element: HTMLDivElement,
): DomOverlayHandle {
  const Ctor = getDomOverlayCtor();
  return new Ctor(position, element);
}

export function fitBoundsWithMaxZoom(
  map: google.maps.Map,
  bounds: google.maps.LatLngBounds,
  padding: number | google.maps.Padding,
  maxZoom: number,
) {
  map.fitBounds(bounds, padding);
  google.maps.event.addListenerOnce(map, "idle", () => {
    const zoom = map.getZoom();
    if (zoom !== undefined && zoom > maxZoom) {
      map.setZoom(maxZoom);
    }
  });
}

interface RouteWaypoint {
  lat: number;
  lng: number;
}

export interface RouteResult {
  path: [number, number][]; // [lng, lat] pairs, matching the existing animateRouteDrawing contract
  distanceMeters: number;
  durationSeconds: number;
  actualTravelMode: google.maps.TravelMode | "TWO_WHEELER";
}

const ROUTES_API_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";

type RoutesApiTravelMode = "DRIVE" | "WALK" | "BICYCLE" | "TWO_WHEELER" | "TRANSIT";

function toRoutesApiTravelMode(
  mode: google.maps.TravelMode | "TWO_WHEELER",
): RoutesApiTravelMode {
  if (mode === "TWO_WHEELER") return "TWO_WHEELER";
  switch (mode) {
    case google.maps.TravelMode.WALKING:
      return "WALK";
    case google.maps.TravelMode.BICYCLING:
      return "BICYCLE";
    case google.maps.TravelMode.TRANSIT:
      return "TRANSIT";
    default:
      return "DRIVE";
  }
}

function toRoutesApiWaypoint(p: RouteWaypoint) {
  return { location: { latLng: { latitude: p.lat, longitude: p.lng } } };
}

export async function fetchGoogleRoute(
  origin: RouteWaypoint,
  destination: RouteWaypoint,
  travelMode: google.maps.TravelMode | "TWO_WHEELER",
  viaPoints: RouteWaypoint[] = [],
): Promise<RouteResult> {
  const response = await fetch(ROUTES_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
      "X-Goog-FieldMask":
        "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
    },
    body: JSON.stringify({
      origin: toRoutesApiWaypoint(origin),
      destination: toRoutesApiWaypoint(destination),
      intermediates: viaPoints.map(toRoutesApiWaypoint),
      travelMode: toRoutesApiTravelMode(travelMode),
    }),
  });

  const data = await response.json();
  const route = data.routes?.[0];

  if (!response.ok || !route) {
    if (travelMode === "TWO_WHEELER") {
      console.warn("TWO_WHEELER travel mode failed/unsupported. Falling back to WALKING mode.");
      return fetchGoogleRoute(origin, destination, google.maps.TravelMode.WALKING, viaPoints);
    }
    const message = data?.error?.message || response.statusText;
    throw new Error(`Directions request failed: ${message}`);
  }

  const decodedPath = google.maps.geometry.encoding.decodePath(
    route.polyline.encodedPolyline,
  );
  const path: [number, number][] = decodedPath.map((p) => [p.lng(), p.lat()]);
  const distanceMeters = route.distanceMeters || 0;
  const durationSeconds = parseInt(route.duration || "0", 10) || 0;

  return { path, distanceMeters, durationSeconds, actualTravelMode: travelMode };
}
