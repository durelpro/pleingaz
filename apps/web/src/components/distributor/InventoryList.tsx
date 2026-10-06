'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, WifiOff, CheckCircle2, Clock } from 'lucide-react';

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
  const [inventory, setInventory] = useState<InventoryItem[]>([
    // Fausses données pour démo UX
    { id: '1', product: { id: 'p1', brand: 'SCTM', weightKg: 12.5 }, level: 'HIGH', lastConfirmedAt: new Date().toISOString() },
    { id: '2', product: { id: 'p2', brand: 'Camgaz', weightKg: 12.5 }, level: 'OUT_OF_STOCK', lastConfirmedAt: new Date(Date.now() - 4 * 3600000).toISOString() }, // 4h
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

  const getAgeColor = (isoDate: string) => {
    const hours = (Date.now() - new Date(isoDate).getTime()) / 3600000;
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
                  Stock confirmé il y a {Math.floor((Date.now() - new Date(item.lastConfirmedAt).getTime()) / 60000)} min
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
            
          </div>
        ))}
      </div>
    </div>
  );
}
