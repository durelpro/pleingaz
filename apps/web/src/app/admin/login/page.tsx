"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const router = useRouter();

  // Redirection souveraine vers le portail personnel officiel (D-11.4 / suppression de E1)
  const handleRedirect = () => {
    router.push('/login/personnel?redirect=/admin/dashboard');
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
            L'accès à l'administration PLEINGAZ nécessite une authentification forte à deux facteurs (TOTP) sur le portail personnel officiel.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleRedirect}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-red-600/30 transition-all text-sm"
          >
            S'authentifier via le Portail Personnel (2FA)
            <ArrowRight size={18} />
          </button>
        </div>
        
        <p className="text-zinc-500 text-xs text-center mt-6">
          Conformité D-11.4 & D-12 : Authentification sécurisée obligatoire.
        </p>
      </motion.div>

    </div>
  );
}
