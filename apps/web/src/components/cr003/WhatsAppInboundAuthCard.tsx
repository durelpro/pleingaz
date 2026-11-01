'use client';

import React, { useState } from 'react';

interface WhatsAppInboundAuthCardProps {
  portal?: 'CUSTOMER' | 'DISTRIBUTOR' | 'COURIER';
  onAuthenticated?: (token: string) => void;
}

export const WhatsAppInboundAuthCard: React.FC<WhatsAppInboundAuthCardProps> = ({
  portal = 'CUSTOMER',
  onAuthenticated,
}) => {
  const [phone, setPhone] = useState('');
  const [callPhone, setCallPhone] = useState('');
  const [challengeCode, setChallengeCode] = useState('');
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);
  const [step, setStep] = useState<'INPUT_PHONE' | 'CHALLENGE_ISSUED' | 'MANUAL_VERIFY'>('INPUT_PHONE');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Étape 1 : Demande de défi WhatsApp
  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!phone.trim()) {
      setErrorMessage('Le numéro WhatsApp est obligatoire.');
      return;
    }

    if (isRegisterMode && (!callPhone.trim() || callPhone.trim() === phone.trim())) {
      setErrorMessage('Le numéro secondaire de secours est obligatoire et doit être différent de votre WhatsApp principal (D-12.3).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/challenge/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose: isRegisterMode ? 'REGISTER' : 'LOGIN' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Impossible d\'initier la connexion WhatsApp');
      }

      setChallengeCode(data.code);
      setWhatsappLink(data.whatsappLink);
      setStep('CHALLENGE_ISSUED');
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Étape 2 : Vérification manuelle du code si le webhook tarde
  const handleVerifyManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/challenge/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: challengeCode, portal }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Code WhatsApp incorrect');
      }

      if (onAuthenticated && data.accessToken) {
        onAuthenticated(data.accessToken);
      } else {
        window.location.href = portal === 'CUSTOMER' ? '/account' : portal === 'DISTRIBUTOR' ? '/distributor' : '/delivery';
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Code erroné');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-b from-neutral-900/90 to-neutral-950/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
      <div className="text-center mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 shadow-lg shadow-red-950/40 mb-3">
          <span className="text-2xl">🔥</span>
        </div>
        <h2 className="text-xl font-black tracking-tight text-white">
          {isRegisterMode ? 'Créer un Compte PLEINGAZ' : 'Connexion Rapide'}
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Authentification sécurisée par Preuve Entrante WhatsApp (D-12, Zéro coût SMS)
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-300">
          {errorMessage}
        </div>
      )}

      {step === 'INPUT_PHONE' && (
        <form onSubmit={handleInitiate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Numéro WhatsApp Principal
            </label>
            <input
              type="tel"
              required
              placeholder="ex: +237 699 12 34 56"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-red-500 focus:outline-none"
            />
          </div>

          {isRegisterMode && (
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Numéro Secondaire de Secours (Appels / Urgences D-12.3)
              </label>
              <input
                type="tel"
                required
                placeholder="ex: +237 677 65 43 21 (Distinct)"
                value={callPhone}
                onChange={(e) => setCallPhone(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-red-500 focus:outline-none"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                Utilisé pour le contact livreur et la récupération de compte encadrée.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-700 py-3.5 text-center text-sm font-bold text-white shadow-xl shadow-red-950/40 transition-all hover:scale-[0.99] active:scale-[0.97]"
          >
            {loading ? 'Génération du défi...' : 'Continuer avec WhatsApp'}
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              {isRegisterMode ? 'Déjà inscrit ? Se connecter' : 'Nouvel acheteur ? Créer un compte'}
            </button>
          </div>
        </form>
      )}

      {step === 'CHALLENGE_ISSUED' && (
        <div className="space-y-5 text-center">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4">
            <p className="text-xs text-neutral-300 mb-2">Votre code de sécurité éphémère (10 min) :</p>
            <div className="text-3xl font-black tracking-widest text-emerald-400 py-1">
              {challengeCode}
            </div>
          </div>

          <p className="text-xs text-neutral-400">
            Cliquez ci-dessous pour ouvrir WhatsApp et envoyer ce code au numéro officiel vérifié de PLEINGAZ :
          </p>

          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-[#25D366] py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-emerald-950/40 transition-all hover:bg-[#20ba59] active:scale-[0.97]"
            >
              <span>Envoyer par WhatsApp</span>
            </a>
          )}

          <div className="pt-2 border-t border-white/5">
            <button
              onClick={() => setStep('MANUAL_VERIFY')}
              className="text-xs font-semibold text-neutral-400 hover:text-white"
            >
              Saisie manuelle du code reçu
            </button>
          </div>
        </div>
      )}

      {step === 'MANUAL_VERIFY' && (
        <form onSubmit={handleVerifyManual} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Saisissez le code (ex: PG-XXXX)
            </label>
            <input
              type="text"
              required
              placeholder="PG-XXXX"
              value={challengeCode}
              onChange={(e) => setChallengeCode(e.target.value.toUpperCase())}
              className="w-full text-center tracking-widest text-lg font-bold rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-white focus:border-red-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-700 py-3.5 text-center text-sm font-bold text-white shadow-xl shadow-red-950/40 transition-all hover:scale-[0.99] active:scale-[0.97]"
          >
            {loading ? 'Vérification...' : 'Valider et Accéder'}
          </button>
        </form>
      )}
    </div>
  );
};
