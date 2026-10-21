'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Phone, CheckCircle2, AlertCircle, ArrowLeft, 
  Store, KeyRound, User, FileText, Lock, ChevronRight, Clock
} from 'lucide-react';
import Link from 'next/link';

export default function StoreClaimPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params?.storeId as string;

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Téléphone & Demande OTP, 2: Code OTP, 3: Succès
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [claimNotes, setClaimNotes] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<{ name: string; city: string; address?: string; phoneMasked?: string } | null>(null);

  useEffect(() => {
    // Récupération des infos basiques de la boutique
    async function loadStore() {
      try {
        const res = await fetch(`http://localhost:3001/stores/${storeId}`);
        if (res.ok) {
          const data = await res.json();
          setStoreData({
            name: data.name,
            city: data.city,
            address: data.address,
            phoneMasked: data.phone ? data.phone.replace(/(\+\d{3})(\d{2})\d+(\d{2})/, '$1 $2••••$3') : undefined
          });
          if (data.phone) {
            setPhoneNumber(data.phone.replace(/^\+237/, ''));
          }
        } else {
          // Fallback UI
          setStoreData({
            name: `Point de vente (${storeId?.slice(0, 8)})`,
            city: 'Cameroun'
          });
        }
      } catch (e) {
        setStoreData({
          name: `Point de vente PLEINGAZ`,
          city: 'Cameroun'
        });
      }
    }
    if (storeId) {
      loadStore();
    }
  }, [storeId]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch(`http://localhost:3001/imports/claims/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          phoneNumber: phoneNumber.trim(),
          contactName: contactName.trim() || undefined,
          notes: claimNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Impossible d\'envoyer le code de vérification.');
      }

      setStep(2);
    } catch (err: any) {
      setErrorMessage(err.message || 'Une erreur est survenue lors de l\'envoi de l\'OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch(`http://localhost:3001/imports/claims/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          otpCode: otpCode.trim(),
          contactName: contactName.trim() || undefined,
          notes: claimNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Code de vérification invalide ou expiré.');
      }

      setStep(3);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la vérification de l\'OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Navigation retour */}
        <Link 
          href={`/stores/${storeId}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-pleingaz-red transition-colors"
        >
          <ArrowLeft size={16} /> Retour à la fiche du point de vente
        </Link>

        {/* Carte principale */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl shadow-xl overflow-hidden p-8 sm:p-10"
        >
          {/* Header */}
          <div className="flex items-center gap-4 border-b border-gray-100 dark:border-neutral-800 pb-6 mb-8">
            <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center shrink-0 border border-amber-500/20">
              <Store size={28} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md">
                Revendication distributeur (CR-002)
              </span>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                {storeData ? storeData.name : 'Chargement...'}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {storeData?.city ? `${storeData.city} • ` : ''}Référence : {storeId}
              </p>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= 1 ? 'bg-pleingaz-red text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                1
              </span>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Coordonnées</span>
            </div>
            <div className="h-0.5 flex-1 bg-gray-200 dark:bg-neutral-800 mx-3"></div>
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= 2 ? 'bg-pleingaz-red text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                2
              </span>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Vérification SMS</span>
            </div>
            <div className="h-0.5 flex-1 bg-gray-200 dark:bg-neutral-800 mx-3"></div>
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step === 3 ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                3
              </span>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Validation</span>
            </div>
          </div>

          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm flex items-start gap-3"
            >
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* Étape 1 : Demande OTP */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200/80 dark:border-neutral-800 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Lock size={16} className="text-amber-500" />
                  Vous êtes le gérant ou propriétaire de ce point de vente ?
                </div>
                <p>
                  Ce point a été répertorié sur la carte officielle PLEINGAZ. Pour gérer vos stocks en temps réel et recevoir les commandes des acheteurs, revendiquez-le via votre numéro de téléphone professionnel.
                </p>
                {storeData?.phoneMasked && (
                  <p className="text-xs text-gray-500">
                    Numéro déclaré lors de l'import : <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{storeData.phoneMasked}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Votre nom & prénom (ou raison sociale)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Ex: Paul Mbarga"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pleingaz-red outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Numéro de téléphone mobile (Cameroun)
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 font-bold text-sm">
                    +237
                  </span>
                  <input
                    type="tel"
                    required
                    pattern="[62][0-9]{8}"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\s+/g, ''))}
                    placeholder="6XXXXXXXX"
                    className="w-full px-4 py-3 rounded-r-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-pleingaz-red outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  Un code de vérification SMS / WhatsApp vous sera envoyé instantanément.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Remarques ou précisions pour l'administrateur (facultatif)
                </label>
                <textarea
                  rows={2}
                  value={claimNotes}
                  onChange={(e) => setClaimNotes(e.target.value)}
                  placeholder="Ex: Gérant depuis 2 ans, licence PLEINGAZ n°..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-pleingaz-red outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-pleingaz-red text-white font-black text-base shadow-lg shadow-red-500/25 hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Envoi en cours...</span>
                ) : (
                  <>
                    <span>Recevoir mon code par SMS</span>
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Étape 2 : Vérification OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-red-50 text-pleingaz-red rounded-full flex items-center justify-center mx-auto">
                  <KeyRound size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Entrez le code à 6 chiffres
                </h3>
                <p className="text-sm text-gray-500">
                  Un code SMS a été envoyé au <span className="font-bold text-gray-700 dark:text-gray-300">+237 {phoneNumber}</span>.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.5em] text-3xl font-black py-4 rounded-2xl border-2 border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:border-pleingaz-red outline-none"
                />
                <p className="text-xs text-center text-gray-400 mt-2">
                  Code valable pendant 15 minutes.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 transition-colors"
                >
                  Modifier
                </button>
                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-2/3 py-3 rounded-xl bg-pleingaz-red text-white font-black shadow-lg shadow-red-500/25 hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Vérification...' : 'Valider mon code'}
                </button>
              </div>
            </form>
          )}

          {/* Étape 3 : Succès & En attente d'approbation admin */}
          {step === 3 && (
            <div className="text-center py-6 space-y-6">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200"
              >
                <CheckCircle2 size={40} />
              </motion.div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                  Demande enregistrée avec succès !
                </h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Votre identité téléphonique a été vérifiée avec succès. Conformément aux règles de sécurité PLEINGAZ, votre dossier est transmis au Control Center pour validation finale.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-left text-sm space-y-2 text-amber-800 dark:text-amber-300">
                <div className="font-bold flex items-center gap-2">
                  <Clock size={16} />
                  Prochaines étapes :
                </div>
                <ul className="list-disc list-inside text-xs space-y-1 text-amber-700 dark:text-amber-400">
                  <li>L'équipe de conformité PLEINGAZ vérifie vos coordonnées sous 24h ouvrées.</li>
                  <li>Une fois validé, votre compte distributeur sera rattaché à ce point de vente.</li>
                  <li>Vous pourrez actualiser vos stocks de gaz (Bouteilles 12.5Kg, 6Kg) et recevoir des réservations en direct.</li>
                </ul>
              </div>

              <div className="pt-4 flex justify-center gap-4">
                <Link
                  href="/search"
                  className="px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  Retourner à la recherche
                </Link>
                <Link
                  href={`/stores/${storeId}`}
                  className="px-6 py-3 rounded-xl border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-100 transition-colors"
                >
                  Voir la fiche boutique
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
