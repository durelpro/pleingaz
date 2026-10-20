'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  MapPin,
  ShieldCheck,
  Zap,
  Flame,
  Gift,
  Sparkles,
  Store,
  Truck,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Clock,
  Gauge,
  CookingPot,
  X,
  ShoppingCart,
  MessageCircle,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const officialCatalog = [
  {
    id: 'prod-pg-125',
    sku: 'PG-BOT-125',
    name: 'Recharge Gaz Butane PLEINGAZ 12.5 kg',
    subtitle: 'Signature "Always Full" • Échange Standard Homologué',
    image: '/products/bouteille-pleingaz-12-5kg.jpg',
    category: 'Bouteilles & Recharges',
    price: 6500,
    badge: '🔥 Bouteille Phare Homologuée',
    desc: 'Échange standard de bouteille 12.5 kg vide contre une bouteille pleine scellée en usine. Gaz butane purifié haute performance.',
    inStock: true,
  },
  {
    id: 'prod-pg-125-pack',
    sku: 'PG-BOT-125-PACK',
    name: 'Pack Bouteille Complète 12.5 kg (Consigne + Gaz)',
    subtitle: 'Premier Achat • Bouteille Neuve Garantie',
    image: '/products/bouteille-pleingaz-12-5kg.jpg',
    category: 'Bouteilles & Recharges',
    price: 26500,
    badge: '📦 Pack Premier Équipement',
    desc: 'Comprend la bouteille de gaz neuve PLEINGAZ 12.5 kg rouge et blanche scellée d’usine avec sa charge complète de gaz.',
    inStock: true,
  },
  {
    id: 'prod-pg-rec-verre',
    sku: 'PG-REC-002',
    name: 'Table de Cuisson Verre Trempé Prestige PLEINGAZ',
    subtitle: 'Double Brûleur Turbo • Motifs Floraux Sérigraphiés',
    image: '/products/rechaud-gaz-2-feux-verre-luxe.jpg',
    category: 'Tables de Cuisson',
    price: 24500,
    badge: '✨ Design Cuisine Moderne',
    desc: 'Surface en verre trempé haute résistance aux chocs thermiques et rayures, allumage automatique piezo et flammes bleues concentrées.',
    inStock: true,
  },
  {
    id: 'prod-pg-rec-noir',
    sku: 'PG-REC-001',
    name: 'Réchaud à Gaz 2 Feux Métal Émaillé Noir PLEINGAZ',
    subtitle: 'Double Brûleur Fonte Haute Température',
    image: '/products/rechaud-gaz-2-feux-noir.jpg',
    category: 'Tables de Cuisson',
    price: 16500,
    badge: '⚡ Robuste & Économique',
    desc: 'Structure ultra-robuste en acier émaillé noir anti-rouille, brûleurs en fonte démontables et molettes de réglage progressif.',
    inStock: true,
  },
  {
    id: 'prod-pg-det',
    sku: 'PG-ACC-DET',
    name: 'Détendeur de Sécurité Basse Pression avec Manomètre',
    subtitle: 'Indicateur de Pression & Niveau de Gaz Réel (30 mbar)',
    image: '/products/detendeur-securite-manometre.jpg',
    category: 'Sécurité & Accessoires',
    price: 6000,
    badge: '🛡️ Sécurité Vitale Anti-Fuite',
    desc: 'Cadran gradué avec aiguille de contrôle du stock de gaz restant, clapet de coupure automatique instantané en cas de fuite.',
    inStock: true,
  },
  {
    id: 'prod-pg-060',
    sku: 'PG-BOT-060',
    name: 'Recharge Gaz Butane PLEINGAZ 6 kg',
    subtitle: 'Format Compact Léger • Idéal Petits Espaces',
    image: '/products/bouteille-pleingaz-12-5kg.jpg',
    category: 'Bouteilles & Recharges',
    price: 3120,
    badge: '🏷️ Tarif Homologué 3 120 F',
    desc: 'Recharge pour bouteille 6 kg PLEINGAZ. Légère, facilement transportable, idéale pour petits ménages ou cuissons rapides.',
    inStock: true,
  },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<'TOUS' | 'BOUTEILLES' | 'CUISSON' | 'SECURITE'>('TOUS');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [bottleChoice, setBottleChoice] = useState<'RECHARGE' | 'PACK'>('RECHARGE');
  const [orderMode, setOrderMode] = useState<'DEPOT' | 'LIVRAISON'>('DEPOT');

  const filteredCatalog = officialCatalog.filter((item) => {
    if (activeCategory === 'BOUTEILLES') return item.category === 'Bouteilles & Recharges';
    if (activeCategory === 'CUISSON') return item.category === 'Tables de Cuisson';
    if (activeCategory === 'SECURITE') return item.category === 'Sécurité & Accessoires';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0d0707] text-white selection:bg-[#E51A24] selection:text-white relative overflow-x-hidden">
      
      {/* Dynamic Background Mesh (Rouge PLEINGAZ & Noir Obsidienne) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[#E51A24]/25 via-[#990e15]/15 to-transparent rounded-full blur-[150px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] bg-[#E51A24]/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 -left-40 w-[500px] h-[500px] bg-[#E51A24]/10 rounded-full blur-[140px]" />
      </div>

      {/* Top Navbar Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0d0707]/85 border-b border-[#E51A24]/20 shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#E51A24] via-[#f02934] to-[#ff5964] flex items-center justify-center text-white shadow-lg shadow-[#E51A24]/40 group-hover:scale-105 group-hover:rotate-2 transition-all">
              <Flame size={26} className="text-white fill-white" />
            </div>
            <div>
              <span className="font-black text-2xl tracking-tight text-white block">
                PLEIN<span className="text-[#E51A24]">GAZ</span>
              </span>
              <span className="text-[10px] text-red-300 font-extrabold uppercase tracking-widest block -mt-1">
                Réseau Numérique Officiel
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-neutral-300">
            <Link href="/search?auto=true" className="hover:text-[#E51A24] transition-colors flex items-center gap-1.5 group">
              <MapPin size={17} className="text-[#E51A24] group-hover:scale-110 transition-transform" />
              <span>Où Trouver du Gaz ?</span>
            </Link>
            <Link href="/stores" className="hover:text-[#E51A24] transition-colors">
              Points de Vente Agréés
            </Link>
            <Link href="/distributor/apply" className="hover:text-[#E51A24] transition-colors flex items-center gap-1.5">
              <Store size={16} className="text-amber-400" />
              <span>Espace Distributeur</span>
            </Link>
            <Link href="/delivery" className="hover:text-[#E51A24] transition-colors flex items-center gap-1.5">
              <Truck size={16} className="text-emerald-400" />
              <span>Espace Livreur</span>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="px-4 py-2.5 rounded-xl text-xs font-bold border border-white/15 hover:bg-white/10 hover:border-[#E51A24]/40 transition-all text-neutral-200"
            >
              Mon Compte
            </Link>
            <Link
              href="/register"
              className="px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#E51A24] to-[#c7101a] text-white shadow-lg shadow-[#E51A24]/30 hover:shadow-[#E51A24]/60 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Sparkles size={15} />
              <span>+100 pts Fidélité</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section Vibrant */}
      <section className="relative pt-16 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#E51A24]/20 via-[#E51A24]/10 to-transparent border border-[#E51A24]/40 text-red-200 text-xs font-black uppercase tracking-wider shadow-md shadow-[#E51A24]/10"
          >
            <Flame size={15} className="text-[#E51A24] fill-[#E51A24] animate-pulse" />
            Réseau Officiel Certifié INFOTECH S.A. • Cameroun
          </motion.div>

          <motion.h1
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.1] tracking-tight"
          >
            Le Réseau Officiel <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-red-100 to-[#E51A24] drop-shadow-sm">
              PLEINGAZ à portée de main !
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-base sm:text-xl text-neutral-300 max-w-3xl mx-auto font-normal leading-relaxed"
          >
            Localisation instantanée au mètre près, stock vérifié en direct, prix officiel garanti (6 500 FCFA la recharge 12.5 kg) et livraison sécurisée par code client.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/search?auto=true"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#E51A24] via-[#f02934] to-[#c7101a] text-white font-black text-base sm:text-lg shadow-xl shadow-[#E51A24]/40 hover:shadow-[#E51A24]/70 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 border border-red-400/30"
            >
              <Search size={22} className="animate-pulse" />
              <span>Trouver du gaz autour de moi</span>
            </Link>

            <Link
              href="/stores/store-pleingaz-siege-officiel"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-[#E51A24]/30 text-white font-bold text-base sm:text-lg backdrop-blur-md flex items-center justify-center gap-3 hover:scale-105 transition-all"
            >
              <Store size={22} className="text-[#E51A24]" />
              <span>Boutique du Siège Central</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Banner: Siège Central PLEINGAZ */}
      <section className="max-w-6xl mx-auto px-4 -mt-4 pb-16 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#200507] via-[#150506] to-[#120405] border-2 border-[#E51A24]/40 shadow-2xl shadow-[#E51A24]/10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E51A24] text-white text-xs font-black uppercase tracking-wider shadow-md">
              <Sparkles size={14} />
              Dépôt Central & Siège Officiel Concepteur
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Boutique Centrale PLEINGAZ Akwa (Vente Directe)
            </h3>
            <p className="text-neutral-300 text-sm max-w-2xl leading-relaxed">
              Disponibilité 24/7 garantie sur l’ensemble de la gamme : Bouteilles 12.5 kg, 6 kg, 50 kg, tables de cuisson et accessoires de sécurité homologués au Boulevard de la Liberté, Douala.
            </p>
          </div>

          <Link
            href="/stores/store-pleingaz-siege-officiel"
            className="px-7 py-4 rounded-2xl font-black text-sm bg-white text-neutral-950 hover:bg-neutral-100 hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2.5 shrink-0"
          >
            <span>Commander au Siège</span>
            <ArrowRight size={18} className="text-[#E51A24]" />
          </Link>
        </motion.div>
      </section>

      {/* PRODUITS PLEINGAZ OFFICIELS : SHOWCASE PREMIUM */}
      <section className="max-w-7xl mx-auto px-4 py-12 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E51A24]/15 border border-[#E51A24]/30 text-red-300 text-xs font-bold uppercase tracking-wider">
            <CookingPot size={15} className="text-[#E51A24]" />
            Catalogue & Équipements Officiels Certifiés
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Gamme Officielle <span className="text-[#E51A24]">PLEINGAZ</span>
          </h2>
          <p className="text-neutral-400 text-base max-w-2xl mx-auto">
            Des produits d’origine certifiés, rigoureusement testés pour la sécurité de votre foyer au Cameroun.
          </p>
        </div>

        {/* Onglets Filtres par Catégorie */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          {[
            { id: 'TOUS', label: 'Toute la Gamme (6)', icon: Sparkles },
            { id: 'BOUTEILLES', label: 'Bouteilles & Recharges', icon: Flame },
            { id: 'CUISSON', label: 'Tables de Cuisson', icon: CookingPot },
            { id: 'SECURITE', label: 'Sécurité & Accessoires', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 border ${
                  isActive
                    ? 'bg-[#E51A24] text-white border-red-500 shadow-lg shadow-[#E51A24]/30 scale-105'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-300 border-white/10 hover:border-white/20'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Grille Dynamique des Produits Officiels */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredCatalog.map((prod, idx) => (
              <motion.div
                key={prod.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                whileHover={{ y: -8 }}
                className="bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-[#E51A24]/50 rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 shadow-xl group relative overflow-hidden"
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between gap-2 mb-3 z-10">
                  <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-[#E51A24]/20 border border-[#E51A24]/40 text-red-300">
                    {prod.badge}
                  </span>
                  <span className="text-[11px] font-bold text-neutral-400">
                    {prod.category}
                  </span>
                </div>

                {/* Product Real Image with Smooth Hover Effect */}
                <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-neutral-900/60 border border-white/5 flex items-center justify-center p-3 mb-4 group-hover:bg-neutral-900/80 transition-colors">
                  <div className="relative w-full h-full">
                    <Image
                      src={prod.image}
                      alt={prod.name}
                      fill
                      sizes="(max-w-768px) 100vw, 33vw"
                      className="object-contain group-hover:scale-108 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-2 mb-4">
                  <h3 className="font-black text-lg text-white group-hover:text-red-400 transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-amber-300/90 font-medium">
                    {prod.subtitle}
                  </p>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {prod.desc}
                  </p>
                </div>

                {/* Price & Action */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-bold uppercase">Prix Officiel</span>
                    <span className="text-xl font-black text-white">
                      {prod.price.toLocaleString('fr-FR')} <span className="text-xs text-[#E51A24]">FCFA</span>
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProduct(prod);
                      setBottleChoice(prod.sku.includes('PACK') ? 'PACK' : 'RECHARGE');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E51A24] to-[#b30d15] text-white text-xs font-black shadow-md hover:shadow-lg hover:shadow-[#E51A24]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <span>Commander</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Tableau Récapitulatif : Barème Officiel Homologué PLEINGAZ Cameroun */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-6 sm:p-8 rounded-3xl bg-neutral-900/70 border border-white/10 shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E51A24]/15 border border-[#E51A24]/30 text-red-300 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck size={14} className="text-[#E51A24]" />
                Transparence & Prix Publics Homologués
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Barème Officiel National PLEINGAZ (Cameroun)
              </h3>
              <p className="text-neutral-400 text-xs sm:text-sm">
                Conformément à la réglementation camerounaise, les prix du gaz sont strictement encadrés et identiques dans tous les dépôts agréés.
              </p>
            </div>
            <Link
              href="/search?auto=true"
              className="px-5 py-3 rounded-xl bg-white text-neutral-950 font-black text-xs hover:bg-neutral-100 transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <span>Vérifier la disponibilité locale</span>
              <ArrowRight size={14} className="text-[#E51A24]" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 text-neutral-400 font-bold uppercase text-[11px] tracking-wider">
                  <th className="pb-3 pr-4">Format / Désignation</th>
                  <th className="pb-3 px-4">Usage Recommandé</th>
                  <th className="pb-3 px-4 text-emerald-400 font-black">Recharge Gaz (Échange)</th>
                  <th className="pb-3 pl-4 text-white font-black">Pack Bouteille (Consigne + Gaz)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-neutral-200">
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 pr-4 font-black text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E51A24]"></span>
                    Bouteille PLEINGAZ 6 kg
                  </td>
                  <td className="py-3.5 px-4 text-neutral-400">Étudiants, petits foyers, camping</td>
                  <td className="py-3.5 px-4 font-black text-emerald-400">3 120 FCFA</td>
                  <td className="py-3.5 pl-4 font-black text-white">16 120 FCFA</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors bg-white/[0.02]">
                  <td className="py-3.5 pr-4 font-black text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E51A24]"></span>
                    Bouteille PLEINGAZ 12.5 kg (Phare)
                  </td>
                  <td className="py-3.5 px-4 text-neutral-400">Familles, usage domestique quotidien</td>
                  <td className="py-3.5 px-4 font-black text-emerald-400">6 500 FCFA <span className="text-[10px] text-red-300 font-bold ml-1 bg-[#E51A24]/20 px-1.5 py-0.5 rounded">Tarif Homologué</span></td>
                  <td className="py-3.5 pl-4 font-black text-white">26 500 FCFA</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 pr-4 font-black text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E51A24]"></span>
                    Bouteille PLEINGAZ 50 kg
                  </td>
                  <td className="py-3.5 px-4 text-neutral-400">Restaurants, boulangeries, hôtels</td>
                  <td className="py-3.5 px-4 font-black text-emerald-400">26 000 FCFA</td>
                  <td className="py-3.5 pl-4 font-black text-white">76 000 FCFA</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 pr-4 font-black text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E51A24]"></span>
                    Table Verre Trempé 2 Feux Prestige
                  </td>
                  <td className="py-3.5 px-4 text-neutral-400">Cuisine moderne, allumage auto</td>
                  <td className="py-3.5 px-4 text-neutral-400">—</td>
                  <td className="py-3.5 pl-4 font-black text-white">24 500 FCFA</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 pr-4 font-black text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E51A24]"></span>
                    Réchaud 2 Feux Métal Émaillé Noir
                  </td>
                  <td className="py-3.5 px-4 text-neutral-400">Robuste, anti-corrosion, double brûleur</td>
                  <td className="py-3.5 px-4 text-neutral-400">—</td>
                  <td className="py-3.5 pl-4 font-black text-white">16 500 FCFA</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 pr-4 font-black text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E51A24]"></span>
                    Détendeur Sécurité avec Manomètre (30 mbar)
                  </td>
                  <td className="py-3.5 px-4 text-neutral-400">Contrôle niveau de gaz & clapet anti-fuite</td>
                  <td className="py-3.5 px-4 text-neutral-400">—</td>
                  <td className="py-3.5 pl-4 font-black text-white">6 000 FCFA</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 pr-4 font-black text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E51A24]"></span>
                    Tuyau à Gaz Renforcé 1.5 m + Colliers
                  </td>
                  <td className="py-3.5 px-4 text-neutral-400">Flexible blindé norme de sécurité</td>
                  <td className="py-3.5 px-4 text-neutral-400">—</td>
                  <td className="py-3.5 pl-4 font-black text-white">3 000 FCFA</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {/* RÈGLES CR-001 & ENGAGEMENTS DE MARQUE */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ y: -6 }}
            className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 space-y-3 hover:border-[#E51A24]/40 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#E51A24]/20 text-[#E51A24] flex items-center justify-center font-bold">
              <MapPin size={24} />
            </div>
            <h4 className="font-extrabold text-lg text-white">Précision Géodésique (D-02)</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Calcul de distance WGS84 au mètre près pour localiser les dépôts immédiats sans aucune fuite de vos coordonnées privées.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 space-y-3 hover:border-emerald-500/40 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck size={24} />
            </div>
            <h4 className="font-extrabold text-lg text-white">Prix Nationaux Homologués (D-01)</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Prix officiel centralisé de 6 500 FCFA pour la 12.5 kg. Zéro spéculation, tout surplus est neutralisé par le système.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 space-y-3 hover:border-amber-500/40 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Truck size={24} />
            </div>
            <h4 className="font-extrabold text-lg text-white">Validation par Code Secret SHA-256 (D-05)</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Remise en main propre sécurisée : le livreur ne peut valider la course qu’en saisissant le code remis par le client.
            </p>
          </motion.div>
        </div>
      </section>

      {/* PORTAILS MÉTIERS & ACCÈS DIRECTS */}
      <section className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-white">Espaces Dédiés & Professionnels</h2>
          <p className="text-neutral-400 text-sm">Accédez à votre cockpit selon votre rôle dans le réseau PLEINGAZ</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Link
            href="/distributor/apply"
            className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-[#E51A24]/60 hover:bg-white/[0.08] transition-all space-y-3 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#E51A24]/20 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Store size={22} />
            </div>
            <h3 className="font-black text-lg text-white group-hover:text-[#E51A24] transition-colors">
              Espace Distributeur
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Inscription simplifiée, accès immédiat à votre espace, gestion de vos stocks et enrôlement de vos livreurs.
            </p>
          </Link>

          <Link
            href="/delivery"
            className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/60 hover:bg-white/[0.08] transition-all space-y-3 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Truck size={22} />
            </div>
            <h3 className="font-black text-lg text-white group-hover:text-emerald-400 transition-colors">
              Portail Livreur Partenaire
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Cockpit mobile pour recevoir les missions de livraison, valider les codes secrets et gérer la caisse espèces.
            </p>
          </Link>

          <Link
            href="/admin/dashboard"
            className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-purple-500/60 hover:bg-white/[0.08] transition-all space-y-3 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Gauge size={22} />
            </div>
            <h3 className="font-black text-lg text-white group-hover:text-purple-400 transition-colors">
              Control Center & Flotte Siège
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Supervision centrale, 15 rapports réels, validation des pièces KYC et pilotage de la flotte officielle du siège.
            </p>
          </Link>
        </div>
      </section>

      {/* Footer Officiel */}
      <footer className="border-t border-[#E51A24]/20 py-10 px-4 text-center text-xs text-neutral-500 space-y-3">
        <p className="text-neutral-400 font-semibold">
          © 2026 PLEINGAZ S.A. (Distribué par INFOTECH S.A.) — Tous droits réservés.
        </p>
        <p className="max-w-2xl mx-auto text-[11px] text-neutral-500">
          Distribution exclusive de gaz domestique au Cameroun sous barèmes officiels homologués par le Ministère du Commerce. Aucune majoration non autorisée.
        </p>
      </footer>

      {/* Modal Interactif de Commande Rapide */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-[#140a0b] border-2 border-[#E51A24]/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#E51A24]/20 z-10 space-y-6 overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-all"
              >
                <X size={18} />
              </button>

              {/* Product Header */}
              <div className="flex items-center gap-4 pr-8">
                <div className="relative w-20 h-20 rounded-2xl bg-black/50 border border-white/10 overflow-hidden shrink-0 p-2">
                  <Image
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#E51A24]/20 border border-[#E51A24]/40 text-red-300 uppercase tracking-wider inline-block mb-1">
                    {selectedProduct.category}
                  </span>
                  <h3 className="text-lg font-black text-white leading-tight">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {selectedProduct.subtitle}
                  </p>
                </div>
              </div>

              {/* Option Bouteille : Consigne vs Recharge (si bouteille de gaz) */}
              {selectedProduct.category === 'Bouteilles & Recharges' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                    Type d'achat :
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setBottleChoice('RECHARGE')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        bottleChoice === 'RECHARGE'
                          ? 'border-[#E51A24] bg-[#E51A24]/15 text-white shadow-md'
                          : 'border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black">Recharge Seule</span>
                        {bottleChoice === 'RECHARGE' && <Check size={14} className="text-[#E51A24]" />}
                      </div>
                      <p className="text-[11px] text-neutral-300 leading-snug">
                        Échange standard (vous avez déjà une bouteille vide)
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBottleChoice('PACK')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        bottleChoice === 'PACK'
                          ? 'border-[#E51A24] bg-[#E51A24]/15 text-white shadow-md'
                          : 'border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black">Pack Consigne + Gaz</span>
                        {bottleChoice === 'PACK' && <Check size={14} className="text-[#E51A24]" />}
                      </div>
                      <p className="text-[11px] text-neutral-300 leading-snug">
                        Premier équipement (bouteille neuve scellée)
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* Mode de récupération */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                  Mode de récupération :
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setOrderMode('DEPOT')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      orderMode === 'DEPOT'
                        ? 'border-[#E51A24] bg-[#E51A24]/15 text-white shadow-md'
                        : 'border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 font-black text-xs">
                      <Store size={14} className="text-[#E51A24]" />
                      <span>Retrait en Dépôt</span>
                    </div>
                    <p className="text-[11px] text-neutral-300">
                      Gratuit, immédiat au point agréé
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderMode('LIVRAISON')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      orderMode === 'LIVRAISON'
                        ? 'border-[#E51A24] bg-[#E51A24]/15 text-white shadow-md'
                        : 'border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 font-black text-xs">
                      <Truck size={14} className="text-[#E51A24]" />
                      <span>Livraison Express</span>
                    </div>
                    <p className="text-[11px] text-neutral-300">
                      À domicile avec code secret SHA-256
                    </p>
                  </button>
                </div>
              </div>

              {/* Total & Call to Action */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-neutral-400 block font-bold uppercase">Prix Homologué</span>
                  <span className="text-2xl font-black text-white">
                    {(
                      selectedProduct.category === 'Bouteilles & Recharges'
                        ? bottleChoice === 'PACK'
                          ? selectedProduct.sku.includes('060') ? 16120 : 26500
                          : selectedProduct.sku.includes('060') ? 3120 : 6500
                        : selectedProduct.price
                    ).toLocaleString('fr-FR')}{' '}
                    <span className="text-xs text-[#E51A24]">FCFA</span>
                  </span>
                </div>

                <Link
                  href={`/search?auto=true&product=${encodeURIComponent(selectedProduct.name)}`}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#E51A24] via-[#f02934] to-[#c7101a] text-white font-black text-xs sm:text-sm shadow-xl shadow-[#E51A24]/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <MapPin size={16} />
                  <span>Trouver un Dépôt</span>
                </Link>
              </div>

              {/* Direct WhatsApp Option */}
              <div className="text-center pt-1">
                <Link
                  href={`https://wa.me/237680000075?text=${encodeURIComponent(
                    `Bonjour PLEINGAZ, je souhaite commander : ${selectedProduct.name} (${
                      selectedProduct.category === 'Bouteilles & Recharges' && bottleChoice === 'PACK'
                        ? 'Pack Bouteille Complète'
                        : 'Recharge'
                    }) avec option ${orderMode === 'LIVRAISON' ? 'Livraison à domicile' : 'Retrait en Dépôt'}.`
                  )}`}
                  target="_blank"
                  className="text-xs text-neutral-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <MessageCircle size={14} className="text-emerald-400" />
                  <span>Assistance directe via WhatsApp officiel (+237 680 00 00 75)</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
