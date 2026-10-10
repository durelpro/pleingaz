'use client';

import { useState } from 'react';
import { 
  Store, Package, TrendingUp, AlertCircle, 
  MapPin, Star, Settings, FileText, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function DistributorDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <Store className="text-pleingaz-red" size={32} />
              Mon Tableau de Bord
            </h1>
            <p className="text-gray-500 mt-2">Bienvenue sur votre espace distributeur PLEINGAZ.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/distributor/inventory" className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pleingaz-red to-[#ff6a00] text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all">
              <Package size={18} />
              Mettre à jour mon stock
            </Link>
          </div>
        </div>

        {/* Actionable Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>

        {/* Quick Access Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              
              <Link href="#" className="group flex justify-between items-center p-4 bg-gray-50 dark:bg-neutral-950 rounded-2xl hover:bg-orange-50 dark:hover:bg-orange-900/10 border border-transparent hover:border-orange-200 dark:hover:border-orange-900/30 transition-all">
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

              <Link href="#" className="group flex justify-between items-center p-4 bg-gray-50 dark:bg-neutral-950 rounded-2xl hover:bg-orange-50 dark:hover:bg-orange-900/10 border border-transparent hover:border-orange-200 dark:hover:border-orange-900/30 transition-all">
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

          <div className="bg-gradient-to-br from-pleingaz-red to-red-600 border border-red-500 rounded-3xl p-8 text-white shadow-lg shadow-orange-500/20 flex flex-col justify-center">
            <h3 className="font-black text-3xl mb-4">Votre boutique est visible !</h3>
            <p className="text-white/90 text-lg mb-6 leading-relaxed">
              Les clients autour de vous peuvent vous trouver et voir vos disponibilités. 
              Mettez à jour votre stock quotidiennement pour conserver un score de fiabilité élevé.
            </p>
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <p className="font-bold">Astuce Pro 💡</p>
              <p className="text-sm text-white/80 mt-1">
                Une mise à jour le matin à 8h attire 3x plus de clients dans la journée.
              </p>
            </div>
          </div>
        </div>

      </div>
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
