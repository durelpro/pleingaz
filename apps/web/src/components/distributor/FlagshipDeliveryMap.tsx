'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Store, Navigation, Phone, MapPin, CheckCircle } from 'lucide-react';

// Custom Map Markers
const storeIcon = L.divIcon({
  className: 'custom-store-pin',
  html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 14px rgba(239,68,68,0.7); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;">🏢</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const driverIcon = L.divIcon({
  className: 'custom-driver-pin',
  html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 14px rgba(59,130,246,0.7); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">🛵</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const clientIcon = L.divIcon({
  className: 'custom-client-pin',
  html: `<div style="background-color: #10b981; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(16,185,129,0.7); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">📍</div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

interface DeliveryMapProps {
  storeLat: number;
  storeLng: number;
  driverLat?: number;
  driverLng?: number;
  storeName?: string;
  storeLandmark?: string;
  driverName?: string;
  driverVehicle?: string;
  deliveries: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    address: string;
    notes?: string;
    lat: number;
    lng: number;
    status: string;
    totalAmount: number;
  }>;
}

export default function FlagshipDeliveryMap({
  storeLat = 3.8420,
  storeLng = 11.5210,
  driverLat = 3.8445,
  driverLng = 11.5230,
  storeName = 'Dépôt Central PLEINGAZ (INFOTECH S.A.)',
  storeLandmark = 'Yaoundé, Mvog-Mbi (Au niveau de Total Magzi)',
  driverName = 'Jean-Pierre Mvondo (Livreur Flotte Directe)',
  driverVehicle = 'Moto-Tricycle PLEINGAZ (DLA-7842-LT)',
  deliveries,
}: DeliveryMapProps) {
  const storePos: [number, number] = [storeLat || 3.8420, storeLng || 11.5210];
  const driverPos: [number, number] = [driverLat || 3.8445, driverLng || 11.5230];

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-inner">
      <MapContainer
        center={storePos}
        zoom={14}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dépôt Central PLEINGAZ */}
        <Marker position={storePos} icon={storeIcon}>
          <Popup>
            <div className="p-1 space-y-1">
              <p className="font-black text-sm text-red-600">🏢 {storeName}</p>
              <p className="text-xs text-gray-600">{storeLandmark}</p>
              <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 font-bold text-[10px] rounded">
                Point de départ Flotte
              </span>
            </div>
          </Popup>
        </Marker>

        {/* Coursier Dédié Pleingaz en Mouvement */}
        <Marker position={driverPos} icon={driverIcon}>
          <Popup>
            <div className="p-1 space-y-1">
              <p className="font-black text-sm text-blue-600">🛵 {driverName}</p>
              <p className="text-xs text-gray-600">{driverVehicle}</p>
              <p className="text-xs font-semibold text-green-600">Statut : En livraison active</p>
            </div>
          </Popup>
        </Marker>

        {/* Clients & Trajets */}
        {deliveries.map((deliv) => {
          if (!deliv.lat || !deliv.lng) return null;
          const clientPos: [number, number] = [deliv.lat, deliv.lng];

          return (
            <div key={deliv.id}>
              {/* Ligne d'acheminement visuelle */}
              <Polyline
                positions={[driverPos, clientPos]}
                color={deliv.status === 'DELIVERED' ? '#10b981' : '#3b82f6'}
                dashArray={deliv.status === 'DELIVERED' ? undefined : '6, 8'}
                weight={3}
                opacity={0.7}
              />

              <Marker position={clientPos} icon={clientIcon}>
                <Popup>
                  <div className="p-1.5 space-y-1.5 min-w-[180px]">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-gray-900">{deliv.orderNumber}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        deliv.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {deliv.status === 'DELIVERED' ? 'LIVRÉ' : 'EN ROUTE'}
                      </span>
                    </div>
                    <p className="font-bold text-sm text-gray-800">{deliv.customerName}</p>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Phone size={11} className="text-blue-500" />
                      {deliv.customerPhone}
                    </p>
                    <p className="text-xs text-gray-500">
                      📍 {deliv.address}
                    </p>
                    {deliv.notes && (
                      <p className="text-[11px] bg-yellow-50 text-yellow-800 p-1 rounded font-medium">
                        Repère : {deliv.notes}
                      </p>
                    )}
                    <p className="text-xs font-black text-gray-900 pt-1 border-t">
                      Montant : {deliv.totalAmount.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}
