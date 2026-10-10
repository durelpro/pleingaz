'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Truck, CheckCircle, Package } from 'lucide-react';

export default function DistributorOrderPage() {
  const [ordered, setOrdered] = useState(false);
  const [quantity, setQuantity] = useState(10);
  const [brand, setBrand] = useState('Camgaz 12.5Kg');

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrdered(true);
  };

  if (ordered) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-8 shadow-xl text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Commande Envoyée !</h1>
          <p className="text-gray-500 mb-6">
            L'administrateur PLEINGAZ a reçu votre commande de <strong>{quantity} x {brand}</strong>. 
            Vous serez contacté très prochainement pour la livraison.
          </p>
          <Link 
            href="/distributor/dashboard"
            className="block w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6 lg:p-10">
      <div className="max-w-3xl mx-auto">
        <Link href="/distributor/inventory" className="inline-flex items-center gap-2 text-gray-500 hover:text-pleingaz-red transition-colors font-semibold mb-6">
          <ArrowLeft size={20} />
          Retour au stock
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="text-pleingaz-red" size={32} />
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Commander à PLEINGAZ</h1>
        </div>

        <form onSubmit={handleOrder} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-6 lg:p-10 shadow-sm space-y-8">
          
          <div className="space-y-4">
            <h3 className="font-bold text-xl flex items-center gap-2"><Package className="text-gray-400" /> Détails de la commande</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Marque & Produit</label>
                <select 
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-pleingaz-red outline-none transition-all font-bold"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                >
                  <option value="Camgaz 12.5Kg">Camgaz 12.5Kg</option>
                  <option value="SCTM 12.5Kg">SCTM 12.5Kg</option>
                  <option value="Tradex 12.5Kg">Tradex 12.5Kg</option>
                  <option value="Bocom 12.5Kg">Bocom 12.5Kg</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantité (Bouteilles)</label>
                <input 
                  type="number"
                  min="1"
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-pleingaz-red outline-none transition-all font-bold"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 p-4 rounded-xl flex gap-3 text-orange-800 dark:text-orange-400">
            <Truck className="shrink-0" />
            <p className="text-sm font-medium">Les frais et délais de livraison dépendent de votre localisation. PLEINGAZ vous contactera pour valider les modalités exactes après soumission de cette commande.</p>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-pleingaz-red to-[#ff6a00] text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all"
          >
            Confirmer la commande
          </button>
        </form>

      </div>
    </div>
  );
}
