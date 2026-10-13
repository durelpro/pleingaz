"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import BackButton from '@/components/common/BackButton';

export default function AdminLogin() {
  const [phone, setPhone] = useState('+237600000000');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3001/auth/login/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), pass: password })
      });
      if (res.ok) {
        const data = await res.json();
        const roles = data.user?.roles || (data.user?.role ? [data.user.role] : []);
        if (!roles.includes('ADMIN')) {
          setError('Accès refusé : Ce compte ne dispose pas des privilèges administrateur.');
          return;
        }
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
        }
        localStorage.setItem('pleingaz_admin_auth', 'true');
        localStorage.setItem('pleingaz_user_data', JSON.stringify(data.user));
        router.push('/admin/dashboard');
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || 'Identifiants administrateur incorrects.');
      }
    } catch (e) {
      setError('Erreur de connexion au serveur d\'authentification.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      
      {/* Bouton de retour en haut à gauche */}
      <div className="absolute top-6 left-6 z-20">
        <BackButton fallbackHref="/" label="Retour à l'accueil" />
      </div>

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

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1.5">Numéro de téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: +237600000000"
              className="w-full bg-black/50 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl py-3.5 px-4 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1.5">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe administrateur"
                className="w-full bg-black/50 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl py-3.5 pl-12 pr-12 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono tracking-wider"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors p-1"
                title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2 font-medium">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? 'Connexion en cours...' : 'Accéder au Dashboard'}
            <ArrowRight size={18} />
          </button>
        </form>
      </motion.div>

    </div>
  );
}
