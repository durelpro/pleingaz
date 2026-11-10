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
import { InfoNoticesDrawer } from '@/components/common/InfoNoticesDrawer';

const officialCatalog = [
  {
    id: 'prod-pg-125',
    sku: 'PG-BOT-125',
    name: 'Bouteille PLEINGAZ 12.5 kg',
    subtitle: 'Signature "Always Full" • Recharge Officielle',
    image: '/products/bouteille-pleingaz-12-5kg.jpg',
    category: 'Gaz Domestique',
    price: 6500,
    badge: '🔥 Produit Phare Homologué',
    desc: 'Bouteille officielle rouge et blanche scellée d’usine avec gaz butane purifié haute combustion.',
    inStock: true,
  },
  {
    id: 'prod-pg-det',
    sku: 'PG-ACC-DET',
    name: 'Détendeur Sécurité avec Manomètre',
    subtitle: 'Contrôle de Pression & Niveau de Gaz Réel',
    image: '/products/detendeur-securite-manometre.jpg',
    category: 'Sécurité Gaz',
    price: 6000,
    badge: '🛡️ Sécurité Vitale Fuite',
    desc: 'Cadran de mesure de pression intégré, valve de blocage immédiate en cas d’anomalie ou de fuite.',
    inStock: true,
  },
  {
    id: 'prod-pg-rec-noir',
    sku: 'PG-REC-001',
    name: 'Réchaud 2 Feux Fonte Émaillée',
    subtitle: 'Double Brûleur Haute Température • Flamme Bleue',
    image: '/products/rechaud-gaz-2-feux-noir.jpg',
    category: 'Équipements Cuisson',
    price: 16500,
    badge: '⚡ Économie de Gaz Maximale',
    desc: 'Robuste structure en métal émaillé anti-rouille, flammes concentrées pour une cuisson rapide.',
    inStock: true,
  },
  {
    id: 'prod-pg-rec-verre',
    sku: 'PG-REC-002',
    name: 'Table de Cuisson Verre Trempé Luxe',
    subtitle: 'Finition Prestige Sérigraphiée • Double Brûleur',
    image: '/products/rechaud-gaz-2-feux-verre-luxe.jpg',
    category: 'Gamme Prestige',
    price: 24500,
    badge: '✨ Design Cuisine Moderne',
    desc: 'Surface en verre trempé résistant aux chocs et rayures, allumage piezo intégré et pieds stables.',
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
            <div className="relative h-11 w-36 sm:w-44 flex items-center">
              <Image
                src="/logoprincipal.png"
                alt="PLEINGAZ — Bouteilles toujours pleines"
                width={176}
                height={58}
                className="h-full w-auto object-contain transition-transform group-hover:scale-105"
                priority
              />
            </div>
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-red-600/10 border border-red-600/30 text-[10px] text-red-400 font-bold uppercase tracking-wider">
              Réseau Officiel
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-neutral-300">
            <Link href="/search?auto=true" className="hover:text-red-500 transition-colors flex items-center gap-1.5 group">
              <MapPin size={17} className="text-red-500 group-hover:scale-110 transition-transform" />
              <span>Où Trouver du Gaz ?</span>
            </Link>
            <Link href="/stores" className="hover:text-[#E51A24] transition-colors">
              Points de Vente (71)
            </Link>
            <Link href="/tarifs" className="hover:text-[#E51A24] transition-colors">
              Tarifs
            </Link>
            <Link href="/support/securite" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
              <span>Sécurité Gaz</span>
            </Link>
            <Link href="/faq" className="hover:text-[#E51A24] transition-colors">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <InfoNoticesDrawer role="CUSTOMER" city="Douala" />
            <Link
              href="/acheteur"
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#E51A24] to-[#c7101a] text-white shadow-lg shadow-[#E51A24]/30 hover:shadow-[#E51A24]/60 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>Je suis acheteur</span>
              <ArrowRight size={14} />
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

      {/* COMMENT ÇA MARCHE EN 3 ÉTAPES (Conforme T3) */}
      <section className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs bg-[#E51A24]/10 text-red-400 font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-[#E51A24]/20">
            Simplicité & Rapidité
          </span>
          <h2 className="text-3xl font-black text-white">Comment ça marche en 3 étapes</h2>
          <p className="text-neutral-400 text-sm">Votre recharge de gaz domestique au prix officiel garanti</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E51A24]/20 text-[#E51A24] flex items-center justify-center font-black text-lg">
              1
            </div>
            <h3 className="font-black text-base text-white">Localisez votre point de vente</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Consultez les 71 dépôts et boutiques officielles géo-référencés à Douala, Yaoundé et dans les régions.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-lg">
              2
            </div>
            <h3 className="font-black text-base text-white">Vérifiez le stock en direct</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Disponibilité certifiée de votre bouteille 12.5 kg au prix réglementé de <strong>6 500 FCFA</strong>. Zéro majoration.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg">
              3
            </div>
            <h3 className="font-black text-base text-white">Retrait ou livraison coursier</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Passez récupérer votre bouteille au comptoir ou faites-vous livrer pour un forfait fixe de 1 000 FCFA avec validation par code secret.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Officiel Enrichi */}
      <footer className="border-t border-[#E51A24]/20 pt-16 pb-12 px-4 bg-[#080404] text-xs text-neutral-400">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-neutral-800">
          
          {/* Colonne 1 : Entreprise */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#E51A24] flex items-center justify-center text-white font-black text-sm">
                PG
              </span>
              <span className="font-black text-base text-white tracking-tight">
                PLEINGAZ S.A.
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Distribué au Cameroun par <strong>INFOTECH S.A.</strong> Bouteilles scellées, pesées et garanties au prix officiel national homologué par la CSPH.
            </p>
            <div className="text-[11px] text-neutral-500">
              Douala, République du Cameroun
            </div>
          </div>

          {/* Colonne 2 : Le Réseau */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider text-[11px]">
              Le Réseau
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/search?auto=true" className="hover:text-red-400 transition-colors">
                  Où trouver du gaz maintenant ?
                </Link>
              </li>
              <li>
                <Link href="/stores" className="hover:text-red-400 transition-colors">
                  Points de vente agréés (71)
                </Link>
              </li>
              <li>
                <Link href="/tarifs" className="hover:text-red-400 transition-colors">
                  Barème officiel des prix
                </Link>
              </li>
              <li>
                <Link href="/acheteur" className="hover:text-red-400 transition-colors">
                  Espace Acheteur &amp; Jauge Quota
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Assistance & Sécurité */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider text-[11px]">
              Assistance &amp; Sécurité
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/support/securite" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1">
                  <span>Prévention fuite &amp; Urgence (118)</span>
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-red-400 transition-colors">
                  Foire aux questions (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-red-400 transition-colors">
                  Service client &amp; WhatsApp
                </Link>
              </li>
              <li>
                <a href="tel:118" className="hover:text-red-400 transition-colors">
                  Sapeurs-pompiers : Composer le 118
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 4 : Informations Légales */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider text-[11px]">
              Informations Légales
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/a-propos" className="hover:text-red-400 transition-colors">
                  À propos d&apos;INFOTECH S.A.
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="hover:text-red-400 transition-colors">
                  Mentions Légales
                </Link>
              </li>
              <li>
                <Link href="/cgu" className="hover:text-red-400 transition-colors">
                  Conditions Générales (CGU)
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="hover:text-red-400 transition-colors">
                  Protection des données (ANTIC)
                </Link>
              </li>
              <li>
                <Link href="/pro" className="text-neutral-500 hover:text-neutral-300 transition-colors">
                  Portail professionnel (Distributeurs &amp; Livreurs)
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-neutral-500">
          <p>
            © 2026 PLEINGAZ (INFOTECH S.A.) — Tous droits réservés. Distribution exclusive au Cameroun.
          </p>
          <p>
            Conforme aux normes du Ministère du Commerce &amp; de la CSPH.
          </p>
        </div>
      </footer>
    </div>
  );
}
