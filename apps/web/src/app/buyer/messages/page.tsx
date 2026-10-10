'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Store, MapPin, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_MESSAGES = [
  { id: 1, sender: 'distributor', text: 'Bonjour ! Oui, nous avons bien de la SCTM 12.5Kg en stock.', time: '10:30' },
  { id: 2, sender: 'buyer', text: 'Super, à quel prix s\'il vous plait ?', time: '10:31' },
  { id: 3, sender: 'distributor', text: 'Le prix officiel, 6500 FCFA. Voulez-vous que je vous en réserve une ?', time: '10:33' },
];

export default function BuyerMessages() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState('');

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'buyer',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    
    setInput('');
    
    // Simulate auto-reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'distributor',
        text: 'D\'accord, c\'est noté ! À tout à l\'heure.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex flex-col md:flex-row">
      
      {/* Sidebar - Conversation List */}
      <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-800">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors font-bold mb-4">
            <ArrowLeft size={18} /> Accueil
          </Link>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Messagerie</h2>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher une boutique..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-neutral-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {/* Active Conversation Item */}
          <div className="p-4 border-b border-gray-100 dark:border-neutral-800 bg-blue-50 dark:bg-blue-900/10 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                <Store size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">ETS Pleingaz Bonamoussadi</h3>
                  <span className="text-xs text-blue-500 font-bold">10:33</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate font-medium">Le prix officiel, 6500 FCFA...</p>
              </div>
            </div>
          </div>

          {/* Another Conversation */}
          <div className="p-4 border-b border-gray-100 dark:border-neutral-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center text-gray-400 shrink-0">
                <Store size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">Maman Gaz Makepe</h3>
                  <span className="text-xs text-gray-400">Hier</span>
                </div>
                <p className="text-sm text-gray-500 truncate">Je n'ai plus de Camgaz désolé.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen max-h-screen relative bg-gray-50 dark:bg-neutral-950">
        
        {/* Chat Header */}
        <div className="px-6 py-4 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 flex items-center gap-4 z-10">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center">
            <Store size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white">ETS Pleingaz Bonamoussadi</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1 font-medium">
              <MapPin size={14} /> Douala, Bonamoussadi
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="text-center">
            <span className="px-3 py-1 bg-gray-200 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 text-xs font-bold rounded-full">
              Aujourd'hui
            </span>
          </div>

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex flex-col max-w-[75%] \${msg.sender === 'buyer' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <div className={`p-4 rounded-2xl shadow-sm \${
                  msg.sender === 'buyer' 
                    ? 'bg-blue-500 text-white rounded-br-sm' 
                    : 'bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border border-gray-100 dark:border-neutral-800 rounded-bl-sm'
                }`}>
                  <p className="font-medium">{msg.text}</p>
                </div>
                <span className="text-xs text-gray-400 mt-1 mx-1 font-bold">{msg.time}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 z-10">
          <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex items-center gap-3">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 bg-gray-100 dark:bg-neutral-800 border-transparent focus:border-blue-500 focus:ring-0 rounded-full px-6 py-3.5 outline-none transition-all font-medium"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="w-12 h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-neutral-700 text-white rounded-full flex items-center justify-center transition-colors shrink-0"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
