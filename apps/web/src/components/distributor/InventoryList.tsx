'use client';

import { apiFetch } from '@/lib/api';
import { useState, useEffect } from 'react';
import { RefreshCw, WifiOff, CheckCircle2, Clock, ShoppingCart, Info, X, Flame, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

type StockLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'OUT_OF_STOCK';

interface Product {
  id: string;
  brand: string;
  weightKg: number;
}

interface InventoryItem {
  id: string;
  productId: string;
  product: Product;
  level: StockLevel;
  lastConfirmedAt: string;
}

// Couleurs thématiques par marque de gaz officielle
const BRAND_THEMES: Record<string, { bg: string; text: string; badge: string; border: string }> = {
  SCTM: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', badge: 'bg-red-500 text-white', border: 'border-red-200 dark:border-red-900/30' },
  Camgaz: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-600 text-white', border: 'border-emerald-200 dark:border-emerald-900/30' },
  Tradex: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', badge: 'bg-blue-600 text-white', border: 'border-blue-200 dark:border-blue-900/30' },
  GreenOil: { bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', badge: 'bg-teal-600 text-white', border: 'border-teal-200 dark:border-teal-900/30' },
  Oilibya: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-500 text-white', border: 'border-amber-200 dark:border-amber-900/30' },
};

export default function InventoryList() {
  const [isOffline, setIsOffline] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const loadInventory = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await apiFetch('/inventory/my-store');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setInventory(data);
        }
      } else if (res.status === 401) {
        setErrorMessage('Session expirée ou non autorisée. Veuillez vous reconnecter.');
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMessage(err.message || 'Impossible de récupérer votre stock.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Erreur réseau lors de la communication avec le serveur.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const getAgeDisplay = (isoDate?: string) => {
    if (!isoDate || !now) return { label: 'Non confirmé', badge: 'bg-gray-100 text-gray-700 border-gray-200' };
    const diffMin = Math.max(0, Math.floor((now - new Date(isoDate).getTime()) / 60000));
    
    if (diffMin < 60) {
      return { label: `Confirmé il y a ${diffMin} min`, badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' };
    }
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 3) {
      return { label: `Confirmé il y a ${diffHours}h`, badge: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800' };
    }
    if (diffHours < 12) {
      return { label: `Confirmé il y a ${diffHours}h (attention)`, badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' };
    }
    return { label: 'Information ancienne (> 12h)', badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800' };
  };

  const getLevelColor = (level: StockLevel) => {
    switch (level) {
      case 'HIGH': return 'bg-emerald-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-white';
      case 'LOW': return 'bg-orange-500 text-white';
      case 'OUT_OF_STOCK': return 'bg-rose-600 text-white';
    }
  };

  const confirmStock = async (productId: string, newLevel: StockLevel) => {
    if (isOffline) {
      alert("Mode hors ligne : Votre modification sera synchronisée ultérieurement.");
    }

    // Mise à jour optimiste dans l'UI
    setInventory(prev => prev.map(item => 
      item.product.id === productId ? { ...item, level: newLevel, lastConfirmedAt: new Date().toISOString() } : item
    ));

    try {
      const res = await apiFetch(`/inventory/my-store/product/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ level: newLevel }),
      });

      if (!res.ok) {
        throw new Error('Erreur de mise à jour');
      }

      if (newLevel === 'OUT_OF_STOCK') {
        setToast("⚠️ PLEINGAZ a été notifié de votre rupture de stock.");
      } else {
        setToast("✅ Stock confirmé et actualisé en temps réel sur la carte !");
      }
      setTimeout(() => setToast(null), 4000);
    } catch (e) {
      console.error(e);
      loadInventory();
      alert("Impossible de mettre à jour le stock sur le serveur.");
    }
  };

  const confirmAllStock = async () => {
    setIsRefreshingAll(true);
    try {
      const res = await apiFetch('/inventory/my-store/confirm-all', { method: 'PUT' });
      if (res.ok) {
        const updated = await res.json();
        if (Array.isArray(updated)) setInventory(updated);
        setToast("✅ Toutes vos disponibilités ont été certifiées à l'instant !");
        setTimeout(() => setToast(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshingAll(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-4 rounded-2xl shadow-[0_20px_40px_rgb(0,0,0,0.2)] flex items-center gap-4 font-bold border border-gray-800 dark:border-gray-200"
          >
            <span>{toast}</span>
            <button onClick={() => setToast(null)} className="p-1 hover:bg-gray-800 dark:hover:bg-gray-200 rounded-full transition-colors">
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bannière Hors Ligne */}
      {isOffline && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
          <WifiOff size={20} />
          <span className="font-medium">Vous êtes hors ligne. Vos modifications seront synchronisées au retour de la connexion.</span>
        </div>
      )}

      {/* Barre d'action rapide : Tout Confirmer & Rafraîchir */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center text-pleingaz-red">
            <Flame size={20} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {inventory.length} type{inventory.length > 1 ? 's' : ''} de bouteille{inventory.length > 1 ? 's' : ''} au catalogue
            </div>
            <div className="text-xs text-gray-500">Mise à jour en 1 clic pour maintenir votre score de fiabilité</div>
          </div>
        </div>

        <button
          onClick={confirmAllStock}
          disabled={isRefreshingAll || inventory.length === 0}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-60"
        >
          <RefreshCw size={16} className={isRefreshingAll ? 'animate-spin' : ''} />
          <span>{isRefreshingAll ? 'Certification...' : 'Certifier tout le stock maintenant'}</span>
        </button>
      </div>

      {/* Message d'erreur s'il y a lieu */}
      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-400">
          <AlertCircle size={20} className="shrink-0" />
          <span className="text-sm font-bold">{errorMessage}</span>
          <button onClick={loadInventory} className="ml-auto text-xs underline font-black">Réessayer</button>
        </div>
      )}

      {/* Liste des Bouteilles */}
      <div className="grid gap-4">
        {isLoading && (
          <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800">
            <RefreshCw size={32} className="animate-spin text-pleingaz-red mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-500">Chargement de votre inventaire de bouteilles...</p>
          </div>
        )}

        {!isLoading && inventory.length === 0 && !errorMessage && (
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-neutral-950 text-gray-400 rounded-full flex items-center justify-center mb-4">
              <Info size={24} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Aucun stock trouvé</h3>
            <p className="text-gray-500 max-w-sm text-sm">
              Votre boutique est peut-être encore en cours de validation ou aucun point de vente n'est rattaché à votre compte.
            </p>
            <Link href="/distributor/dashboard" className="mt-6 text-pleingaz-red font-bold hover:underline text-sm">
              Retour au tableau de bord
            </Link>
          </div>
        )}

        {inventory.map(item => {
          const brandTheme = BRAND_THEMES[item.product.brand] || {
            bg: 'bg-orange-500/10',
            text: 'text-orange-600',
            badge: 'bg-orange-600 text-white',
            border: 'border-orange-200'
          };
          const age = getAgeDisplay(item.lastConfirmedAt);

          return (
            <div 
              key={item.id} 
              className={`bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border ${brandTheme.border} flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${brandTheme.bg} ${brandTheme.text}`}>
                  {item.product.brand.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-gray-900 dark:text-white text-lg">
                      {item.product.brand}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300">
                      {item.product.weightKg} kg
                    </span>
                  </div>
                  
                  <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold ${age.badge}`}>
                    <Clock size={12} />
                    <span>{age.label}</span>
                  </div>
                </div>
              </div>

              {/* Boutons Sélecteurs d'état de stock (Règle R1 & UX tactile Cameroun) */}
              <div className="flex flex-wrap items-center gap-2">
                {([
                  { level: 'HIGH', label: 'BON', desc: 'En stock' },
                  { level: 'MEDIUM', label: 'MOYEN', desc: 'Stock moyen' },
                  { level: 'LOW', label: 'FAIBLE', desc: 'Stock bas' },
                  { level: 'OUT_OF_STOCK', label: 'RUPTURE', desc: 'Épuisé' },
                ] as const).map(({ level, label }) => {
                  const isActive = item.level === level;
                  return (
                    <button
                      key={level}
                      onClick={() => confirmStock(item.product.id, level)}
                      className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95
                        ${isActive 
                          ? `${getLevelColor(level)} shadow-md scale-105 ring-2 ring-offset-2 ring-black/10 dark:ring-offset-neutral-900` 
                          : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-transparent'
                        }
                      `}
                    >
                      {isActive && <CheckCircle2 size={16} />}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Alerte et action de réapprovisionnement en cas de Rupture */}
              {item.level === 'OUT_OF_STOCK' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  className="w-full p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden"
                >
                  <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
                    <div className="w-9 h-9 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center shrink-0">
                      <Info size={18} />
                    </div>
                    <span className="text-xs md:text-sm font-bold">
                      Cette bouteille est marquée en rupture pour vos clients. Commandez votre réassort auprès de PLEINGAZ.
                    </span>
                  </div>
                  <Link 
                    href="/distributor/order"
                    className="px-5 py-2.5 bg-gradient-to-r from-pleingaz-red to-[#ff6a00] text-white font-black text-xs md:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all whitespace-nowrap"
                  >
                    <ShoppingCart size={16} />
                    Commander du stock
                  </Link>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
