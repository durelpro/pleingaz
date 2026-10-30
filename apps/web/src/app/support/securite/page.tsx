'use client';

import Link from 'next/link';
import { 
  ShieldAlert, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  PhoneCall, 
  AlertTriangle, 
  Wind, 
  Sparkles, 
  ArrowLeft,
  ChevronRight,
  LifeBuoy
} from 'lucide-react';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';

export default function GasSafetyPage() {
  const emergencyPhone = "+237 657 696 567";
  const firefighterPhone = "118";

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans text-neutral-900 dark:text-neutral-100 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour à mon espace
          </Link>
          <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 rounded-md">
            Guide Officiel de Sécurité
          </span>
        </div>

        {/* Hero Header */}
        <div className="bg-gradient-to-br from-red-600 to-red-800 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-300" />
              Sécurité Domestique PLEINGAZ
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Guide de Prévention & Gestion des Fuites de Gaz
            </h1>
            <p className="text-sm text-red-100 leading-relaxed">
              Le gaz butane est naturellement inodore. Un composant odorisant (le mercaptan) y est ajouté pour détecter immédiatement la moindre fuite. Voici les réflexes vitaux à adopter.
            </p>
          </div>
          <Flame className="absolute -bottom-8 -right-8 w-48 h-48 text-white/10" />
        </div>

        {/* ======================================================== */}
        {/* URGENCE VITALE : PROTOCOLE FUITE DE GAZ */}
        {/* ======================================================== */}
        <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-500 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-red-900 dark:text-red-200">
                Vous sentez une odeur suspecte de gaz ?
              </h2>
              <p className="text-xs text-red-700 dark:text-red-300">
                Protocole immédiat à exécuter dans l'ordre strict suivant :
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-red-200 dark:border-red-900/50 space-y-2">
              <div className="flex items-center gap-2 text-red-600 font-black text-sm">
                <XCircle className="w-5 h-5 shrink-0" />
                1. NE TOUCHEZ À RIEN
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                N'actionnez <strong>aucun interrupteur</strong>, ne débranchez aucun appareil, n'allumez <strong>aucune flamme ni briquet</strong>, n'utilisez pas de lampe torche à étincelle.
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-red-200 dark:border-red-900/50 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                <Wind className="w-5 h-5 shrink-0" />
                2. AÉREZ IMMÉDIATEMENT
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Ouvrez en grand portes et fenêtres pour créer un courant d'air naturel et diluer la concentration de gaz.
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-red-200 dark:border-red-900/50 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                3. COUPEZ LE DÉTENDEUR
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Baissez le levier du détendeur ou tournez le volant du robinet de la bouteille dans le sens des aiguilles d'une montre pour fermer l'arrivée.
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-red-200 dark:border-red-900/50 space-y-2">
              <div className="flex items-center gap-2 text-red-600 font-black text-sm">
                <PhoneCall className="w-5 h-5 shrink-0" />
                4. ÉVACUEZ & ALERTEZ
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Sortez du logement avec tous les occupants. Appelez les secours ou PLEINGAZ <strong>une fois à l'extérieur</strong> du bâtiment.
              </p>
            </div>
          </div>

          {/* Emergency Hotline Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <a
              href={`tel:${emergencyPhone}`}
              className="flex-1 py-3.5 px-6 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <PhoneCall className="w-4 h-4" /> Urgence PLEINGAZ : {emergencyPhone}
            </a>
            <a
              href={`tel:${firefighterPhone}`}
              className="py-3.5 px-6 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-black text-sm rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              Sapeurs-Pompiers ({firefighterPhone})
            </a>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RÈGLES D'OR DU RACCORDEMENT ET DU STOCKAGE */}
        {/* ======================================================== */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Les 4 Règles d'Or pour une Cuisine Sans Risque
          </h2>

          <div className="space-y-4">
            {/* Règle 1 : Joint d'étanchéité */}
            <div className="flex gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
              <span className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-950 text-red-600 font-black text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                  Inspecter le joint en caoutchouc du détendeur
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  À chaque changement de bouteille, assurez-vous que le joint noir d'étanchéité à l'intérieur du détendeur est présent, souple et non fissuré. Un joint usé est la cause n°1 des fuites.
                </p>
              </div>
            </div>

            {/* Règle 2 : Le Test de la mousse de savon */}
            <div className="flex gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
              <span className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-950 text-red-600 font-black text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                  Toujours tester avec de l'eau savonneuse (JAMAIS avec une flamme !)
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Après raccordement, appliquez une éponge imbibée d'eau savonneuse ou de liquide vaisselle sur les raccords. Si des bulles gonflent, il y a une fuite. Ne jamais allumer une allumette pour tester !
                </p>
              </div>
            </div>

            {/* Règle 3 : Date limite du tuyau flexible */}
            <div className="flex gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
              <span className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-950 text-red-600 font-black text-xs flex items-center justify-center shrink-0">
                3
              </span>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                  Contrôler la date de péremption du tuyau et les colliers
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Les tuyaux souples à gaz comportent une date de péremption imprimée (généralement 5 ans). Remplacez-les avant échéance et serrez fermement les colliers métalliques aux deux extrémités.
                </p>
              </div>
            </div>

            {/* Règle 4 : Stockage vertical et aéré */}
            <div className="flex gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
              <span className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-950 text-red-600 font-black text-xs flex items-center justify-center shrink-0">
                4
              </span>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                  Position debout obligatoire et aération permanente
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Une bouteille de gaz doit <strong>TOUJOURS</strong> être maintenue en position verticale, jamais couchée ni inclinée. Ne la stockez jamais en sous-sol ou dans une pièce sans ventilation basse.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* ASSISTANCE EN DIRECT WHATSAPP */}
        {/* ======================================================== */}
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/60 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
              <LifeBuoy className="w-4 h-4" />
              Assistance Technique Dédiée
            </div>
            <h3 className="text-lg font-black text-neutral-900 dark:text-white">
              Un doute sur votre installation de gaz ?
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md">
              Envoyez-nous une photo de votre raccordement sur WhatsApp. Nos techniciens certifiés PLEINGAZ vous répondent immédiatement.
            </p>
          </div>

          <WhatsAppButton
            phoneNumber={emergencyPhone}
            contextMessage="Bonjour PLEINGAZ Sécurité, j'ai une question concernant mon installation de bouteille de gaz."
            className="w-full sm:w-auto shrink-0 shadow-lg"
          />
        </div>

      </div>
    </div>
  );
}
