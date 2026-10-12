'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Store, LogIn, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function DistributorPortal() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('http://localhost:3001/auth/login/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pass: password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
        }
        window.location.href = '/distributor/dashboard';
      } else {
        const err = await res.json();
        setErrorMsg(err.message || 'Identifiants incorrects');
      }
    } catch (e) {
      setErrorMsg('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Decorative background */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-pleingaz-red/5 rounded-full filter blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full filter blur-[100px] -z-10" />

      <div className="w-full max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-pleingaz-red transition-colors font-semibold mb-8">
          <ArrowLeft size={20} />
          Retour à l'accueil
        </Link>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Espace <span className="text-transparent bg-clip-text bg-gradient-to-r from-pleingaz-red to-[#ff6a00]">Distributeur</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Gérez votre point de vente, mettez à jour votre stock et augmentez votre visibilité sur PLEINGAZ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card Login */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <LogIn size={32} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Déjà partenaire ?</h2>
              <p className="text-gray-500 mb-6 font-medium">
                Connectez-vous pour accéder à votre tableau de bord.
              </p>
            </div>
            
            <form className="space-y-4" onSubmit={handleLogin}>
              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Numéro de téléphone ou Email</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: 690000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mot de passe</label>
                <input 
                  type="password" 
                  required
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 text-center bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading && <Loader2 size={20} className="animate-spin" />}
                {isLoading ? 'Connexion...' : 'Se Connecter'}
              </button>
            </form>
          </div>

          {/* Card Register */}
          <div className="bg-white dark:bg-neutral-900 border-2 border-orange-200 dark:border-orange-900/30 p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="z-10">
              <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/30 text-pleingaz-red rounded-2xl flex items-center justify-center mb-6 border border-orange-100 dark:border-orange-900/50">
                <Store size={32} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Nouveau ici ?</h2>
              <p className="text-gray-500 mb-8 font-medium">
                Créez votre profil distributeur. Nous examinerons vos pièces justificatives pour vous référencer sur notre carte.
              </p>
            </div>
            <Link 
              href="/distributor/apply"
              className="w-full py-4 text-center bg-gradient-to-r from-pleingaz-red to-[#ff6a00] text-white font-black text-lg rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all z-10 relative"
            >
              Créer mon profil
            </Link>
          </div>

        </div>

        {/* Bannière Flagship Entreprise */}
        <div className="mt-8 bg-gradient-to-r from-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center font-black text-xl shrink-0">
              🏢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base">Dépôt Central & Flotte Directe PLEINGAZ</span>
                <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-full uppercase">Officiel</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Accès réservé aux gestionnaires de la boutique propre de l'entreprise INFOTECH S.A.</p>
            </div>
          </div>
          <Link
            href="/distributor/flagship"
            className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/30 transition-all shrink-0"
          >
            Accéder au Flagship →
          </Link>
        </div>
      </div>
    </div>
  );
}
