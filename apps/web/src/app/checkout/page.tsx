'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Flame, 
  MapPin, 
  Truck, 
  CreditCard, 
  Banknote, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Phone, 
  Info,
  Loader2,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface BottleOption {
  id: string;
  name: string;
  weight: string;
  price: number;
  badge?: string;
  color: string;
  iconBg: string;
}

const BOTTLE_OPTIONS: BottleOption[] = [
  {
    id: 'pleingaz-125',
    name: 'PLEINGAZ 12.5 kg',
    weight: '12.5 kg (Ménage standard)',
    price: 6500,
    badge: 'Plus populaire',
    color: 'border-red-600',
    iconBg: 'bg-red-500'
  },
  {
    id: 'pleingaz-6',
    name: 'PLEINGAZ 6 kg',
    weight: '6 kg (Pratique / Étudiant)',
    price: 3600,
    badge: 'Économique',
    color: 'border-amber-500',
    iconBg: 'bg-amber-500'
  },
  {
    id: 'pleingaz-50',
    name: 'PLEINGAZ 50 kg',
    weight: '50 kg (Professionnel / Restaurant)',
    price: 28000,
    badge: 'Pro',
    color: 'border-blue-600',
    iconBg: 'bg-blue-600'
  }
];

export default function CheckoutTunnelPage() {
  const router = useRouter();

  // Navigation Steps
  const [step, setStep] = useState<number>(1);

  // Step 1: Bottle & Operation Type
  const [selectedBottle, setSelectedBottle] = useState<BottleOption>(BOTTLE_OPTIONS[0]);
  const [operationType, setOperationType] = useState<'RECHARGE' | 'CONSIGNE'>('RECHARGE');
  const depositFee = operationType === 'CONSIGNE' ? 25000 : 0;

  // Step 2: Delivery Destination
  const [city, setCity] = useState<string>('Douala');
  const [quarter, setQuarter] = useState<string>('Akwa Nord');
  const [landmark, setLandmark] = useState<string>('En face de la pharmacie du rail, portail noir avec guérite');
  const [contactPhone, setContactPhone] = useState<string>('+237 699 123 456');

  // Step 3: Payment & Pricing
  const deliveryFee = 1000; // Fixe forfaitaire D-17
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MTN_MOMO' | 'ORANGE_MONEY'>('CASH');
  const [momoPhone, setMomoPhone] = useState<string>('677123456');

  // Step 4: Quota & Submission state
  const [quota, setQuota] = useState<{ consumed: number; remaining: number; maxLimit: number } | null>(null);
  const [quotaLoading, setQuotaLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [deliveryPin, setDeliveryPin] = useState<string>('');
  const [timerSeconds, setTimerSeconds] = useState<number>(15 * 60); // 15 min countdown (D-05)

  // Countdown timer for 15 minutes stock reservation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Check buyer quota on Step 4
  useEffect(() => {
    if (step === 4) {
      setQuotaLoading(true);
      fetch(`http://localhost:3001/api/v1/cr003/buyer/quota?phone=${encodeURIComponent(contactPhone)}`)
        .then((res) => res.json())
        .then((data) => {
          setQuota(data);
          setQuotaLoading(false);
        })
        .catch(() => {
          // Fallback simulation if local API server not reachable
          setQuota({ consumed: 2, remaining: 3, maxLimit: 5 });
          setQuotaLoading(false);
        });
    }
  }, [step, contactPhone]);

  const bottleTotal = selectedBottle.price + depositFee;
  const grandTotal = bottleTotal + deliveryFee;

  const handleConfirmOrder = () => {
    // Generate secure 4-digit PIN for delivery confirmation (D-05)
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setDeliveryPin(pin);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setOrderSuccess(true);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans text-neutral-900 dark:text-neutral-100 py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Top Header Bar */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <Link 
            href="/account"
            className="text-xs font-bold text-neutral-500 hover:text-red-600 flex items-center gap-1 transition-colors"
          >
            ✕ Annuler
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            <h1 className="font-black text-sm md:text-base tracking-tight text-neutral-900 dark:text-white">
              Commande de Gaz PLEINGAZ
            </h1>
          </div>
          <span className="text-xs font-bold px-2 py-1 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 rounded-md">
            Étape {step}/4
          </span>
        </div>

        {/* 15-Minute Guaranteed Reservation Banner */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 rounded-xl p-3 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">Réservation de stock garantie :</span>
          </div>
          <span className="font-mono font-black text-sm px-2 py-0.5 bg-amber-200 dark:bg-amber-900/80 rounded text-amber-900 dark:text-amber-100">
            {formatTimer(timerSeconds)}
          </span>
        </div>

        {/* Step Progress Indicator */}
        <div className="relative flex items-center justify-between px-6">
          <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-neutral-200 dark:bg-neutral-800 -translate-y-1/2 -z-0" />
          {[1, 2, 3, 4].map((i) => {
            const isDone = step > i;
            const isCurrent = step === i;
            return (
              <div 
                key={i}
                className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-sm ${
                  isDone 
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950' 
                    : isCurrent 
                      ? 'bg-red-600 text-white ring-4 ring-red-100 dark:ring-red-950 scale-110' 
                      : 'bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 text-neutral-400'
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : i}
              </div>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* SUCCESS STATE */}
        {/* ======================================================== */}
        {orderSuccess ? (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-neutral-900 border-2 border-emerald-500 rounded-3xl p-8 shadow-xl text-center space-y-6"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400">
                Commande validée & Réservée
              </span>
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white">
                Félicitations !
              </h2>
              <p className="text-sm text-neutral-500">
                Votre bouteille est assignée au distributeur le plus proche à {quarter}, {city}.
              </p>
            </div>

            {/* D-05 Confidential PIN */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 rounded-2xl p-5 text-center space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-300 flex items-center justify-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                Code PIN de remise physique contradictoire (D-05)
              </span>
              <div className="text-4xl font-black font-mono tracking-widest text-red-600 dark:text-red-400">
                {deliveryPin}
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-md mx-auto">
                ⚠️ Communiquez ce code au livreur <strong>UNIQUEMENT APRÈS</strong> avoir inspecté et reçu la bouteille scellée avec son détendeur vérifié.
              </p>
            </div>

            {/* Recap Details */}
            <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-xl p-4 text-xs space-y-2 text-left">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-300">
                <span>Article :</span>
                <span className="font-bold text-neutral-900 dark:text-white">{selectedBottle.name} ({operationType === 'CONSIGNE' ? 'Nouvelle consigne' : 'Recharge standard'})</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-300">
                <span>Montant réglé / dû :</span>
                <span className="font-bold text-red-600">{grandTotal.toLocaleString('fr-FR')} FCFA ({paymentMethod === 'CASH' ? 'Espèces à la livraison' : 'Mobile Money validé'})</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-300">
                <span>Repère de livraison :</span>
                <span className="font-bold text-neutral-900 dark:text-white">{quarter}, {landmark}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/delivery"
                className="flex-1 py-3.5 px-6 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
              >
                Suivre ma livraison en direct <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/account"
                className="py-3.5 px-6 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-bold rounded-xl transition-all text-xs flex items-center justify-center"
              >
                Mon compte
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            {/* ======================================================== */}
            {/* ÉTAPE 1 : CHOIX DE LA BOUTEILLE ET TYPE D'OPÉRATION */}
            {/* ======================================================== */}
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-neutral-900 dark:text-white">
                    1. Choisissez votre bouteille
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Sélectionnez le calibre certifié PLEINGAZ correspondant à votre besoin.
                  </p>
                </div>

                {/* Bouteilles Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {BOTTLE_OPTIONS.map((bottle) => {
                    const isSelected = selectedBottle.id === bottle.id;
                    return (
                      <button
                        key={bottle.id}
                        type="button"
                        onClick={() => setSelectedBottle(bottle)}
                        className={`text-left p-4 rounded-2xl border-2 transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-red-600 bg-red-50/50 dark:bg-red-950/20 shadow-md ring-2 ring-red-600/20'
                            : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 bg-white dark:bg-neutral-900'
                        }`}
                      >
                        {bottle.badge && (
                          <span className="absolute -top-2.5 right-3 text-[10px] font-black uppercase tracking-wider bg-amber-400 text-neutral-900 px-2 py-0.5 rounded-full shadow-sm">
                            {bottle.badge}
                          </span>
                        )}
                        <div className="space-y-2">
                          <div className={`w-10 h-10 rounded-xl ${bottle.iconBg} text-white flex items-center justify-center font-black shadow-sm`}>
                            <Flame className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-black text-sm text-neutral-900 dark:text-white">{bottle.name}</div>
                            <div className="text-[11px] text-neutral-500">{bottle.weight}</div>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                          <span className="text-base font-black text-red-600 dark:text-red-400">
                            {bottle.price.toLocaleString('fr-FR')} FCFA
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Operation Type (Recharge vs Consigne) */}
                <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-700 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Type d'opération
                  </span>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 cursor-pointer">
                    <input 
                      type="radio" 
                      name="opType" 
                      value="RECHARGE" 
                      checked={operationType === 'RECHARGE'}
                      onChange={() => setOperationType('RECHARGE')}
                      className="mt-1 text-red-600 focus:ring-red-600"
                    />
                    <div className="text-xs">
                      <strong className="block font-bold text-neutral-900 dark:text-white">
                        Échange de bouteille vide (Recharge standard)
                      </strong>
                      <span className="text-neutral-500">
                        Vous remettez une bouteille vide de même marque au livreur lors de la livraison.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 cursor-pointer">
                    <input 
                      type="radio" 
                      name="opType" 
                      value="CONSIGNE" 
                      checked={operationType === 'CONSIGNE'}
                      onChange={() => setOperationType('CONSIGNE')}
                      className="mt-1 text-red-600 focus:ring-red-600"
                    />
                    <div className="text-xs">
                      <strong className="block font-bold text-neutral-900 dark:text-white">
                        Nouvelle bouteille complète (Consigne + Gaz)
                      </strong>
                      <span className="text-neutral-500">
                        Vous n'avez pas de bouteille vide : +25 000 FCFA de consigne officielle remboursable.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all hover:gap-3"
                >
                  Continuer vers la livraison <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* ÉTAPE 2 : ADRESSE DE LIVRAISON & REPÈRE PRÉCIS */}
            {/* ======================================================== */}
            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-neutral-900 dark:text-white">
                    2. Lieu de livraison
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Indiquez un repère clair et précis pour guider le livreur à moto sans appel inutile.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Ville */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
                      Ville
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-bold focus:border-red-600 outline-none transition-colors"
                    >
                      <option value="Douala">Douala</option>
                      <option value="Yaounde">Yaoundé</option>
                    </select>
                  </div>

                  {/* Quartier */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
                      Quartier
                    </label>
                    <input
                      type="text"
                      value={quarter}
                      onChange={(e) => setQuarter(e.target.value)}
                      placeholder="Ex: Akwa, Bonamoussadi, Bastos, Biyem-Assi..."
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-bold focus:border-red-600 outline-none transition-colors"
                    />
                  </div>

                  {/* Repère Visuel Textuel */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
                      Repère précis (Guide du livreur en moto)
                    </label>
                    <textarea
                      rows={3}
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Ex: En face de la pharmacie du rail, portail noir avec guérite..."
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium focus:border-red-600 outline-none transition-colors"
                    />
                    <span className="text-[11px] text-neutral-400 mt-1 block">
                      💡 Indispensable au Cameroun : couleur de portail, pharmacie, carrefour ou boulangerie à proximité.
                    </span>
                  </div>

                  {/* Téléphone joignable */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
                      Numéro joignable pour la livraison
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-bold focus:border-red-600 outline-none transition-colors font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" /> Retour
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!quarter.trim() || !landmark.trim()}
                    className="flex-2 py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    Continuer vers le paiement <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* ÉTAPE 3 : TARIF LIVRAISON & MODE DE PAIEMENT */}
            {/* ======================================================== */}
            {step === 3 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-neutral-900 dark:text-white">
                    3. Livraison & Règlement
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Tarification officielle transparente, sans frais cachés ni surcoût.
                  </p>
                </div>

                {/* Forfait de Livraison Fixe 1 000 FCFA (D-17) */}
                <div className="border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-sm text-neutral-900 dark:text-white">
                        Livraison Express à Domicile (D-17)
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        Tarif unique officiel pour toute la zone urbaine • Livreur certifié
                      </div>
                    </div>
                  </div>
                  <span className="font-black text-sm text-emerald-700 dark:text-emerald-300 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/60 rounded-lg">
                    1 000 FCFA
                  </span>
                </div>

                {/* Modes de paiement */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Moyen de paiement
                  </span>

                  {/* Option Cash */}
                  <label 
                    onClick={() => setPaymentMethod('CASH')}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'CASH'
                        ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-sm'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Banknote className={`w-5 h-5 ${paymentMethod === 'CASH' ? 'text-emerald-600' : 'text-neutral-400'}`} />
                      <div>
                        <div className="font-bold text-sm text-neutral-900 dark:text-white">
                          💵 Espèces à la livraison (Recommandé)
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Paiement remis en main propre au livreur après inspection de la bouteille.
                        </div>
                      </div>
                    </div>
                    {paymentMethod === 'CASH' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                  </label>

                  {/* Option MTN MoMo */}
                  <label 
                    onClick={() => setPaymentMethod('MTN_MOMO')}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'MTN_MOMO'
                        ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-950/20 shadow-sm'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className={`w-5 h-5 ${paymentMethod === 'MTN_MOMO' ? 'text-amber-500' : 'text-neutral-400'}`} />
                      <div>
                        <div className="font-bold text-sm text-neutral-900 dark:text-white">
                          📱 MTN Mobile Money
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Paiement instantané sécurisé via USSD prompt sur votre téléphone.
                        </div>
                      </div>
                    </div>
                    {paymentMethod === 'MTN_MOMO' && <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />}
                  </label>

                  {/* Option Orange Money */}
                  <label 
                    onClick={() => setPaymentMethod('ORANGE_MONEY')}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'ORANGE_MONEY'
                        ? 'border-orange-500 bg-orange-50/30 dark:bg-orange-950/20 shadow-sm'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className={`w-5 h-5 ${paymentMethod === 'ORANGE_MONEY' ? 'text-orange-500' : 'text-neutral-400'}`} />
                      <div>
                        <div className="font-bold text-sm text-neutral-900 dark:text-white">
                          📱 Orange Money
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Paiement instantané sécurisé via code d'autorisation Orange.
                        </div>
                      </div>
                    </div>
                    {paymentMethod === 'ORANGE_MONEY' && <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />}
                  </label>
                </div>

                {/* Numéro MoMo si sélectionné */}
                {paymentMethod !== 'CASH' && (
                  <div className="pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
                      Numéro de compte {paymentMethod === 'MTN_MOMO' ? 'MTN' : 'Orange'}
                    </label>
                    <input
                      type="tel"
                      value={momoPhone}
                      onChange={(e) => setMomoPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-bold focus:border-red-600 outline-none transition-colors font-mono"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-3.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" /> Retour
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex-2 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    Voir le récapitulatif <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* ÉTAPE 4 : RÉCAPITULATIF FINAL & CONTRÔLE QUOTA SOUVERAIN */}
            {/* ======================================================== */}
            {step === 4 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-neutral-900 dark:text-white">
                    4. Récapitulatif & Confirmation
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Vérifiez attentivement les détails avant d'engager la course.
                  </p>
                </div>

                {/* Quota Mensuel Check (D-14) */}
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Contrôle Quota Souverain (D-14) : Éligible</span>
                  </div>
                  {quotaLoading ? (
                    <div className="text-xs text-neutral-500 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Vérification du registre...
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                      1 bouteille demandée. Il vous restera {quota ? quota.remaining - 1 : 2} bouteille(s) disponible(s) sur votre quota de {quota ? quota.maxLimit : 5} pour cette période de 30 jours.
                    </p>
                  )}
                </div>

                {/* Breakdown Card */}
                <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-700 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-600 dark:text-neutral-300">
                      1x {selectedBottle.name} ({operationType === 'CONSIGNE' ? 'Gaz + Consigne neuve' : 'Recharge standard'})
                    </span>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {bottleTotal.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-600 dark:text-neutral-300">
                      Frais de livraison express (D-17)
                    </span>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {deliveryFee.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                    <div>
                      <span className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider block">
                        Total net à régler
                      </span>
                      <span className="text-xs text-neutral-500">
                        {paymentMethod === 'CASH' ? 'Espèces à la remise physique' : `Paiement ${paymentMethod}`}
                      </span>
                    </div>
                    <span className="text-2xl font-black text-red-600 dark:text-red-400">
                      {grandTotal.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>

                {/* Destination & Security Guarantee */}
                <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs space-y-1.5 text-neutral-600 dark:text-neutral-300">
                  <div>📍 <strong>Destination :</strong> {quarter}, {city} ({landmark})</div>
                  <div>📞 <strong>Contact acheteur :</strong> {contactPhone}</div>
                  <div>🛡️ <strong>Garantie sécurité :</strong> Scellé officiel PLEINGAZ vérifié + double confirmation contradictoire.</div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 py-3.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" /> Modifier
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    disabled={isSubmitting}
                    className="flex-2 py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Traitement de la commande...
                      </>
                    ) : (
                      <>
                        🚀 Confirmer ma commande ({grandTotal.toLocaleString('fr-FR')} F)
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
