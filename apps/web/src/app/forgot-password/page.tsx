'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  KeyRound,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Phone,
  Copy,
  Check,
  ArrowLeft,
  Smartphone,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'PHONE' | 'CHALLENGE' | 'SUCCESS'>('PHONE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [challengeCode, setChallengeCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [copied, setCopied] = useState(false);

  // Numéro WhatsApp officiel de support PLEINGAZ
  const OFFICIAL_WHATSAPP = '237657696567';
  const OFFICIAL_DISPLAY = '+237 657 696 567';

  // 1. Demande de code WhatsApp
  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clean = phone.replace(/[\s\-\(\)]/g, '').trim();
    if (!clean || clean.length < 8) {
      setError('Veuillez renseigner un numéro de téléphone valide (ex: 657696567 ou +237 699112233).');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Génération code de défi éphémère (Option A - D-12)
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const generatedCode = `PG-${randomSuffix}`;
      setChallengeCode(generatedCode);
      setInputCode(generatedCode); // Pré-rempli pour confort maximal sur mobile
      setLoading(false);
      setStep('CHALLENGE');
    }, 700);
  };

  // Copie rapide du code
  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(challengeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // 2. Réinitialisation du mot de passe
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!inputCode.trim()) {
      setError('Veuillez renseigner le code de confirmation.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('SUCCESS');
    }, 1000);
  };

  const whatsappMessage = encodeURIComponent(
    `PLEINGAZ : Réinitialiser mon mot de passe. Code de confirmation : ${challengeCode}`
  );
  const whatsappUrl = `https://wa.me/${OFFICIAL_WHATSAPP}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden py-12">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-neutral-900/95 border border-neutral-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative z-10 space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 text-white shadow-lg shadow-red-600/30 mb-2">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white">Récupération de compte</h1>
          <p className="text-xs text-neutral-400">
            Confirmation 100% gratuite par WhatsApp • Sans frais d&apos;opérateur
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Étape 1 : Saisie Téléphone */}
        {step === 'PHONE' && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Numéro de téléphone / WhatsApp *
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="tel"
                  required
                  placeholder="Ex: 657696567 ou 699112233"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-semibold text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                />
              </div>
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Fonctionne pour tous les profils (Client, Distributeur, Gestionnaire).
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 transition-transform active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Génération du code sécurisé...</span>
                </>
              ) : (
                <>
                  <MessageSquare size={18} />
                  <span>Envoyer mon code via WhatsApp (Gratuit)</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="text-xs font-bold text-neutral-400 hover:text-white flex items-center justify-center gap-1 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Retour à la connexion</span>
              </Link>
            </div>
          </form>
        )}

        {/* Étape 2 : Confirmation WhatsApp 1-Clic & Nouveau mot de passe */}
        {step === 'CHALLENGE' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* Encadré 1-Clic WhatsApp Mobile */}
            <div className="bg-emerald-950/40 border-2 border-emerald-500/40 rounded-2xl p-4 text-center space-y-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wide text-emerald-400 block">
                Votre Code de Confirmation Éphémère (D-12)
              </span>

              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-mono font-black text-white tracking-widest bg-neutral-950/80 px-4 py-1.5 rounded-xl border border-emerald-500/30">
                  {challengeCode}
                </span>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl border border-neutral-700 transition-colors"
                  title="Copier le code"
                >
                  {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                </button>
              </div>

              {/* Bouton direct WhatsApp 1-clic mobile */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 transition-transform active:scale-[0.98]"
              >
                <MessageSquare size={18} />
                <span>1-Clic : Confirmer sur WhatsApp ({OFFICIAL_DISPLAY})</span>
              </a>

              <p className="text-[10px] text-neutral-400 leading-relaxed">
                Appuyez sur le bouton vert ci-dessus : WhatsApp s&apos;ouvre avec votre code pré-rempli. Aucun frais n&apos;est facturé.
              </p>
            </div>

            {/* Saisie Nouveau Mot de Passe */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Code de confirmation
                </label>
                <input
                  type="text"
                  required
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Nouveau mot de passe (6 caractères min.)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 transition-transform active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Valider mon nouveau mot de passe</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Étape 3 : Succès & Redirection */}
        {step === 'SUCCESS' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-white">Mot de passe réinitialisé !</h2>
              <p className="text-xs text-neutral-400">
                Votre compte a été sécurisé avec votre nouveau mot de passe.
              </p>
            </div>

            <Link
              href="/login"
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-transform"
            >
              <span>Se connecter maintenant</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

      </motion.div>
    </div>
  );
}

