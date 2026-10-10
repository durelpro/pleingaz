'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, WifiOff, CheckCircle2, Clock, ShoppingCart, Info } from 'lucide-react';
import Link from 'next/link';

type StockLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'OUT_OF_STOCK';

interface Product {
  id: string;
  brand: string;
  weightKg: number;
}

interface InventoryItem {
  id: string;
  product: Product;
  level: StockLevel;
  lastConfirmedAt: string;
}

export default function InventoryList() {
  const [isOffline, setIsOffline] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([
    // Fausses données pour démo UX
    { id: '1', product: { id: 'p1', brand: 'SCTM', weightKg: 12.5 }, level: 'HIGH', lastConfirmedAt: '2026-10-07T08:00:00.000Z' },
    { id: '2', product: { id: 'p2', brand: 'Camgaz', weightKg: 12.5 }, level: 'OUT_OF_STOCK', lastConfirmedAt: '2026-10-07T04:00:00.000Z' }, // 4h
  ]);

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
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const getAgeColor = (isoDate: string) => {
    if (!now) return 'bg-gray-100 text-gray-700 border-gray-200';
    const hours = (now - new Date(isoDate).getTime()) / 3600000;
    if (hours < 1) return 'bg-green-100 text-green-700 border-green-200'; // 🟢 < 1h
    if (hours < 3) return 'bg-orange-100 text-orange-700 border-orange-200'; // 🟠 < 3h
    if (hours < 12) return 'bg-red-100 text-red-700 border-red-200'; // 🔴 < 12h
    return 'bg-gray-100 text-gray-700 border-gray-200'; // ⚪ > 12h
  };

  const getLevelColor = (level: StockLevel) => {
    switch (level) {
      case 'HIGH': return 'bg-green-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-orange-500';
      case 'OUT_OF_STOCK': return 'bg-red-500';
    }
  };

  const confirmStock = (id: string, newLevel: StockLevel) => {
    // Tâche 4.2: Fonctionnement dégradé hors ligne
    if (isOffline) {
      alert("Mode hors ligne: Mise à jour mise en file d'attente.");
      // On sauvegarderait dans IndexedDB ici
    }

    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, level: newLevel, lastConfirmedAt: new Date().toISOString() } : item
    ));

    if (newLevel === 'OUT_OF_STOCK') {
      alert("⚠️ Alerte envoyée à l'administrateur ! PLEINGAZ a été notifié de votre rupture de stock et vous contactera bientôt.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {isOffline && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
          <WifiOff size={20} />
          <span className="font-medium">Vous êtes hors ligne. Vos modifications seront synchronisées au retour de la connexion.</span>
        </div>
      )}

      <div className="grid gap-4">
        {inventory.map(item => (
          <div key={item.id} className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 dark:bg-neutral-950 rounded-xl flex items-center justify-center font-black text-xl text-gray-900 dark:text-white border border-gray-100 dark:border-neutral-800">
                {item.product.brand.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.product.brand} {item.product.weightKg}kg</h3>
                <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold ${getAgeColor(item.lastConfirmedAt)}`}>
                  <Clock size={12} />
                  Stock confirmé il y a {now ? Math.floor((now - new Date(item.lastConfirmedAt).getTime()) / 60000) : 0} min
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['HIGH', 'MEDIUM', 'LOW', 'OUT_OF_STOCK'] as StockLevel[]).map(level => (
                <button
                  key={level}
                  onClick={() => confirmStock(item.id, level)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2
                    ${item.level === level 
                      ? `${getLevelColor(level)} text-white shadow-md` 
                      : 'bg-gray-50 dark:bg-neutral-950 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 border border-transparent'
                    }
                  `}
                >
                  {item.level === level && <CheckCircle2 size={16} />}
                  {level === 'HIGH' ? 'BON' : level === 'MEDIUM' ? 'MOYEN' : level === 'LOW' ? 'FAIBLE' : 'RUPTURE'}
                </button>
              ))}
            </div>

            {item.level === 'OUT_OF_STOCK' && (
              <div className="w-full mt-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
                  <Info size={20} />
                  <span className="text-sm font-semibold">L'administrateur a été notifié. Vous pouvez aussi commander directement.</span>
                </div>
                <Link 
                  href="/distributor/order"
                  className="px-6 py-2.5 bg-pleingaz-red text-white font-bold rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  <ShoppingCart size={18} />
                  Commander à PLEINGAZ
                </Link>
              </div>
            )}
            
          </div>
        ))}
      </div>
    </div>
  );
}
