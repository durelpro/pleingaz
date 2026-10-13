"use client";

import { MapPin, Search, ArrowLeft, Filter, AlertTriangle, Layers } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import { useState } from 'react';

// Disable SSR for Leaflet
const RadarMap = dynamic(() => import('@/components/admin/RadarMap'), { ssr: false });

export default function GlobalRadarPage() {
  const [selectedCity, setSelectedCity] = useState<'douala' | 'yaounde' | 'bafoussam'>('douala');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 dark:bg-neutral-950 overflow-hidden">
      
      {/* Top Navbar */}
      <div className="h-20 shrink-0 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between px-6 z-10 gap-4">
        <div className="flex items-center gap-6">
          <Link href="/admin/dashboard" className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors">
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="text-pleingaz-red" /> Radar & Heatmap PLEINGAZ
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Supervision de la demande et des ruptures par ville et quartier</p>
          </div>
        </div>

        {/* Sélecteur de Ville (Douala, Yaoundé, Bafoussam) */}
        <div className="flex items-center bg-gray-100 dark:bg-neutral-800 p-1 rounded-2xl border border-gray-200 dark:border-neutral-700">
          {(['douala', 'yaounde', 'bafoussam'] as const).map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2 rounded-xl text-xs font-black capitalize transition-all ${
                selectedCity === city
                  ? 'bg-pleingaz-red text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Filtrer un quartier ou distributeur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-9 pr-4 py-2 bg-gray-100 dark:bg-neutral-950 border border-transparent focus:border-gray-300 dark:focus:border-neutral-700 rounded-full text-sm font-medium outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Map Content */}
      <div className="flex-1 relative w-full h-[calc(100vh-80px)] min-h-[500px]">
        <RadarMap selectedCity={selectedCity} searchQuery={searchQuery} />

        {/* Legend Overlay */}
        <div className="absolute bottom-6 right-6 z-[1000] bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-gray-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xl w-64">
          <h4 className="font-black text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Layers size={16} /> Légende du Réseau
          </h4>
          <div className="space-y-3 text-sm font-medium text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
              <span>Stock Bon</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white shadow-sm"></div>
              <span>Stock Moyen</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-sm"></div>
              <span>Stock Faible</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
              <span>Rupture totale</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-gray-400 border-2 border-white shadow-sm"></div>
              <span>Inactif (Non à jour)</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500 opacity-20"></div>
              <span className="text-xs">Zone de forte demande non satisfaite</span>
            </div>
          </div>
        </div>

        {/* Action Panel Overlay */}
        <div className="absolute top-6 left-6 z-[1000] bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-gray-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xl w-80">
          <h4 className="font-black text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <AlertTriangle className="text-orange-500" /> Alertes Réseau
          </h4>
          
          <div className="space-y-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl">
              <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">Rupture Critique</p>
              <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">Bonamoussadi : 2 distributeurs viennent de déclarer une rupture sur le 12.5Kg.</p>
              <button className="mt-2 text-xs font-bold bg-white dark:bg-neutral-900 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 hover:text-pleingaz-red transition-colors w-full text-center">
                Organiser réapprovisionnement
              </button>
            </div>
            
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-xl">
              <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mb-1">Zone sous-desservie</p>
              <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">Yassa : Forte densité de recherches ("J'ai besoin de gaz") mais 0 point de vente à moins de 3km.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
