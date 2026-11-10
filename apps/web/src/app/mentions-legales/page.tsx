'use client';

import Link from 'next/link';
import { ArrowLeft, Building2, Shield, Scale, Mail, MapPin } from 'lucide-react';

export default function MentionsLegalesPage() {
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
          <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-md">
            Informations Légales
          </span>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
            Mentions Légales
          </h1>
          <p className="text-xs text-neutral-500">
            Dernière mise à jour : Novembre 2026 — En conformité avec la législation camerounaise
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 space-y-6 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed shadow-xs">
          
          {/* Section 1 */}
          <div className="space-y-2">
            <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-red-600" />
              1. Éditeur de la Plateforme
            </h2>
            <p>
              Le site et la plateforme numérique officielle <strong>PLEINGAZ</strong> sont édités et exploités par la société :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-600 dark:text-neutral-400">
              <li><strong>Raison Sociale</strong> : INFOTECH S.A.</li>
              <li><strong>Activité</strong> : Distribution officielle et réseau numérique PLEINGAZ au Cameroun</li>
              <li><strong>Siège Social</strong> : Douala, République du Cameroun</li>
              <li><strong>Contact Assistance WhatsApp</strong> : +237 657 696 567</li>
              <li><strong>Contact Électronique</strong> : contact@monpleingaz.com</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-600" />
              2. Propriété Intellectuelle &amp; Marque Déposée
            </h2>
            <p>
              La marque <strong>PLEINGAZ</strong>, les logos, la charte graphique, les visuels, les textes, les modèles de données et l&apos;architecture applicative constituent des créations protégées par le droit de la propriété intellectuelle en vigueur dans l&apos;espace OAPI (Organisation Africaine de la Propriété Intellectuelle) et au Cameroun.
            </p>
            <p className="text-neutral-500">
              Toute reproduction, représentation, extraction, modification ou diffusion totale ou partielle, sans l&apos;accord exprès écrit préalable d&apos;INFOTECH S.A., est formellement interdite et constitutive de contrefaçon.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-red-600" />
              3. Homologation des Prix &amp; Réglementation
            </h2>
            <p>
              Les prix publics du gaz butane commercialisé sous la marque PLEINGAZ respectent scrupuleusement les barèmes nationaux homologués par le Ministère du Commerce du Cameroun et la <strong>Caisse de Stabilisation des Prix des Hydrocarbures (CSPH)</strong>.
            </p>
            <p>
              Les distributeurs agréés référencés sur cette plateforme s&apos;engagent formellement à appliquer les prix officiels et à délivrer un reçu dématérialisé pour chaque achat en boutique ou à la livraison.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" />
              4. Cartographie &amp; Données Géographiques
            </h2>
            <p>
              Les coordonnées des distributeurs, stations et dépôts proviennent des relevés GPS officiels certifiés par PLEINGAZ et du projet OpenStreetMap sous licence ODbL. L&apos;utilisation de la position du client est strictement subordonnée à son clic explicite et ne fait l&apos;objet d&apos;aucun traçage permanent.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

