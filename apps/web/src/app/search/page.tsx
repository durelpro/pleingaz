'use client';

import { useState } from 'react';
import { Search, MapPin, BellRing, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([
    { id: 'store-akwa-1', name: "Dépôt Agréé PLEINGAZ Akwa", city: "Douala", distanceStr: "0.8 km", stockFreshness: "Confirmé il y a 15 min (🟢 Frais)", recommendationReason: "📍 Le plus proche", stockLevel: "BON" },
    { id: 'store-bonapriso-2', name: "Point Relais PLEINGAZ Bonapriso", city: "Douala", distanceStr: "1.4 km", stockFreshness: "Confirmé il y a 1h (🟠 Récent)", recommendationReason: "⚡ Forte disponibilité", stockLevel: "MOYEN" },
  ]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  };

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'BON': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'MOYEN': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'FAIBLE': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'RUPTURE': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 text-pleingaz-red mb-2">
            <Flame size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            J'ai besoin de gaz ! (D-02)
          </h1>
          <p className="text-gray-500 text-lg">
            Recherchez les dépôts agréés <strong className="text-pleingaz-red">PLEINGAZ</strong> avec stock disponible en direct.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400 group-focus-within:text-pleingaz-red transition-colors" />
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-16 py-4 bg-white dark:bg-neutral-900 border-2 border-gray-100 dark:border-neutral-800 rounded-2xl text-lg focus:border-pleingaz-red focus:ring-0 outline-none shadow-sm transition-all"
            placeholder="Ex: Akwa, Bonamoussadi, ou 'Ma position'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            type="button"
            className="absolute inset-y-2 right-2 px-4 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-600 dark:text-gray-300 rounded-xl transition-colors flex items-center justify-center"
            title="Utiliser ma position GPS"
          >
            <MapPin size={20} />
          </button>
        </form>

        {/* Results */}
        <AnimatePresence>
          {hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="font-bold text-gray-900 dark:text-white text-xl">Dépôts officiels disponibles</h2>
              
              {results.length > 0 ? (
                results.map((store) => (
                  <motion.div 
                    key={store.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{store.name}</h3>
                        {store.recommendationReason && (
                          <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-100 dark:border-blue-800">
                            {store.recommendationReason}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 font-medium">{store.distanceStr} • {store.stockFreshness}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getBadgeColor(store.stockLevel)}`}>
                        {store.stockLevel}
                      </span>
                      <Link 
                        href={`/checkout?storeId=${store.id}`}
                        className="px-5 py-2.5 bg-pleingaz-red text-white font-bold rounded-xl shadow-md hover:bg-red-700 transition-colors"
                      >
                        Commander
                      </Link>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-8 rounded-2xl text-center space-y-4">
                  <h3 className="text-orange-800 dark:text-orange-400 font-bold text-lg">Oups, rupture de stock par ici !</h3>
                  <p className="text-orange-700 dark:text-orange-300">Aucun distributeur n'a de gaz dans cette zone actuellement.</p>
                  <button className="inline-flex items-center gap-2 px-6 py-3 bg-pleingaz-red text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 transition-all">
                    <BellRing size={20} />
                    Alertez-moi quand le gaz revient
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
