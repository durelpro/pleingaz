'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Truck, CheckCircle, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="max-w-md w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-8 shadow-2xl text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
          >
            <CheckCircle size={48} />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-black text-gray-900 dark:text-white mb-2"
          >
            Commande Envoyée !
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500 mb-8 leading-relaxed"
          >
            L'administrateur PLEINGAZ a bien reçu votre demande d'approvisionnement de <strong className="text-gray-900 dark:text-gray-100">{quantity} x {brand}</strong>. 
            Vous serez contacté très prochainement pour finaliser la livraison.
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link 
              href="/distributor/dashboard"
              className="block w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-lg rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
            >
              Retour au tableau de bord
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6 lg:p-10">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link href="/distributor/inventory" className="inline-flex items-center gap-2 text-gray-500 hover:text-pleingaz-red transition-colors font-semibold mb-6">
            <ArrowLeft size={20} />
            Retour au stock
          </Link>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-pleingaz-red rounded-xl flex items-center justify-center">
            <ShoppingCart size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">Commander à PLEINGAZ</h1>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          onSubmit={handleOrder} 
          className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-[2rem] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8"
        >
          
          <div className="space-y-6">
            <h3 className="font-black text-xl flex items-center gap-2 border-b border-gray-100 dark:border-neutral-800 pb-4">
              <Package className="text-pleingaz-red" /> 
              Détails de la commande
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 group">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Marque & Produit</label>
                <div className="relative">
                  <select 
                    className="w-full p-4 rounded-xl border-2 border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:border-pleingaz-red focus:ring-0 outline-none transition-all font-bold appearance-none hover:bg-white dark:hover:bg-neutral-900"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  >
                    <option value="Camgaz 12.5Kg">Camgaz 12.5Kg</option>
                    <option value="SCTM 12.5Kg">SCTM 12.5Kg</option>
                    <option value="Tradex 12.5Kg">Tradex 12.5Kg</option>
                    <option value="Bocom 12.5Kg">Bocom 12.5Kg</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-pleingaz-red transition-colors">
                    ▼
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Quantité (Bouteilles)</label>
                <input 
                  type="number"
                  min="1"
                  className="w-full p-4 rounded-xl border-2 border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:border-pleingaz-red focus:ring-0 outline-none transition-all font-bold hover:bg-white dark:hover:bg-neutral-900"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 border border-orange-100 dark:border-orange-900/30 p-5 rounded-2xl flex gap-4 text-orange-800 dark:text-orange-300"
          >
            <div className="w-10 h-10 bg-white dark:bg-neutral-900 rounded-full flex items-center justify-center shrink-0 shadow-sm text-pleingaz-red">
              <Truck size={20} />
            </div>
            <p className="text-sm font-medium leading-relaxed pt-1">
              Les frais et délais de livraison dépendent de votre localisation. PLEINGAZ vous contactera pour valider les modalités exactes après soumission de cette commande.
            </p>
          </motion.div>

          <button 
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-pleingaz-red to-[#ff6a00] text-white font-black text-lg rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Confirmer la commande
          </button>
        </motion.form>

      </div>
    </div>
  );
}
