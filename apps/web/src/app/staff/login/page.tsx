'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Shield, Lock, KeyRound, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function StaffLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/v1/staff/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, totpCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Authentification refusée.');
      }

      if (data.accessToken) {
        localStorage.setItem('pleingaz_staff_token', data.accessToken);
      }

      router.push('/admin/control-center');
    } catch (err: any) {
      setError(err.message || 'Identifiants ou code TOTP invalides.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col justify-between p-4 sm:p-8">
      <header className="max-w-md mx-auto w-full flex items-center justify-between py-4 border-b border-neutral-900">
        <Image
          src="/logoprincipal.png"
          alt="PLEINGAZ"
          width={120}
          height={34}
          className="h-8 w-auto object-contain opacity-70"
        />
        <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
          RESTRICTED_ACCESS
        </span>
      </header>

      <main className="max-w-md mx-auto w-full my-auto py-8">
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 text-neutral-300 flex items-center justify-center mx-auto mb-3 border border-neutral-800">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white mb-1">
              Portail Personnel & Administration
            </h1>
            <p className="text-xs text-neutral-500">
              Double authentification matérielle requise (D-11.5).
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
              <label className="block text-xs font-mono text-neutral-400 mb-1.5">
                Identifiant ou Numéro E.164
              </label>
              <input
                type="text"
                required
                placeholder="staff.admin@pleingaz.internal"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm font-mono focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1.5">
                Mot de passe maître
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm font-mono focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1.5">
                Code Authenticator TOTP (6 chiffres)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm font-mono tracking-widest focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="tap-target w-full rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition-colors mt-6 flex items-center justify-center gap-2 border border-neutral-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validation de la session...</span>
                </>
              ) : (
                <>
                  <span>Authentifier la session Staff</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <footer className="max-w-md mx-auto w-full py-4 text-center text-[10px] font-mono text-neutral-700 border-t border-neutral-900">
        Toute tentative d'intrusion non autorisée fait l'objet d'une journalisation immuable dans AuditLog.
      </footer>
    </div>
  );
}
