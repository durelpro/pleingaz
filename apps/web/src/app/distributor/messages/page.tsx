'use client';

import { apiFetch } from '@/lib/api';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Send, User, Search, Loader2, Phone, Plus, Store, 
  ShieldCheck, HelpCircle, CheckCheck, X, Zap, MessageSquare 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '@/components/common/BackButton';

interface Contact {
  id: string;
  storeId?: string;
  name: string;
  type: 'STORE' | 'CUSTOMER' | 'SUPPORT';
  subtitle: string;
  isVerified?: boolean;
}

interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  updatedAt: string;
  messages?: any[];
  otherParticipant?: {
    id: string;
    name: string;
    phone?: string;
    store?: any;
    isStore?: boolean;
  };
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

const QUICK_REPLIES_DISTRIBUTOR = [
  "✅ Oui, le gaz 12.5kg est bien disponible en magasin !",
  "🚚 Votre livraison est prête et notre livreur est en route.",
  "📞 Veuillez nous joindre au téléphone pour la localisation exacte.",
  "⏳ Réapprovisionnement prévu d'ici 30 minutes."
];

function DistributorMessagesContent() {
  const searchParams = useSearchParams();
  const toId = searchParams.get('to');

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [convSearch, setConvSearch] = useState('');

  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Nouveau Message & Recherche de Clients / Contacts
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Récupérer l'utilisateur courant via /auth/me
  useEffect(() => {
    apiFetch('/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          setCurrentUserId(data.id);
        }
      })
      .catch(() => {});
  }, []);

  // 2. Charger les conversations
  const loadConversations = async (autoSelectToId?: string) => {
    try {
      const res = await apiFetch('/chat/conversations');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setConversations(data);
          setFilteredConversations(data);

          const targetTo = autoSelectToId || toId;
          if (targetTo) {
            const existing = data.find((c: any) => 
              c.otherParticipant?.id === targetTo ||
              c.participant1Id === targetTo ||
              c.participant2Id === targetTo
            );
            if (existing) {
              selectConversation(existing);
            } else {
              apiFetch(`/chat/contacts?q=`)
                .then(r => r.json())
                .then(cList => {
                  const match = Array.isArray(cList) ? cList.find((c: any) => c.id === targetTo) : null;
                  setActiveConv({
                    id: 'new',
                    isNew: true,
                    otherParticipant: {
                      id: targetTo,
                      name: match?.name || 'Client',
                      subtitle: match?.subtitle || '',
                    }
                  });
                  setMessages([]);
                })
                .catch(() => {
                  setActiveConv({
                    id: 'new',
                    isNew: true,
                    otherParticipant: { id: targetTo, name: 'Client' }
                  });
                  setMessages([]);
                });
            }
          } else if (data.length > 0 && !activeConv) {
            selectConversation(data[0]);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [toId]);

  // Filtre instantané sur les conversations
  useEffect(() => {
    if (!convSearch.trim()) {
      setFilteredConversations(conversations);
    } else {
      const q = convSearch.toLowerCase();
      setFilteredConversations(
        conversations.filter(c => 
          (c.otherParticipant?.name && c.otherParticipant.name.toLowerCase().includes(q)) ||
          (c.otherParticipant?.phone && c.otherParticipant.phone.includes(q)) ||
          (c.messages?.[0]?.content && c.messages[0].content.toLowerCase().includes(q))
        )
      );
    }
  }, [convSearch, conversations]);

  // 3. Sélectionner une conversation et charger ses messages
  const selectConversation = async (conv: any) => {
    setActiveConv(conv);
    if (conv.isNew) {
      setMessages([]);
      return;
    }
    try {
      const res = await apiFetch(`/chat/conversations/${conv.id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
        scrollToBottom();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Polling automatique pour les nouveaux messages toutes les 3s
  useEffect(() => {
    if (!activeConv || activeConv.isNew || activeConv.id === 'new') return;
    const interval = setInterval(async () => {
      try {
        const res = await apiFetch(`/chat/conversations/${activeConv.id}/messages`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length !== messages.length) {
            setMessages(data);
            scrollToBottom();
          }
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [activeConv, messages.length]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 4. Recherche de contacts dans la modale (Clients / Support)
  const searchContacts = async (query: string) => {
    setIsLoadingContacts(true);
    try {
      const res = await apiFetch(`/chat/contacts?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setContacts(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const openNewMessageModal = () => {
    setShowNewMessageModal(true);
    setContactSearchQuery('');
    searchContacts('');
  };

  const handleSelectContact = (contact: Contact) => {
    setShowNewMessageModal(false);
    const existing = conversations.find(c => 
      c.otherParticipant?.id === contact.id || 
      c.participant1Id === contact.id || 
      c.participant2Id === contact.id
    );

    if (existing) {
      selectConversation(existing);
    } else {
      setActiveConv({
        id: 'new',
        isNew: true,
        otherParticipant: {
          id: contact.id,
          name: contact.name,
          subtitle: contact.subtitle,
          isStore: contact.type === 'STORE',
        }
      });
      setMessages([]);
    }
  };

  // 5. Envoi de message
  const sendMessage = async (customContent?: string) => {
    const text = (customContent || input).trim();
    if (!text || !activeConv || isSending) return;

    const recipientId = activeConv.otherParticipant?.id;
    if (!recipientId) return;

    setIsSending(true);
    try {
      const res = await apiFetch('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ recipientId, content: text })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
        if (!customContent) setInput('');
        scrollToBottom();

        if (activeConv.isNew || activeConv.id === 'new') {
          await loadConversations(recipientId);
        } else {
          loadConversations();
        }
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Erreur lors de l'envoi du message.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau lors de l'envoi.");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950">
        <Loader2 className="animate-spin text-pleingaz-red" size={36} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar - Conversations Distributeur */}
      <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 flex flex-col h-auto md:h-screen">
        
        {/* Header Sidebar */}
        <div className="p-4 border-b border-gray-100 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <BackButton fallbackHref="/distributor/dashboard" label="Tableau de bord" />
            
            <button
              onClick={openNewMessageModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pleingaz-red to-[#ff6a00] hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all active:scale-95"
            >
              <Plus size={16} />
              <span>Nouveau</span>
            </button>
          </div>

          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Messagerie</h1>
            <p className="text-xs text-gray-500 mt-0.5">Répondez aux demandes des clients en temps réel</p>
          </div>

          {/* Recherche dans les conversations */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              value={convSearch}
              onChange={(e) => setConvSearch(e.target.value)}
              placeholder="Rechercher un client..."
              className="w-full pl-9 pr-8 py-2 bg-gray-100 dark:bg-neutral-800 border-none rounded-xl focus:ring-2 focus:ring-pleingaz-red outline-none text-xs font-medium"
            />
            {convSearch && (
              <button onClick={() => setConvSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-neutral-800/60">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-950/40 text-pleingaz-red rounded-2xl flex items-center justify-center mx-auto">
                <MessageSquare size={22} />
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {convSearch ? "Aucun échange ne correspond à votre recherche." : "Aucun message client pour le moment."}
              </p>
              <button
                onClick={openNewMessageModal}
                className="text-xs font-bold text-pleingaz-red hover:underline"
              >
                Écrire à un client ou à l'assistance
              </button>
            </div>
          ) : (
            filteredConversations.map(conv => {
              const isSelected = activeConv?.id === conv.id;
              const other = conv.otherParticipant;
              const lastMsg = conv.messages?.[0];

              return (
                <div 
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-orange-50 dark:bg-orange-950/20 border-l-4 border-pleingaz-red' : 'hover:bg-gray-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      isSelected 
                        ? 'bg-gradient-to-r from-pleingaz-red to-[#ff6a00] text-white shadow-md shadow-orange-500/20' 
                        : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400'
                    }`}>
                      <User size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h2 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                          {other?.name || 'Client PLEINGAZ'}
                        </h2>
                        {lastMsg && (
                          <span className="text-[10px] text-gray-400 font-semibold ml-2 shrink-0">
                            {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      {other?.phone && (
                        <div className="text-[11px] text-gray-400 font-semibold truncate mb-0.5">
                          📞 {other.phone}
                        </div>
                      )}

                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {lastMsg?.content || 'Nouvelle conversation'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen max-h-screen relative bg-gray-50 dark:bg-neutral-950">
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-3xl bg-orange-100 dark:bg-orange-950/50 text-pleingaz-red flex items-center justify-center mb-4">
              <MessageSquare size={32} />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Sélectionnez une conversation</h2>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              Choisissez une discussion client dans la liste pour lui répondre ou initiez un nouvel échange.
            </p>
            <button
              onClick={openNewMessageModal}
              className="px-6 py-3 bg-gradient-to-r from-pleingaz-red to-[#ff6a00] hover:opacity-90 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/30 transition-all active:scale-95"
            >
              Écrire à quelqu'un
            </button>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-orange-100 dark:bg-orange-950/40 text-pleingaz-red rounded-2xl flex items-center justify-center shrink-0">
                  <User size={22} />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900 dark:text-white">
                    {activeConv.otherParticipant?.name || 'Client PLEINGAZ'}
                  </h2>
                  <p className="text-xs text-gray-500 flex items-center gap-1 font-medium mt-0.5">
                    <Phone size={12} className="text-orange-500" />
                    {activeConv.otherParticipant?.phone || 'Numéro sécurisé'}
                  </p>
                </div>
              </div>

              {activeConv.otherParticipant?.phone && (
                <a
                  href={`tel:${activeConv.otherParticipant.phone}`}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800"
                >
                  <Phone size={14} />
                  <span>Appeler</span>
                </a>
              )}
            </div>

            {/* Zone des Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-950/30 text-pleingaz-red flex items-center justify-center mx-auto">
                    <Send size={20} />
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Début de la discussion</p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Répondez avec professionnalisme pour rassurer le client sur la disponibilité et vos horaires.
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg) => {
                    const isMe = currentUserId ? msg.senderId === currentUserId : msg.senderId !== activeConv.otherParticipant?.id;
                    return (
                      <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex flex-col max-w-[80%] md:max-w-[70%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <div className={`p-4 rounded-2xl shadow-sm ${
                          isMe
                            ? 'bg-gradient-to-r from-pleingaz-red to-[#ff6a00] text-white rounded-br-none' 
                            : 'bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border border-gray-100 dark:border-neutral-800 rounded-bl-none'
                        }`}>
                          <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 mx-1 text-[10px] text-gray-400 font-semibold">
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && <CheckCheck size={12} className="text-orange-500" />}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies & Zone de Saisie */}
            <div className="p-4 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 z-10 space-y-3">
              {/* Réponses rapides distributeur */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-gray-400 font-bold flex items-center gap-1 shrink-0">
                  <Zap size={14} className="text-yellow-500" /> Réponses rapides :
                </span>
                {QUICK_REPLIES_DISTRIBUTOR.map((reply, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendMessage(reply)}
                    disabled={isSending}
                    className="shrink-0 px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 hover:bg-orange-50 dark:hover:bg-orange-950/30 text-gray-700 dark:text-gray-300 hover:text-pleingaz-red rounded-full font-medium transition-colors border border-gray-200 dark:border-neutral-700"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Formulaire de message */}
              <form 
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }} 
                className="max-w-4xl mx-auto flex items-center gap-3"
              >
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Écrivez votre message..."
                  disabled={isSending}
                  className="flex-1 bg-gray-100 dark:bg-neutral-800 border-transparent focus:border-pleingaz-red focus:ring-0 rounded-2xl px-5 py-3.5 outline-none transition-all text-sm font-medium"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isSending}
                  className="w-12 h-12 bg-gradient-to-r from-pleingaz-red to-[#ff6a00] hover:opacity-90 disabled:bg-gray-300 dark:disabled:bg-neutral-700 text-white rounded-2xl flex items-center justify-center transition-all shrink-0 shadow-md shadow-orange-500/20 active:scale-95"
                >
                  {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Modal Nouveau Message : Recherche de Clients / Support */}
      <AnimatePresence>
        {showNewMessageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowNewMessageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-lg text-gray-900 dark:text-white">Nouveau Message</h3>
                  <p className="text-xs text-gray-500">Recherchez un client ou l'assistance PLEINGAZ</p>
                </div>
                <button 
                  onClick={() => setShowNewMessageModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Champ de recherche de contacts */}
              <div className="p-4 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-950/50">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    autoFocus
                    value={contactSearchQuery}
                    onChange={(e) => {
                      setContactSearchQuery(e.target.value);
                      searchContacts(e.target.value);
                    }}
                    placeholder="Tapez un numéro de téléphone ou un nom..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 focus:ring-2 focus:ring-pleingaz-red outline-none text-sm font-medium"
                  />
                </div>
              </div>

              {/* Résultats */}
              <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100 dark:divide-neutral-800/60">
                {isLoadingContacts && (
                  <div className="py-8 text-center">
                    <Loader2 className="animate-spin text-pleingaz-red mx-auto mb-2" size={24} />
                    <p className="text-xs text-gray-400 font-bold">Recherche des contacts...</p>
                  </div>
                )}

                {!isLoadingContacts && contacts.length === 0 && (
                  <div className="py-8 text-center text-gray-400 text-xs font-bold">
                    Aucun résultat trouvé pour "{contactSearchQuery}".
                  </div>
                )}

                {!isLoadingContacts && contacts.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectContact(c)}
                    className="py-3 px-3 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 rounded-2xl cursor-pointer flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        c.type === 'SUPPORT' 
                          ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600'
                          : 'bg-orange-100 dark:bg-orange-950/40 text-pleingaz-red'
                      }`}>
                        {c.type === 'SUPPORT' ? <HelpCircle size={22} /> : <User size={22} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">{c.name}</span>
                          {c.isVerified && <ShieldCheck size={14} className="text-emerald-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-500 font-medium truncate max-w-xs">{c.subtitle}</p>
                      </div>
                    </div>

                    <button className="px-3 py-1.5 bg-orange-50 dark:bg-orange-950/50 hover:bg-pleingaz-red hover:text-white text-pleingaz-red font-bold text-xs rounded-xl transition-all">
                      Écrire
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function DistributorMessages() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-pleingaz-red" size={32} /></div>}>
      <DistributorMessagesContent />
    </Suspense>
  );
}
