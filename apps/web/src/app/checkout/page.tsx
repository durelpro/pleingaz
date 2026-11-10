'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  MapPin,
  ArrowRight,
  Flame,
  AlertCircle,
  Copy,
  Check,
  PhoneCall,
  Smartphone,
  PauseCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const [method, setMethod] = useState<'MTN_MOMO' | 'ORANGE_MONEY' | 'CASH'>('CASH');
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'PAUSED'>('IDLE');
  const [phone, setPhone] = useState('699112233');
  const [city, setCity] = useState('Douala');
  const [neighborhood, setNeighborhood] = useState('Akwa Nord');
  const [landmark, setLandmark] = useState('Face Pharmacie du Rail, portail noir');

  // Numéros officiels de transfert direct Mobile Money
  const ORANGE_NUMBER = '657696567';
  const MTN_NUMBER = '675119989';
  const ACCOUNT_HOLDER = 'Compte Particulier (PLEINGAZ)';

  // Référence SMS et copie
  const [transactionRef, setTransactionRef] = useState('');
  const [senderMomoPhone, setSenderMomoPhone] = useState('699112233');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const [quotaRemaining, setQuotaRemaining] = useState(4);
  const [secondsRemaining, setSecondsRemaining] = useState(900); // 15 min
  const secretCode = '4815';

  // Compte à rebours de réservation 15 min
  useEffect(() => {
    if (status !== 'IDLE') return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setStatus('PAUSED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} min`;
  };

  const handleCopy = (num: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(num);
      setCopiedNumber(num);
      setTimeout(() => setCopiedNumber(null), 2500);
    }
  };

  const handlePay = () => {
    setStatus('PROCESSING');
    setTimeout(() => {
      setStatus('SUCCESS');
    }, 1200);
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

        {/* Écran État : COMMANDE MISE EN PAUSE */}
        {status === 'PAUSED' ? (
          <div className="bg-white border-2 border-amber-400 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-lg">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <PauseCircle size={36} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900">Commande mise en pause</h2>
              <p className="text-xs text-gray-600 leading-relaxed max-w-md mx-auto">
                Le délai de réservation de 15 minutes a expiré. Votre commande n&apos;est pas annulée : elle est mise en attente. Vous pouvez la réactiver immédiatement pour finaliser votre règlement.
              </p>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 text-xs font-semibold text-amber-900 border border-amber-200">
              💡 Le stock peut être réattribué temporairement jusqu&apos;à réactivation de votre panier.
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSecondsRemaining(900);
                  setStatus('IDLE');
                }}
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors text-center"
              >
                Réactiver ma commande
              </button>
              <Link
                href="/"
                className="py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors text-center"
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        ) : status === 'SUCCESS' ? (
          /* Écran État : COMMANDE CONFIRMÉE */
          <div className="bg-white border-2 border-emerald-400 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-lg">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-gray-900">
                {method === 'CASH' ? 'Commande Confirmée !' : 'Transfert Mobile Money Enregistré !'}
              </h2>
              <p className="text-xs text-gray-600">
                {method === 'CASH'
                  ? 'Votre bouteille PLEINGAZ 12.5 kg est en cours de préparation au dépôt le plus proche.'
                  : `Votre règlement est en cours de vérification sur notre numéro ${method === 'ORANGE_MONEY' ? 'Orange' : 'MTN'}. Votre commande est sécurisée.`}
              </p>
            </div>

            {/* Information Mobile Money si virement direct */}
            {method !== 'CASH' && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="flex items-center space-x-2 text-blue-900 font-bold">
                  <Smartphone size={16} className="text-blue-600" />
                  <span>Détails du transfert direct vers l&apos;entreprise</span>
                </div>
                <div className="text-gray-700 space-y-1 text-[11px] font-mono">
                  <p>• Destinataire : <strong className="text-gray-900">{method === 'ORANGE_MONEY' ? '657696567 (Orange)' : '675119989 (MTN)'}</strong></p>
                  <p>• Intitulé : <strong>{ACCOUNT_HOLDER}</strong></p>
                  {transactionRef && <p>• Réf / ID SMS saisi : <strong className="text-blue-700">{transactionRef}</strong></p>}
                  <p>• Téléphone émetteur : <strong>{senderMomoPhone || phone}</strong></p>
                </div>
                <p className="text-[10px] text-blue-800/80 italic">
                  Dès notification de réception des fonds par notre opérateur, le coursier prend en charge votre bouteille scellée.
                </p>
              </div>
            )}

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
                <span>Total réglé / à régler :</span>
                <span>7 500 FCFA ({method === 'CASH' ? 'Espèces à la livraison' : method === 'ORANGE_MONEY' ? 'Orange Money (657696567)' : 'MTN MoMo (675119989)'})</span>
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
          /* Formulaire de commande */
          <>
            {/* Jauge Quota & Réservation 15 min (ADR D5, D14) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs flex items-center space-x-2 text-emerald-800 font-bold">
                <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                <span>Quota : {quotaRemaining}/5 bouteilles dispo</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs flex items-center justify-between text-amber-900 font-bold">
                <div className="flex items-center space-x-1.5">
                  <Clock size={15} className="text-amber-600" />
                  <span>Stock réservé :</span>
                </div>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300">
                  {formatTimer(secondsRemaining)}
                </span>
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
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-800 block">Mode de règlement</label>

              <div className="space-y-2">
                {[
                  {
                    id: 'CASH',
                    label: 'Espèces à la livraison (Cash on Delivery)',
                    sub: 'Code secret obligatoire à la remise de la bouteille',
                    icon: Banknote,
                  },
                  {
                    id: 'ORANGE_MONEY',
                    label: 'Orange Money (Paiement direct vers 657696567)',
                    sub: 'Transfert sans frais API vers le compte officiel PLEINGAZ',
                    icon: Smartphone,
                  },
                  {
                    id: 'MTN_MOMO',
                    label: 'MTN Mobile Money (Paiement direct vers 675119989)',
                    sub: 'Transfert sans frais API vers le compte officiel PLEINGAZ',
                    icon: Smartphone,
                  },
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

              {/* Encadré d'instructions interactif pour Orange Money */}
              {method === 'ORANGE_MONEY' && (
                <div className="bg-amber-50/90 border-2 border-orange-300 rounded-2xl p-4 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-orange-900 flex items-center gap-1.5">
                      <Smartphone size={16} className="text-orange-600" />
                      Numéro Orange Money de Réception
                    </span>
                    <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full border border-orange-200">
                      Vérifié
                    </span>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-orange-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase font-mono">Transférer 7 500 FCFA vers :</span>
                      <span className="text-lg font-black font-mono text-gray-900 tracking-wider">
                        +237 657 696 567
                      </span>
                      <span className="text-[10px] text-gray-500 block">Intitulé : {ACCOUNT_HOLDER}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(ORANGE_NUMBER)}
                      className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-lg flex items-center space-x-1.5 transition-colors shadow-sm"
                    >
                      {copiedNumber === ORANGE_NUMBER ? (
                        <>
                          <Check size={14} />
                          <span>Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Raccourci USSD mobile */}
                  <a
                    href={`tel:#150*1*1*${ORANGE_NUMBER}*7500%23`}
                    className="w-full py-2.5 px-3 bg-white hover:bg-orange-50 border border-orange-300 rounded-xl text-orange-900 font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
                  >
                    <PhoneCall size={14} className="text-orange-600" />
                    <span>Lancer le code USSD Orange (#150*1*1*{ORANGE_NUMBER}*7500#)</span>
                  </a>

                  {/* Saisie Référence / ID de transaction */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] font-bold text-gray-700 block">
                      ID de transaction SMS ou Téléphone Orange payeur (Recommandé) :
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Ex: CI2409..."
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                      <input
                        type="text"
                        placeholder="N° payeur (65...)"
                        value={senderMomoPhone}
                        onChange={(e) => setSenderMomoPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Encadré d'instructions interactif pour MTN MoMo */}
              {method === 'MTN_MOMO' && (
                <div className="bg-yellow-50/90 border-2 border-yellow-300 rounded-2xl p-4 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-yellow-900 flex items-center gap-1.5">
                      <Smartphone size={16} className="text-yellow-700" />
                      Numéro MTN Mobile Money de Réception
                    </span>
                    <span className="text-[10px] bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded-full border border-yellow-200">
                      Vérifié
                    </span>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-yellow-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase font-mono">Transférer 7 500 FCFA vers :</span>
                      <span className="text-lg font-black font-mono text-gray-900 tracking-wider">
                        +237 675 119 989
                      </span>
                      <span className="text-[10px] text-gray-500 block">Intitulé : {ACCOUNT_HOLDER}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(MTN_NUMBER)}
                      className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xs rounded-lg flex items-center space-x-1.5 transition-colors shadow-sm"
                    >
                      {copiedNumber === MTN_NUMBER ? (
                        <>
                          <Check size={14} />
                          <span>Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Raccourci USSD mobile */}
                  <a
                    href={`tel:*126*1*1*${MTN_NUMBER}*7500%23`}
                    className="w-full py-2.5 px-3 bg-white hover:bg-yellow-50 border border-yellow-300 rounded-xl text-yellow-950 font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
                  >
                    <PhoneCall size={14} className="text-yellow-700" />
                    <span>Lancer le code USSD MTN (*126*1*1*{MTN_NUMBER}*7500#)</span>
                  </a>

                  {/* Saisie Référence / ID de transaction */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] font-bold text-gray-700 block">
                      ID de transaction SMS ou Téléphone MTN payeur (Recommandé) :
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Ex: MP2409..."
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                      <input
                        type="text"
                        placeholder="N° payeur (67...)"
                        value={senderMomoPhone}
                        onChange={(e) => setSenderMomoPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                    </div>
                  </div>
                </div>
              )}
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
                  <span>Enregistrement de la commande...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>
                    {method === 'CASH'
                      ? 'Confirmer la commande (7 500 FCFA)'
                      : `Valider le transfert Mobile Money (7 500 FCFA)`}
                  </span>
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

