"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { Store, ShieldCheck, Flame, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';

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

// Villes camerounaises avec leurs coordonnées
export const CITIES_DATA: Record<string, {
  name: string;
  center: [number, number];
  zoom: number;
}> = {
  douala: {
    name: 'Douala',
    center: [4.051, 9.708],
    zoom: 13,
  },
  yaounde: {
    name: 'Yaoundé',
    center: [3.848, 11.502],
    zoom: 13,
  },
  bafoussam: {
    name: 'Bafoussam',
    center: [5.477, 10.417],
    zoom: 14,
  }
};

function ChangeMapView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
    // Invalider la taille après changement de vue pour s'assurer que Leaflet calcule correctement la hauteur/largeur
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [center, zoom, map]);
  return null;
}

export default function RadarMap({ 
  selectedCity = 'douala',
  searchQuery = '',
}: { 
  selectedCity?: string;
  searchQuery?: string;
}) {
  const [stores, setStores] = useState<any[]>([]);
  const [demandClusters, setDemandClusters] = useState<any[]>([]);

  const cityConfig = CITIES_DATA[selectedCity] || CITIES_DATA.douala;

  // Charger les magasins réels géolocalisés
  useEffect(() => {
    apiFetch(`/search/stores?lat=${cityConfig.center[0]}&lng=${cityConfig.center[1]}&radius=25`)
      .then(res => res.json())
      .then(data => setStores(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [cityConfig]);

  // Charger les points de demande réels de la heatmap depuis la base de données
  useEffect(() => {
    apiFetch('/dashboard/heatmap')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDemandClusters(data);
        }
      })
      .catch(() => setDemandClusters([]));
  }, []);

  const filteredStores = stores.filter(store => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      store.name?.toLowerCase().includes(q) ||
      store.neighborhood?.toLowerCase().includes(q) ||
      store.city?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full h-full min-h-[500px] relative">
      <MapContainer 
        center={cityConfig.center} 
        zoom={cityConfig.zoom} 
        scrollWheelZoom={true} 
        className="w-full h-full min-h-[500px] z-0"
      >
        <ChangeMapView center={cityConfig.center} zoom={cityConfig.zoom} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Heatmap des recherches sans résultat et demandes réelles */}
        {demandClusters.map((cluster, idx) => (
          <Circle
            key={cluster.id || idx}
            center={[cluster.latitude, cluster.longitude]}
            radius={800}
            pathOptions={{
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: 0.25,
              stroke: true,
              weight: 2,
            }}
          >
            <Popup>
              <div className="font-sans text-xs space-y-1 p-1">
                <strong className="text-gray-900 block font-bold text-sm">
                  🔥 Signalement Demande Réseau
                </strong>
                <p className="text-gray-600">
                  Type : {cluster.type === 'NO_RESULT' ? 'Recherche sans stock trouvé' : cluster.type}
                </p>
                <span className="inline-block px-2 py-0.5 rounded font-black text-[10px] text-white bg-red-600">
                  PRIORITÉ RÉAPPROVISIONNEMENT
                </span>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Points de vente officiels enregistrés */}
        {filteredStores.map(store => {
          if (!store.latitude || !store.longitude) return null;

          let worstLevel = store.stockLevel || 'HIGH';
          const levels = store.inventory?.map((i: any) => i.level) || [];
          if (levels.includes('OUT_OF_STOCK') || store.stockLevel === 'OUT_OF_STOCK') worstLevel = 'OUT_OF_STOCK';
          else if (levels.includes('LOW') || store.stockLevel === 'LOW') worstLevel = 'LOW';
          else if (levels.includes('MEDIUM') || store.stockLevel === 'MEDIUM') worstLevel = 'MEDIUM';
          if (levels.length === 0 && !store.stockLevel) worstLevel = 'INACTIVE';

          const color = getColorForStockLevel(worstLevel);

          return (
            <Marker key={store.id} position={[store.latitude, store.longitude]} icon={createIcon(color)}>
              <Popup>
                <div className="font-sans min-w-[200px]">
                  <strong className="text-gray-900 block mb-0.5 font-bold text-sm">{store.name}</strong>
                  <p className="text-xs text-gray-500 mb-2">{store.neighborhood || 'Centre'}, {store.city}</p>
                  
                  {store.inventory && store.inventory.length > 0 ? (
                    <div className="space-y-1">
                      {store.inventory.map((inv: any) => (
                        <div key={inv.id} className="flex justify-between items-center gap-4 text-xs">
                          <span>{inv.product?.brand || 'Gaz'} {inv.product?.weightKg ? `${inv.product.weightKg}kg` : ''}</span>
                          <span className="font-bold px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: `${getColorForStockLevel(inv.level)}20`, color: getColorForStockLevel(inv.level) }}>
                            {inv.level === 'HIGH' ? 'BON' : inv.level === 'MEDIUM' ? 'MOYEN' : inv.level === 'LOW' ? 'FAIBLE' : 'RUPTURE'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs font-semibold text-gray-700">
                      Disponibilité générale : <span className="font-bold" style={{ color }}>{worstLevel}</span>
                    </div>
                  )}

                  {store.whatsappNumber && (
                    <p className="text-[11px] text-gray-500 mt-2">
                      WhatsApp : {store.whatsappNumber}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
