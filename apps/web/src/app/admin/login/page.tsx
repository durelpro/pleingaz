"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Mot de passe démo
      localStorage.setItem('pleingaz_admin_auth', 'true');
      router.push('/admin/dashboard');
    } else {
      setError('Mot de passe incorrect.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/30 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/30 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Espace Administrateur</h1>
          <p className="text-zinc-400 text-sm mt-2 text-center">
            Veuillez vous authentifier pour accéder à la supervision de PLEINGAZ.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe d'accès..."
                className="w-full bg-black/50 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm mt-2 font-medium">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            Accéder au Dashboard
            <ArrowRight size={18} />
          </button>
        </form>
        
        <p className="text-zinc-500 text-xs text-center mt-6">
          Démo : tapez <code className="text-purple-400 font-mono">admin123</code>
        </p>
      </motion.div>

    </div>
  );
}
