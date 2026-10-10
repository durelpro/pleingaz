'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DocumentsPage() {
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
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">Mes Documents</h1>
            <p className="text-gray-500 mt-1 font-medium">Gérez vos pièces justificatives</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-[2rem] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <div className="space-y-6">
            <div className="p-6 border border-gray-100 dark:border-neutral-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-xl flex items-center justify-center">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">Carte Nationale d'Identité</h3>
                  <p className="text-sm text-gray-500">Document validé par l'administration</p>
                </div>
              </div>
              <button className="text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Voir</button>
            </div>

            <div className="p-6 border border-gray-100 dark:border-neutral-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-xl flex items-center justify-center">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">Registre de Commerce (RCCM)</h3>
                  <p className="text-sm text-gray-500">Document validé par l'administration</p>
                </div>
              </div>
              <button className="text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Voir</button>
            </div>
            
            <label className="block border-2 border-dashed border-gray-300 dark:border-neutral-800 rounded-2xl p-8 text-center hover:border-pleingaz-red transition-colors cursor-pointer group bg-gray-50 dark:bg-neutral-950">
              <div className="w-16 h-16 bg-gray-100 dark:bg-neutral-900 text-gray-400 group-hover:text-pleingaz-red group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all">
                <UploadCloud size={24} />
              </div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Ajouter un nouveau document</p>
              <p className="text-xs text-gray-500 mt-2">JPEG, PNG ou PDF (Max 5Mo)</p>
              <input type="file" className="hidden" />
            </label>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
