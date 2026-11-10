'use client';

import Link from 'next/link';
import { 
  Building2, 
  ShieldCheck, 
  Scale, 
  MapPin, 
  ArrowLeft, 
  Flame, 
  CheckCircle2, 
  Truck, 
  Users,
  Award
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans text-neutral-900 dark:text-neutral-100 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Navigation retour */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
          </Link>
          <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 rounded-md">
            Entreprise &amp; Réseau
          </span>
        </div>

        {/* Hero Header */}
        <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white rounded-3xl p-6 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold">
              <Building2 className="w-4 h-4 text-amber-300" />
              INFOTECH S.A. &amp; PLEINGAZ
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Le Réseau Numérique Officiel de PLEINGAZ
            </h1>
            <p className="text-base sm:text-lg text-red-100 leading-relaxed font-medium">
              PLEINGAZ est la marque camerounaise de gaz domestique distribuée par <strong>INFOTECH S.A.</strong> Notre engagement quotidien : garantir à chaque foyer des bouteilles toujours pleines, sécurisées et au prix homologué.
            </p>
          </div>
          <Flame className="absolute -bottom-10 -right-10 w-64 h-64 text-white/10" />
        </div>

        {/* Les 4 Piliers de la Marque */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
            Nos Engagements Fondamentaux
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Pilier 1 */}
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center font-bold">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                Garantie de Poids Intégral
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Chaque bouteille PLEINGAZ (12,5 kg et 6 kg) est rigoureusement pesée et vérifiée électroniquement avant mise sous scellé. Avec nous, vous avez la certitude de payer pour le poids exact annoncé.
              </p>
            </div>

            {/* Pilier 2 */}
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                Sécurité &amp; Scellé Officiel
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Nos robinets et valves sont protégés par un opercule scellé inviolable. Ce scellé garantit l&apos;intégrité de la bouteille depuis le centre emplisseur jusqu&apos;à votre cuisine.
              </p>
            </div>

            {/* Pilier 3 */}
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                Prix Public Homologué CSPH
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Nous combattons la spéculation illicite. Nos prix de recharge respectent strictement le tarif officiel national fixé par le Ministère du Commerce et la Caisse de Stabilisation des Prix des Hydrocarbures.
              </p>
            </div>

            {/* Pilier 4 */}
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                Réseau de Proximité Géolocalisé
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Plus de 70 points de vente agréés, dépôts officiels et stations partenaires quadrillent le territoire pour vous assurer un réapprovisionnement sans rupture.
              </p>
            </div>

          </div>
        </div>

        {/* Le Réseau Physique & Digital */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase text-red-600 tracking-wider">
              Une Innovation Nationale
            </span>
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white">
              Du Site Vitrine au Réseau Digital Connecté
            </h2>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Face aux difficultés d&apos;approvisionnement et à la spéculation sur les prix, <strong>INFOTECH S.A.</strong> a conçu la première plateforme numérique nationale dédiée à la traçabilité intégrale du gaz domestique :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="block font-bold text-neutral-900 dark:text-white">Visibilité Stock en Direct</strong>
                Savoir exactement quel distributeur a du stock avant de se déplacer.
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
              <Truck className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="block font-bold text-neutral-900 dark:text-white">Livraison Sécurisée</strong>
                Forfait fixe à 1 000 FCFA avec double confirmation obligatoire.
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
              <Users className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="block font-bold text-neutral-900 dark:text-white">Quota Légal Protégé</strong>
                Jauge de 5 bouteilles / 30 jours pour garantir l&apos;accès équitable de tous les ménages.
              </div>
            </div>
          </div>
        </div>

        {/* CTA Réseau */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-3xl gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-black text-red-900 dark:text-red-100 text-lg">
              Consulter nos points de vente agréés
            </h3>
            <p className="text-xs text-red-700 dark:text-red-300">
              Trouvez le distributeur PLEINGAZ le plus proche de votre domicile.
            </p>
          </div>
          <Link
            href="/stores"
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all shrink-0"
          >
            Voir la carte du réseau
          </Link>
        </div>

      </div>
    </div>
  );
}
