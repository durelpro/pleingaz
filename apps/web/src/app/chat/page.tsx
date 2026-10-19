'use client';

import { useState } from 'react';
import { Send, Bot, User, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function AssistantPage() {
  const [messages, setMessages] = useState<{role: 'assistant' | 'user', content: string, action?: {label: string, href: string}}[]>([
    { role: 'assistant', content: "Bonjour ! Je suis l'assistant PLEINGAZ. Posez-moi vos questions sur nos produits, le statut de votre commande ou nos horaires." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    // Simulation d'un modèle d'IA très avancé
    setTimeout(() => {
      let response = "";
      let action = undefined;
      const msg = userMsg.toLowerCase().trim();
      
      // Moteur NLP aligné avec CR-001
      const rules = [
        {
          patterns: ['fuite', 'odeur de gaz', 'incendie', 'danger', 'explosion', 'secours', 'bouteille qui fuit'],
          reply: "🚨 ALERTE SÉCURITÉ GAZ - CONSIGNES D'URGENCE IMMÉDIATES :\n1. N'actionnez aucun interrupteur électrique ni flamme.\n2. Fermez le robinet / détendeur de votre bouteille.\n3. Aérez largement la pièce en ouvrant portes et fenêtres.\n4. Évacuez les lieux et appelez les sapeurs-pompiers (118) ainsi que le support d'urgence PLEINGAZ au +237 657696567."
        },
        {
          patterns: ['prix', 'coute', 'coûte', 'combien', 'tarif', 'fcfa'],
          reply: "Le tarif public homologué officiel de la bouteille PLEINGAZ 12.5 kg est fixé à 6 500 FCFA. Il n'y a aucune surfacturation chez nos distributeurs agréés officiels !"
        },
        {
          patterns: ['livraison', 'livrer', 'apporter', 'domicile', 'chez moi'],
          reply: "Nous proposons une livraison express sécurisée à domicile. Un code secret OTP (haché SHA-256) vous est transmis dans l'application : ne le remettez au livreur qu'après réception physique de votre bouteille PLEINGAZ."
        },
        {
          patterns: ['distributeur', 'proche', 'trouver', 'boutique', 'magasin', 'relais', 'autour'],
          reply: "J'ai repéré les points de distribution agréés PLEINGAZ autour de vous avec stock en direct. Vous pouvez consulter la carte interactive pour réserver votre bouteille avec garantie de 15 minutes.",
          action: { label: "Trouver du gaz", href: "/search" }
        },
        {
          patterns: ['partenaire', 'vendre', 'devenir'],
          reply: "Vous souhaitez devenir distributeur agréé PLEINGAZ ? Rendez-vous dans la section 'Devenir Distributeur'. Selon la règle stricte D-04, seuls 3 documents sont requis : votre CNI, votre photo portrait et la photo de votre point de vente (aucun RCCM ni document fiscal n'est exigé).",
          action: { label: "Devenir Distributeur", href: "/distributor/apply" }
        },
        {
          patterns: ['rupture', 'vide', 'plus de gaz', 'fini', 'stock'],
          reply: "Tous les distributeurs confirment régulièrement leur stock qualitatif (BON, MOYEN, FAIBLE, RUPTURE). Si un dépôt est en rupture, notre algorithme géolocalisé vous oriente immédiatement vers le point agréé le plus proche approvisionné."
        },
        {
          patterns: ['paiement', 'payer', 'orange money', 'mtn momo', 'cash', 'espece'],
          reply: "Nous acceptons les règlements instantanés MTN Mobile Money, Orange Money, ainsi que le paiement en espèces à la livraison. Vos paiements en ligne sont protégés par séquestre et clé d'idempotence."
        },
        {
          patterns: ['marque', 'sctm', 'camgaz', 'tradex', 'greenoil', 'oilibya', 'bocom'],
          reply: "PLEINGAZ est une marque exclusive et intégrée. Pour garantir la sécurité et la conformité des bouteilles, nous distribuons exclusivement les calibres officiels de la marque PLEINGAZ au Cameroun."
        },
        {
          patterns: ['horaire', 'ouvert', 'ferme', 'heure'],
          reply: "La majorité des dépôts agréés PLEINGAZ sont ouverts de 08:00 à 18:00, du lundi au samedi. La recherche en direct vous indique les dépôts actuellement ouverts."
        },
        {
          patterns: ['probleme', 'reclamation', 'arnaque', 'surfacturation', 'cher', 'plainte'],
          reply: "Toute surfacturation ou non-conformité est sanctionnée. Vous pouvez déposer un signalement direct sur la boutique en cause. Notre équipe support prend en charge le dossier."
        },
        {
          patterns: ['bonjour', 'salut', 'coucou', 'hello'],
          reply: "Bonjour ! Je suis l'assistant officiel de PLEINGAZ. Comment puis-je vous accompagner pour votre approvisionnement en gaz aujourd'hui ?"
        },
        {
          patterns: ['merci', 'super', 'génial', 'genial', 'ok', 'd\'accord'],
          reply: "C'est un plaisir de vous servir ! PLEINGAZ vous garantit la sécurité et les tarifs officiels sans compromis."
        }
      ];

      // Recherche de la meilleure correspondance
      let foundMatch = false;
      for (const rule of rules) {
        if (rule.patterns.some(pattern => msg.includes(pattern))) {
          response = rule.reply;
          if ('action' in rule) {
            action = (rule as any).action;
          }
          foundMatch = true;
          break;
        }
      }

      // Réponse de repli (Fallback) si l'IA ne comprend pas
      if (!foundMatch) {
        response = "Je n'ai pas bien compris votre demande. En tant qu'assistant virtuel en phase d'apprentissage, pourriez-vous reformuler votre question ? Vous pouvez me demander nos prix, le suivi de livraison, ou comment devenir distributeur.";
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response, action }]);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-4 md:p-8 flex flex-col">
      <div className="max-w-3xl mx-auto w-full flex flex-col h-[calc(100vh-4rem)] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-100 dark:border-neutral-800 flex items-center gap-4 bg-white dark:bg-neutral-900 z-10">
          <div className="w-12 h-12 bg-pleingaz-red rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-500/30">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white">Assistant PLEINGAZ</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              En ligne (Alimenté par IA)
            </p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/10 px-6 py-3 flex items-start gap-3 border-b border-blue-100 dark:border-blue-900/20">
          <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Je suis une Intelligence Artificielle. Mes réponses sont basées sur la base de connaissances officielle PLEINGAZ. Pour des cas complexes, tapez "parler à un humain".
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white' : 'bg-pleingaz-red text-white'}`}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-tr-none' : 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white rounded-tl-none'}`}>
                  {msg.content}
                  {msg.action && (
                    <div className="mt-3">
                      <Link 
                        href={msg.action.href}
                        className="inline-block px-4 py-2 bg-pleingaz-red text-white text-sm font-bold rounded-xl hover:bg-red-800 transition-colors"
                      >
                        {msg.action.label}
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-pleingaz-red flex items-center justify-center text-white shrink-0">
                  <Bot size={18} />
                </div>
                <div className="p-4 rounded-2xl bg-gray-100 dark:bg-neutral-800 rounded-tl-none flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="relative flex items-center">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Écrivez votre message..."
              className="w-full pl-6 pr-14 py-4 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl focus:border-pleingaz-red outline-none transition-colors"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-3 bg-pleingaz-red text-white rounded-xl hover:bg-red-800 transition-colors disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
