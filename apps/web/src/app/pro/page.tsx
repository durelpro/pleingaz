'use client';

import React from 'react';
import { Store, Truck, ArrowRight, ShieldCheck, Flame, UserCheck, Shield } from 'lucide-react';
import Link from 'next/link';

export default function EspaceProfessionnelPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      
      {/* Header Neutre */}
      <header className="border-b border-neutral-800 bg-neutral-900/80 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E51A24] to-[#b30e17] flex items-center justify-center text-white">
            <Flame size={20} className="fill-white" />
          </div>
          <span className="font-black text-xl text-white">
            PLEIN<span className="text-[#E51A24]">GAZ</span>
          </span>
        </Link>
        <Link href="/" className="text-xs text-neutral-400 hover:text-white font-bold transition-colors">
          Retour au site public
        </Link>
      </header>

      {/* Main Portails Partenaires */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col justify-center space-y-8">
        
        <div className="text-center space-y-2">
          <span className="text-xs bg-neutral-800 text-neutral-300 px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-neutral-700">
            Portails Professionnels & Partenaires Agréés
          </span>
          <h1 className="text-3xl font-black text-white">
            Accès Professionnel Sécurisé
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
            Sélectionnez votre portail métier pour gérer vos activités agréées sur le réseau PLEINGAZ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* Portail Distributeur */}
          <Link
            href="/distributor/inventory"
            className="group bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 p-6 rounded-3xl space-y-4 transition-all shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Store size={26} />
              </div>
              <h2 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                Point de Vente & Dépôt
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Mise à jour rapide des stocks qualitatifs en un geste (BON / RUPTURE), vente au comptoir et suivi des réassorts.
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs font-bold text-amber-400">
              <span>Accéder au Portail Distributeur</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Portail Livreur */}
          <Link
            href="/delivery"
            className="group bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 p-6 rounded-3xl space-y-4 transition-all shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Truck size={26} />
              </div>
              <h2 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors">
                Livreur & Flotte Urbaine
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Courses assignées en temps réel, repères visuels géographiques, saisie du code secret client à 4 chiffres et suivi des espèces.
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Accéder à l'Application Livreur</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>

        {/* Liens Collaborateurs Staff discrets en bas */}
        <div className="pt-6 border-t border-neutral-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500">
          <Link href="/gestionnaire" className="hover:text-neutral-300 flex items-center gap-1.5 transition-colors">
            <UserCheck size={14} className="text-amber-500/70" />
            <span>Gestionnaire de Compte</span>
          </Link>
          <span className="text-neutral-700">•</span>
          <Link href="/admin/dashboard" className="hover:text-neutral-300 flex items-center gap-1.5 transition-colors">
            <Shield size={14} className="text-red-500/70" />
            <span>Control Center Administrateur</span>
          </Link>
        </div>

      </main>

      <footer className="py-6 border-t border-neutral-900 text-center text-xs text-neutral-600">
        © 2026 PLEINGAZ S.A. — Accès réservé aux partenaires contractuels.
      </footer>
    </div>
  );
}
