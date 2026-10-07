'use client';

import { useState } from 'react';
import { Send, Bot, User, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AssistantPage() {
  const [messages, setMessages] = useState<{role: 'assistant' | 'user', content: string}[]>([
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

    // Simulation de l'appel API (Tâche 8.4)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: userMsg.toLowerCase().includes('prix') 
          ? "Le prix officiel d'une bouteille SCTM 12.5Kg est de 6 500 FCFA."
          : '[MODE DEV] Je suis connecté à ma base de connaissances. Posez une vraie question !'
      }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-4 md:p-8 flex flex-col">
      <div className="max-w-3xl mx-auto w-full flex flex-col h-[calc(100vh-4rem)] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-100 dark:border-neutral-800 flex items-center gap-4 bg-white dark:bg-neutral-900 z-10">
          <div className="w-12 h-12 bg-pleingaz-red rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/30">
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
                className={`flex gap-4 \${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 \${msg.role === 'user' ? 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white' : 'bg-pleingaz-red text-white'}`}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl \${msg.role === 'user' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-tr-none' : 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white rounded-tl-none'}`}>
                  {msg.content}
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
              className="absolute right-2 p-3 bg-pleingaz-red text-white rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
