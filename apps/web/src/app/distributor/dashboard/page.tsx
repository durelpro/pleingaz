'use client';

import { useState } from 'react';
import { 
  Store, Package, TrendingUp, AlertCircle, 
  MapPin, Star, Settings, FileText, ArrowRight, EyeOff, Eye
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function DistributorDashboard() {
  const [status, setStatus] = useState<'PENDING' | 'APPROVED'>('PENDING');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6 lg:p-10 relative overflow-hidden">
      {/* Premium Background Blurs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full filter blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-500/5 rounded-full filter blur-[100px] -z-10 pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8 relative z-10"
      >
        
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-12 h-12 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm flex items-center justify-center text-pleingaz-red border border-gray-100 dark:border-neutral-800">
                <Store size={24} />
              </div>
              Mon Tableau de Bord
            </h1>
            <p className="text-gray-500 mt-2 font-medium ml-1">Bienvenue sur votre espace distributeur PLEINGAZ.</p>
          </div>
          <div className="flex gap-3 items-center">
            <button 
              onClick={() => setStatus(s => s === 'PENDING' ? 'APPROVED' : 'PENDING')}
              className="px-4 py-2 text-xs font-bold bg-gray-200 dark:bg-neutral-800 rounded-xl hover:bg-gray-300 dark:hover:bg-neutral-700 transition-colors"
            >
              Basculer statut (Dev)
            </button>
            <Link href="/distributor/inventory" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pleingaz-red to-[#ff6a00] text-white font-black rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Package size={20} />
              Mettre à jour mon stock
            </Link>
          </div>
        </motion.div>

        {/* Status Banner */}
        {status === 'PENDING' && (
          <motion.div variants={itemVariants} className="bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-200 dark:border-orange-900/30 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-5 text-orange-800 dark:text-orange-400 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="w-14 h-14 bg-white dark:bg-neutral-900 shadow-sm rounded-2xl flex items-center justify-center shrink-0 border border-orange-100 dark:border-orange-900/50">
              <AlertCircle size={28} className="text-orange-500" />
            </div>
            <div className="z-10">
              <h3 className="font-black text-xl mb-1">Dossier en attente de validation</h3>
              <p className="font-medium opacity-90 leading-relaxed">
                Votre profil distributeur a bien été créé mais n'est pas encore visible par les clients. 
                L'administrateur PLEINGAZ analyse vos pièces justificatives. Vous serez notifié dès l'activation.
              </p>
            </div>
          </motion.div>
        )}

        {/* Actionable Insights */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InsightCard 
            title="Score de Fiabilité" 
            value="95/100" 
            desc="Très bien ! Continuez à mettre à jour votre stock." 
            icon={<Star />} 
            alert="GOOD"
          />
          <InsightCard 
            title="Dernière mise à jour" 
            value="Il y a 2h" 
            desc="Stock de Camgaz 12Kg déclaré." 
            icon={<AlertCircle />} 
            alert="MEDIUM"
          />
          <InsightCard 
            title="Vues de la boutique" 
            value="142" 
            desc="Recherches à proximité (7 jours)" 
            icon={<TrendingUp />} 
            alert="GOOD"
          />
        </motion.div>

        {/* Quick Access Menu */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-6">
            <h3 className="font-black text-xl text-gray-900 dark:text-white mb-6">Actions Rapides</h3>
            <div className="space-y-4">
              <Link href="/distributor/inventory" className="group flex justify-between items-center p-4 bg-gray-50 dark:bg-neutral-950 rounded-2xl hover:bg-orange-50 dark:hover:bg-orange-900/10 border border-transparent hover:border-orange-200 dark:hover:border-orange-900/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-neutral-900 rounded-xl flex items-center justify-center shadow-sm text-pleingaz-red group-hover:scale-110 transition-transform">
                    <Package size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Gestion du Stock</h4>
                    <p className="text-sm text-gray-500">Signaler vos disponibilités</p>
                  </div>
                </div>
                <ArrowRight className="text-gray-400 group-hover:text-pleingaz-red transition-colors" />
              </Link>
              
              <Link href="/distributor/documents" className="group flex justify-between items-center p-4 bg-gray-50 dark:bg-neutral-950 rounded-2xl hover:bg-orange-50 dark:hover:bg-orange-900/10 border border-transparent hover:border-orange-200 dark:hover:border-orange-900/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-neutral-900 rounded-xl flex items-center justify-center shadow-sm text-pleingaz-red group-hover:scale-110 transition-transform">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Mes Documents</h4>
                    <p className="text-sm text-gray-500">Mettre à jour vos pièces</p>
                  </div>
                </div>
                <ArrowRight className="text-gray-400 group-hover:text-pleingaz-red transition-colors" />
              </Link>

              <Link href="/distributor/location" className="group flex justify-between items-center p-4 bg-gray-50 dark:bg-neutral-950 rounded-2xl hover:bg-orange-50 dark:hover:bg-orange-900/10 border border-transparent hover:border-orange-200 dark:hover:border-orange-900/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-neutral-900 rounded-xl flex items-center justify-center shadow-sm text-pleingaz-red group-hover:scale-110 transition-transform">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Localisation</h4>
                    <p className="text-sm text-gray-500">Ajuster vos coordonnées GPS</p>
                  </div>
                </div>
                <ArrowRight className="text-gray-400 group-hover:text-pleingaz-red transition-colors" />
              </Link>
            </div>
          </div>

          <div className={`relative overflow-hidden border-2 rounded-[2rem] p-8 flex flex-col justify-center shadow-2xl transition-colors duration-500 \${status === 'APPROVED' ? 'bg-gradient-to-br from-pleingaz-red to-[#ff6a00] border-orange-400/50 shadow-orange-500/20 text-white' : 'bg-neutral-900 dark:bg-black border-neutral-800 shadow-neutral-900/40 text-white'}`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="z-10">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                {status === 'APPROVED' ? <Eye size={32} /> : <EyeOff size={32} className="text-gray-400" />}
              </div>
              <h3 className="font-black text-3xl md:text-4xl mb-4 tracking-tight">
                {status === 'APPROVED' ? 'Votre boutique est visible !' : 'Boutique invisible'}
              </h3>
              <div className="text-lg mb-8 leading-relaxed font-medium">
                {status === 'APPROVED' 
                  ? <p className="text-white/90">Les clients autour de vous peuvent vous trouver et voir vos disponibilités. Mettez à jour votre stock quotidiennement pour conserver un score de fiabilité élevé.</p>
                  : <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                      <p className="text-orange-300 font-bold flex items-center gap-2">
                        <AlertCircle size={20} />
                        En attente de validation
                      </p>
                      <p className="text-gray-300 mt-2 text-base">Votre dossier est actuellement en cours d'analyse par l'administrateur. Vous n'apparaissez pas encore sur la carte PLEINGAZ.</p>
                    </div>
                }
              </div>
              {status === 'APPROVED' && (
                <div className="p-5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 flex gap-4 items-center">
                  <div className="text-3xl">💡</div>
                  <div>
                    <p className="font-black tracking-wide uppercase text-xs text-white/80 mb-1">Astuce Pro</p>
                    <p className="text-sm text-white font-medium">
                      Une mise à jour le matin à 8h attire 3x plus de clients dans la journée.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}

function InsightCard({ title, value, desc, icon, alert }: { title: string, value: string, desc: string, icon: any, alert: 'HIGH' | 'MEDIUM' | 'GOOD' }) {
  const colors = {
    HIGH: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-600',
    MEDIUM: 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30 text-orange-600',
    GOOD: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30 text-green-600'
  };

  return (
    <div className={`p-6 rounded-3xl border ${colors[alert]} flex flex-col justify-between`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-white dark:bg-neutral-900 rounded-xl shadow-sm">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm font-bold opacity-80 mb-1">{title}</p>
        <h3 className="text-3xl font-black">{value}</h3>
        <p className="text-xs mt-2 opacity-75 font-medium">{desc}</p>
      </div>
    </div>
  );
}
