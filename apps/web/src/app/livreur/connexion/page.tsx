'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Truck, Phone, Lock, ArrowRight, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';

export default function LivreurConnexionPage() {
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
      let cleanPhone = phone.trim().replace(/\s+/g, '');
      if (cleanPhone.startsWith('6') && cleanPhone.length === 9) {
        cleanPhone = '+237' + cleanPhone;
      }

      const res = await fetch('http://localhost:3001/api/v1/courier/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Identifiants livreur non reconnus.');
      }

      if (data.accessToken) {
        localStorage.setItem('pleingaz_courier_token', data.accessToken);
      }

      router.push('/livreur/missions');
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
          href="/espace-pro"
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Espace Pro</span>
        </Link>
      </header>

      <main className="max-w-md mx-auto w-full my-auto py-8">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-neutral-800">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 mb-2 border border-amber-500/20">
              Livreur Agréé
            </span>
            <h1 className="text-2xl font-bold text-white mb-1">
              Portail Livreur
            </h1>
            <p className="text-xs text-neutral-400">
              Consultez vos missions de tournée, vos collectes espèces et confirmez vos livraisons.
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
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="tap-target w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-sm transition-colors mt-6 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <span>Ouvrir mes missions</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-800 text-center">
            <Link
              href="/livreur/inscription"
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              Nouveau coursier ? <span className="text-amber-400 font-semibold">Postuler comme partenaire</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="max-w-md mx-auto w-full py-4 text-center text-[11px] text-neutral-500 border-t border-neutral-900">
        © 2026 PLEINGAZ Cameroun • Réseau logistique certifié
      </footer>
    </div>
  );
}
