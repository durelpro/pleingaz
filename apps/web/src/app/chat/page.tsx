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
      
      // Moteur NLP (Natural Language Processing) de base avec Regex et Mots-clés
      const rules = [
        {
          patterns: ['prix', 'coute', 'coûte', 'combien', 'tarif', 'fcfa'],
          reply: "Le prix officiel homologué d'une recharge de bouteille SCTM, Camgaz ou Tradex de 12.5Kg est de 6 500 FCFA. Il n'y a aucune surfacturation chez nos distributeurs agréés !"
        },
        {
          patterns: ['livraison', 'livrer', 'apporter', 'domicile', 'chez moi'],
          reply: "Nous proposons une livraison express de vos bouteilles de gaz à domicile. Une fois votre commande passée dans l'application, un livreur vous l'apportera. Un code OTP secret vous sera fourni pour valider la réception en toute sécurité."
        },
        {
          patterns: ['distributeur', 'proche', 'trouver', 'boutique', 'magasin', 'relais', 'autour'],
          reply: "J'ai trouvé un distributeur ouvert et certifié très proche de votre position ! Vous pouvez visiter sa Boutique Virtuelle pour voir son stock, son emplacement exact sur la carte, ou discuter avec lui sur WhatsApp.",
          action: { label: "Visiter la boutique", href: "/stores/sctm-bonamoussadi" }
        },
        {
          patterns: ['partenaire', 'vendre', 'devenir'],
          reply: "Vous souhaitez devenir distributeur agréé PLEINGAZ ? Super ! Rendez-vous dans la section 'Devenir Distributeur' de l'application. Vous devrez fournir votre CNI et votre RCCM. Une fois validé, votre point de vente apparaîtra sur notre carte avec votre stock en temps réel."
        },
        {
          patterns: ['rupture', 'vide', 'plus de gaz', 'fini', 'stock'],
          reply: "Notre technologie IoT surveille les stocks de tous nos distributeurs en temps réel. S'il n'y a plus de gaz près de chez vous, c'est que nous sommes déjà en route pour les réapprovisionner ! Vous pouvez consulter la carte pour trouver un autre point de vente avec du stock."
        },
        {
          patterns: ['paiement', 'payer', 'orange money', 'mtn momo', 'cash', 'espece'],
          reply: "Nous acceptons les paiements via MTN Mobile Money, Orange Money, et également le paiement en Cash à la livraison ou en point de retrait. Vos transactions sont 100% sécurisées."
        },
        {
          patterns: ['marque', 'sctm', 'camgaz', 'tradex', 'greenoil', 'oilibya', 'bocom'],
          reply: "L'application PLEINGAZ regroupe toutes vos marques préférées : SCTM, Camgaz, Tradex, BOCOM, GreenOil, etc. Vous pouvez filtrer la carte par marque pour trouver exactement ce que vous cherchez."
        },
        {
          patterns: ['horaire', 'ouvert', 'ferme', 'heure'],
          reply: "Les horaires varient selon les distributeurs. Cependant, la majorité de nos points relais sont ouverts de 08:00 à 18:00, du lundi au samedi. La carte interactive vous indiquera en temps réel si une boutique est ouverte ou fermée."
        },
        {
          patterns: ['probleme', 'reclamation', 'arnaque', 'surfacturation', 'cher', 'plainte'],
          reply: "Nous prenons les infractions très au sérieux. Si un distributeur surfacture le gaz ou est fermé alors qu'il est indiqué ouvert, vous pouvez le signaler directement via le bouton 'Signaler' sur sa boutique virtuelle. Son score de fiabilité baissera automatiquement."
        },
        {
          patterns: ['bonjour', 'salut', 'coucou', 'hello'],
          reply: "Bonjour ! Je suis l'Intelligence Artificielle PLEINGAZ. Comment puis-je vous aider aujourd'hui concernant votre approvisionnement en gaz ?"
        },
        {
          patterns: ['merci', 'super', 'génial', 'genial', 'ok', 'd\'accord'],
          reply: "C'est un plaisir de vous aider ! N'hésitez pas si vous avez d'autres questions. PLEINGAZ est là pour vous faciliter la vie."
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
