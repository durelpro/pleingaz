'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, CheckCircle2, Clock, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AcheteurCommandesPage() {
  const [orders, setOrders] = useState([
    {
      id: 'cmd-pg-2026-0891',
      date: '01 Novembre 2026 à 18h45',
      productName: 'Recharge Gaz Butane PLEINGAZ 12.5 kg',
      quantity: 1,
      totalPrice: 6500,
      status: 'EN_COURS',
      storeName: 'Dépôt Gaz Akwa Central',
      deliveryAddress: 'Douala, Bonapriso (Face pharmacie)',
      securityCode: '4829',
    },
    {
      id: 'cmd-pg-2026-0742',
      date: '14 Octobre 2026 à 11h15',
      productName: 'Recharge Gaz Butane PLEINGAZ 12.5 kg',
      quantity: 1,
      totalPrice: 6500,
      status: 'LIVREE',
      storeName: 'Dépôt Gaz Akwa Central',
      deliveryAddress: 'Douala, Bonapriso (Face pharmacie)',
      securityCode: '9153',
    },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          Mes Commandes de Gaz
        </h1>
        <p className="text-xs text-neutral-400">
          Suivez vos livraisons en cours et retrouvez l'historique de vos recharges.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((o) => {
          const isOngoing = o.status === 'EN_COURS';
          return (
            <div
              key={o.id}
              className="glass-panel rounded-2xl p-5 sm:p-6 border border-neutral-800 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-neutral-900">
                <div>
                  <span className="text-xs font-mono text-neutral-400 block mb-0.5">
                    Réf. {o.id}
                  </span>
                  <span className="text-xs text-neutral-500">{o.date}</span>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto ${
                    isOngoing
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {isOngoing ? (
                    <>
                      <Clock className="w-3.5 h-3.5" />
                      <span>En cours de livraison</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Livrée & Scellé vérifié</span>
                    </>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-neutral-500 block mb-1">Article</span>
                  <span className="text-white font-bold">{o.productName}</span>
                  <span className="text-red-400 font-extrabold block mt-0.5">
                    {o.totalPrice.toLocaleString()} FCFA
                  </span>
                </div>

                <div>
                  <span className="text-neutral-500 block mb-1">Dépôt préparateur</span>
                  <span className="text-neutral-300">{o.storeName}</span>
                  <span className="text-neutral-400 block mt-0.5">{o.deliveryAddress}</span>
                </div>

                <div>
                  <span className="text-neutral-500 block mb-1">Code de confirmation livraison</span>
                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 inline-block font-mono text-base font-extrabold text-amber-400 tracking-widest">
                    {o.securityCode}
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    À communiquer au livreur uniquement après vérification du scellé intact.
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
