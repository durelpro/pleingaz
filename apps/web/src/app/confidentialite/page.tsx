'use client';

import Link from 'next/link';
import { ArrowLeft, Lock, ShieldCheck, Database, EyeOff, UserCheck, Bell } from 'lucide-react';

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans text-neutral-900 dark:text-neutral-100 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Navigation retour */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
          </Link>
          <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-md">
            Protection des Données
          </span>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
            Politique de Confidentialité
          </h1>
          <p className="text-xs text-neutral-500">
            Conformité ANTIC &amp; Loi Camerounaise n° 2010/012 sur la Cybersécurité et la Protection des Données Personnelles
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 space-y-6 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed shadow-xs">
          
          {/* Cadre légal */}
          <div className="space-y-2">
            <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              1. Engagement &amp; Cadre Réglementaire
            </h2>
            <p>
              <strong>INFOTECH S.A.</strong> place la protection de la vie privée au centre de son architecture. La plateforme PLEINGAZ est rigoureusement conçue selon le principe de <em>Privacy by Design</em> (minimisation des données) et applique les directives de l&apos;<strong>ANTIC</strong> (Agence Nationale des Technologies de l&apos;Information et de la Communication).
            </p>
          </div>

          {/* Données collectées */}
          <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              2. Données Strictement Nécessaires Collectées
            </h2>
            <p>
              Seules les données indispensables à la bonne exécution logistique de la commande de gaz sont collectées :
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-600 dark:text-neutral-400">
              <li><strong>Numéro WhatsApp (`whatsappPhone`)</strong> : utilisé exclusivement pour l&apos;authentification gratuite sans mot de passe et l&apos;envoi de votre reçu dématérialisé.</li>
              <li><strong>Numéro d&apos;appel vocal (`callPhone`)</strong> : utilisé par le livreur en cas de difficulté à localiser votre portail.</li>
              <li><strong>Repère de quartier ou adresse de livraison</strong> : nom de ville, quartier et repère visuel (ex: « face pharmacie »).</li>
              <li><strong>Historique d&apos;achats sur 30 jours</strong> : requis légalement pour le calcul de votre jauge de quota de 5 bouteilles.</li>
            </ul>
          </div>

          {/* Règle Aucune Trace */}
          <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-emerald-600" />
              3. Règle Zéro Traçage &amp; Masquage Immédiat
            </h2>
            <p>
              Nous n&apos;effectuons aucun suivi GPS permanent. Votre position géographique n&apos;est transmise au navigateur qu&apos;au moment précis où vous cliquez sur <em>« Ma position »</em> pour trouver les boutiques proches.
            </p>
            <p>
              Dès qu&apos;une livraison est validée et clôturée par la double confirmation, <strong>les coordonnées de contact du client sont automatiquement et immédiatement masquées</strong> sur le terminal du livreur.
            </p>
          </div>

          {/* Sécurité des pièces KYC */}
          <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              4. Sécurité des Données Distributeurs (KYC 3 Pièces)
            </h2>
            <p>
              Les pièces d&apos;identité (CNI recto/verso et portrait) transmises par les distributeurs lors de leur demande de référencement sont stockées dans un coffre-fort numérique chiffré. Elles ne sont accessibles qu&apos;aux administrateurs habilités pour la durée stricte de la validation et ne sont jamais rendues publiques.
            </p>
          </div>

          {/* Droits des usagers */}
          <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              5. Vos Droits d&apos;Accès &amp; de Rectification
            </h2>
            <p>
              Conformément à la réglementation camerounaise, vous disposez d&apos;un droit permanent d&apos;accès, de rectification et de suppression de vos données personnelles. Pour exercer ce droit ou en cas de perte de votre ligne WhatsApp, contactez notre service client ou adressez un courrier électronique à <code>dpo@monpleingaz.com</code>.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

