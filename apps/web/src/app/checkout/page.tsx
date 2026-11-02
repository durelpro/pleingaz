'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Banknote, ShieldCheck, CheckCircle2, Loader2, MapPin, ArrowRight, Flame, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const [method, setMethod] = useState<'MTN_MOMO' | 'ORANGE_MONEY' | 'CASH'>('CASH');
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS'>('IDLE');
  const [phone, setPhone] = useState('699112233');
  const [city, setCity] = useState('Douala');
  const [neighborhood, setNeighborhood] = useState('Akwa Nord');
  const [landmark, setLandmark] = useState('Face Pharmacie du Rail, portail noir');

  const [quotaRemaining, setQuotaRemaining] = useState(4);
  const secretCode = '4815';

  const handlePay = () => {
    setStatus('PROCESSING');
    setTimeout(() => {
      setStatus('SUCCESS');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-12 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
            Commande Officielle PLEINGAZ
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 pt-2">Validation de Commande</h1>
          <p className="text-xs text-gray-500">Gaz certifié scellé d&apos;usine livré chez vous à prix réglementé.</p>
        </div>

        {status === 'SUCCESS' ? (
          <div className="bg-white border-2 border-emerald-400 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-lg">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-gray-900">Commande Confirmée !</h2>
              <p className="text-xs text-gray-600">
                Votre bouteille PLEINGAZ 12.5 kg est en cours de préparation au dépôt le plus proche.
              </p>
            </div>

            {/* Code Confidentiel Client (ADR D9, D17) */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wide text-amber-900 block">
                Votre Code Confidentiel de Remise (D-17)
              </span>
              <span className="text-4xl font-mono font-black text-red-600 tracking-widest block py-1">
                {secretCode}
              </span>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                ⚠️ <strong>IMPORTANT :</strong> Ne communiquez ce code au livreur qu&apos;au moment exact où vous avez la bouteille en main.
              </p>
            </div>

            {/* Récapitulatif adresse */}
            <div className="text-left bg-gray-50 rounded-xl p-4 text-xs font-mono space-y-1 text-gray-700">
              <div className="flex justify-between">
                <span>Lieu de livraison :</span>
                <span className="font-bold">{neighborhood}, {city}</span>
              </div>
              <div className="flex justify-between">
                <span>Repère :</span>
                <span>{landmark}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1 mt-1 font-bold text-gray-900">
                <span>Total à régler :</span>
                <span>7 500 FCFA ({method === 'CASH' ? 'Espèces à la livraison' : 'Mobile Money'})</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                href="/delivery"
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors text-center"
              >
                Suivre mon livreur en direct
              </Link>
              <Link
                href="/account"
                className="py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors text-center"
              >
                Mon compte
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Jauge Quota & Réservation 15 min (ADR D5, D14) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs flex items-center space-x-2 text-emerald-800 font-bold">
                <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                <span>Quota : {quotaRemaining}/5 bouteilles dispo</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs flex items-center justify-between text-amber-900 font-bold">
                <span>⏱️ Stock réservé :</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300">14:45 min</span>
              </div>
            </div>

            {/* Récapitulatif Produit & Tarifs Nationaux (CR-001 D-01) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <Flame size={22} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">Bouteille PLEINGAZ 12.5 kg</h3>
                    <span className="text-[11px] text-gray-500">Recharge officielle scellée d&apos;usine</span>
                  </div>
                </div>
                <span className="font-extrabold text-gray-900 text-sm">6 500 FCFA</span>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                <span>Livraison standard (Tarif fixe flotte urbaine D-17)</span>
                <span className="font-bold text-gray-700">1 000 FCFA</span>
              </div>

              <div className="flex justify-between items-center text-base font-black text-gray-900 pt-2 border-t border-gray-100">
                <span>Total à payer</span>
                <span className="text-xl text-red-600">7 500 FCFA</span>
              </div>
            </div>

            {/* Adresse et Repère Visuel Obligatoire (R7, R8, D6) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={15} className="text-red-600" />
                Lieu de livraison & Repère visuel
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Ville</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="Douala">Douala</option>
                    <option value="Yaoundé">Yaoundé</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Quartier</label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">
                  Repère familier précis (Pharmacie, portail, barrière...) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Face Pharmacie du Rail, portail noir"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Modes de Règlement */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-800 block">Mode de règlement</label>

              <div className="space-y-2">
                {[
                  { id: 'CASH', label: 'Espèces à la livraison (Cash on Delivery)', sub: 'Code secret obligatoire à la remise', icon: Banknote },
                  { id: 'MTN_MOMO', label: 'MTN Mobile Money', sub: 'Paiement immédiat sans contact', icon: CreditCard },
                  { id: 'ORANGE_MONEY', label: 'Orange Money', sub: 'Paiement immédiat sans contact', icon: CreditCard },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = method === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id as any)}
                      className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-red-600 bg-red-50/40 ring-1 ring-red-600'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-red-600' : 'text-gray-400'}`} />
                        <div>
                          <span className="font-bold text-xs text-gray-900 block">{m.label}</span>
                          <span className="text-[10px] text-gray-500">{m.sub}</span>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-red-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bouton de Validation */}
            <button
              type="button"
              onClick={handlePay}
              disabled={status === 'PROCESSING'}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
            >
              {status === 'PROCESSING' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Réservation de la commande...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Confirmer la commande (7 500 FCFA)</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
