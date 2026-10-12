'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix missing marker icons in leaflet with next/image
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationMarker({ 
  onChange,
  initialPosition
}: { 
  onChange: (lat: number, lng: number) => void;
  initialPosition?: [number, number];
}) {
  const [position, setPosition] = useState<L.LatLng | null>(
    initialPosition ? new L.LatLng(initialPosition[0], initialPosition[1]) : null
  );

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onChange(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
    locationfound(e) {
      if (!initialPosition) {
        setPosition(e.latlng);
        onChange(e.latlng.lat, e.latlng.lng);
        map.flyTo(e.latlng, map.getZoom());
      }
    },
  });

  useEffect(() => {
    if (!initialPosition) {
      map.locate();
    }
  }, [map, initialPosition]);

  return position === null ? null : (
    <Marker position={position} icon={icon} />
  );
}

export default function MapPicker({ 
  onChange,
  initialPosition
}: { 
  onChange: (lat: number, lng: number) => void;
  initialPosition?: [number, number];
}) {
  const center: [number, number] = initialPosition && initialPosition[0] ? initialPosition : [4.0511, 9.7679];
  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="w-full h-full z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker onChange={onChange} initialPosition={initialPosition} />
    </MapContainer>
  );
}
