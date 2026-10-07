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
          
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/search" 
              className="w-full sm:w-auto px-8 py-4 bg-white text-pleingaz-red font-bold text-lg rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:scale-105 transition-transform"
            >
              <Search size={22} />
              Trouver du gaz
            </Link>
            <Link 
              href="/chat" 
              className="w-full sm:w-auto px-8 py-4 bg-red-800/40 text-white font-bold text-lg rounded-2xl backdrop-blur-sm flex items-center justify-center gap-3 hover:bg-red-800 transition-colors"
            >
              <Bot size={22} />
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
          <Link href="/distributor/apply" className="group p-6 bg-white dark:bg-neutral-900 rounded-3xl border-2 border-gray-100 dark:border-neutral-800 hover:border-pleingaz-red hover:shadow-lg hover:shadow-red-500/10 transition-all">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-pleingaz-red transition-colors">Devenir Distributeur</h3>
            <p className="text-sm text-gray-500 mt-2">Rejoignez notre réseau agréé et augmentez vos ventes.</p>
          </Link>
          
          <Link href="/admin/dashboard" className="group p-6 bg-white dark:bg-neutral-900 rounded-3xl border-2 border-gray-100 dark:border-neutral-800 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors">Espace Administrateur</h3>
            <p className="text-sm text-gray-500 mt-2">Gestion globale, alertes et supervision de la plateforme.</p>
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
