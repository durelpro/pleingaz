'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Flame,
  ShoppingBag,
  Store,
  MapPin,
  Clock,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  X,
  AlertTriangle,
} from 'lucide-react';
import { QuotaGauge } from '@/components/cr003/QuotaGauge';
import { InfoNoticeBanner } from '@/components/cr003/InfoNoticeBanner';

export default function AcheteurDashboardPage() {
  // État du quota acheteur (fenêtre glissante 30 jours)
  const [quotaData, setQuotaData] = useState({
    consumed: 1,
    limit: 5,
    remaining: 4,
  });

  // Profil et distributeur habituel
  const [favoriteStore, setFavoriteStore] = useState({
    name: 'Dépôt Gaz Akwa Central',
    city: 'Douala',
    neighborhood: 'Akwa (Rond-Point)',
    stockStatus: 'DISPONIBLE',
    closingHour: '20h00',
    distance: '850 m',
  });

  // Modal d'urgence sécurité (D-14.7)
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Simulation commande 1-clic
  const handleExpressOrder = () => {
    if (quotaData.remaining <= 0) return;
    setOrderSuccess(true);
    setQuotaData((prev) => ({
      ...prev,
      consumed: prev.consumed + 1,
      remaining: prev.remaining - 1,
    }));
    setTimeout(() => setOrderSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Bannière d'annonces ciblées D-18 */}
      <InfoNoticeBanner
        id="notice-officielle-prix"
        title="Tarification Homologuée Garantée"
        content="La recharge de 12.5 kg PLEINGAZ reste strictement fixée au tarif homologué de 6 500 FCFA. Signalez tout dépassement."
        category="INFO"
        requiresAck={false}
      />

      {/* Message de confirmation de commande express */}
      {orderSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-sm flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold">Commande express confirmée !</p>
              <p className="text-xs text-emerald-300">
                Votre bouteille 12.5 kg est en cours de préparation au {favoriteStore.name}.
              </p>
            </div>
          </div>
          <Link
            href="/acheteur/commandes"
            className="text-xs font-bold underline underline-offset-2 hover:text-white"
          >
            Suivre
          </Link>
        </div>
      )}

      {/* 2. Jauge de quota mensuel D-14.2 & Commande express 1-clic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne Gauche : Jauge de quota */}
        <div className="lg:col-span-2">
          <QuotaGauge
            consumed={quotaData.consumed}
            limit={quotaData.limit}
            remaining={quotaData.remaining}
            onOrderClick={handleExpressOrder}
          />
        </div>

        {/* Colonne Droite : Commande Express 1-Clic (C-01) */}
        <div className="glass-panel rounded-2xl p-5 border border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600/10 text-red-400 border border-red-600/20">
                <Sparkles className="w-3 h-3" />
                Commande 1-Clic
              </span>
              <span className="text-xs font-bold text-neutral-400">Habituelle</span>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-neutral-900 p-1 border border-neutral-800 shrink-0">
                <Image
                  src="/products/bouteille-pleingaz-12-5kg.jpg"
                  alt="Bouteille 12.5 kg"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Recharge Gaz 12.5 kg</h4>
                <p className="text-xs text-red-400 font-extrabold">6 500 FCFA</p>
              </div>
            </div>

            <div className="text-[11px] text-neutral-400 space-y-1 mb-4 pt-2 border-t border-neutral-900">
              <p className="flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-neutral-500" />
                <span>{favoriteStore.name}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                <span>Livraison : Bonapriso (Quartier habituel)</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleExpressOrder}
            disabled={quotaData.remaining <= 0}
            className="tap-target w-full rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs transition-all shadow-lg shadow-red-600/30 disabled:opacity-40"
          >
            {quotaData.remaining > 0
              ? 'Répéter ma commande en 1 clic'
              : 'Plafond atteint ce mois'}
          </button>
        </div>
      </div>

      {/* 3. Distributeur habituel & Statut de stock en direct (D-14.4) */}
      <div className="glass-panel rounded-2xl p-6 border border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-red-500" />
              <span>Votre Distributeur Habituel</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Point de vente agréé le plus proche de votre adresse de référence.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Stock Qualitatif : BON
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-900 text-xs">
          <div>
            <span className="text-neutral-500 block mb-0.5">Emplacement</span>
            <span className="text-white font-medium">{favoriteStore.name} ({favoriteStore.neighborhood})</span>
          </div>
          <div>
            <span className="text-neutral-500 block mb-0.5">Horaires & Retrait</span>
            <span className="text-white font-medium">Ouvert aujourd'hui jusqu'à {favoriteStore.closingHour}</span>
          </div>
          <div>
            <span className="text-neutral-500 block mb-0.5">Distance estimée</span>
            <span className="text-white font-medium">{favoriteStore.distance} de chez vous</span>
          </div>
        </div>
      </div>

      {/* 4. Bouton d'urgence sécurité d'urgence D-14.7 */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-neutral-900 to-red-950/40 border border-red-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Sécurité Domestique Immédiate</h4>
            <p className="text-xs text-neutral-400">
              Odeur suspecte de gaz ? Suivez les consignes vitales en un clic.
            </p>
          </div>
        </div>

        <button
          onClick={() => setEmergencyModalOpen(true)}
          className="tap-target px-4 py-2.5 rounded-xl bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white font-semibold text-xs border border-red-600/40 transition-colors self-start sm:self-auto"
        >
          Odeur suspecte / Que faire ?
        </button>
      </div>

      {/* Modal interactif de sécurité d'urgence */}
      {emergencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-red-600/40 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2 text-red-400 font-bold text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>Consignes Vitales Anti-Fuite</span>
              </div>
              <button
                onClick={() => setEmergencyModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-neutral-200">
              <p className="font-semibold text-amber-300">
                1. FERMER IMMÉDIATEMENT le détendeur rouge sur la tête de la bouteille.
              </p>
              <p>
                2. N'ACTIONNER AUCUN INTERRUPTEUR électrique (ne pas allumer ni éteindre la lumière).
              </p>
              <p>
                3. OUVRIR PORTES ET FENÊTRES en grand pour ventiler la pièce vers l'extérieur.
              </p>
              <p>
                4. NE JAMAIS UTILISER DE BRIQUET pour chercher l'origine d'une fuite.
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex gap-3">
              <a
                href="tel:118"
                className="tap-target flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Pompiers (118)</span>
              </a>
              <button
                onClick={() => setEmergencyModalOpen(false)}
                className="tap-target px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
