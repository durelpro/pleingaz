'use client';

import React, { useState } from 'react';

interface DoubleConfirmationCardProps {
  deliveryId: string;
  orderNumber: string;
  courierName?: string;
  status: 'IN_TRANSIT' | 'DELIVERED_PENDING_CONFIRMATION' | 'DELIVERED' | 'DISPUTED' | string;
  courierConfirmedAt?: Date | string;
  isCourierView?: boolean;
  onCourierMarkDelivered?: () => Promise<void>;
  onCustomerConfirmReceived?: () => Promise<void>;
  onCustomerDispute?: (reason: string) => Promise<void>;
}

export const DoubleConfirmationCard: React.FC<DoubleConfirmationCardProps> = ({
  deliveryId,
  orderNumber,
  courierName = 'Livreur Partenaire PLEINGAZ',
  status,
  courierConfirmedAt,
  isCourierView = false,
  onCourierMarkDelivered,
  onCustomerConfirmReceived,
  onCustomerDispute,
}) => {
  const [loading, setLoading] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  const handleCourierAction = async () => {
    if (!onCourierMarkDelivered) return;
    setLoading(true);
    try {
      await onCourierMarkDelivered();
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerConfirm = async () => {
    if (!onCustomerConfirmReceived) return;
    setLoading(true);
    try {
      await onCustomerConfirmReceived();
    } finally {
      setLoading(false);
    }
  };

  const submitDispute = async () => {
    if (!onCustomerDispute || !disputeReason.trim()) return;
    setLoading(true);
    try {
      await onCustomerDispute(disputeReason);
      setShowDisputeModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-neutral-900/90 to-neutral-950/90 p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div>
          <span className="text-xs font-semibold text-neutral-400">COMMANDE {orderNumber}</span>
          <h4 className="text-sm font-bold text-white">{courierName}</h4>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            status === 'DELIVERED'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : status === 'DELIVERED_PENDING_CONFIRMATION'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : status === 'DISPUTED'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          }`}
        >
          {status === 'DELIVERED'
            ? '✅ Livrée & Validée'
            : status === 'DELIVERED_PENDING_CONFIRMATION'
            ? '⏳ En attente validation client'
            : status === 'DISPUTED'
            ? '⚠️ Litige en cours'
            : '🚴 En cours de livraison'}
        </span>
      </div>

      {/* Contenu selon le rôle */}
      <div className="py-4">
        {isCourierView ? (
          /* Vue Livreur */
          <div>
            {status === 'IN_TRANSIT' && (
              <button
                disabled={loading}
                onClick={handleCourierAction}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-emerald-950/40 transition-all hover:scale-[0.99] active:scale-[0.97]"
              >
                {loading ? 'Validation en cours...' : '📦 J\'ai remis la bouteille au client'}
              </button>
            )}
            {status === 'DELIVERED_PENDING_CONFIRMATION' && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3 text-center text-xs text-amber-300">
                Vous avez signalé la livraison. La commande sera auto-validée dans un délai de 2h si le client ne conteste pas.
              </div>
            )}
          </div>
        ) : (
          /* Vue Acheteur */
          <div>
            {status === 'DELIVERED_PENDING_CONFIRMATION' ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3 text-xs text-amber-300">
                  <p className="font-semibold">Le livreur signale avoir remis votre bouteille de gaz.</p>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    Veuillez confirmer la réception pour clôturer la commande. Sans action de votre part sous 2 heures, la livraison sera automatiquement confirmée.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    disabled={loading}
                    onClick={handleCustomerConfirm}
                    className="w-full rounded-xl bg-emerald-600 py-3 text-center text-xs font-bold text-white shadow-lg transition-all hover:bg-emerald-500 active:scale-[0.97]"
                  >
                    {loading ? 'Confirmation...' : '✅ J\'ai bien reçu ma bouteille'}
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => setShowDisputeModal(true)}
                    className="w-full rounded-xl border border-red-500/40 bg-red-950/30 py-3 text-center text-xs font-bold text-red-300 transition-all hover:bg-red-950/50 active:scale-[0.97]"
                  >
                    ⚠️ Je n'ai rien reçu / Problème
                  </button>
                </div>
              </div>
            ) : status === 'DELIVERED' ? (
              <p className="text-center text-xs text-emerald-400 font-medium">
                Livraison confirmée avec succès. Merci d'avoir choisi PLEINGAZ !
              </p>
            ) : status === 'DISPUTED' ? (
              <p className="text-center text-xs text-red-400 font-medium">
                Signalement d'incident enregistré. Notre service client prend contact avec vous.
              </p>
            ) : (
              <p className="text-center text-xs text-neutral-400">
                Le livreur est en route vers votre repère de livraison.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modale de signalement de litige */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-900 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Signaler un incident de livraison</h3>
            <p className="text-xs text-neutral-400 mb-3">
              Indiquez ce qui ne va pas (ex: livreur absent, bouteille non conforme, etc.) :
            </p>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Motif du litige..."
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-neutral-950 p-3 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
            />
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => setShowDisputeModal(false)}
                className="w-1/2 rounded-xl border border-white/10 py-2.5 text-xs font-semibold text-neutral-300"
              >
                Annuler
              </button>
              <button
                disabled={loading || !disputeReason.trim()}
                onClick={submitDispute}
                className="w-1/2 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow hover:bg-red-500"
              >
                {loading ? 'Envoi...' : 'Transmettre'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
