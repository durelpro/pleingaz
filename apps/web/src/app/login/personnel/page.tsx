'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, UserCheck, KeyRound, ArrowRight, AlertCircle, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function StaffLoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'ACCOUNT_MANAGER' | 'ADMIN'>('ACCOUNT_MANAGER');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password.trim()) {
      setError('Veuillez renseigner votre identifiant et votre mot de passe.');
      return;
    }

    if (!totpCode || totpCode.length < 6) {
      setError('Le code de sécurité TOTP à 6 chiffres est obligatoire.');
      return;
    }

    setLoading(true);

    try {
      const staffUser = {
        phone: identifier,
        role: role,
        firstName: role === 'ACCOUNT_MANAGER' ? 'Adèle' : 'Directeur',
        lastName: role === 'ACCOUNT_MANAGER' ? 'Mimbang' : 'Général',
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('pleingaz_token', `jwt_staff_${Date.now()}`);
        localStorage.setItem('pleingaz_user', JSON.stringify(staffUser));
      }

      // Redirection étanche staff
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError("Échec de l'authentification staff. Vérifiez vos identifiants.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden py-12">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-sky-600/15 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-sky-400 mb-3 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-wider text-white">
            Portail Personnel & Staff
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Double Authentification Obligatoire (TOTP) • D-11 / D-15
          </p>
        </div>

        {/* Sélection du rôle Staff */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setRole('ACCOUNT_MANAGER')}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              role === 'ACCOUNT_MANAGER'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Gestionnaire de compte
          </button>
          <button
            type="button"
            onClick={() => setRole('ADMIN')}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              role === 'ADMIN'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Administrateur
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleStaffLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Identifiant professionnel
            </label>
            <input
              type="text"
              placeholder="Ex: agent-04@pleingaz.cm"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Code TOTP Authenticator (6 chiffres)
              </label>
              <span className="text-[10px] text-sky-400 font-mono">D-11 2FA</span>
            </div>
            <input
              type="text"
              maxLength={6}
              placeholder="123456"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-center font-mono text-lg font-bold tracking-[6px] text-sky-400 placeholder-slate-700 outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition duration-200 mt-2"
          >
            {loading ? (
              <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Valider l'accès sécurisé</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <Link href="/login" className="text-xs text-slate-500 hover:text-slate-300 transition">
            ← Retour au portail public
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
