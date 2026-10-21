'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, WifiOff, CheckCircle2, Clock, CheckCheck, Sparkles } from 'lucide-react';

export type StockLevel = 'BON' | 'MOYEN' | 'FAIBLE' | 'RUPTURE';

interface Product {
  id: string;
  name: string;
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
  const [quickConfirmSuccess, setQuickConfirmSuccess] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: '1', product: { id: 'p1', name: 'Bouteille de gaz 12,5 kg', weightKg: 12.5 }, level: 'BON', lastConfirmedAt: '2026-10-19T12:00:00.000Z' },
    { id: '2', product: { id: 'p2', name: 'Bouteille de gaz 6 kg', weightKg: 6 }, level: 'MOYEN', lastConfirmedAt: '2026-10-19T11:30:00.000Z' },
    { id: '3', product: { id: 'p3', name: 'Bouteille de gaz 50 kg', weightKg: 50 }, level: 'BON', lastConfirmedAt: '2026-10-19T10:00:00.000Z' },
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
    if (hours < 1) return 'bg-emerald-100 text-emerald-800 border-emerald-200'; // 🟢 < 1h
    if (hours < 3) return 'bg-amber-100 text-amber-800 border-amber-200'; // 🟠 < 3h
    if (hours < 12) return 'bg-rose-100 text-rose-800 border-rose-200'; // 🔴 < 12h
    return 'bg-gray-100 text-gray-700 border-gray-200'; // ⚪ > 12h
  };

  const getLevelColor = (level: StockLevel) => {
    switch (level) {
      case 'BON': return 'bg-emerald-600 hover:bg-emerald-700';
      case 'MOYEN': return 'bg-amber-500 hover:bg-amber-600';
      case 'FAIBLE': return 'bg-orange-500 hover:bg-orange-600';
      case 'RUPTURE': return 'bg-rose-600 hover:bg-rose-700';
    }
  };

  const confirmStock = (id: string, newLevel: StockLevel) => {
    if (isOffline) {
      alert("Mode hors ligne: Mise à jour mise en file d'attente.");
    }
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, level: newLevel, lastConfirmedAt: new Date().toISOString() } : item
    ));
  };

  const handleQuickConfirmAll = () => {
    const nowIso = new Date().toISOString();
    setInventory(prev => prev.map(item => ({ ...item, lastConfirmedAt: nowIso })));
    setQuickConfirmSuccess(true);
    setTimeout(() => setQuickConfirmSuccess(false), 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {isOffline && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
          <WifiOff size={20} />
          <span className="font-medium">Vous êtes hors ligne. Vos modifications seront synchronisées au retour de la connexion.</span>
        </div>
      )}

      {/* Bouton 1-clic D-03 */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <Sparkles size={22} className="text-yellow-300" />
            Confirmation Rapide (D-03)
          </h2>
          <p className="text-red-100 text-sm mt-1">
            Vos stocks sont-ils conformes à ce qui est affiché ? Cliquez pour réactualiser l'horodatage en 1 seconde.
          </p>
        </div>
        <button
          onClick={handleQuickConfirmAll}
          className={`px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95 ${
            quickConfirmSuccess 
              ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
              : 'bg-white text-pleingaz-red hover:bg-gray-50 shadow-black/10'
          }`}
        >
          {quickConfirmSuccess ? (
            <>
              <CheckCheck size={20} />
              Stocks Confirmés !
            </>
          ) : (
            <>
              <RefreshCw size={20} />
              Confirmer tout mon stock
            </>
          )}
        </button>
      </div>

      <div className="grid gap-4">
        {inventory.map(item => (
          <div key={item.id} className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-50 dark:bg-red-950/40 text-pleingaz-red rounded-2xl flex items-center justify-center font-black text-lg border border-red-100 dark:border-red-900/40">
                PG
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-red-100 text-pleingaz-red text-xs font-black rounded uppercase">PLEINGAZ Officiel</span>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.product.weightKg} kg</h3>
                </div>
                <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold ${getAgeColor(item.lastConfirmedAt)}`}>
                  <Clock size={12} />
                  Confirmé il y a {now ? Math.floor((now - new Date(item.lastConfirmedAt).getTime()) / 60000) : 0} min
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['BON', 'MOYEN', 'FAIBLE', 'RUPTURE'] as StockLevel[]).map(level => (
                <button
                  key={level}
                  onClick={() => confirmStock(item.id, level)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2
                    ${item.level === level 
                      ? `${getLevelColor(level)} text-white shadow-md` 
                      : 'bg-gray-50 dark:bg-neutral-950 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800'
                    }
                  `}
                >
                  {item.level === level && <CheckCircle2 size={16} />}
                  {level}
                </button>
              ))}
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
