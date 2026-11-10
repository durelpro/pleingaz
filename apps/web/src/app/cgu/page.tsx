'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, Truck, Scale } from 'lucide-react';

export default function CguPage() {
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
            Conditions Contractuelles
          </span>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
            Conditions Générales d&apos;Utilisation (CGU)
          </h1>
          <p className="text-xs text-neutral-500">
            Version 2.0 — En vigueur au Cameroun — Applicable à l&apos;ensemble des usagers du réseau
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 space-y-6 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed shadow-xs">
          
          {/* Article 1 */}
          <div className="space-y-2">
            <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-600" />
              Article 1 : Objet &amp; Périmètre
            </h2>
            <p>
              Les présentes Conditions Générales d&apos;Utilisation encadrent l&apos;accès et les transactions réalisés sur la plateforme numérique <strong>PLEINGAZ</strong>. Le service met en relation les acheteurs de gaz domestique, les points de vente agréés (distributeurs) et les livreurs officiels opérant sur le territoire camerounais.
            </p>
          </div>

          {/* Article 2 */}
          <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-red-600" />
              Article 2 : Quota Légal &amp; Plafond Mensuel
            </h2>
            <p>
              Afin de préserver l&apos;accès universel des foyers à l&apos;énergie et d&apos;empêcher le stockage spéculatif ou la revente non agréée, chaque acheteur particulier est soumis à un quota strict et non contournable de <strong>5 bouteilles par période glissante de 30 jours</strong>.
            </p>
            <p className="text-neutral-500">
              Ce plafond comptabilise l&apos;ensemble des achats en ligne ainsi que les achats enregistrés au comptoir physique chez nos distributeurs.
            </p>
          </div>

          {/* Article 3 */}
          <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-600" />
              Article 3 : Commandes &amp; Paiement
            </h2>
            <p>
              Les commandes de gaz peuvent être réglées soit par Mobile Money (MTN MoMo, Orange Money) lors de la commande en ligne, soit en espèces à la livraison ou au comptoir.
            </p>
            <p>
              Une commande en ligne réserve temporairement le stock de la boutique pendant un délai de <strong>15 minutes</strong> pour permettre la finalisation du règlement. Passé ce délai, le stock est automatiquement libéré pour les autres usagers.
            </p>
          </div>

          {/* Article 4 */}
          <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-red-600" />
              Article 4 : Modalités de Livraison &amp; Double Confirmation
            </h2>
            <p>
              La livraison urbaine est facturée au tarif forfaitaire fixe de <strong>1 000 FCFA</strong>.
            </p>
            <p>
              La clôture légale d&apos;une mission de livraison nécessite impérativement une <strong>double confirmation contradictoire</strong> :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-600 dark:text-neutral-400">
              <li>Le livreur valide la dépose sur son application (« J&apos;ai livré »).</li>
              <li>Le destinataire valide la prise en charge sur son terminal (« J&apos;ai reçu »).</li>
            </ul>
            <p className="text-neutral-500">
              En cas de litige, l&apos;acheteur peut contester la livraison pour déclencher l&apos;arbitrage immédiat du Control Center d&apos;INFOTECH S.A.
            </p>
          </div>

          {/* Article 5 */}
          <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Article 5 : Sécurité &amp; Consignes d&apos;Utilisation
            </h2>
            <p>
              L&apos;acheteur s&apos;engage à respecter les règles élémentaires de sécurité : stockage de la bouteille debout dans un espace aéré, vérification de l&apos;état des joints et utilisation de détendeurs certifiés. L&apos;échange d&apos;une bouteille vide n&apos;est accepté que si la consigne est intacte et exempte de choc structurel grave.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

