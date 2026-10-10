'use client';

import { useState } from 'react';
import { Search, MessageCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/map/MapPicker'), { ssr: false, loading: () => <div className="h-[600px] w-full bg-skeleton-base animate-pulse rounded-2xl" /> });

export default function StoresPublicMap() {
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-neutral-950">
      
      {/* Sidebar - Liste des boutiques */}
      <div className="w-full md:w-[400px] h-[50vh] md:h-screen bg-white dark:bg-neutral-900 border-r border-gray-100 dark:border-neutral-800 flex flex-col shadow-xl z-10 relative">
        <div className="p-6 border-b border-gray-100 dark:border-neutral-800">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">Trouver du Gaz</h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Ville, Quartier, Repère..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-pleingaz-red outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Fausse donnée pour la démo du design */}
          <div className="p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-pleingaz-red transition-colors">ETS Kamga & Fils</h3>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Vérifié</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">📍 Bonamoussadi, Derrière la boulangerie Saker</p>
            
            <a href="https://wa.me/237600000000?text=Bonjour,%20avez-vous%20des%20bouteilles%20SCTM%2012.5kg%20vides%20?" target="_blank" rel="noreferrer" 
               className="w-full py-2.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors">
              <MessageCircle size={18} />
              Contacter sur WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Carte */}
      <div className="flex-1 h-[50vh] md:h-screen relative z-0">
        <MapPicker onChange={() => {}} />
      </div>

    </div>
  );
}
