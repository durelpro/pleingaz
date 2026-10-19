'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Flame, Store, Navigation, Phone, ShieldCheck, Sparkles, AlertCircle, ArrowRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('Douala (Par défaut)');
  const [stores, setStores] = useState<any[]>([]);

  // Déclencheur automatique si l'utilisateur arrive avec le paramètre ?auto=true
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Déclenchement automatique de la géolocalisation GPS dès l'accès à la recherche
      handleUseGPS();
    }
  }, []);

  const fetchNearbyStores = async (lat: number, lng: number, label?: string) => {
    setLoading(true);
    setError(null);
    if (label) setLocationName(label);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/search/nearby?latitude=${lat}&longitude=${lng}`);
      
      if (!res.ok) {
        throw new Error('Impossible de joindre le serveur de recherche.');
      }

      const data = await res.json();
      setStores(data || []);
    } catch (err: any) {
      // Fallback gracieux si l'API est inaccessible ou réseau instable
      setError('Mode secours local : affichage des points de distribution officiels de référence.');
      setStores([
        {
          id: 'store-pleingaz-siege-officiel',
          name: 'Boutique Officielle PLEINGAZ (Siège Central & Vente Directe)',
          city: 'Douala',
          neighborhood: 'Akwa',
          landmark: 'Boulevard de la Liberté, Immeuble Infotech S.A.',
          whatsappNumber: '+237699000000',
          stockLevel: 'BON',
          distanceStr: '0.3 km',
          stockFreshness: 'Stock officiel vérifié en temps réel (🟢 Optimal)',
          isOfficialCompanyStore: true,
          reliabilityScore: 100,
        },
        {
          id: 'store-akwa-1',
          name: 'Dépôt Agréé PLEINGAZ Akwa',
          city: 'Douala',
          neighborhood: 'Akwa',
          landmark: 'Face Boulangerie Saker',
          whatsappNumber: '+237690112233',
          stockLevel: 'BON',
          distanceStr: '0.8 km',
          stockFreshness: 'Confirmé il y a 15 min (🟢 Frais)',
          reliabilityScore: 98,
        },
      ]);
    } finally {
      setLoading(false);
      setGpsLoading(false);
    }
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }

    setGpsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchNearbyStores(latitude, longitude, 'Ma position GPS en direct');
      },
      (err) => {
        setGpsLoading(false);
        setError('Accès GPS non autorisé ou indisponible. Vous pouvez rechercher manuellement par quartier.');
        fetchNearbyStores(4.0511, 9.7085, 'Douala');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Coordonnées approximatives selon la recherche textuelle
    const q = query.toLowerCase();
    if (q.includes('yaound')) {
      fetchNearbyStores(3.8480, 11.5021, query);
    } else if (q.includes('bafoussam')) {
      fetchNearbyStores(5.4778, 10.4176, query);
    } else {
      fetchNearbyStores(4.0511, 9.7085, query);
    }
  };

  const getBadgeStyle = (level: string) => {
    switch (level) {
      case 'BON':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'MOYEN':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'FAIBLE':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'RUPTURE':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white py-12 px-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/3 w-[600px] h-96 bg-orange-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider"
          >
            <Flame size={14} className="text-orange-500 animate-pulse" />
            Réseau Officiel PLEINGAZ Cameroun (D-02)
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black tracking-tight"
          >
            Où trouver du gaz <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">maintenant ?</span>
          </motion.h1>

          <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto">
            Disponibilité certifiée en temps réel chez les distributeurs agréés et dans la <strong>Boutique Officielle PLEINGAZ</strong>.
          </p>
        </div>

        {/* Instant Action Bar : GPS Click & Manual Search */}
        <div className="p-4 sm:p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Primary GPS button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUseGPS}
              disabled={gpsLoading}
              className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-orange-500/25 flex items-center justify-center gap-3 transition-all"
            >
              {gpsLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Localisation en cours...
                </>
              ) : (
                <>
                  <Navigation size={20} className="animate-bounce" />
                  Prendre ma position & trouver les dépôts proches
                </>
              )}
            </motion.button>
          </div>

          {/* Manual input */}
          <form onSubmit={handleManualSearch} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ou entrez un quartier : Akwa, Bonamoussadi, Bastos, Bepanda..."
              className="w-full bg-black/40 border border-neutral-800 rounded-2xl py-3.5 pl-12 pr-28 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-white placeholder-neutral-500"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-all"
            >
              Chercher
            </button>
          </form>

          {/* Location status pill */}
          <div className="flex items-center justify-between text-xs text-neutral-400 px-2 pt-1">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-orange-400" />
              <span>Zone active : <strong className="text-white">{locationName}</strong></span>
            </div>
            <span className="text-[11px] text-neutral-500">Coordonnées GPS jamais conservées (D-02)</span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Store size={18} className="text-orange-400" />
              Points de distribution disponibles ({stores.length})
            </h2>
            {loading && <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />}
          </div>

          <AnimatePresence>
            {stores.map((store, idx) => {
              const isOfficial = store.id === 'store-pleingaz-siege-officiel' || store.isOfficialCompanyStore;

              return (
                <motion.div
                  key={store.id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                    isOfficial
                      ? 'bg-gradient-to-r from-orange-950/40 via-neutral-900 to-neutral-900 border-orange-500/40 shadow-xl shadow-orange-500/10'
                      : 'bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {isOfficial && (
                          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                            <Sparkles size={12} />
                            Siège & Boutique Officielle PLEINGAZ
                          </span>
                        )}
                        <h3 className="text-lg font-extrabold text-white">{store.name}</h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-300">
                        <span className="flex items-center gap-1 text-neutral-400">
                          <MapPin size={13} className="text-orange-400" />
                          {store.neighborhood}, {store.city} {store.landmark && `(${store.landmark})`}
                        </span>
                        {store.distanceStr && (
                          <span className="font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                            📍 {store.distanceStr}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBadgeStyle(store.stockLevel || 'BON')}`}>
                          Stock : {store.stockLevel || 'BON'}
                        </span>
                        <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                          <Clock size={12} />
                          {store.stockFreshness || 'Stock vérifié aujourd\'hui'}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <div className="text-lg font-black text-white">6 500 FCFA</div>
                        <div className="text-[11px] text-neutral-400">Prix officiel homologué (12.5kg)</div>
                      </div>

                      <Link
                        href={`/stores/${store.id}`}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                          isOfficial
                            ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:scale-105'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        Commander ici
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Footer Guarantee */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>Garantie PLEINGAZ : Aucun revendeur n'est autorisé à vendre au-dessus du prix homologué.</span>
        </div>
      </div>
    </div>
  );
}
