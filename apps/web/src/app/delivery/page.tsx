'use client';

import React, { useState } from 'react';
import { Truck, CheckCircle2, PhoneCall, MessageSquare, AlertCircle, ShieldCheck, DollarSign, MapPin, Navigation, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { InfoNoticesDrawer } from '@/components/common/InfoNoticesDrawer';
import { DoubleConfirmationCard } from '@/components/cr003';

export default function DeliveryCourierPage() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [cashCollected, setCashCollected] = useState(13000); // Espèces en main
  const cashLimit = 50000; // Plafond légal 50 000 FCFA (ADR D9)

  const [deliveryState, setDeliveryState] = useState<'IN_PROGRESS' | 'COMPLETED'>('IN_PROGRESS');
  const [clientSecretCode, setClientSecretCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const [todayEarnings, setTodayEarnings] = useState(6000); // 6 courses x 1000 FCFA
  const [completedCount, setCompletedCount] = useState(6);
  const [doubleConfStatus, setDoubleConfStatus] = useState<
    'IN_TRANSIT' | 'DELIVERED_PENDING_CONFIRMATION' | 'DELIVERED' | 'DISPUTED'
  >('IN_TRANSIT');

  const handleCourierMarkDelivered = async () => {
    setDoubleConfStatus('DELIVERED_PENDING_CONFIRMATION');
  };

  const handleCustomerConfirmReceived = async () => {
    setDoubleConfStatus('DELIVERED');
    setDeliveryState('COMPLETED');
    setTodayEarnings((prev) => prev + 1000);
    setCompletedCount((prev) => prev + 1);
    setCashCollected((prev) => prev + 6500);
  };

  const handleCustomerDispute = async (reason: string) => {
    setDoubleConfStatus('DISPUTED');
    setCodeError(`Litige signalé : ${reason}`);
  };

  // Validation contradictoire par code confidentiel (ADR D9, D17)
  const handleConfirmDelivery = () => {
    setCodeError(null);

    if (!clientSecretCode.trim()) {
      setCodeError('Veuillez demander et saisir le code confidentiel à 4 chiffres remis par le client.');
      return;
    }

    // Le code attendu pour la course de démonstration est 4815 ou tout code à 4 chiffres
    if (clientSecretCode.trim().length !== 4) {
      setCodeError('Le code secret client doit comporter exactement 4 chiffres.');
      return;
    }

    setValidating(true);
    setTimeout(() => {
      setDeliveryState('COMPLETED');
      setTodayEarnings((prev) => prev + 1000); // Tarif fixe 1 000 FCFA (D-17)
      setCompletedCount((prev) => prev + 1);
      setCashCollected((prev) => prev + 6500); // 6 500 F encaissés en cash
      setValidating(false);
    }, 600);
  };

  const handleResetDemoMission = () => {
    setDeliveryState('IN_PROGRESS');
    setClientSecretCode('');
    setCodeError(null);
  };

  const cashPercent = Math.min(100, (cashCollected / cashLimit) * 100);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 pb-20">
      {/* Top Navbar Livreur */}
      <header className="bg-gray-900 text-white border-b border-gray-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-xs">
              🛵
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-white">Paul M. (Moto #LT-402)</span>
              </div>
              <button
                onClick={() => setIsAvailable(!isAvailable)}
                className={`text-[11px] font-bold flex items-center space-x-1 ${
                  isAvailable ? 'text-emerald-400' : 'text-gray-400'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                <span>{isAvailable ? 'En service (Disponible)' : 'En pause'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <InfoNoticesDrawer role="COURIER" city="Douala" />
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded transition-colors"
            >
              Quitter
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        {/* Résumé des Gains & Caisse Cash on Delivery */}
        <div className="grid grid-cols-2 gap-3">
          {/* Gains Nets */}
          <div className="bg-gray-900 text-white p-4 rounded-2xl shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Gains du jour</span>
            <div className="text-2xl font-black text-emerald-400">
              {todayEarnings.toLocaleString()} <span className="text-xs font-bold text-gray-300">FCFA</span>
            </div>
            <p className="text-[11px] text-gray-400">
              {completedCount} courses (1 000 F / course fixe)
            </p>
          </div>

          {/* Suivi Espèces en Caisse (Plafond 50 000 F - ADR D9) */}
          <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <span>Espèces en main</span>
              <span className={cashCollected >= 45000 ? 'text-red-600 font-extrabold' : 'text-gray-700'}>
                {cashCollected.toLocaleString()} / 50 000 F
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  cashPercent >= 90 ? 'bg-red-600' : cashPercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${cashPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500">
              {cashCollected >= 45000
                ? '⚠️ Versement proche du seuil 50k FCFA'
                : 'Caisse en règle envers PLEINGAZ'}
            </p>
          </div>
        </div>

        {/* MISSION ACTIVE AVEC DOUBLE CONFIRMATION CONTRADICTOIRE (D-17) */}
        {deliveryState === 'IN_PROGRESS' ? (
          <div className="bg-white border-2 border-emerald-500 rounded-2xl p-5 shadow-md space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase rounded-full">
                Course Active #PG-9482
              </span>
              <span className="font-extrabold text-red-600 text-sm">
                +1 000 FCFA Net
              </span>
            </div>

            {/* Étape 1 : Récupération au Dépôt */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-gray-900 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                Prise en charge au Dépôt agréé
              </span>
              <h3 className="font-extrabold text-sm text-gray-900">Dépôt PLEINGAZ Akwa Nord</h3>
              <p className="text-xs text-gray-600">
                1 x Bouteille 12.5 kg scellée d&apos;usine • Prête à l&apos;enlèvement
              </p>
            </div>

            {/* Étape 2 : Livraison au Client & Repère Textuel Précis */}
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 space-y-2">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                Lieu de livraison chez le client
              </span>

              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Marie T. (Akwa Nord)</h3>
                <div className="flex items-start space-x-1.5 text-xs text-red-700 font-bold mt-1 bg-white p-2 rounded-lg border border-amber-200">
                  <MapPin className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span>Repère visuel : En face de la Pharmacie du Rail, portail noir barbelé</span>
                </div>
              </div>

              {/* Boutons d'Appel Direct et WhatsApp */}
              <div className="flex gap-2 pt-1">
                <a
                  href="tel:+237677112233"
                  className="flex-1 py-2.5 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
                >
                  <PhoneCall size={14} className="text-gray-700" />
                  <span>Appeler cliente</span>
                </a>
                <a
                  href="https://wa.me/237699112233?text=Bonjour,%20je%20suis%20votre%20livreur%20PLEINGAZ,%20je%20suis%20en%20route"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
                >
                  <MessageSquare size={14} />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Composant Officiel Double Confirmation Contradictoire (D-17) */}
            <DoubleConfirmationCard
              deliveryId="del-demo-9482"
              orderNumber="PG-9482"
              courierName="Paul M. (Livreur Agréé)"
              status={doubleConfStatus}
              courierConfirmedAt={
                doubleConfStatus !== 'IN_TRANSIT' ? new Date().toISOString() : undefined
              }
              isCourierView={true}
              onCourierMarkDelivered={handleCourierMarkDelivered}
              onCustomerConfirmReceived={handleCustomerConfirmReceived}
              onCustomerDispute={handleCustomerDispute}
            />

            {/* Clôture Contradictoire avec Saisie du Code Confidentiel Client (ADR D9, D17) */}
            <div className="border-t border-gray-100 pt-3 space-y-3">
              <div>
                <label className="text-xs font-black text-gray-900 flex items-center gap-1.5 mb-1">
                  <Lock size={15} className="text-red-600" />
                  Saisir le Code Confidentiel à 4 chiffres (fourni par la cliente) :
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Ex: 4815"
                  value={clientSecretCode}
                  onChange={(e) => setClientSecretCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-2xl font-mono font-black tracking-widest py-3 bg-gray-50 border-2 border-gray-300 focus:border-red-600 focus:bg-white rounded-xl focus:outline-none transition-all"
                />
                <span className="text-[11px] text-gray-500 text-center block mt-1">
                  Remise sécurisée : La cliente doit vous donner son code secret lors du dépôt de la bouteille.
                </span>
              </div>

              {codeError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center space-x-1.5">
                  <AlertCircle size={15} className="shrink-0 text-red-600" />
                  <span>{codeError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirmDelivery}
                disabled={validating}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                {validating ? (
                  <span>Validation contradictoire en cours...</span>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>J&apos;AI LIVRÉ LA BOUTEILLE (CLÔTURE)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Mission Clôturée avec Succès */
          <div className="bg-white border border-emerald-300 rounded-2xl p-6 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>

            <h2 className="text-xl font-black text-gray-900">Course #PG-9482 Terminée !</h2>
            <p className="text-xs text-gray-600 max-w-sm mx-auto">
              La remise a été validée contradictoirement. Votre compte livreur est crédité de <strong>1 000 FCFA</strong>. Les coordonnées de la cliente ont été masquées pour la confidentialité (D-17).
            </p>

            <button
              onClick={handleResetDemoMission}
              className="py-3 px-6 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Rechercher une nouvelle course disponible
            </button>
          </div>
        )}

        {/* Historique Rapide des Dernières Remises */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="font-extrabold text-xs text-gray-700 uppercase tracking-wider">
            Historique du Jour
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg">
              <div>
                <span className="font-bold text-gray-900 block">Bonapriso • Recharge 12.5kg</span>
                <span className="text-gray-500 text-[10px]">Livré à 10:42 • Code validé</span>
              </div>
              <span className="font-extrabold text-emerald-700">+1 000 FCFA</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg">
              <div>
                <span className="font-bold text-gray-900 block">Akwa Nord • Bouteille 6kg</span>
                <span className="text-gray-500 text-[10px]">Livré à 09:15 • Code validé</span>
              </div>
              <span className="font-extrabold text-emerald-700">+1 000 FCFA</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
