'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, User, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DistributorMessages() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [activeConv, setActiveConv] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = () => {
    fetch('http://localhost:3001/chat/conversations', {
      headers: { 'x-demo-role': 'distributor_1' }
    })
    .then(res => res.json())
    .then(data => setConversations(data))
    .catch(err => console.error(err))
    .finally(() => setIsLoading(false));
  };

  const selectConversation = (conv: any) => {
    setActiveConv(conv);
    fetch(`http://localhost:3001/chat/conversations/${conv.id}/messages`, {
      headers: { 'x-demo-role': 'distributor_1' }
    })
    .then(res => res.json())
    .then(data => setMessages(data))
    .catch(err => console.error(err));
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeConv) return;
    
    // Distributor replies to the customer
    const recipientId = activeConv.participant1Id === 'distributor_1' ? activeConv.participant2Id : activeConv.participant1Id;

    try {
      const res = await fetch('http://localhost:3001/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-demo-role': 'distributor_1' },
        body: JSON.stringify({ recipientId, content: input })
      });
      const newMsg = await res.json();
      setMessages(prev => [...prev, newMsg]);
      setInput('');
      loadConversations();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-pleingaz-red" size={32} /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex flex-col md:flex-row">
      
      {/* Sidebar - Conversation List */}
      <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-800">
          <Link href="/distributor/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-pleingaz-red transition-colors font-bold mb-4">
            <ArrowLeft size={18} /> Tableau de bord
          </Link>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Messagerie Clients</h2>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un client..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-neutral-800 border-none rounded-xl focus:ring-2 focus:ring-pleingaz-red outline-none text-sm font-medium"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-6 text-center text-gray-500 text-sm">Aucun message de client pour le moment.</p>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`p-4 border-b border-gray-100 dark:border-neutral-800 cursor-pointer transition-colors ${activeConv?.id === conv.id ? 'bg-orange-50 dark:bg-orange-900/10' : 'hover:bg-gray-50 dark:hover:bg-neutral-900'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${activeConv?.id === conv.id ? 'bg-white dark:bg-neutral-800 text-pleingaz-red shadow-sm' : 'bg-gray-100 dark:bg-neutral-800 text-gray-400'}`}>
                    <User size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">Client</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate font-medium">
                      {conv.messages?.[0]?.content || 'Nouvelle conversation'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen max-h-screen relative bg-gray-50 dark:bg-neutral-950">
        {!activeConv ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Sélectionnez une conversation pour répondre
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 flex items-center gap-4 z-10">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-pleingaz-red rounded-full flex items-center justify-center">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">Client</h2>
                <p className="text-sm text-green-500 font-bold">En ligne</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((msg: any) => {
                  const isMe = msg.senderId === 'distributor_1';
                  return (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex flex-col max-w-[75%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <div className={`p-4 rounded-2xl shadow-sm ${
                        isMe
                          ? 'bg-gradient-to-r from-pleingaz-red to-[#ff6a00] text-white rounded-br-sm' 
                          : 'bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border border-gray-100 dark:border-neutral-800 rounded-bl-sm'
                      }`}>
                        <p className="font-medium">{msg.content}</p>
                      </div>
                      <span className="text-xs text-gray-400 mt-1 mx-1 font-bold">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 z-10">
              <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex items-center gap-3">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Écrivez votre réponse..."
                  className="flex-1 bg-gray-100 dark:bg-neutral-800 border-transparent focus:border-pleingaz-red focus:ring-0 rounded-full px-6 py-3.5 outline-none transition-all font-medium"
                />
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="w-12 h-12 bg-pleingaz-red hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-neutral-700 text-white rounded-full flex items-center justify-center transition-colors shrink-0"
                >
                  <Send size={18} className="ml-1" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
