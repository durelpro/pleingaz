'use client';

import { useState } from 'react';
import {
  Truck,
  CheckCircle2,
  PackageSearch,
  PackageOpen,
  Download,
  ShieldCheck,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Bike,
  AlertTriangle,
  Banknote,
  RotateCcw,
  Check,
  ChevronRight,
  User,
  Navigation,
  FileText,
  KeyRound,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DeliveryTracker() {
  const [viewMode, setViewMode] = useState<'CLIENT' | 'COURIER'>('CLIENT');

  // État de la livraison active
  const [deliveryStatus, setDeliveryStatus] = useState<
    'CONFIRMED' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED'
  >('IN_TRANSIT');

  // Code secret D-05 (généré lors de la commande)
  const clientOtpCode = '4829';

  // État livreur D-05
  const [isCourierOnline, setIsCourierOnline] = useState(true);
  const [courierCashBalance, setCourierCashBalance] = useState(12000);
  const maxCashHolding = 50000; // D-05 : Plafond strict 50 000 FCFA

  // Saisie du code secret par le livreur
  const [enteredCode, setEnteredCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSuccess, setCodeSuccess] = useState(false);
  const [remitSuccess, setRemitSuccess] = useState(false);

  // Étapes du cycle de livraison
  const steps = [
    { key: 'CONFIRMED', label: 'Commande Validée', sub: 'Paiement encaissé au dépôt', icon: CheckCircle2 },
    { key: 'ASSIGNED', label: 'Livreur Assigné', sub: 'Moussa Bello (Moto)', icon: PackageSearch },
    { key: 'PICKED_UP', label: 'Bouteille Récupérée', sub: 'Départ du Dépôt Bonabéri', icon: PackageOpen },
    { key: 'IN_TRANSIT', label: 'En Route Quartier', sub: 'Arrivée estimée dans 8 min', icon: Truck },
    { key: 'DELIVERED', label: 'Livré & Conforme', sub: 'Code secret vérifié (D-05)', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === deliveryStatus);

  // Validation du code secret par le livreur
  const handleValidateDeliveryCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError(null);

    if (enteredCode.trim() !== clientOtpCode) {
      setCodeError('Code secret incorrect. Demandez au client de vérifier le code affiché sur son écran.');
      return;
    }

    setCodeSuccess(true);
    setTimeout(() => {
      setDeliveryStatus('DELIVERED');
      setCourierCashBalance((prev) => prev + 1000); // Rémunération course
      setCodeSuccess(false);
      setEnteredCode('');
    }, 1000);
  };

  // Réconciliation du cash au dépôt
  const handleRemitCash = () => {
    setRemitSuccess(true);
    setTimeout(() => {
      setCourierCashBalance(0);
      setRemitSuccess(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-10 px-4 transition-colors">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* En-tête & Sélecteur de Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-pleingaz-red uppercase tracking-wider">
              <ShieldCheck size={14} />
              Protocole Sécurisé D-05
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              {viewMode === 'CLIENT' ? 'Suivi de ma Livraison' : 'Terminal Livreur Express'}
            </h1>
            <p className="text-xs text-gray-500 font-mono">Commande #PG-20261020-4829</p>
          </div>

          {/* Switch Client / Livreur */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-neutral-800 rounded-2xl shrink-0">
            <button
              onClick={() => setViewMode('CLIENT')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'CLIENT'
                  ? 'bg-white dark:bg-neutral-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <User size={14} />
              <span>Vue Client</span>
            </button>
            <button
              onClick={() => setViewMode('COURIER')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'COURIER'
                  ? 'bg-pleingaz-red text-white shadow-sm shadow-red-500/30'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Bike size={14} />
              <span>Terminal Livreur</span>
            </button>
          </div>
        </div>

        {/* ========================================== */}
        {/* 1. VUE CLIENT : SUIVI & CODE SECRET D-05   */}
        {/* ========================================== */}
        {viewMode === 'CLIENT' && (
          <div className="space-y-6">
            
            {/* Carte Timeline de la Course */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-neutral-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-neutral-800">
                <div>
                  <span className="text-xs font-bold uppercase text-gray-400 block">Article en Acheminement</span>
                  <span className="text-base font-black text-gray-900 dark:text-white">
                    1x Recharge Bouteille PLEINGAZ 12.5 kg
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase text-gray-400 block">Total Réglé</span>
                  <span className="text-base font-black text-pleingaz-red">7 500 FCFA</span>
                </div>
              </div>

              {/* Barre de Progression Visuelle */}
              <div className="relative pl-3">
                <div className="absolute left-[26px] top-4 bottom-4 w-1 bg-gray-100 dark:bg-neutral-800 rounded-full" />
                
                <div className="space-y-6 relative">
                  {steps.map((step, index) => {
                    const isActive = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.key} className="flex items-start gap-4">
                        <motion.div
                          initial={false}
                          animate={{
                            backgroundColor: isActive ? '#E51A24' : '#f3f4f6',
                            scale: isCurrent ? 1.15 : 1,
                          }}
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-colors ${
                            isActive ? 'text-white shadow-lg shadow-red-500/30' : 'text-gray-400 dark:bg-neutral-800'
                          }`}
                        >
                          <Icon size={20} />
                        </motion.div>

                        <div className="pt-1">
                          <h3
                            className={`font-black text-sm ${
                              isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-neutral-400">{step.sub}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Fiche Livreur Assigné */}
            {deliveryStatus !== 'DELIVERED' && (
              <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pleingaz-red to-red-400 text-white flex items-center justify-center font-bold text-lg shadow-md">
                    MB
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-white text-sm">Moussa Bello</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        Moto Yamaha • Agréé
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 block mt-0.5">
                      Flotte Officielle Dépôt Bonabéri • 243 courses
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="tel:+237690112233"
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white text-xs font-bold hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Phone size={14} className="text-pleingaz-red" />
                    <span>Appeler</span>
                  </a>
                  <a
                    href="https://wa.me/237690112233"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            )}

            {/* Code Secret de Remise Physique D-05 */}
            {deliveryStatus !== 'DELIVERED' ? (
              <div className="bg-red-50 dark:bg-red-950/20 rounded-3xl p-6 sm:p-8 border-2 border-dashed border-red-300 dark:border-red-800 text-center space-y-4 shadow-sm">
                <div className="inline-flex items-center gap-2 text-xs font-black px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-pleingaz-red uppercase">
                  <KeyRound size={14} />
                  Sécurité Anti-Fraude (D-05)
                </div>
                <h3 className="font-black text-gray-900 dark:text-white text-lg">
                  Votre Code Secret de Confirmation Physique
                </h3>
                <p className="text-xs text-gray-600 dark:text-neutral-300 max-w-md mx-auto">
                  Communiquez ce code au livreur <strong>UNIQUEMENT</strong> lorsque vous tenez votre bouteille en main et avez vérifié le bouchon scellé d'origine PLEINGAZ.
                </p>
                <div className="text-5xl font-black text-pleingaz-red font-mono tracking-[0.25em] py-2">
                  {clientOtpCode}
                </div>
                <p className="text-[11px] text-gray-400 font-medium">
                  Le livreur doit saisir ce code sur son terminal pour débloquer et clôturer la livraison.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-3xl p-6 sm:p-8 border-2 border-emerald-300 dark:border-emerald-800 text-center space-y-4 shadow-lg">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full text-white shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-300">
                  Bouteille Livrée & Scellé Vérifié !
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-md mx-auto">
                  La remise physique a été certifiée par le protocole D-05. Votre facture officielle et bon de livraison sont disponibles.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => alert('Téléchargement du bordereau de livraison officiel PLEINGAZ certifié.')}
                    className="px-6 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs rounded-xl flex items-center justify-center gap-2 mx-auto hover:bg-pleingaz-red transition-all shadow-md"
                  >
                    <Download size={16} />
                    <span>Télécharger le Bon de Livraison & Facture</span>
                  </button>
                </div>
              </div>
            )}

            {/* Adresse & Repère Local */}
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs text-gray-600 dark:text-neutral-400 flex items-center gap-3">
              <MapPin size={18} className="text-pleingaz-red shrink-0" />
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">
                  Lieu de dépose : Bonabéri, face Collège Eyengue
                </span>
                <span>Douala, Région du Littoral • Remise au portail blanc</span>
              </div>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* 2. VUE LIVREUR : TERMINAL TERRAIN & CODE D-05    */}
        {/* ================================================= */}
        {viewMode === 'COURIER' && (
          <div className="space-y-6">
            
            {/* Jauge Plafond d'Espèces Détenues (Règle D-05) */}
            <div className="p-6 rounded-3xl bg-neutral-900 border border-white/10 text-white space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-black block tracking-wider">
                    Règle de Sécurité D-05 • Plafond Espèces
                  </span>
                  <h3 className="text-lg font-black text-white">Solde d'Espèces Détenues</h3>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black font-mono text-amber-400">
                    {courierCashBalance.toLocaleString('fr-FR')} / {maxCashHolding.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-neutral-950 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    courierCashBalance >= maxCashHolding
                      ? 'bg-red-500'
                      : courierCashBalance >= 35000
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (courierCashBalance / maxCashHolding) * 100)}%` }}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
                <span className="text-neutral-400">
                  {courierCashBalance >= maxCashHolding ? (
                    <span className="text-red-400 font-bold flex items-center gap-1.5">
                      <AlertTriangle size={15} />
                      Plafond atteint : Nouvelles courses bloquées
                    </span>
                  ) : (
                    `Capacité restante : ${(maxCashHolding - courierCashBalance).toLocaleString('fr-FR')} FCFA`
                  )}
                </span>

                <button
                  onClick={handleRemitCash}
                  disabled={courierCashBalance === 0 || remitSuccess}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                >
                  <Banknote size={14} className="text-amber-400" />
                  <span>{remitSuccess ? 'Réconciliation effectuée !' : 'Verser le cash au Dépôt'}</span>
                </button>
              </div>
            </div>

            {/* Fiche de Course en Cours */}
            <div className="p-6 rounded-3xl bg-neutral-900 border border-white/10 text-white space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-neutral-300">Course Active en Cours</span>
                </div>
                <span className="text-xs font-mono font-bold text-neutral-400">#PG-20261020-4829</span>
              </div>

              {/* Trajet & Adresses */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-red-500/20 text-pleingaz-red flex items-center justify-center shrink-0 font-bold text-xs">
                    1
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-bold block">Point de Départ (Dépôt)</span>
                    <span className="text-sm font-bold text-white block">Dépôt PLEINGAZ Bonabéri</span>
                    <span className="text-xs text-neutral-400">Face Marché Bonassama, Douala</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    2
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-bold block">Destination Client</span>
                    <span className="text-sm font-bold text-white block">Alain Fotso (+237 671 22 33 44)</span>
                    <span className="text-xs text-neutral-400">Bonabéri, face Collège Eyengue (Portail blanc)</span>
                  </div>
                </div>
              </div>

              {/* Actions d'Étape */}
              {deliveryStatus !== 'DELIVERED' && (
                <div className="pt-2 border-t border-white/10 space-y-4">
                  {deliveryStatus === 'ASSIGNED' && (
                    <button
                      onClick={() => setDeliveryStatus('PICKED_UP')}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-pleingaz-red to-red-600 text-white font-black text-sm flex items-center justify-center gap-2 hover:scale-[1.01] transition-all shadow-lg shadow-red-500/30"
                    >
                      <PackageOpen size={18} />
                      <span>Confirmer le Retrait de la Bouteille au Dépôt</span>
                    </button>
                  )}

                  {deliveryStatus === 'PICKED_UP' && (
                    <button
                      onClick={() => setDeliveryStatus('IN_TRANSIT')}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-pleingaz-red to-red-600 text-white font-black text-sm flex items-center justify-center gap-2 hover:scale-[1.01] transition-all shadow-lg shadow-red-500/30"
                    >
                      <Truck size={18} />
                      <span>Je suis en Route vers le Client</span>
                    </button>
                  )}

                  {deliveryStatus === 'IN_TRANSIT' && (
                    <form onSubmit={handleValidateDeliveryCode} className="space-y-4">
                      <div className="p-4 rounded-2xl bg-neutral-950 border border-white/10 space-y-3">
                        <div className="flex items-center gap-2 text-xs text-amber-400 font-bold">
                          <KeyRound size={16} />
                          <span>Validation Finale : Saisissez le Code Secret du Client</span>
                        </div>
                        <p className="text-[11px] text-neutral-400">
                          Demandez au client le code à 4 chiffres affiché sur son application après avoir inspecté la bouteille.
                        </p>

                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Code à 4 chiffres (ex: 4829)"
                          value={enteredCode}
                          onChange={(e) => setEnteredCode(e.target.value)}
                          className="w-full px-4 py-3.5 rounded-xl bg-neutral-900 border border-white/20 text-center font-mono text-2xl tracking-[0.25em] text-white focus:border-pleingaz-red outline-none"
                          required
                        />

                        {codeError && (
                          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
                            <AlertTriangle size={15} className="shrink-0" />
                            <span>{codeError}</span>
                          </div>
                        )}

                        {codeSuccess && (
                          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                            <CheckCircle2 size={15} />
                            <span>Code vérifié avec succès ! Remise enregistrée.</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30"
                      >
                        <ShieldCheck size={18} />
                        <span>Valider la Remise Physique & Clôturer la Course</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

              {deliveryStatus === 'DELIVERED' && (
                <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-200">
                    <CheckCircle2 size={18} />
                    Course Terminée avec Succès
                  </div>
                  <p>
                    La remise physique est validée. Vos 1 000 FCFA de rémunération de course ont été crédités sur votre portefeuille livreur.
                  </p>
                </div>
              )}
            </div>

            {/* Simulateur Démo Rapide */}
            <div className="pt-4 border-t border-white/10 text-center space-y-2">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-widest">
                Contrôleur Démo d'Étape Rapide
              </span>
              <div className="flex flex-wrap gap-2 justify-center">
                {steps.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setDeliveryStatus(s.key as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      deliveryStatus === s.key
                        ? 'bg-[#E51A24] text-white shadow-sm'
                        : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
