"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import type { Coordinates, Location } from "@/lib/types";

// Default Leaflet marker icons reference bundler-relative asset URLs that
// don't resolve under Next.js's bundler, so they're set explicitly here.
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface MapProps {
  locations: Location[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  origin?: Coordinates | null;
}

function FitBounds({ locations }: { locations: Location[] }) {
  const map = useMap();
  useEffect(() => {
    if (locations.length === 0) return;
    const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lng]));
    map.fitBounds(bounds, { padding: [32, 32] });
  }, [locations, map]);
  return null;
}

export default function LocationMap({ locations, selectedId, onSelect, origin }: MapProps) {
  const center: [number, number] = origin
    ? [origin.lat, origin.lng]
    : [45.9, -121.5];

  return (
    <MapContainer center={center} zoom={7} className="h-full w-full" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds locations={locations} />
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.lat, loc.lng]}
          icon={markerIcon}
          eventHandlers={{ click: () => onSelect?.(loc.id) }}
          opacity={selectedId && selectedId !== loc.id ? 0.6 : 1}
        >
          <Popup>{loc.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
