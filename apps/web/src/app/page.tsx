'use client';

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
} from 'lucide-react';
import { motion } from 'framer-motion';

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

        {/* Grille des 4 Produits avec Photos Réelles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {officialCatalog.map((prod, idx) => (
            <motion.div
              key={prod.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
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
                    sizes="(max-w-768px) 100vw, 25vw"
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

                <Link
                  href="/search?auto=true"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E51A24] to-[#b30d15] text-white text-xs font-black shadow-md hover:shadow-lg hover:shadow-[#E51A24]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span>Commander</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

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
    </div>
  );
}
