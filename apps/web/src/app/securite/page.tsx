'use client';

import Link from 'next/link';
import { ShieldCheck, AlertTriangle, Flame, CheckCircle2, XCircle, ArrowLeft, Bot, PhoneCall, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GasSafetyPage() {
  const goldenRules = [
    {
      title: "Position Verticale Obligatoire",
      desc: "Conservez et utilisez toujours votre bouteille de gaz bien droite sur un sol stable. Ne jamais coucher ou renverser une bouteille.",
      icon: CheckCircle2,
      badge: "Indispensable"
    },
    {
      title: "Vérification du Détendeur & Joint",
      desc: "Assurez-vous de la présence du joint d'étanchéité noir avant de brancher le détendeur. Ne forcez jamais le levier d'enclenchement.",
      icon: ShieldCheck,
      badge: "Étanchéité"
    },
    {
      title: "Tuyau de Raccordement Conforme",
      desc: "Utilisez un tuyau souple avec colliers de serrage en bon état. Respectez impérativement la date limite d'utilisation inscrite sur le tuyau.",
      icon: CheckCircle2,
      badge: "Matériel"
    },
    {
      title: "Test à l'Eau Savonneuse (Jamais à la flamme !)",
      desc: "Pour vérifier l'étanchéité après branchement, appliquez de l'eau savonneuse sur les raccords. Si des bulles apparaissent, il y a une fuite.",
      icon: AlertTriangle,
      badge: "Règle d'or"
    },
    {
      title: "Aération Constante du Local",
      desc: "Ne placez jamais une bouteille dans un sous-sol ou un placard hermétique. Prévoyez toujours une aération basse et haute.",
      icon: CheckCircle2,
      badge: "Ventilation"
    },
    {
      title: "Fermeture Systématique la Nuit",
      desc: "Fermez le robinet du détendeur après chaque utilisation prolongée et chaque soir avant de vous coucher.",
      icon: ShieldCheck,
      badge: "Prévention"
    }
  ];

  const leakSteps = [
    { step: 1, text: "Ne touchez à aucun interrupteur électrique (lumière, ventilateur, prise) et n'allumez aucune flamme." },
    { step: 2, text: "Fermez immédiatement le robinet du détendeur de votre bouteille de gaz si accessible." },
    { step: 3, text: "Ouvrez grand toutes les portes et fenêtres pour aérer et évacuer le gaz accumulé." },
    { step: 4, text: "Sortez immédiatement du logement et contactez votre distributeur ou les secours (Sapeurs-Pompiers : 118)." }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-4 md:p-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-pleingaz-red font-bold text-sm transition-colors"
          >
            <ArrowLeft size={18} />
            Retour à l'accueil
          </Link>

          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-4 py-2 bg-pleingaz-red text-white text-xs font-bold rounded-xl shadow-md hover:bg-red-800 transition-colors"
          >
            <Bot size={16} />
            Poser une question à l'IA
          </Link>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 dark:bg-red-950/50 text-pleingaz-red text-xs font-black">
            <Flame size={16} />
            Guide Officiel PLEINGAZ Cameroun
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
            Sécurité & Utilisation du Gaz Domestique
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
            Le gaz domestique est une énergie propre et économique. Appliquez les gestes simples ci-dessous pour protéger votre foyer et cuisiner en toute sérénité.
          </p>
        </motion.div>

        {/* Alerte Urgence Fuite de Gaz */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-xl space-y-4 relative overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <AlertTriangle size={28} className="text-yellow-300" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black">Que faire en cas d'odeur ou suspicion de fuite ?</h2>
              <p className="text-xs md:text-sm text-red-100 font-medium">Réagissez immédiatement avec les 4 réflexes vitaux :</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {leakSteps.map((s) => (
              <div key={s.step} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                <span className="w-7 h-7 rounded-xl bg-white text-pleingaz-red font-black text-sm flex items-center justify-center shrink-0">
                  {s.step}
                </span>
                <p className="text-xs md:text-sm font-semibold text-white leading-relaxed">
                  {s.text}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-red-100">
            <span>Numéro d'urgence Sapeurs-Pompiers au Cameroun : <strong>118</strong></span>
            <span>Assistance Client PLEINGAZ : <strong>+237 657 696 567</strong></span>
          </div>
        </motion.div>

        {/* 6 Règles d'Or */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="text-pleingaz-red" />
            Les 6 Règles d'Or de Sécurité
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goldenRules.map((rule, idx) => {
              const Icon = rule.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm space-y-3 hover:border-gray-300 dark:hover:border-neutral-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-pleingaz-red flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400">
                      {rule.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    {rule.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                    {rule.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interdits Absolus */}
        <div className="p-6 md:p-8 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-3xl space-y-3">
          <h3 className="text-lg font-black text-amber-900 dark:text-amber-300 flex items-center gap-2">
            <XCircle className="text-amber-600 dark:text-amber-400" />
            Les Interdits Absolus
          </h3>
          <ul className="space-y-2 text-xs md:text-sm text-amber-800 dark:text-amber-400 font-medium list-disc list-inside">
            <li>Ne <strong>jamais</strong> utiliser de briquet ou allumette pour chercher une fuite de gaz.</li>
            <li>Ne <strong>jamais</strong> conserver une bouteille de gaz à proximité immédiate d'une source de chaleur vive ou en plein soleil.</li>
            <li>Ne <strong>jamais</strong> transférer vous-même du gaz d'une bouteille à une autre (transvasement artisanal interdit et dangereux).</li>
            <li>Ne <strong>jamais</strong> utiliser de bouteille présentant des traces de choc important, de rouille profonde ou sans sceau d'inviolabilité officiel à la livraison.</li>
          </ul>
        </div>

        {/* Call to Action Assistant IA */}
        <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-gray-100 dark:border-neutral-800 text-center space-y-4 shadow-sm">
          <Bot size={40} className="mx-auto text-pleingaz-red" />
          <h3 className="text-xl font-black text-gray-900 dark:text-white">
            Une question sur votre installation ou votre bouteille ?
          </h3>
          <p className="text-xs md:text-sm text-gray-500 max-w-lg mx-auto">
            Notre assistant IA est disponible 24h/24 pour répondre à toutes vos interrogations sur la sécurité, le prix homologué ou les distributeurs agréés au Cameroun.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl hover:bg-pleingaz-red hover:text-white transition-all shadow-md"
          >
            Discuter avec l'Assistant IA
          </Link>
        </div>

      </div>
    </div>
  );
}
