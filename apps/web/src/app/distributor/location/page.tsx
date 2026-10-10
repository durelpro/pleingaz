'use client';

import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/map/MapPicker'), { ssr: false, loading: () => <div className="h-64 bg-gray-100 dark:bg-neutral-800 animate-pulse rounded-xl" /> });

export default function LocationPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6 lg:p-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link href="/distributor/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-pleingaz-red transition-colors font-semibold mb-2">
            <ArrowLeft size={20} />
            Retour au tableau de bord
          </Link>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 text-pleingaz-red rounded-2xl flex items-center justify-center">
            <MapPin size={28} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">Localisation</h1>
            <p className="text-gray-500 mt-1 font-medium">Ajustez vos coordonnées GPS</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-[2rem] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <div className="space-y-6">
            <div className="h-[400px] rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-inner">
              <MapPicker onChange={() => {}} />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Repère textuel précis</label>
              <input 
                type="text" 
                className="w-full p-4 rounded-xl border-2 border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:border-pleingaz-red focus:ring-0 outline-none transition-all font-bold"
                defaultValue="Boutique face à la pharmacie"
              />
            </div>
            
            <button className="w-full py-4 bg-gradient-to-r from-pleingaz-red to-[#ff6a00] text-white font-black text-lg rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Mettre à jour ma position
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
