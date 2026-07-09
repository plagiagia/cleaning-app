"use client";

import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: [number, number] = [40.2681, 23.3167];

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type LocationMapProps = {
  position: { lat: number; lng: number } | null;
  onPositionChange: (position: { lat: number; lng: number }) => void;
  hint: string;
};

function MapClickHandler({
  onPositionChange,
}: {
  onPositionChange: (position: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(event) {
      onPositionChange({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

export function LocationMap({ position, onPositionChange, hint }: LocationMapProps) {
  const center = position ? [position.lat, position.lng] as [number, number] : DEFAULT_CENTER;
  const zoom = position ? 15 : 12;

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl ring-1 ring-slate-200">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom
          className="h-48 w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onPositionChange={onPositionChange} />
          {position ? <Marker position={[position.lat, position.lng]} icon={markerIcon} /> : null}
        </MapContainer>
      </div>
      <p className="text-xs text-slate-500">{hint}</p>
    </div>
  );
}
