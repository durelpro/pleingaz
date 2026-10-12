"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import { MapPin, ShieldCheck, ChevronRight } from 'lucide-react';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function SearchStoresMap({ stores }: { stores: any[] }) {
  const defaultCenter: [number, number] = stores.length > 0 && stores[0].latitude
    ? [stores[0].latitude, stores[0].longitude]
    : [4.0511, 9.7679]; // Douala

  return (
    <div className="w-full h-[500px] rounded-3xl overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-lg relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {stores.map((store) => {
          if (!store.latitude || !store.longitude) return null;
          return (
            <Marker 
              key={store.id} 
              position={[store.latitude, store.longitude]} 
              icon={icon}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px] space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 text-sm">
                    <ShieldCheck size={16} className="text-pleingaz-red" />
                    <span>{store.name}</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    <strong>{store.neighborhood || 'Centre'}</strong>, {store.city || 'Douala'}
                  </p>
                  {store.landmark && (
                    <p className="text-[11px] text-gray-500 italic">
                      📍 {store.landmark}
                    </p>
                  )}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      {store.stockLevel === 'HIGH' ? 'BON STOCK' : 'STOCK DISPONIBLE'}
                    </span>
                    <Link
                      href={`/stores/${store.id}`}
                      className="text-xs font-bold text-pleingaz-red hover:underline flex items-center"
                    >
                      Voir boutique <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
