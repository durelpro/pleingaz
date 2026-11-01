'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Phone, Lock, ArrowRight, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';

export default function AcheteurConnexionPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Normalisation du numéro pour le Cameroun
      let cleanPhone = phone.trim().replace(/\s+/g, '');
      if (cleanPhone.startsWith('6') && cleanPhone.length === 9) {
        cleanPhone = '+237' + cleanPhone;
      } else if (cleanPhone.startsWith('237') && cleanPhone.length === 12) {
        cleanPhone = '+' + cleanPhone;
      }

      const res = await fetch('http://localhost:3001/api/v1/buyer/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Identifiants incorrects. Veuillez réessayer.');
      }

      // Stocker le token localement pour les requêtes autorisées
      if (data.accessToken) {
        localStorage.setItem('pleingaz_buyer_token', data.accessToken);
        localStorage.setItem('pleingaz_buyer_profile', JSON.stringify(data.user || {}));
      }

      // Redirection vers l'espace acheteur
      router.push('/acheteur');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between p-4 sm:p-8">
      {/* En-tête */}
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
          href="/"
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Accueil</span>
        </Link>
      </header>

      {/* Formulaire de connexion */}
      <main className="max-w-md mx-auto w-full my-auto py-8">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-neutral-800">
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-600/10 text-red-500 mb-3 border border-red-600/20">
              Espace Client Particulier
            </span>
            <h1 className="text-2xl font-bold text-white mb-2">
              Connexion Acheteur
            </h1>
            <p className="text-xs text-neutral-400">
              Accédez à vos commandes de gaz, votre jauge de quota et vos adresses de livraison.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Numéro WhatsApp
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
              <p className="text-[11px] text-neutral-500 mt-1">
                Le numéro utilisé lors de votre inscription WhatsApp.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  Mot de passe
                </label>
                <Link
                  href="/acheteur/mot-de-passe-oublie"
                  className="text-[11px] text-red-400 hover:text-red-300 transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  <span>Vérification...</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-800 text-center">
            <p className="text-xs text-neutral-400 mb-2">
              Vous n'avez pas encore de compte client ?
            </p>
            <Link
              href="/acheteur/inscription"
              className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors inline-flex items-center gap-1"
            >
              Créer mon compte en 30 secondes
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Pied de page */}
      <footer className="max-w-md mx-auto w-full py-4 text-center text-[11px] text-neutral-500 border-t border-neutral-900">
        © 2026 PLEINGAZ Cameroun • Protection des données garantie
      </footer>
    </div>
  );
}
