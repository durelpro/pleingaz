'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, BellRing, Flame, MessageCircle, Store, Navigation, Compass, List, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import FavoriteButton from '@/components/store/FavoriteButton';
import BackButton from '@/components/common/BackButton';

const SearchStoresMap = dynamic(() => import('@/components/map/SearchStoresMap'), { 
  ssr: false, 
  loading: () => <div className="h-[500px] bg-gray-100 dark:bg-neutral-800 animate-pulse rounded-3xl" /> 
});

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertSet, setAlertSet] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Initialisation via l'URL (?q=...)
  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam && qParam.trim() !== '') {
      setQuery(qParam);
      performSearch(undefined, undefined, qParam);
    }
  }, [searchParams]);

  // Fermer les suggestions si on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Suggestions & Recherche Debounce
  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      setSuggestions([]);
      setShowSuggestions(false);
      setHasSearched(false);
      return;
    }

    if (query !== 'Ma position GPS') {
      // 1. Récupérer les suggestions instantanées au fur et à mesure de la frappe
      fetch(`http://localhost:3001/search/suggestions?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setSuggestions(data);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
          }
        })
        .catch(err => console.error(err));
    }

    // 2. Lancer la recherche complète après 400ms
    const delayDebounceFn = setTimeout(() => {
      if (query !== 'Ma position GPS') {
        performSearch(undefined, undefined, query);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async (lat?: number, lng?: number, textQuery?: string) => {
    setHasSearched(true);
    setIsLoading(true);
    setAlertSet(false);
    setShowSuggestions(false);
    try {
      const url = new URL('http://localhost:3001/search/stores');
      if (lat && lng) {
        url.searchParams.append('lat', lat.toString());
        url.searchParams.append('lng', lng.toString());
      }
      if (textQuery) {
        url.searchParams.append('q', textQuery);
      }

      const res = await fetch(url.toString());
      const data = await res.json();
      setResults(data || []);
    } catch (err) {
      console.error('Error fetching stores', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    performSearch(undefined, undefined, query);
  };

  const selectSuggestion = (item: any) => {
    setQuery(item.text);
    setShowSuggestions(false);
    performSearch(undefined, undefined, item.text);
  };

  const handleGPSRequest = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }
    
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setQuery('Ma position GPS');
        performSearch(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setIsLoading(false);
        alert("Impossible d'obtenir votre position. Veuillez vérifier vos permissions.");
      }
    );
  };

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'MEDIUM': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'LOW': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Navigation retour */}
        <div className="flex items-center justify-between">
          <BackButton fallbackHref="/" label="Retour à l'accueil" />
        </div>

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 text-pleingaz-red mb-2">
            <Flame size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            J'ai besoin de gaz !
          </h1>
          <p className="text-gray-500 text-lg">
            Recherchez par nom, par quartier (ex: Bonamoussadi, Akwa) ou par repère (ex: boulangerie Saker).
          </p>
        </div>

        {/* Search Bar avec Autocomplétion Intelligente */}
        <div ref={searchContainerRef} className="relative group">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-gray-400 group-focus-within:text-pleingaz-red transition-colors" />
            </div>
            <input
              type="text"
              className="w-full pl-12 pr-16 py-4 bg-white dark:bg-neutral-900 border-2 border-gray-100 dark:border-neutral-800 rounded-2xl text-lg focus:border-pleingaz-red focus:ring-0 outline-none shadow-sm transition-all"
              placeholder="Ex: Bonamoussadi, Saker, Orange, Akwa..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
            />
            <button 
              type="button"
              onClick={handleGPSRequest}
              className="absolute inset-y-2 right-2 px-4 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-600 dark:text-gray-300 rounded-xl transition-colors flex items-center justify-center"
              title="Utiliser ma position GPS"
            >
              <Navigation size={20} />
            </button>
          </form>

          {/* Menu flottant de suggestions / autocomplétion au fur et à mesure de la saisie */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100 dark:divide-neutral-800"
              >
                <div className="px-4 py-2 bg-gray-50 dark:bg-neutral-800/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Suggestions correspondantes ({suggestions.length})
                </div>
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectSuggestion(item)}
                    className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-colors group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gray-100 dark:bg-neutral-800 group-hover:bg-pleingaz-red/10 group-hover:text-pleingaz-red transition-colors text-gray-500">
                      {item.type === 'neighborhood' && <Compass size={18} />}
                      {item.type === 'landmark' && <MapPin size={18} />}
                      {item.type === 'store' && <Store size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-pleingaz-red transition-colors">
                        {item.text}
                      </p>
                      {item.subtext && (
                        <p className="text-xs text-gray-500 truncate">{item.subtext}</p>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 shrink-0">
                      {item.type === 'neighborhood' ? 'Quartier' : (item.type === 'landmark' ? 'Repère' : 'Boutique')}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        <AnimatePresence>
          {hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900 dark:text-white text-xl">
                  Points de vente trouvés ({results.length})
                </h2>

                {results.length > 0 && (
                  <div className="flex items-center bg-gray-100 dark:bg-neutral-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'list' ? 'bg-white dark:bg-neutral-900 text-pleingaz-red shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      <List size={14} /> Liste
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('map')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'map' ? 'bg-white dark:bg-neutral-900 text-pleingaz-red shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      <Map size={14} /> Carte
                    </button>
                  </div>
                )}
              </div>
              
              {results.length > 0 ? (
                viewMode === 'map' ? (
                  <SearchStoresMap stores={results} />
                ) : (
                  results.map((store) => (
                  <motion.div 
                    key={store.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{store.name}</h3>
                        {store.recommendationReason && (
                          <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-100 dark:border-blue-800">
                            {store.recommendationReason}
                          </span>
                        )}
                      </div>

                      {/* Quartier, Ville et Repère / Description du lieu */}
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">
                        <MapPin size={15} className="text-pleingaz-red shrink-0" />
                        <span>
                          {store.neighborhood || 'Centre'}, {store.city || 'Douala'}
                          {store.landmark && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-1">
                              • Repère : {store.landmark}
                            </span>
                          )}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 font-medium mt-1">
                        {store.distanceStr ? `${store.distanceStr} • ` : ''}{store.stockFreshness}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getBadgeColor(store.stockLevel)}`}>
                        {store.stockLevel === 'HIGH' ? 'BON STOCK' : (store.stockLevel === 'LOW' ? 'STOCK FAIBLE' : 'STOCK MOYEN')}
                      </span>
                      <FavoriteButton storeId={store.id} storeName={store.name} size={18} />
                      <Link 
                        href={`/buyer/messages?to=${store.ownerId || store.id}`}
                        className="px-3.5 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-1.5"
                      >
                        <MessageCircle size={16} />
                        Contacter
                      </Link>
                      <Link 
                        href={`/stores/${store.id}`}
                        className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-xl hover:bg-pleingaz-red dark:hover:bg-pleingaz-red hover:text-white transition-colors"
                      >
                        Voir boutique
                      </Link>
                    </div>
                  </motion.div>
                ))
              )) : (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-8 rounded-2xl text-center space-y-4">
                  <h3 className="text-orange-800 dark:text-orange-400 font-bold text-lg">Oups, rupture de stock par ici !</h3>
                  <p className="text-orange-700 dark:text-orange-300">Aucun distributeur n'a de gaz dans cette zone actuellement.</p>
                  <button 
                    onClick={() => setAlertSet(true)}
                    disabled={alertSet}
                    className={`inline-flex items-center gap-2 px-6 py-3 font-bold rounded-xl shadow-lg transition-all ${
                      alertSet 
                        ? 'bg-green-500 text-white cursor-default'
                        : 'bg-pleingaz-red text-white shadow-orange-500/30 hover:-translate-y-0.5'
                    }`}
                  >
                    <BellRing size={20} />
                    {alertSet ? "Alerte programmée ! Vous serez notifié." : "Alertez-moi quand le gaz revient"}
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex items-center justify-center font-bold text-gray-500">Chargement de la recherche...</div>}>
      <SearchContent />
    </Suspense>
  );
}

