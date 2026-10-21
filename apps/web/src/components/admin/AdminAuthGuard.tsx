'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Lock, ArrowRight, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Si on est sur la page de login, accès direct
    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      return;
    }

    // Vérification du localStorage
    try {
      const auth = localStorage.getItem('pleingaz_admin_auth');
      if (auth === 'true') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      setIsAuthenticated(false);
    }
  }, [pathname]);

  const handleQuickLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      try {
        localStorage.setItem('pleingaz_admin_auth', 'true');
      } catch (e) {}
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Mot de passe incorrect (Démo: admin123)');
    }
  };

  // Pendant l'initialisation côté client (SSR/Hydration)
  if (isAuthenticated === null) {
    if (pathname === '/admin/login') {
      return <>{children}</>;
    }
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white p-4">
        <div className="w-8 h-8 border-3 border-pleingaz-red border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-neutral-400">Chargement sécurisé...</p>
      </div>
    );
  }

  // Si non authentifié et pas sur /admin/login : afficher directement l'écran de déverrouillage élégant
  if (!isAuthenticated && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-600/20 rounded-full blur-[100px]" />

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-pleingaz-red to-red-700 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 mb-4">
              <Shield className="text-white" size={32} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-pleingaz-red bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              Espace Restreint Control Center
            </span>
            <h1 className="text-2xl font-black text-white mt-2">Accès Administrateur</h1>
            <p className="text-zinc-400 text-xs mt-1.5 text-center leading-relaxed">
              Veuillez saisir votre mot de passe d'habilitation pour accéder à la supervision de PLEINGAZ.
            </p>
          </div>

          <form onSubmit={handleQuickLogin} className="space-y-4">
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe administrateur..."
                  autoFocus
                  className="w-full bg-black/60 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-pleingaz-red focus:ring-1 focus:ring-pleingaz-red transition-all"
                  required
                />
              </div>
              {error && <p className="text-red-400 text-xs mt-2 font-medium">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-pleingaz-red text-white font-black text-sm rounded-xl py-3.5 flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
            >
              <span>Déverrouiller le module</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
            <span>Environnement Démo</span>
            <span className="font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded">admin123</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
