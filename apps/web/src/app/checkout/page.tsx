'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
  Clock,
  Phone,
  AlertCircle,
  ArrowRight,
  Store,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutPage() {
  const [method, setMethod] = useState<'MTN_MOMO' | 'ORANGE_MONEY' | 'CASH'>('MTN_MOMO');
  const [status, setStatus] = useState<'IDLE' | 'AWAITING_CONFIRMATION' | 'SUCCESS'>('IDLE');
  const [customerTxRef, setCustomerTxRef] = useState('');
  const [customerPhone, setCustomerPhone] = useState('670000000');
  const [copied, setCopied] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Coordonnées directes du point de vente récepteur (configurées par le gérant)
  const [storePayment, setStorePayment] = useState({
    storeName: 'Dépôt PLEINGAZ Bonabéri - Douala',
    momoReceiverNumber: '677889900',
    momoAccountName: 'ETS PLEINGAZ BONABERI (NKOA JEAN)',
    orangeReceiverNumber: '699112233',
    orangeAccountName: 'PLEINGAZ DEPOT BONABERI',
    acceptCash: true,
  });

  // Chargement des coordonnées configurées dans le store si disponibles
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('distributor_payment_settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setStorePayment((prev) => ({
            ...prev,
            momoReceiverNumber: parsed.momoReceiverNumber || prev.momoReceiverNumber,
            momoAccountName: parsed.momoAccountName || prev.momoAccountName,
            orangeReceiverNumber: parsed.orangeReceiverNumber || prev.orangeReceiverNumber,
            orangeAccountName: parsed.orangeAccountName || prev.orangeAccountName,
            acceptCash: parsed.acceptCash !== undefined ? parsed.acceptCash : prev.acceptCash,
          }));
        } catch (e) {}
      }
    }
  }, []);

  const handleCopy = (text: string, label: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleNotifyPaid = async () => {
    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

      // Notification au backend si API active
      if (token) {
        await fetch(`${apiUrl}/orders/demo-order-1/notify-paid`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            method,
            customerTxRef: customerTxRef || (method === 'CASH' ? 'Espèces à la livraison' : 'Transfert Mobile Money'),
            amount: 7500,
          }),
        }).catch(() => {});
      }
    } catch (e) {
      // Tolérance dégradée
    } finally {
      setIsSubmitting(false);
      setStatus('AWAITING_CONFIRMATION');
    }
  };

  // Simulation interactive de la validation par le titulaire du compte
  const handleSimulateStoreConfirmation = () => {
    setStatus('SUCCESS');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-12 px-4 transition-colors">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* En-tête */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 text-pleingaz-red text-xs font-black uppercase tracking-wider">
            <ShieldCheck size={14} />
            Paiement Direct au Point de Vente
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Règlement de votre Commande</h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            Paiement direct sans intermédiaire ni frais cachés. Confirmation directe par le gérant.
          </p>
        </div>

        {/* Info Point de Vente Récepteur */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-pleingaz-red flex items-center justify-center font-bold">
              <Store size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase text-gray-400 block">Boutique Réceptrice des Fonds</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{storePayment.storeName}</span>
            </div>
          </div>
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
            Agréé PLEINGAZ
          </span>
        </div>

        {status === 'SUCCESS' ? (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-800 rounded-3xl p-8 text-center space-y-5 shadow-xl"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-full text-white shadow-lg shadow-emerald-500/30">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-emerald-800 dark:text-emerald-300">Paiement Validé par le Gérant !</h2>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Les fonds ont été bien reçus et vérifiés par le titulaire du compte. Votre bouteille PLEINGAZ est réservée et prête.
              </p>
            </div>
            
            {/* Code de remise physique D-05 */}
            <div className="bg-white dark:bg-neutral-900 border-2 border-dashed border-emerald-400 dark:border-emerald-700 rounded-2xl p-5 my-3 shadow-inner">
              <span className="text-xs uppercase font-extrabold text-gray-400 tracking-wider block mb-1">
                Code Secret de Remise Physique (D-05)
              </span>
              <span className="text-4xl font-black text-pleingaz-red font-mono tracking-widest block">
                4829
              </span>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-2">
                Communiquez ce code au livreur ou au comptoir <strong>UNIQUEMENT</strong> après avoir inspecté et reçu votre bouteille.
              </p>
            </div>
            
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl hover:bg-pleingaz-red transition-all shadow-lg"
            >
              Retour à l’accueil
            </button>
          </motion.div>
        ) : status === 'AWAITING_CONFIRMATION' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="animate-spin" size={28} />
              </div>
              <div>
                <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                  Étape 2 / 2 • Vérification en Cours
                </span>
                <h2 className="text-xl font-black text-amber-950 dark:text-amber-200">
                  En Attente de Confirmation par le Gérant
                </h2>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-800 text-xs text-gray-700 dark:text-neutral-300 space-y-2">
              <p>
                Votre signalement de virement a été transmis au gérant du <strong>{storePayment.storeName}</strong>.
              </p>
              <p className="text-gray-500 dark:text-neutral-400">
                Dès que le gérant consulte son SMS MoMo/Orange Money et confirme la réception des <strong>7 500 FCFA</strong>, votre écran s’actualisera automatiquement et votre code de retrait vous sera délivré.
              </p>
              {customerTxRef && (
                <div className="pt-2 border-t border-gray-100 dark:border-neutral-800 flex justify-between font-mono">
                  <span className="text-gray-400">Référence fournie :</span>
                  <span className="font-bold text-gray-900 dark:text-white">{customerTxRef}</span>
                </div>
              )}
            </div>

            {/* Déclencheur pour démo ou test direct */}
            <div className="pt-2 border-t border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                Simulation espace commerçant :
              </span>
              <button
                onClick={handleSimulateStoreConfirmation}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={15} />
                Valider côté gérant (Démo)
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Bannière Réservation de 15 min */}
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center justify-between text-amber-900 dark:text-amber-300 text-sm">
              <span className="font-medium flex items-center gap-2">
                <Clock size={16} />
                Réservation de stock garantie (D-05) :
              </span>
              <span className="font-black px-2.5 py-1 bg-amber-200 dark:bg-amber-900/60 rounded-lg font-mono">
                14:45 min
              </span>
            </div>

            {/* Récapitulatif Tarif Homologué Cameroun */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-neutral-800 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-neutral-300 font-medium">
                  Recharge Bouteille PLEINGAZ 12.5 kg (Tarif Homologué)
                </span>
                <span className="font-bold text-gray-900 dark:text-white">6 500 FCFA</span>
              </div>
              <div className="flex justify-between items-center text-sm pb-3 border-b border-gray-100 dark:border-neutral-800">
                <span className="text-gray-500 font-medium">Frais de livraison express quartier</span>
                <span className="font-bold text-gray-900 dark:text-white">1 000 FCFA</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <div>
                  <span className="text-base font-bold text-gray-900 dark:text-white block">Total Net à Payer</span>
                  <span className="text-[11px] text-gray-400">Sans commission intermédiaire</span>
                </div>
                <span className="text-2xl font-black text-pleingaz-red">7 500 FCFA</span>
              </div>
            </div>

            {/* Choix des Moyens de Règlement Direct */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase text-gray-500 dark:text-neutral-400 tracking-wider block">
                Sélectionnez le mode de règlement direct
              </label>

              {[
                {
                  id: 'MTN_MOMO',
                  label: 'MTN Mobile Money',
                  number: storePayment.momoReceiverNumber,
                  holder: storePayment.momoAccountName,
                  ussd: `*126*4*${storePayment.momoReceiverNumber}*7500#`,
                  badgeColor: 'bg-yellow-400 text-yellow-950',
                  borderActive: 'border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20',
                },
                {
                  id: 'ORANGE_MONEY',
                  label: 'Orange Money',
                  number: storePayment.orangeReceiverNumber,
                  holder: storePayment.orangeAccountName,
                  ussd: `#150*1*1*${storePayment.orangeReceiverNumber}*7500#`,
                  badgeColor: 'bg-orange-500 text-white',
                  borderActive: 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20',
                },
                {
                  id: 'CASH',
                  label: 'Espèces au Comptoir / à la Livraison',
                  number: null,
                  holder: 'Règlement en main propre',
                  ussd: null,
                  badgeColor: 'bg-emerald-500 text-white',
                  borderActive: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20',
                },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id as any)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between text-left ${
                    method === m.id
                      ? `${m.borderActive} shadow-sm`
                      : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300">
                      {m.id === 'CASH' ? <Banknote size={20} /> : <CreditCard size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-white text-sm">{m.label}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-neutral-400 block mt-0.5">
                        {m.holder}
                      </span>
                    </div>
                  </div>
                  {method === m.id && (
                    <div className="w-6 h-6 rounded-full bg-pleingaz-red text-white flex items-center justify-center shrink-0">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Détails du compte récepteur sélectionné */}
            <AnimatePresence mode="wait">
              {method !== 'CASH' ? (
                <motion.div
                  key={method}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-5 rounded-2xl bg-neutral-900 border border-white/10 text-white space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Coordonnées du compte commerçant
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono font-bold">
                      7 500 FCFA
                    </span>
                  </div>

                  {/* Numéro et bouton copier */}
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase block font-semibold">
                        Numéro {method === 'MTN_MOMO' ? 'MTN MoMo' : 'Orange Money'}
                      </span>
                      <span className="text-xl font-black font-mono tracking-wider text-white">
                        {method === 'MTN_MOMO' ? storePayment.momoReceiverNumber : storePayment.orangeReceiverNumber}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          method === 'MTN_MOMO' ? storePayment.momoReceiverNumber : storePayment.orangeReceiverNumber,
                          'num',
                        )
                      }
                      className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      {copied === 'num' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                      <span>{copied === 'num' ? 'Copié !' : 'Copier'}</span>
                    </button>
                  </div>

                  {/* Titulaire exact */}
                  <div className="text-xs text-neutral-300 flex items-center justify-between">
                    <span className="text-neutral-400">Titulaire enregistré :</span>
                    <span className="font-bold font-mono">
                      {method === 'MTN_MOMO' ? storePayment.momoAccountName : storePayment.orangeAccountName}
                    </span>
                  </div>

                  {/* Code USSD direct */}
                  <div className="p-3 rounded-xl bg-neutral-950/60 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Code USSD Direct :</span>
                      <span className="font-mono font-bold text-amber-300">
                        {method === 'MTN_MOMO'
                          ? `*126*4*${storePayment.momoReceiverNumber}*7500#`
                          : `#150*1*1*${storePayment.orangeReceiverNumber}*7500#`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          method === 'MTN_MOMO'
                            ? `*126*4*${storePayment.momoReceiverNumber}*7500#`
                            : `#150*1*1*${storePayment.orangeReceiverNumber}*7500#`,
                          'ussd',
                        )
                      }
                      className="p-1.5 text-neutral-400 hover:text-white"
                    >
                      {copied === 'ussd' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* Champ de saisie référence SMS */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                      <span>Référence de transaction / ID SMS reçu</span>
                      <span className="text-[10px] text-neutral-400">Facultatif mais recommandé</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: MP261020.1423.H01847 ou votre numéro"
                      value={customerTxRef}
                      onChange={(e) => setCustomerTxRef(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-950 border border-white/10 rounded-xl text-sm font-mono text-white placeholder:text-neutral-500 focus:border-pleingaz-red outline-none transition-colors"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs space-y-2"
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-200">
                    <Banknote size={18} />
                    Paiement en espèces lors de la réception
                  </div>
                  <p>
                    Préparez le montant exact de <strong>7 500 FCFA</strong>. Le règlement s'effectuera en main propre soit au comptoir du dépôt lors du retrait, soit auprès de votre livreur.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bouton de Validation */}
            <button
              onClick={handleNotifyPaid}
              disabled={isSubmitting}
              className="w-full py-4 bg-pleingaz-red text-white font-black text-base sm:text-lg rounded-2xl shadow-lg shadow-red-500/30 flex items-center justify-center gap-3 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Transmission du signalement...
                </>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  {method === 'CASH' ? 'Confirmer la commande en espèces' : 'J’ai envoyé les 7 500 FCFA'}
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 font-medium">
              Système officiel PLEINGAZ • Aucune commission prélevée sur votre transfert
            </p>
          </>
        )}
      </div>
    </div>
  );
}
