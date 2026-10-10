"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

const getColorForStockLevel = (level: string) => {
  switch (level) {
    case 'HIGH': return '#22c55e'; // green
    case 'MEDIUM': return '#eab308'; // yellow
    case 'LOW': return '#f97316'; // orange
    case 'OUT_OF_STOCK': return '#ef4444'; // red
    default: return '#9ca3af'; // gray (inactive)
  }
};

export default function RadarMap() {
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/stores/search?lat=4.051&lng=9.708&radius=1000')
      .then(res => res.json())
      .then(data => setStores(data))
      .catch(console.error);
  }, []);

  // Douala coordinates
  const center: [number, number] = [4.051, 9.708];

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={true} className="w-full h-full z-0">
      <TileLayer
        attribution='&copy; OpenStreetMap CartoDB Positron'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      
      {/* Demand Heat (Simulated with static circles for now based on search misses) */}
      <Circle center={[4.06, 9.71]} radius={800} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2, stroke: false }} />
      <Circle center={[4.04, 9.69]} radius={1200} pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.2, stroke: false }} />
      <Circle center={[4.03, 9.73]} radius={600} pathOptions={{ color: 'yellow', fillColor: 'yellow', fillOpacity: 0.2, stroke: false }} />

      {stores.map(store => {
        // Find worst stock level among inventory
        let worstLevel = 'HIGH';
        const levels = store.inventory?.map((i: any) => i.level) || [];
        if (levels.includes('OUT_OF_STOCK')) worstLevel = 'OUT_OF_STOCK';
        else if (levels.includes('LOW')) worstLevel = 'LOW';
        else if (levels.includes('MEDIUM')) worstLevel = 'MEDIUM';
        if (levels.length === 0) worstLevel = 'INACTIVE'; // Gray

        const color = getColorForStockLevel(worstLevel);

        return (
          <Marker key={store.id} position={[store.latitude, store.longitude]} icon={createIcon(color)}>
            <Popup>
              <div className="font-sans">
                <strong className="text-gray-900 block mb-1">{store.name}</strong>
                <p className="text-xs text-gray-500 mb-2">{store.neighborhood}</p>
                <div className="space-y-1">
                  {store.inventory?.map((inv: any) => (
                    <div key={inv.id} className="flex justify-between items-center gap-4 text-sm">
                      <span>{inv.product.brand} {inv.product.weightKg}kg</span>
                      <span className="font-bold" style={{ color: getColorForStockLevel(inv.level) }}>
                        {inv.level === 'HIGH' ? 'BON' : inv.level === 'MEDIUM' ? 'MOYEN' : inv.level === 'LOW' ? 'FAIBLE' : 'RUPTURE'}
                      </span>
                    </div>
                  ))}
                  {(!store.inventory || store.inventory.length === 0) && (
                    <div className="text-sm text-gray-400 italic">Aucun stock déclaré</div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
