'use client';

import React, { useState } from 'react';
import { Store, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Printer, RefreshCw, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { getApiBaseUrl } from '@/lib/api-config';

export default function CounterSalePage() {
  const [customerPhone, setCustomerPhone] = useState('');
  const [checkingQuota, setCheckingQuota] = useState(false);
  const [quotaResult, setQuotaResult] = useState<{
    allowed: boolean;
    usedCount: number;
    remainingCount: number;
    limit: number;
  } | null>(null);

  const [productType, setProductType] = useState<'12.5KG' | '6KG'>('12.5KG');
  const [bottleCount, setBottleCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MTN_MOMO' | 'ORANGE_MONEY'>('CASH');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{
    receiptNumber: string;
    totalAmount: number;
    customerPhone: string;
    date: string;
  } | null>(null);

  const priceMap = {
    '12.5KG': 6500,
    '6KG': 3200,
  };

  const totalAmount = priceMap[productType] * bottleCount;
  const apiUrl = getApiBaseUrl();

  // 1. Vérification du quota acheteur (D-14, D-16)
  const handleCheckQuota = async () => {
    if (!customerPhone.trim()) {
      setError('Veuillez renseigner le numéro de téléphone de l’acheteur.');
      return;
    }

    setCheckingQuota(true);
    setError(null);
    setQuotaResult(null);

    try {
      const res = await fetch(`${apiUrl}/api/v1/counter-sales/check-quota`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerPhone,
          bottleCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de la vérification du quota.');
      }

      setQuotaResult(data);
    } catch (err: any) {
      setError(err.message || 'Impossible de joindre le serveur.');
    } finally {
      setCheckingQuota(false);
    }
  };

  // 2. Enregistrement de la vente
  const handleValidateSale = async () => {
    if (!quotaResult || !quotaResult.allowed) {
      setError('Vérification du quota obligatoire avant enregistrement.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('pleingaz_token') : null;

      const res = await fetch(`${apiUrl}/api/v1/counter-sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          storeId: 'store-demo-default',
          customerPhone,
          bottleCount,
          totalAmount,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de l’enregistrement.');
      }

      setReceipt({
        receiptNumber: data.sale.receiptNumber,
        totalAmount: data.sale.totalAmount,
        customerPhone: data.sale.customerPhone,
        date: new Date().toLocaleString('fr-FR'),
      });
    } catch (err: any) {
      setError(err.message || 'Erreur de validation comptoir.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCustomerPhone('');
    setQuotaResult(null);
    setReceipt(null);
    setError(null);
    setBottleCount(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white font-black text-xl shadow-sm">
              <Store size={20} />
            </span>
            <span className="font-extrabold text-xl tracking-tight text-gray-900">
              PLEINGAZ <span className="text-amber-800 text-xs uppercase font-bold px-2 py-0.5 rounded bg-amber-50 border border-amber-200">Mode Vente au Comptoir</span>
            </span>
          </div>

          <Link
            href="/distributor/inventory"
            className="text-xs font-bold text-gray-600 hover:text-red-600 underline"
          >
            Retour Inventaire
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
        {receipt ? (
          /* Reçu fiscal dématérialisé édité */
          <div className="bg-white border border-emerald-300 rounded-2xl p-6 sm:p-8 shadow-md text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>

            <h2 className="text-2xl font-black text-gray-900">Vente au Comptoir Validée !</h2>
            <p className="text-xs text-gray-500">
              Reçu fiscal certifié et inscrit au Grand Livre immuable PLEINGAZ.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left font-mono text-xs space-y-2">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">RÉFÉRENCE REÇU :</span>
                <span className="font-bold text-gray-900">{receipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">ACHETEUR :</span>
                <span className="font-bold text-gray-900">{receipt.customerPhone}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">MONTANT ENCAISSÉ :</span>
                <span className="font-bold text-emerald-700 text-sm">
                  {receipt.totalAmount.toLocaleString()} FCFA ({paymentMethod})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">DATE & HEURE :</span>
                <span>{receipt.date}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Printer size={16} />
                <span>Imprimer / Télécharger reçu</span>
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
              >
                <RefreshCw size={16} />
                <span>Nouvelle vente</span>
              </button>
            </div>
          </div>
        ) : (
          /* Formulaire de saisie comptoir */
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h1 className="text-xl font-black text-gray-900">Enregistrer un achat physique en boutique</h1>
              <p className="text-xs text-gray-500 mt-1">
                Conformité ADR D-16 : Contrôle de quota obligatoire avant encaissement.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl">
                {error}
              </div>
            )}

            {/* Étape 1 : Numéro Acheteur & Quota */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-800 block">
                1. Numéro de téléphone de l&apos;acheteur (WhatsApp) *
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-bold">+237</span>
                  <input
                    type="tel"
                    placeholder="6XXXXXXXX"
                    value={customerPhone.replace(/^\+237/, '')}
                    onChange={(e) => setCustomerPhone(`+237${e.target.value.replace(/^0+/, '')}`)}
                    className="w-full pl-14 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCheckQuota}
                  disabled={checkingQuota}
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors flex items-center space-x-1 shrink-0"
                >
                  <UserCheck size={16} />
                  <span>{checkingQuota ? 'Contrôle...' : 'Vérifier Quota'}</span>
                </button>
              </div>

              {quotaResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    quotaResult.allowed
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {quotaResult.allowed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    )}
                    <span>
                      {quotaResult.allowed
                        ? `Acheteur éligible : ${quotaResult.usedCount}/${quotaResult.limit} bouteilles consommées (${quotaResult.remainingCount} autorisées)`
                        : `QUOTA DÉPASSÉ : Le client a déjà atteint son plafond de 5 bouteilles sur 30 jours. Vente strictement interdite.`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Étape 2 : Produit & Quantité */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-gray-800 block">
                2. Bouteille officielle PLEINGAZ (Prix centralisé)
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProductType('12.5KG')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    productType === '12.5KG'
                      ? 'border-red-600 bg-red-50/50 ring-1 ring-red-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-sm text-gray-900">Bouteille 12.5 kg</div>
                  <div className="text-red-600 font-extrabold text-sm mt-0.5">6 500 FCFA</div>
                </button>

                <button
                  type="button"
                  onClick={() => setProductType('6KG')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    productType === '6KG'
                      ? 'border-red-600 bg-red-50/50 ring-1 ring-red-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-sm text-gray-900">Bouteille 6 kg</div>
                  <div className="text-red-600 font-extrabold text-sm mt-0.5">3 200 FCFA</div>
                </button>
              </div>
            </div>

            {/* Étape 3 : Règlement */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-gray-800 block">3. Mode d&apos;encaissement</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                    paymentMethod === 'CASH'
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Espèces en caisse
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('MTN_MOMO')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                    paymentMethod === 'MTN_MOMO'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  MTN MoMo
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ORANGE_MONEY')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                    paymentMethod === 'ORANGE_MONEY'
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Orange Money
                </button>
              </div>
            </div>

            {/* Total et Bouton de Validation */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 block">Total à encaisser :</span>
                <span className="text-2xl font-black text-gray-900">
                  {totalAmount.toLocaleString()} FCFA
                </span>
              </div>

              <button
                type="button"
                onClick={handleValidateSale}
                disabled={loading || !quotaResult?.allowed}
                className={`py-3.5 px-6 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all shadow-md ${
                  quotaResult?.allowed
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/25 hover:scale-[1.01]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>{loading ? 'Validation en cours...' : 'Valider la vente au comptoir'}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
