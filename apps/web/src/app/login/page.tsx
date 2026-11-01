'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, MessageSquare, Phone, ArrowRight, ShieldCheck, CheckCircle2, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

type UserRole = 'CUSTOMER' | 'DISTRIBUTOR' | 'COURIER';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('CUSTOMER');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [callPhone, setCallPhone] = useState('');
  const [step, setStep] = useState<'PHONE' | 'CHALLENGE'>('PHONE');
  const [challengeCode, setChallengeCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Génération du défi WhatsApp (Option A - D-12)
  const handleRequestChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanWhatsapp = whatsappPhone.trim();
    if (!cleanWhatsapp || cleanWhatsapp.length < 8) {
      setError('Veuillez renseigner un numéro WhatsApp valide (ex: +237 699 123 456).');
      return;
    }

    // Code défi court unique (Option A D-12)
    const randomCode = `PG-${Math.floor(1000 + Math.random() * 9000)}`;
    setChallengeCode(randomCode);
    setStep('CHALLENGE');
  };

  // Validation et connexion
  const handleVerify = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simuler l'authentification réussie et persistance locale
      const userObj = {
        phone: whatsappPhone,
        whatsappPhone: whatsappPhone,
        callPhone: callPhone || whatsappPhone,
        role: selectedRole,
        firstName: selectedRole === 'CUSTOMER' ? 'Marie' : selectedRole === 'DISTRIBUTOR' ? 'Dépôt Akwa Nord' : 'Paul',
        lastName: selectedRole === 'CUSTOMER' ? 'Tchouassi' : selectedRole === 'COURIER' ? 'Mouto' : '',
        loyaltyPoints: 120,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('pleingaz_token', `jwt_demo_${Date.now()}`);
        localStorage.setItem('pleingaz_user', JSON.stringify(userObj));
        document.cookie = `pleingaz_session=${encodeURIComponent(JSON.stringify(userObj))}; path=/; max-age=86400; SameSite=Lax`;
        if (selectedRole === 'DISTRIBUTOR') {
          localStorage.setItem('distributor_phone', whatsappPhone);
          localStorage.setItem('distributor_store', JSON.stringify({
            id: 'store-demo-1',
            name: 'Dépôt Gaz Akwa Nord',
            city: 'Douala',
            neighborhood: 'Akwa',
          }));
        }
      }

      // Redirection étanche selon profil (D-11)
      if (selectedRole === 'CUSTOMER') {
        router.push('/account');
      } else if (selectedRole === 'DISTRIBUTOR') {
        router.push('/distributor/inventory');
      } else if (selectedRole === 'COURIER') {
        router.push('/delivery');
      }
    } catch (err: any) {
      setError("Erreur lors de la vérification. Réessayez l'envoi du message WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden py-12">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 text-white shadow-lg shadow-red-600/30 mb-3">
            <Flame className="w-8 h-8 fill-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase font-sans">
            PLEINGAZ
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Connexion Gratuite par WhatsApp • Zéro mot de passe
          </p>
        </div>

        {/* Sélecteur de profil (D-11 : Espace étanche) */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-950 border border-neutral-800 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setSelectedRole('CUSTOMER'); setStep('PHONE'); }}
            className={`py-2 px-3 text-xs font-bold rounded-xl transition-all ${
              selectedRole === 'CUSTOMER'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Acheteur
          </button>
          <button
            type="button"
            onClick={() => { setSelectedRole('DISTRIBUTOR'); setStep('PHONE'); }}
            className={`py-2 px-3 text-xs font-bold rounded-xl transition-all ${
              selectedRole === 'DISTRIBUTOR'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Distributeur
          </button>
          <button
            type="button"
            onClick={() => { setSelectedRole('COURIER'); setStep('PHONE'); }}
            className={`py-2 px-3 text-xs font-bold rounded-xl transition-all ${
              selectedRole === 'COURIER'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Livreur
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {step === 'PHONE' ? (
          <form onSubmit={handleRequestChallenge} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Numéro WhatsApp principal (Identifiant E.164)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                </div>
                <input
                  type="tel"
                  placeholder="+237 699 123 456"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  className="w-full bg-neutral-950/80 border border-neutral-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition"
                  required
                />
              </div>
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Aucun SMS payant ne vous sera facturé.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Numéro d'appel de secours (Optionnel)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  placeholder="+237 677 654 321"
                  value={callPhone}
                  onChange={(e) => setCallPhone(e.target.value)}
                  className="w-full bg-neutral-950/80 border border-neutral-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition duration-200 mt-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Recevoir le défi WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="space-y-5 text-center">
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl text-left">
              <span className="text-xs font-bold text-emerald-400 block mb-1">
                💬 Étape 1 : Envoyez ce code sur WhatsApp
              </span>
              <p className="text-xs text-neutral-300 mb-3">
                Pour prouver votre numéro sans frais, envoyez ce message prérempli au numéro officiel PLEINGAZ :
              </p>
              
              <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                <span className="font-mono font-bold text-base text-amber-400 tracking-wider">
                  {challengeCode}
                </span>
                <a
                  href={`https://wa.me/237600000000?text=${encodeURIComponent(challengeCode)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-500 transition"
                >
                  Ouvrir WhatsApp ↗
                </a>
              </div>
            </div>

            <div className="text-left space-y-2">
              <span className="text-xs font-bold text-neutral-300 block">
                ⚡ Étape 2 : Confirmation instantanée
              </span>
              <button
                type="button"
                onClick={handleVerify}
                disabled={loading}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition"
              >
                {loading ? (
                  <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>J'ai envoyé le message • Me connecter</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('PHONE')}
                className="w-full py-2 text-xs text-neutral-500 hover:text-neutral-300 transition"
              >
                ← Changer de numéro
              </button>
            </div>
          </div>
        )}

        {/* Footer & Lien personnel masqué */}
        <div className="mt-8 pt-4 border-t border-neutral-800/80 flex flex-col gap-2 text-center text-xs text-neutral-400">
          <div>
            Pas encore inscrit ?{' '}
            <Link href="/register" className="text-red-400 hover:text-red-300 font-semibold underline underline-offset-2">
              Créer un compte
            </Link>
          </div>
          <div className="pt-2">
            <Link
              href="/login/personnel"
              className="text-[11px] text-neutral-500 hover:text-neutral-300 transition flex items-center justify-center gap-1"
            >
              <Lock className="w-3 h-3 text-neutral-600" />
              <span>Accès réservé au personnel (2FA)</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
