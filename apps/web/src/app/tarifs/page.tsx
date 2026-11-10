'use client';

import Link from 'next/link';
import { 
  ArrowLeft, 
  Tag, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle, 
  Truck, 
  Flame, 
  AlertCircle 
} from 'lucide-react';

export default function TarifsPage() {
  const products = [
    {
      name: 'Recharge Bouteille 12,5 kg',
      category: 'Gaz Domestique',
      price: '6 500 FCFA',
      officialPriceNotice: 'Prix public homologué CSPH / Ministère du Commerce',
      description: 'Format familial standard pour la cuisine quotidienne. Bouteille vérifiée, pesée électroniquement et opercule scellé.',
      isGas: true,
      popular: true,
    },
    {
      name: 'Recharge Bouteille 6 kg',
      category: 'Gaz Domestique',
      price: '2 800 FCFA',
      officialPriceNotice: 'Prix public homologué national',
      description: 'Format compact et mobile, idéal pour petits foyers, étudiants ou réchauds d\'appoint.',
      isGas: true,
      popular: false,
    },
    {
      name: 'Pack Première Consigne 12,5 kg Complète',
      category: 'Pack Premier Achat',
      price: '33 000 FCFA',
      officialPriceNotice: 'Bouteille métallique + Recharge gaz + Détendeur + Flexible',
      description: 'Kit complet de démarrage : consigne officielle PLEINGAZ neuve pleine, détendeur sécurisé et tuyau renforcé.',
      isGas: false,
      popular: false,
    },
    {
      name: 'Détendeur Sécurité 28 mbar avec manomètre',
      category: 'Accessoire Officiel Certifié',
      price: '6 000 FCFA',
      officialPriceNotice: 'Norme de sécurité renforcée',
      description: 'Système Quick-On à coupure automatique en cas d\'excès de débit ou d\'arrachement du flexible.',
      isGas: false,
      popular: false,
    },
    {
      name: 'Tuyau Flexible Renforcé Gaz (2 mètres)',
      category: 'Accessoire Officiel Certifié',
      price: '3 500 FCFA',
      officialPriceNotice: 'Date de validité gravée et colliers de serrage inclus',
      description: 'Tuyau haute résistance armé pour gaz butane avec deux colliers de serrage en acier inoxydable.',
      isGas: false,
      popular: false,
    },
  ];

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
          <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-md">
            Transparence Tarifaire
          </span>
        </div>

        {/* Hero Header */}
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-red-950 text-white rounded-3xl p-6 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/30 border border-red-500/40 rounded-full text-xs font-bold text-red-200">
              <Tag className="w-4 h-4 text-amber-400" />
              Barème Officiel Homologué
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Tarifs Officiels &amp; Transparents
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              Chez PLEINGAZ, aucun surcoût caché. Nos prix de recharge sont strictement alignés sur le tarif réglementaire de la <strong>Caisse de Stabilisation des Prix des Hydrocarbures (CSPH)</strong> et du <strong>Ministère du Commerce</strong>.
            </p>
          </div>
          <Flame className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5" />
        </div>

        {/* Grille des Prix */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              Catalogue &amp; Barème en Vigueur
            </h2>
            <span className="text-xs font-bold text-neutral-500">
              Devise : Franc CFA (XAF)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {products.map((p, idx) => (
              <div 
                key={idx} 
                className={`bg-white dark:bg-neutral-900 rounded-2xl border p-6 space-y-4 relative flex flex-col justify-between shadow-xs ${
                  p.popular 
                    ? 'border-red-500 dark:border-red-600 ring-2 ring-red-500/20' 
                    : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 right-6 px-3 py-0.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-xs">
                    Format le plus demandé
                  </span>
                )}
                
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    {p.category}
                  </span>
                  <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                    {p.name}
                  </h3>
                  <div className="text-2xl font-black text-red-600 dark:text-red-400">
                    {p.price}
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    {p.officialPriceNotice}
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pt-1">
                    {p.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <Link
                    href="/stores"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Trouver un point de vente
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forfait de Livraison Urbaine */}
        <div className="bg-gradient-to-r from-red-500/10 via-amber-500/10 to-red-500/10 border-2 border-red-500/30 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Truck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-[11px] font-black uppercase">
                Tarif Unique Forfaitaire
              </div>
              <h3 className="text-xl font-black text-neutral-900 dark:text-white">
                Livraison à Domicile : 1 000 FCFA
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Le tarif de livraison officiel assuré par la flotte PLEINGAZ est fixé forfaitairement à <strong>1 000 FCFA</strong> par course dans le périmètre urbain. Pas de supplément surprise à l&apos;arrivée.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-neutral-700 dark:text-neutral-300">
            <div className="flex items-center gap-2 bg-white/80 dark:bg-neutral-900/80 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Double confirmation obligatoire (Livreur + Client)</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 dark:bg-neutral-900/80 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Raccordement et test d&apos;étanchéité inclus</span>
            </div>
          </div>
        </div>

        {/* Rappel Quota Légal */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-900/60 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
            <strong className="block font-bold">Rappel de la Réglementation : Quota Particulier de 5 Bouteilles</strong>
            Conformément aux directives de distribution équitable, chaque ménage dispose d&apos;un quota maximal de 5 bouteilles par période glissante de 30 jours, aussi bien en commande en ligne qu&apos;en achat direct au comptoir.
          </div>
        </div>

      </div>
    </div>
  );
}

