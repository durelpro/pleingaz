'use client';

import { useState } from 'react';
import {
  Truck,
  CheckCircle2,
  PackageSearch,
  PackageOpen,
  Download,
  ShieldCheck,
  AlertTriangle,
  User,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function DeliveryTracker() {
  const [activeRole, setActiveRole] = useState<'COURIER' | 'CUSTOMER'>('COURIER');
  const [courierDelivered, setCourierDelivered] = useState(false);
  const [customerReceived, setCustomerReceived] = useState(false);
  const [disputeTriggered, setDisputeTriggered] = useState(false);

  const isFullyDelivered = courierDelivered && customerReceived;

  return (
    <div className="min-h-screen bg-neutral-950 text-white py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Header & Switch de Perspective (D-17 Démonstrateur) */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-950/80 border border-red-800 text-red-300 uppercase tracking-wider">
            <Truck size={14} className="text-red-500" />
            Double Confirmation Contradictoire (D-17)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Suivi Mission & Livraison
          </h1>
          <p className="text-xs text-neutral-400">
            Forfait fixe PLEINGAZ : <strong>1 000 FCFA</strong> • Commande #ORD-20261030-99F2
          </p>

          {/* Toggle Rôle Démonstrateur */}
          <div className="inline-flex p-1 bg-neutral-900 border border-neutral-800 rounded-2xl mt-2">
            <button
              onClick={() => setActiveRole('COURIER')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeRole === 'COURIER'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Vue Livreur (Paul M.) 🛵
            </button>
            <button
              onClick={() => setActiveRole('CUSTOMER')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeRole === 'CUSTOMER'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Vue Client (Marie T.) 👤
            </button>
          </div>
        </div>

        {/* Détails de la mission */}
        <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">
              Course en cours
            </span>
            <span className="text-xs font-bold text-amber-400">
              Tarif Livraison : 1 000 FCFA (Fixe D-17)
            </span>
          </div>

          <div className="border-t border-neutral-800 pt-2 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-white">1x Bouteille 12.5 kg PLEINGAZ</div>
              <div className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                <MapPin size={13} className="text-red-500" />
                <span>Akwa Nord, face pharmacie du rail</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-white font-mono">7 500 F</span>
              <span className="text-[10px] text-neutral-500 block">Total TTC</span>
            </div>
          </div>

          {/* Coordonnées Client : Masquage après livraison (D-11 / RGPD) */}
          <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 text-xs">
            <div className="text-neutral-400 font-bold mb-1">Destinataire :</div>
            {isFullyDelivered ? (
              <span className="text-neutral-500 italic">
                🔒 Coordonnées masquées après livraison clôturée (Protection vie privée).
              </span>
            ) : (
              <div className="flex items-center justify-between">
                <span>Marie Tchouassi</span>
                <span className="text-neutral-400 font-mono">+237 699 123 456</span>
              </div>
            )}
          </div>
        </div>

        {/* ÉTATS DE LA DOUBLE VALIDATION */}
        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-6">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            Statut des Validations Contradictoires
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Statut Livreur */}
            <div className={`p-4 rounded-2xl border text-center space-y-2 transition-all ${
              courierDelivered
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400'
            }`}>
              <div className="text-xs font-bold">1. Validation Livreur</div>
              <div className="text-2xl">
                {courierDelivered ? '✅' : '⏳'}
              </div>
              <span className="text-[11px] block font-semibold">
                {courierDelivered ? 'Bouteille déposée' : 'En attente clic livreur'}
              </span>
            </div>

            {/* Statut Client */}
            <div className={`p-4 rounded-2xl border text-center space-y-2 transition-all ${
              customerReceived
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400'
            }`}>
              <div className="text-xs font-bold">2. Validation Client</div>
              <div className="text-2xl">
                {customerReceived ? '✅' : '⏳'}
              </div>
              <span className="text-[11px] block font-semibold">
                {customerReceived ? 'Réception confirmée' : 'En attente clic client'}
              </span>
            </div>
          </div>

          {/* Action selon le rôle actif */}
          {activeRole === 'COURIER' && (
            <div className="pt-2">
              {!courierDelivered ? (
                <button
                  onClick={() => setCourierDelivered(true)}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
                >
                  <CheckCircle2 size={18} />
                  <span>J'ai remis la bouteille au client</span>
                </button>
              ) : (
                <div className="text-center p-3 bg-neutral-950 rounded-2xl text-xs text-neutral-400 border border-neutral-800">
                  Votre confirmation est enregistrée. En attente de la validation du client pour débloquer votre solde de course (+1 000 F).
                </div>
              )}
            </div>
          )}

          {activeRole === 'CUSTOMER' && (
            <div className="pt-2 space-y-3">
              {!customerReceived ? (
                <div className="space-y-2">
                  <button
                    onClick={() => setCustomerReceived(true)}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
                  >
                    <CheckCircle2 size={18} />
                    <span>J'ai bien reçu ma bouteille (Plombage intact)</span>
                  </button>

                  <button
                    onClick={() => setDisputeTriggered(true)}
                    className="w-full py-2.5 text-xs text-red-400 hover:text-red-300 transition font-bold"
                  >
                    Signaler un litige / Bouteille non conforme
                  </button>
                </div>
              ) : (
                <div className="text-center p-3 bg-neutral-950 rounded-2xl text-xs text-neutral-400 border border-neutral-800">
                  Vous avez validé la bonne réception de votre bouteille. Reçu transmis sur votre WhatsApp.
                </div>
              )}
            </div>
          )}

          {/* Bannière de Clôture Totale */}
          {isFullyDelivered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 bg-gradient-to-r from-emerald-950 to-neutral-900 border border-emerald-500/50 rounded-2xl text-center space-y-2 shadow-xl"
            >
              <div className="inline-flex items-center gap-2 text-emerald-400 font-black text-base">
                <CheckCircle2 size={20} />
                <span>Mission Clôturée à 100% (DELIVERED)</span>
              </div>
              <p className="text-xs text-neutral-300">
                Écritures comptables générées dans le Grand Livre. Reversement de 1 000 FCFA crédité au livreur.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => alert('Téléchargement de la facture officielle PLEINGAZ PDF (Conforme D-06)...')}
                  className="px-4 py-2 bg-white text-neutral-900 font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 mx-auto hover:bg-neutral-100 transition"
                >
                  <Download size={14} />
                  <span>Télécharger la facture PDF</span>
                </button>
              </div>
            </motion.div>
          )}

          {disputeTriggered && (
            <div className="p-4 bg-red-950/60 border border-red-700/60 rounded-2xl text-xs text-red-200 flex items-start gap-2">
              <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-red-300 font-bold mb-0.5">Dossier de litige ouvert :</strong>
                La course est suspendue. Un superviseur logistique PLEINGAZ contacte le client et le livreur dans les 10 minutes.
              </div>
            </div>
          )}
        </div>

        {/* Footer retour */}
        <div className="text-center pt-4">
          <Link href="/account" className="text-xs text-neutral-500 hover:text-white transition">
            ← Revenir au tableau de bord
          </Link>
        </div>

      </div>
    </div>
  );
}
