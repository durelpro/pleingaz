"use client";

import Link from 'next/link';
import { Search, MapPin, ShieldCheck, Zap, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      
      {/* Header / Hero Section */}
      <div className="bg-pleingaz-red pt-16 pb-24 px-4 rounded-b-[3rem] shadow-lg relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white blur-3xl"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl mx-auto relative z-10 text-center space-y-6"
        >
          <motion.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-md"
          >
            Votre Gaz à Domicile,<br />en un clic !
          </motion.h1>
          <p className="text-red-100 text-lg md:text-xl font-medium max-w-xl mx-auto">
            Trouvez les distributeurs agréés autour de vous, commandez en ligne et faites-vous livrer en toute sécurité.
          </p>
          
          {/* Barre de recherche directe depuis l'accueil */}
          <div className="pt-2 max-w-xl mx-auto">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.currentTarget.elements.namedItem('homeSearch') as HTMLInputElement)?.value;
                if (input && input.trim()) {
                  window.location.href = `/search?q=${encodeURIComponent(input.trim())}`;
                } else {
                  window.location.href = '/search';
                }
              }}
              className="relative flex items-center bg-white rounded-2xl p-2 shadow-2xl border border-red-200"
            >
              <div className="pl-3 pr-2 text-gray-400">
                <Search size={22} className="text-pleingaz-red" />
              </div>
              <input 
                name="homeSearch"
                type="text"
                placeholder="Entrez votre quartier (ex: Bonamoussadi, Akwa, Bastos...)"
                className="flex-1 bg-transparent border-none outline-none text-gray-800 text-base placeholder-gray-400 font-medium py-2 pr-2"
              />
              <button
                type="submit"
                className="bg-pleingaz-red hover:bg-[#d9230f] text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all shrink-0 text-sm"
              >
                Rechercher
              </button>
            </form>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/search" 
              className="w-full sm:w-auto px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold text-sm rounded-xl backdrop-blur-md flex items-center justify-center gap-2 transition-all"
            >
              <MapPin size={18} />
              Rechercher par carte & GPS
            </Link>
            <Link 
              href="/chat" 
              className="w-full sm:w-auto px-6 py-3 bg-red-800/40 hover:bg-red-800/60 text-white font-bold text-sm rounded-xl backdrop-blur-md flex items-center justify-center gap-2 transition-all"
            >
              <Bot size={18} />
              Assistant IA
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-20">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="bg-white dark:bg-neutral-900 p-6 rounded-3xl shadow-md border border-gray-100 dark:border-neutral-800 text-center space-y-3 hover:-translate-y-2 transition-transform">
            <div className="w-12 h-12 mx-auto bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl flex items-center justify-center">
              <MapPin size={24} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Proximité</h3>
            <p className="text-sm text-gray-500">Géolocalisation des dépôts les plus proches de chez vous.</p>
          </motion.div>

          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="bg-white dark:bg-neutral-900 p-6 rounded-3xl shadow-md border border-gray-100 dark:border-neutral-800 text-center space-y-3 hover:-translate-y-2 transition-transform">
            <div className="w-12 h-12 mx-auto bg-green-50 dark:bg-green-900/20 text-green-500 rounded-2xl flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Prix Officiels</h3>
            <p className="text-sm text-gray-500">Achetez au prix homologué, sans surfacturation.</p>
          </motion.div>

          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="bg-white dark:bg-neutral-900 p-6 rounded-3xl shadow-md border border-gray-100 dark:border-neutral-800 text-center space-y-3 hover:-translate-y-2 transition-transform">
            <div className="w-12 h-12 mx-auto bg-red-50 dark:bg-red-900/20 text-pleingaz-red rounded-2xl flex items-center justify-center">
              <Zap size={24} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Rapide</h3>
            <p className="text-sm text-gray-500">Paiement Mobile Money et livraison express avec code OTP.</p>
          </motion.div>

        </motion.div>
      </div>

      {/* Accès rapides */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="max-w-3xl mx-auto px-4 py-16 space-y-8"
      >
        <h2 className="text-2xl font-black text-gray-900 dark:text-white text-center">Espaces Dédiés</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/buyer/portal" className="group p-6 bg-white dark:bg-neutral-900 rounded-3xl border-2 border-gray-100 dark:border-neutral-800 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">Espace Acheteur</h3>
            <p className="text-sm text-gray-500 mt-2">Connectez-vous pour utiliser vos points de fidélité et gérer vos achats.</p>
          </Link>
          
          <Link href="/distributor/portal" className="group p-6 bg-white dark:bg-neutral-900 rounded-3xl border-2 border-gray-100 dark:border-neutral-800 hover:border-pleingaz-red hover:shadow-lg hover:shadow-red-500/10 transition-all">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-pleingaz-red transition-colors">Espace Distributeur</h3>
            <p className="text-sm text-gray-500 mt-2">Connectez-vous à votre tableau de bord ou rejoignez notre réseau agréé.</p>
          </Link>
          
          <Link href="/admin/dashboard" className="group p-6 bg-white dark:bg-neutral-900 rounded-3xl border-2 border-gray-100 dark:border-neutral-800 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors">Espace Administrateur</h3>
            <p className="text-sm text-gray-500 mt-2">Gestion globale, alertes et supervision de la plateforme.</p>
          </Link>
          
          <Link href="/securite" className="group p-6 bg-white dark:bg-neutral-900 rounded-3xl border-2 border-gray-100 dark:border-neutral-800 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/10 transition-all">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-pleingaz-red transition-colors">Guide de Sécurité du Gaz</h3>
            <p className="text-sm text-gray-500 mt-2">Les 6 règles d'or, branchement du détendeur et conduite à tenir en cas de fuite.</p>
          </Link>

          <Link href="/chat" className="group p-6 bg-white dark:bg-neutral-900 rounded-3xl border-2 border-gray-100 dark:border-neutral-800 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">Assistant IA PLEINGAZ</h3>
            <p className="text-sm text-gray-500 mt-2">Posez vos questions 24h/24 sur les prix homologués, les stocks et la sécurité.</p>
          </Link>

          <Link href="/support" className="group p-6 bg-white dark:bg-neutral-900 rounded-3xl border-2 border-gray-100 dark:border-neutral-800 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all sm:col-span-2">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">Centre d'Assistance & Signalements</h3>
            <p className="text-sm text-gray-500 mt-2">Contactez-nous ou signalez un problème chez un revendeur (fermé, prix abusif...).</p>
          </Link>
        </div>
      </motion.div>

    </div>
  );
}
