'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  HelpCircle, 
  ChevronDown, 
  MessageSquare, 
  ShieldCheck, 
  Truck, 
  PhoneCall,
  Search
} from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
  category: 'commande' | 'paiement' | 'livraison' | 'compte' | 'distributeur';
}

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [search, setSearch] = useState('');

  const faqs: FaqItem[] = [
    {
      q: "Comment commander du gaz sur PLEINGAZ ?",
      a: "C'est très simple : connectez-vous gratuitement via WhatsApp, consultez les distributeurs ayant du stock confirmé autour de vous, choisissez votre bouteille (12,5 kg ou 6 kg) et sélectionnez le retrait en boutique ou la livraison à domicile.",
      category: 'commande'
    },
    {
      q: "Comment fonctionne la connexion gratuite par WhatsApp ?",
      a: "Aucun mot de passe à mémoriser ! Vous saisissez votre numéro, un lien prérempli ouvre WhatsApp sur votre smartphone. Vous envoyez le code éphémère (ex: PG-1234) au numéro officiel PLEINGAZ pour prouver que vous êtes bien le propriétaire de la ligne. La connexion est instantanée.",
      category: 'compte'
    },
    {
      q: "Quels sont les moyens de paiement acceptés ?",
      a: "Nous acceptons le paiement Mobile Money (MTN MoMo, Orange Money) directement en ligne avec reçu instantané, ainsi que le règlement en espèces au livreur ou au comptoir de la boutique.",
      category: 'paiement'
    },
    {
      q: "Qu'est-ce que la double confirmation contradictoire de livraison ?",
      a: "Pour garantir qu'aucune course n'est clôturée abusivement, le livreur doit d'abord cliquer sur 'J'ai livré' une fois chez vous, puis vous confirmez vous-même sur votre écran en cliquant sur 'J'ai reçu ma bouteille'. En cas de problème, un bouton 'Contester' alerte immédiatement le Control Center.",
      category: 'livraison'
    },
    {
      q: "Quel est le tarif de livraison à domicile ?",
      a: "Le tarif officiel de livraison assuré par la flotte PLEINGAZ est un forfait fixe garanti de 1 000 FCFA dans le périmètre urbain. Aucun pourboire ou supplément kilométrique n'est exigible.",
      category: 'livraison'
    },
    {
      q: "Pourquoi existe-t-il une limite de 5 bouteilles par période de 30 jours ?",
      a: "Cette règle est une mesure légale de distribution équitable pour protéger les ménages contre l'accaparement et la spéculation illicite. Elle s'applique de façon transparente à la fois aux commandes en ligne et aux ventes au comptoir.",
      category: 'commande'
    },
    {
      q: "Que faire si j'ai changé de numéro de téléphone ?",
      a: "Contactez un gestionnaire de compte officiel PLEINGAZ via notre support. Conformément au protocole Maker-Checker de sécurité, un dossier d'assistance 'AccountCase' sera instruit avec vérification d'identité pour mettre à jour vos coordonnées en toute sécurité.",
      category: 'compte'
    },
    {
      q: "Comment devenir distributeur agréé PLEINGAZ ?",
      a: "Accédez à l'espace Professionnel (/distributor/apply). Votre dossier ne nécessite que 3 pièces : votre pièce d'identité recto/verso, une photo portrait récente et la photo de votre boutique extérieure. Une fois validé par l'administrateur, votre point de vente apparaît sur la carte nationale.",
      category: 'distributeur'
    },
    {
      q: "Les prix affichés sont-ils négociables ?",
      a: "Non. Tous les prix sur PLEINGAZ sont nationaux, transparents et strictement homologués par la Caisse de Stabilisation des Prix des Hydrocarbures (CSPH). Nos distributeurs s'engagent contractuellement à ne pratiquer aucune surfacturation.",
      category: 'paiement'
    }
  ];

  const filteredFaqs = faqs.filter(item => 
    item.q.toLowerCase().includes(search.toLowerCase()) || 
    item.a.toLowerCase().includes(search.toLowerCase())
  );

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
          <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 rounded-md">
            Centre d&apos;Aide
          </span>
        </div>

        {/* Hero Header */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 rounded-full text-xs font-bold">
            <HelpCircle className="w-4 h-4" />
            Questions Fréquentes
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
            Comment pouvons-nous vous aider ?
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Retrouvez toutes les réponses officielles sur le fonctionnement du réseau, vos commandes, les tarifs et la sécurité.
          </p>
        </div>

        {/* Barre de Recherche */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher une question (ex: paiement, livraison, quota, WhatsApp)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-xs"
          />
        </div>

        {/* Liste Accordéon FAQ */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-2">
              <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                Aucun résultat pour &laquo; {search} &raquo;
              </p>
              <p className="text-xs text-neutral-500">
                Contactez notre assistance WhatsApp pour obtenir une réponse directe.
              </p>
            </div>
          ) : (
            filteredFaqs.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-neutral-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-red-600' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/60">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bloc Contact Support */}
        <div className="p-6 bg-neutral-900 text-white rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-black text-white text-base">
              Vous n&apos;avez pas trouvé votre réponse ?
            </h3>
            <p className="text-xs text-neutral-400">
              Notre équipe d&apos;assistance est disponible sur WhatsApp 7j/7 de 7h à 20h.
            </p>
          </div>
          <a
            href="https://wa.me/237657696567"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all shrink-0 inline-flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Écrire sur WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
}

