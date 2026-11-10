'use client';

import React, { useState, useEffect } from 'react';
import { 
  Flame, PhoneCall, ArrowRight, ShieldCheck, 
  MapPin, Clock, RotateCcw, AlertTriangle, 
  ShoppingBag, HelpCircle, FileText, CheckCircle2, 
  Sparkles, Bell
} from 'lucide-react';
import Link from 'next/link';
import { InfoNoticesDrawer } from '@/components/common/InfoNoticesDrawer';
import { QuotaGauge } from '@/components/cr003';

export default function EspaceAcheteurPage() {
  // Quota légal 5 bouteilles / 30 jours glissants (D-14)
  const [quota, setQuota] = useState({
    limit: 5,
    used: 1,
    remaining: 4,
    earliestReleaseDate: '26 novembre 2026',
  });

  const [emergencyModal, setEmergencyModal] = useState(false);
  const [reorderSuccess, setReorderSuccess] = useState(false);

  const handleQuickReorder = () => {
    setReorderSuccess(true);
    setTimeout(() => setReorderSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      
      {/* 1. Navigation Acheteur (5 entrées exclusives conforme T4) */}
      <header className="sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-xl border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E51A24] to-[#c7101a] flex items-center justify-center text-white shadow-md shadow-red-500/20">
              <Flame size={20} className="fill-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-white">
              PLEIN<span className="text-[#E51A24]">GAZ</span>
            </span>
          </Link>

          {/* 5 Entrées sans aucun mot interdit */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-neutral-300">
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            <Link href="/stores" className="hover:text-[#E51A24] transition-colors flex items-center gap-1">
              <MapPin size={14} className="text-[#E51A24]" />
              <span>Trouver du Gaz</span>
            </Link>
            <Link href="/checkout" className="hover:text-white transition-colors flex items-center gap-1">
              <ShoppingBag size={14} />
              <span>Mes Commandes</span>
            </Link>
            <Link href="/support" className="hover:text-white transition-colors flex items-center gap-1">
              <HelpCircle size={14} />
              <span>Aide & Sécurité</span>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <InfoNoticesDrawer role="CUSTOMER" city="Douala" />
            
            <button
              onClick={() => setEmergencyModal(true)}
              className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all animate-pulse"
            >
              <AlertTriangle size={14} />
              <span>Urgence Gaz</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Toast réassort 1-clic */}
        {reorderSuccess && (
          <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 px-4 py-3 rounded-2xl flex items-center gap-3 animate-fade-in">
            <CheckCircle2 size={20} className="text-emerald-400" />
            <div className="text-xs">
              <strong>Demande de réassort transmise !</strong> Votre commande habituelle de bouteille 12.5 kg (6 500 FCFA) est en cours de préparation auprès de votre point habituel.
            </div>
          </div>
        )}

        {/* Hero : Bouton d'action central "J'ai besoin de gaz" + Jauge Quota */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Carte Action Rapide */}
          <div className="md:col-span-2 bg-gradient-to-br from-neutral-900 via-neutral-900 to-[#E51A24]/15 border border-neutral-800 p-6 rounded-3xl space-y-6 flex flex-col justify-between shadow-xl">
            <div>
              <span className="text-xs bg-[#E51A24]/20 text-red-300 px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-[#E51A24]/30">
                Gaz Garanti au Prix Homologué
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-3 leading-tight">
                Besoin d’une recharge de gaz en urgence ?
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-xl leading-relaxed">
                Trouvez les points de distribution approvisionnés en direct au prix officiel subventionné de <strong>6 500 FCFA</strong> (bouteille standard 12.5 kg).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/stores"
                className="px-6 py-3.5 bg-gradient-to-r from-[#E51A24] to-[#b30e17] hover:from-red-600 hover:to-red-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-600/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
              >
                <span>J’AI BESOIN DE GAZ MAINTENANT</span>
                <ArrowRight size={18} />
              </Link>
              
              <button
                onClick={handleQuickReorder}
                className="px-5 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-2xl border border-neutral-700 flex items-center gap-2 transition-all"
              >
                <RotateCcw size={16} className="text-amber-400" />
                <span>Réassort 1-clic (6 500 F)</span>
              </button>
            </div>
          </div>

          {/* Jauge Quota 5 Bouteilles / 30 Jours Officielle (D-14) */}
          <div className="flex flex-col justify-between">
            <QuotaGauge
              consumed={quota.used}
              limit={quota.limit}
              remaining={quota.remaining}
              onOrderClick={() => {}}
            />
          </div>

        </div>

        {/* Section 2 : Mes Points Habituels & Fraîcheur du Stock */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <MapPin size={18} className="text-[#E51A24]" />
                Mon Point de Vente Habituel
              </h2>
              <p className="text-xs text-neutral-400">Dernier lieu d’achat et disponibilité en direct</p>
            </div>
            <Link href="/stores" className="text-xs text-[#E51A24] font-bold hover:underline flex items-center gap-1">
              Voir les 71 points agréés <ArrowRight size={14} />
            </Link>
          </div>

          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Boutique Officielle PLEINGAZ (Siège Akwa)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Stock BON
                </span>
              </div>
              <p className="text-xs text-neutral-400">Boulevard de la Liberté, face Immeuble Infotech S.A. • Douala</p>
              <div className="flex items-center gap-4 text-[11px] text-neutral-500 pt-1">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Clock size={12} /> Confirmé il y a 10 min
                </span>
                <span>Prix : 6 500 FCFA</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href="tel:118"
                className="flex-1 sm:flex-none px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl border border-neutral-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <PhoneCall size={14} />
                <span>Appeler</span>
              </a>
              <Link
                href="/checkout"
                className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-[#E51A24] to-[#b30e17] text-white text-xs font-black rounded-xl shadow-md shadow-red-600/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Commander</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

      </main>

      {/* Modal Urgence Fuite de Gaz (118 / 18) */}
      {emergencyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-red-500/50 max-w-md w-full rounded-3xl p-6 space-y-5 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">Consignes d’Urgence Fuite de Gaz</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                1. <strong>N’allumez aucun interrupteur</strong> ni flamme vive.<br />
                2. Fermez le robinet du détendeur immédiatement.<br />
                3. Aérez largement en ouvrant toutes les fenêtres.<br />
                4. Évacuez les lieux et appelez les secours.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href="tel:118"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/40"
              >
                <PhoneCall size={18} />
                <span>Appeler les Sapeurs-Pompiers (118 / 18)</span>
              </a>
              
              <button
                onClick={() => setEmergencyModal(false)}
                className="w-full py-2.5 bg-neutral-900 text-neutral-400 hover:text-white font-bold text-xs rounded-xl"
              >
                J’ai compris et sécurisé les lieux
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
