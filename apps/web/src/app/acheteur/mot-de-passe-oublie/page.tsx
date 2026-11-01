'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Loader2, MessageCircle } from 'lucide-react';

export default function MotDePasseOubliePage() {
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let cleanPhone = phone.trim().replace(/\s+/g, '');
      if (cleanPhone.startsWith('6') && cleanPhone.length === 9) {
        cleanPhone = '+237' + cleanPhone;
      }

      await fetch('http://localhost:3001/api/v1/buyer/auth/recovery/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      // Règle anti-énumération : toujours afficher le message de confirmation
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between p-4 sm:p-8">
      <header className="max-w-md mx-auto w-full flex items-center justify-between py-4 border-b border-neutral-800">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Image
            src="/logoprincipal.png"
            alt="Logo PLEINGAZ"
            width={130}
            height={38}
            className="h-9 w-auto object-contain"
          />
        </Link>
        <Link
          href="/acheteur/connexion"
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Connexion</span>
        </Link>
      </header>

      <main className="max-w-md mx-auto w-full my-auto py-8">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-neutral-800">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              Mot de passe oublié
            </h1>
            <p className="text-xs text-neutral-400">
              Réinitialisez votre accès en toute sécurité via votre ligne WhatsApp enregistrée.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-600/10 text-green-400 flex items-center justify-center mx-auto mb-4 border border-green-600/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-semibold text-white mb-2">
                Consultez votre WhatsApp
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                Si ce numéro correspond à un compte actif, vous recevrez les instructions sécurisées pour réinitialiser votre mot de passe.
              </p>
              <Link
                href="/acheteur/connexion"
                className="tap-target w-full rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>Retour à la page de connexion</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Votre numéro WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="+237 699 00 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="tap-target w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors mt-6 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Envoyer les instructions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="max-w-md mx-auto w-full py-4 text-center text-[11px] text-neutral-500 border-t border-neutral-900">
        © 2026 PLEINGAZ Cameroun
      </footer>
    </div>
  );
}
