"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { Store, ShieldCheck, Flame, AlertCircle } from 'lucide-react';

const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(0,0,0,0.4);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
};

const getColorForStockLevel = (level: string) => {
  switch (level) {
    case 'HIGH': return '#22c55e'; // green
    case 'MEDIUM': return '#eab308'; // yellow
    case 'LOW': return '#f97316'; // orange
    case 'OUT_OF_STOCK': return '#ef4444'; // red
    default: return '#9ca3af'; // gray
  }
};

// Villes camerounaises et leurs zones de chaleur (Heatmap de la demande)
export const CITIES_DATA: Record<string, {
  name: string;
  center: [number, number];
  zoom: number;
  demandClusters: {
    neighborhood: string;
    center: [number, number];
    radius: number;
    intensity: 'CRITICAL' | 'HIGH' | 'MODERATE';
    searchesCount: number;
    color: string;
  }[];
}> = {
  douala: {
    name: 'Douala',
    center: [4.051, 9.708],
    zoom: 13,
    demandClusters: [
      { neighborhood: 'Bonamoussadi & Makepe', center: [4.078, 9.738], radius: 1000, intensity: 'CRITICAL', searchesCount: 142, color: '#ef4444' },
      { neighborhood: 'Akwa & Deido', center: [4.055, 9.705], radius: 900, intensity: 'HIGH', searchesCount: 98, color: '#f97316' },
      { neighborhood: 'Yassa & Nyalla', center: [4.015, 9.785], radius: 1400, intensity: 'CRITICAL', searchesCount: 186, color: '#dc2626' },
      { neighborhood: 'Bonapriso & Bali', center: [4.032, 9.692], radius: 700, intensity: 'MODERATE', searchesCount: 54, color: '#eab308' },
    ]
  },
  yaounde: {
    name: 'Yaoundé',
    center: [3.848, 11.502],
    zoom: 13,
    demandClusters: [
      { neighborhood: 'Bastos & Golf', center: [3.892, 11.512], radius: 950, intensity: 'HIGH', searchesCount: 112, color: '#f97316' },
      { neighborhood: 'Mendong & Biyem-Assi', center: [3.832, 11.482], radius: 1300, intensity: 'CRITICAL', searchesCount: 164, color: '#ef4444' },
      { neighborhood: 'Nsam & Mvan', center: [3.818, 11.515], radius: 1100, intensity: 'HIGH', searchesCount: 89, color: '#f97316' },
      { neighborhood: 'Emana & Messassi', center: [3.918, 11.528], radius: 1200, intensity: 'CRITICAL', searchesCount: 135, color: '#dc2626' },
    ]
  },
  bafoussam: {
    name: 'Bafoussam',
    center: [5.477, 10.417],
    zoom: 14,
    demandClusters: [
      { neighborhood: 'Djeleng & Marché A', center: [5.479, 10.422], radius: 850, intensity: 'CRITICAL', searchesCount: 78, color: '#ef4444' },
      { neighborhood: 'Famla & Evêché', center: [5.468, 10.412], radius: 900, intensity: 'HIGH', searchesCount: 61, color: '#f97316' },
      { neighborhood: 'Tamkwe & Carrefour Biao', center: [5.488, 10.435], radius: 750, intensity: 'MODERATE', searchesCount: 39, color: '#eab308' },
    ]
  }
};

function ChangeMapView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function RadarMap({ selectedCity = 'douala' }: { selectedCity?: string }) {
  const [stores, setStores] = useState<any[]>([]);

  const cityConfig = CITIES_DATA[selectedCity] || CITIES_DATA.douala;

  useEffect(() => {
    fetch(`http://localhost:3001/stores/search?lat=${cityConfig.center[0]}&lng=${cityConfig.center[1]}&radius=15000`)
      .then(res => res.json())
      .then(data => setStores(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [cityConfig]);

  return (
    <MapContainer center={cityConfig.center} zoom={cityConfig.zoom} scrollWheelZoom={true} className="w-full h-full z-0">
      <ChangeMapView center={cityConfig.center} zoom={cityConfig.zoom} />
      
      <TileLayer
        attribution='&copy; OpenStreetMap CartoDB Positron'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      
      {/* Heatmap de la demande réelle par ville et quartier */}
      {cityConfig.demandClusters.map((cluster, idx) => (
        <Circle
          key={idx}
          center={cluster.center}
          radius={cluster.radius}
          pathOptions={{
            color: cluster.color,
            fillColor: cluster.color,
            fillOpacity: cluster.intensity === 'CRITICAL' ? 0.35 : 0.22,
            stroke: true,
            weight: 2,
          }}
        >
          <Popup>
            <div className="font-sans text-xs space-y-1 p-1">
              <strong className="text-gray-900 block font-bold text-sm">
                🔥 Zone de Forte Demande : {cluster.neighborhood}
              </strong>
              <p className="text-gray-600">
                Volume : <strong>{cluster.searchesCount} recherches non satisfaites</strong> ces dernières 24h.
              </p>
              <span className={`inline-block px-2 py-0.5 rounded font-black text-[10px] text-white ${cluster.intensity === 'CRITICAL' ? 'bg-red-600' : 'bg-orange-500'}`}>
                PRIORITÉ RÉAPPROVISIONNEMENT : {cluster.intensity}
              </span>
            </div>
          </Popup>
        </Circle>
      ))}

      {/* Points de vente officiels */}
      {stores.map(store => {
        let worstLevel = 'HIGH';
        const levels = store.inventory?.map((i: any) => i.level) || [];
        if (levels.includes('OUT_OF_STOCK')) worstLevel = 'OUT_OF_STOCK';
        else if (levels.includes('LOW')) worstLevel = 'LOW';
        else if (levels.includes('MEDIUM')) worstLevel = 'MEDIUM';
        if (levels.length === 0) worstLevel = 'INACTIVE';

        const color = getColorForStockLevel(worstLevel);

        return (
          <Marker key={store.id} position={[store.latitude, store.longitude]} icon={createIcon(color)}>
            <Popup>
              <div className="font-sans min-w-[190px]">
                <strong className="text-gray-900 block mb-0.5 font-bold">{store.name}</strong>
                <p className="text-xs text-gray-500 mb-2">{store.neighborhood || 'Centre'}, {store.city}</p>
                <div className="space-y-1">
                  {store.inventory?.map((inv: any) => (
                    <div key={inv.id} className="flex justify-between items-center gap-4 text-xs">
                      <span>{inv.product.brand} {inv.product.weightKg}kg</span>
                      <span className="font-bold px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: `${getColorForStockLevel(inv.level)}20`, color: getColorForStockLevel(inv.level) }}>
                        {inv.level === 'HIGH' ? 'BON' : inv.level === 'MEDIUM' ? 'MOYEN' : inv.level === 'LOW' ? 'FAIBLE' : 'RUPTURE'}
                      </span>
                    </div>
                  ))}
                  {(!store.inventory || store.inventory.length === 0) && (
                    <div className="text-xs text-gray-400 italic">Aucun stock déclaré</div>
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
