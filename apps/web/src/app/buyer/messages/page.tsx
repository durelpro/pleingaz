'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Store, MapPin, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function BuyerMessagesContent() {
  const searchParams = useSearchParams();
  const toId = searchParams.get('to');
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [activeConv, setActiveConv] = useState<any>(null);
  
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '' });
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const h: any = { 'Content-Type': 'application/json', 'x-demo-role': 'customer_1' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  };

  useEffect(() => {
    // Check profile
    fetch('http://localhost:3001/users/profile', {
      headers: getHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error('No profile');
      return res.json();
    })
    .then(data => {
      if (data && data.id) {
        setHasProfile(true);
        loadConversations();
      } else {
        setHasProfile(true); // Don't block chat if basic user
        loadConversations();
      }
    })
    .catch(() => {
      setHasProfile(true);
      loadConversations();
    });
  }, []);

  const loadConversations = () => {
    fetch('http://localhost:3001/chat/conversations', {
      headers: getHeaders()
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setConversations(data);
        if (toId && !activeConv) {
          const existing = data.find((c: any) => c.participant1Id === toId || c.participant2Id === toId || c.otherParticipant?.id === toId);
          if (existing) {
            selectConversation(existing);
          } else {
            // New conversation directly
            setActiveConv({ 
              isNew: true, 
              participant1Id: 'customer-demo-1234', 
              participant2Id: toId,
              otherParticipant: { name: 'Point de vente', id: toId }
            });
            setMessages([]);
          }
        }
      }
    })
    .catch(err => console.error(err));
  };

  const selectConversation = (conv: any) => {
    setActiveConv(conv);
    fetch(`http://localhost:3001/chat/conversations/${conv.id}/messages`, {
      headers: getHeaders()
    })
    .then(res => res.json())
    .then(data => setMessages(Array.isArray(data) ? data : []))
    .catch(err => console.error(err));
  };

  // Poll for messages in active conversation every 3.5 seconds
  useEffect(() => {
    if (!activeConv || activeConv.isNew) return;
    const interval = setInterval(() => {
      fetch(`http://localhost:3001/chat/conversations/${activeConv.id}/messages`, {
        headers: getHeaders()
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data);
        }
      })
      .catch(() => {});
    }, 3500);
    return () => clearInterval(interval);
  }, [activeConv]);

  const createProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProfile(true);
    try {
      await fetch('http://localhost:3001/users/profile', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(profileForm)
      });
      setHasProfile(true);
      loadConversations();
    } catch (err) {
      console.error(err);
    }
    setIsSubmittingProfile(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeConv) return;
    
    const recipientId = activeConv.otherParticipant?.id || (activeConv.participant1Id === 'customer-demo-1234' ? activeConv.participant2Id : activeConv.participant1Id);

    try {
      const res = await fetch('http://localhost:3001/chat/messages', {
        method: 'POST',
        headers: getHeaders(),
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

  if (hasProfile === null) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;
  }

  if (hasProfile === false) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-neutral-800">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store size={32} />
          </div>
          <h2 className="text-2xl font-black text-center mb-2">Profil Acheteur</h2>
          <p className="text-gray-500 text-center mb-8">Veuillez renseigner votre nom pour discuter avec les distributeurs.</p>
          
          <form onSubmit={createProfile} className="space-y-4">
            <input 
              type="text" 
              placeholder="Prénom" 
              required
              value={profileForm.firstName}
              onChange={e => setProfileForm({...profileForm, firstName: e.target.value})}
              className="w-full p-4 rounded-xl bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
            <input 
              type="text" 
              placeholder="Nom" 
              required
              value={profileForm.lastName}
              onChange={e => setProfileForm({...profileForm, lastName: e.target.value})}
              className="w-full p-4 rounded-xl bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
            <button 
              type="submit" 
              disabled={isSubmittingProfile}
              className="w-full py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors flex justify-center items-center gap-2"
            >
              {isSubmittingProfile && <Loader2 size={18} className="animate-spin" />}
              Créer mon profil
            </button>
          </form>
        </div>
      </div>
    );
  }

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
          {conversations.length === 0 ? (
            <p className="p-6 text-center text-gray-500 text-sm">Aucune conversation active.</p>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`p-4 border-b border-gray-100 dark:border-neutral-800 cursor-pointer transition-colors ${activeConv?.id === conv.id ? 'bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-neutral-900'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${activeConv?.id === conv.id ? 'bg-white dark:bg-neutral-800 text-blue-500 shadow-sm' : 'bg-gray-100 dark:bg-neutral-800 text-gray-400'}`}>
                    <Store size={20} />
                  </div>
                    <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">
                        {conv.otherParticipant?.name || 'Boutique Distributeur'}
                      </h3>
                      {conv.otherParticipant?.store?.neighborhood && (
                        <span className="text-xs text-blue-500 font-bold ml-2 shrink-0">
                          {conv.otherParticipant.store.neighborhood}
                        </span>
                      )}
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
            Sélectionnez une boutique pour démarrer la discussion
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 flex items-center gap-4 z-10">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center">
                <Store size={24} />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">
                  {activeConv.otherParticipant?.name || 'Boutique PLEINGAZ'}
                </h2>
                <p className="text-sm text-gray-500 flex items-center gap-1 font-medium">
                  <MapPin size={14} className="text-blue-500" /> 
                  {activeConv.otherParticipant?.store 
                    ? `${activeConv.otherParticipant.store.neighborhood}, ${activeConv.otherParticipant.store.city} ${activeConv.otherParticipant.store.landmark ? `(${activeConv.otherParticipant.store.landmark})` : ''}`
                    : 'Point de vente Agréé'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((msg: any) => {
                  const isMe = msg.senderId === 'customer_1';
                  return (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex flex-col max-w-[75%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <div className={`p-4 rounded-2xl shadow-sm ${
                        isMe
                          ? 'bg-blue-500 text-white rounded-br-sm' 
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
          </>
        )}
      </div>
    </div>
  );
}

export default function BuyerMessages() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>}>
      <BuyerMessagesContent />
    </Suspense>
  );
}
