'use client';

import Link from 'next/link';
import { Search, MapPin, ShieldCheck, Zap, Bot, Flame, Gift, Sparkles, Store, Truck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-orange-500 selection:text-white">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-neutral-950/80 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform">
              <Flame size={22} className="text-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-white block">PLEINGAZ</span>
              <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block -mt-1">Réseau Officiel</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-neutral-300">
            <Link href="/search?auto=true" className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
              <MapPin size={16} className="text-orange-500" />
              Trouver du gaz
            </Link>
            <Link href="/stores" className="hover:text-orange-400 transition-colors">
              Points de vente
            </Link>
            <Link href="/distributor/apply" className="hover:text-orange-400 transition-colors">
              Devenir Distributeur
            </Link>
            <Link href="/delivery" className="hover:text-orange-400 transition-colors">
              Espace Livreur
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="px-4 py-2 rounded-xl text-xs font-bold border border-white/15 hover:bg-white/10 transition-all text-neutral-200"
            >
              Mon Compte
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              +100 pts Offerts
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-4 overflow-hidden">
        {/* Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-orange-600/20 via-red-600/15 to-transparent rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/15 to-red-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider shadow-sm"
          >
            <Flame size={14} className="animate-bounce" />
            Distribution Officielle de Gaz Domestique au Cameroun
          </motion.div>

          <motion.h1
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-tight tracking-tight"
          >
            Votre Gaz à Domicile,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-600">
              au prix officiel en 1 clic !
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-xl text-neutral-300 max-w-2xl mx-auto font-medium"
          >
            Localisez les dépôts agréés ayant du stock vérifié, commandez directement auprès de la <strong>Boutique Officielle PLEINGAZ</strong> et faites-vous livrer en toute sécurité.
          </motion.p>

          {/* Primary Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/search?auto=true"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-extrabold text-base sm:text-lg shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Search size={22} className="animate-pulse" />
              Trouver du gaz autour de moi
            </Link>

            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-base sm:text-lg backdrop-blur-md flex items-center justify-center gap-3 hover:scale-105 transition-all"
            >
              <Gift size={22} className="text-orange-400" />
              Créer un compte (+100 pts fidélité)
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Banner: Official PLEINGAZ Direct Store */}
      <section className="max-w-5xl mx-auto px-4 -mt-6 pb-12 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-950/70 via-neutral-900 to-neutral-900 border-2 border-orange-500/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-black uppercase tracking-wider shadow-md">
              <Sparkles size={14} />
              Boutique Officielle Certifiée du Concepteur
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Dépôt Central & Siège PLEINGAZ (Vente Directe)
            </h3>
            <p className="text-neutral-300 text-sm max-w-xl">
              Stock optimal garanti 24/7 de bouteilles 6kg, 12.5kg, 50kg et accessoires de sécurité homologués au Boulevard de la Liberté, Akwa - Douala.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/stores/store-pleingaz-siege-officiel"
              className="px-6 py-3.5 rounded-xl font-extrabold text-sm bg-white text-neutral-950 hover:bg-neutral-100 transition-all shadow-lg flex items-center gap-2"
            >
              Commander au Siège
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 3 Pillars D-01 to D-06 */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ y: -6 }}
            className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
              <MapPin size={24} />
            </div>
            <h4 className="font-extrabold text-lg text-white">Géolocalisation au Clic (D-02)</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Détection instantanée des dépôts les plus proches par calcul SQL Haversine, sans conserver vos coordonnées exactes.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck size={24} />
            </div>
            <h4 className="font-extrabold text-lg text-white">Prix Officiels Homologués (D-01)</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              6 500 FCFA pour la recharge 12.5kg. Tout dépassement tarifaire est strictement interdit et neutralisé côté serveur.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
              <Truck size={24} />
            </div>
            <h4 className="font-extrabold text-lg text-white">Code Secret Client SHA-256 (D-05)</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Remise en main propre sécurisée par code secret remis par le client au livreur partenaire indépendant.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Dedicated Portals Section */}
      <section className="max-w-5xl mx-auto px-4 py-16 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-white">Espaces & Portails Dédiés</h2>
          <p className="text-neutral-400 text-sm">Accédez aux fonctionnalités réservées de la plateforme PLEINGAZ</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Link
            href="/distributor/apply"
            className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-white/10 transition-all space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Store size={20} />
            </div>
            <h3 className="font-bold text-base text-white group-hover:text-orange-400 transition-colors">Devenir Distributeur (D-04)</h3>
            <p className="text-xs text-neutral-400">KYC simplifié en 3 documents légaux (CNI, portrait, photo boutique).</p>
          </Link>

          <Link
            href="/delivery"
            className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Truck size={20} />
            </div>
            <h3 className="font-bold text-base text-white group-hover:text-emerald-400 transition-colors">Portail Livreur Partenaire</h3>
            <p className="text-xs text-neutral-400">Acceptation des courses, validation par code OTP et gestion des espèces.</p>
          </Link>

          <Link
            href="/admin/dashboard"
            className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bot size={20} />
            </div>
            <h3 className="font-bold text-base text-white group-hover:text-purple-400 transition-colors">Control Center & Rapports</h3>
            <p className="text-xs text-neutral-400">Supervision en direct et 15 rapports réels sans données fictives (D-03).</p>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4 text-center text-xs text-neutral-500 space-y-2">
        <p>© 2026 PLEINGAZ S.A. — Tous droits réservés. Distribution exclusive de gaz domestique au Cameroun.</p>
        <p>Prix officiel homologué par le Ministère du Commerce. Aucune surfacturation tolérée.</p>
      </footer>
    </div>
  );
}
