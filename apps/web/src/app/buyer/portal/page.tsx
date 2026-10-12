'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, LogIn, LogOut, ArrowLeft, MessageSquare, Award, Gift, ShoppingBag, Loader2, FileText, Star, Heart, MapPin, ChevronRight, Store, BellRing, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import FavoriteButton, { getFavoriteStoreIds } from '@/components/store/FavoriteButton';
import InvoiceModal from '@/components/invoice/InvoiceModal';

export default function BuyerPortal() {
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoiceOrderId, setSelectedInvoiceOrderId] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('pleingaz_user_data');
    setProfile(null);
    setCurrentUser(null);
    setOrders([]);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError('');
    try {
      const res = await fetch('http://localhost:3001/auth/login/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pass: password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
        }
        if (data.user) {
          localStorage.setItem('pleingaz_user_data', JSON.stringify(data.user));
          setCurrentUser(data.user);
          setProfile({
            firstName: data.user.profile?.firstName || 'Client',
            lastName: data.user.profile?.lastName || '',
            loyaltyPoints: data.user.loyaltyPoints || 0,
            phone: data.user.phone
          });
        }
        // Load orders
        const ordersRes = await fetch('http://localhost:3001/orders', {
          headers: { 'Authorization': `Bearer ${data.accessToken}` }
        });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData || []);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setAuthError(err.message || 'Numéro ou mot de passe incorrect.');
      }
    } catch (e) {
      setAuthError('Erreur de connexion au serveur.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !phone.trim() || !password.trim()) {
      setAuthError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setIsSubmitting(true);
    setAuthError('');
    try {
      const res = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName: lastName || '',
          phone,
          password,
          email: email || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
        }
        if (data.user) {
          localStorage.setItem('pleingaz_user_data', JSON.stringify(data.user));
          setCurrentUser(data.user);
          setProfile({
            firstName: data.user.profile?.firstName || firstName,
            lastName: data.user.profile?.lastName || lastName,
            loyaltyPoints: data.user.loyaltyPoints || 100,
            phone: data.user.phone
          });
        }
        setOrders([]);
      } else {
        const err = await res.json().catch(() => ({}));
        setAuthError(err.message || 'Erreur lors de la création du compte.');
      }
    } catch (err) {
      console.error(err);
      setAuthError('Erreur réseau lors de la création du profil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [favoriteStores, setFavoriteStores] = useState<any[]>([]);

  const loadFavoriteStores = async () => {
    const favIds = getFavoriteStoreIds();
    if (favIds.length === 0) {
      setFavoriteStores([]);
      return;
    }

    try {
      const stores = await Promise.all(
        favIds.map(async (id) => {
          try {
            const res = await fetch(`http://localhost:3001/search/stores/${id}`);
            if (res.ok) return await res.json();
            return null;
          } catch {
            return null;
          }
        })
      );
      setFavoriteStores(stores.filter(Boolean));
    } catch (e) {
      console.error(e);
    }
  };

  const [subscribedAlerts, setSubscribedAlerts] = useState<string[]>([]);

  const loadAlerts = () => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('pleingaz_stock_alerts');
        setSubscribedAlerts(raw ? JSON.parse(raw) : []);
      } catch {
        setSubscribedAlerts([]);
      }
    }
  };

  useEffect(() => {
    loadFavoriteStores();
    loadAlerts();
    const handleFavChange = () => {
      loadFavoriteStores();
      loadAlerts();
    };
    window.addEventListener('pleingaz_favorites_changed', handleFavChange);
    return () => window.removeEventListener('pleingaz_favorites_changed', handleFavChange);
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetch('http://localhost:3001/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(async (res) => {
      if (res.ok) {
        const userData = await res.json();
        setCurrentUser(userData);
        setProfile({
          firstName: userData.profile?.firstName || 'Client',
          lastName: userData.profile?.lastName || '',
          loyaltyPoints: userData.loyaltyPoints || 0,
          phone: userData.phone
        });

        // Load customer orders
        fetch('http://localhost:3001/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(r => r.json())
        .then(ordersData => setOrders(Array.isArray(ordersData) ? ordersData : []))
        .catch(() => {});
      } else {
        // Invalid or expired token
        localStorage.removeItem('accessToken');
        setProfile(null);
      }
    })
    .catch(() => {
      setProfile(null);
    })
    .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Decorative background */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full filter blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full filter blur-[100px] -z-10" />

      <div className="w-full max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors font-semibold mb-8">
          <ArrowLeft size={20} />
          Retour à l'accueil
        </Link>
        
        {!profile ? (
          <>
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
                Espace <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Acheteur</span>
              </h1>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Connectez-vous pour échanger avec les distributeurs de gaz, suivre vos commandes et cumuler des points de fidélité.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Card Form */}
              <div className="bg-white dark:bg-neutral-900 border-2 border-blue-200 dark:border-blue-900/30 p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
                <div className="z-10">
                  {/* Mode selector */}
                  <div className="flex bg-gray-100 dark:bg-neutral-800 p-1 rounded-xl mb-6">
                    <button 
                      type="button"
                      onClick={() => setMode('LOGIN')}
                      className={`flex-1 py-2 font-bold text-sm rounded-lg transition-all ${mode === 'LOGIN' ? 'bg-white dark:bg-neutral-900 text-blue-600 shadow-sm' : 'text-gray-500'}`}
                    >
                      Se Connecter
                    </button>
                    <button 
                      type="button"
                      onClick={() => setMode('REGISTER')}
                      className={`flex-1 py-2 font-bold text-sm rounded-lg transition-all ${mode === 'REGISTER' ? 'bg-white dark:bg-neutral-900 text-blue-600 shadow-sm' : 'text-gray-500'}`}
                    >
                      Créer un compte
                    </button>
                  </div>

                  {authError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-200">
                      {authError}
                    </div>
                  )}

                  {mode === 'LOGIN' ? (
                    <form className="space-y-4" onSubmit={handleLogin}>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Numéro de téléphone</label>
                        <input 
                          type="tel" 
                          required
                          placeholder="Ex: 699000000 ou +237699..."
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full mt-1 p-3.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mot de passe</label>
                        <input 
                          type="password" 
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full mt-1 p-3.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 mt-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-black text-lg rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Connexion'}
                      </button>
                    </form>
                  ) : (
                    <form className="space-y-4" onSubmit={handleRegister}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Prénom *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Ex: Alain"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nom de famille *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Ex: Mbarga"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Numéro de téléphone *</label>
                        <input 
                          type="tel" 
                          required
                          placeholder="Ex: 699000000 ou +237699..."
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email (optionnel)</label>
                        <input 
                          type="email" 
                          placeholder="client@domaine.cm"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mot de passe *</label>
                        <input 
                          type="password" 
                          required
                          placeholder="8 caractères minimum"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 mt-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-black text-lg rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Créer mon compte client'}
                      </button>
                    </form>
                  )}
                  
                  <Link href="/buyer/messages" className="block text-center text-sm text-blue-500 hover:underline mt-4 font-semibold">
                    Accéder directement à mes messages
                  </Link>
                </div>
              </div>

              {/* Loyalty Teaser */}
              <div className="bg-gradient-to-br from-indigo-900 to-blue-900 p-8 rounded-[2rem] shadow-xl text-white flex flex-col justify-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                  <Award size={32} className="text-yellow-400" />
                </div>
                <h2 className="text-2xl font-black mb-3 text-yellow-400">Programme Fidélité Pleingaz</h2>
                <p className="text-blue-100 mb-4 font-medium leading-relaxed">
                  Cumulez des points sur vos achats de bouteilles et recharge de gaz. Échangez vos points contre :
                </p>
                <ul className="space-y-3 mb-6 font-bold text-sm">
                  <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400"/> Des réductions sur le gaz</li>
                  <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400"/> Des détendeurs et tuyaux gratuits</li>
                  <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400"/> Une livraison prioritaire offerte</li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                  Bonjour, {profile.firstName} 👋
                </h1>
                <p className="text-gray-500 font-medium mt-1">
                  Connecté en tant que <span className="font-bold text-gray-700 dark:text-gray-300">{profile.phone || 'Client'}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/buyer/messages" className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                  <MessageSquare size={18} />
                  Mes Messages
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-200 dark:border-red-800/30"
                  title="Se déconnecter"
                >
                  <LogOut size={18} />
                  Déconnexion
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Loyalty Points Card */}
              <div className="lg:col-span-2 bg-gradient-to-br from-[#1a1c29] to-[#2d3250] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl border border-white/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/20 rounded-full filter blur-[80px] pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                      <Award size={28} className="text-yellow-400" />
                    </div>
                    <span className="px-4 py-1.5 bg-yellow-400/20 text-yellow-400 font-black text-sm rounded-full border border-yellow-400/30">
                      Niveau Or
                    </span>
                  </div>
                  
                  <h3 className="text-gray-300 font-semibold mb-1">Solde de Points de Fidélité</h3>
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-5xl md:text-6xl font-black tracking-tight">{profile.loyaltyPoints}</span>
                    <span className="text-xl text-gray-400 font-bold">Pts</span>
                  </div>

                  <div className="bg-black/20 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Gift className="text-purple-400" size={24} />
                      <div>
                        <p className="font-bold">Récompense dispo !</p>
                        <p className="text-sm text-gray-400">-1000 FCFA sur votre prochaine recharge</p>
                      </div>
                    </div>
                    <button className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-black rounded-xl transition-colors">
                      Utiliser
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-6">
                <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-[2rem] p-6 shadow-sm flex-1">
                  <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-xl flex items-center justify-center mb-4">
                    <User size={24} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Parrainage</h3>
                  <p className="text-sm text-gray-500 mb-4">Invitez un ami et gagnez 200 points chacun lors de son premier achat.</p>
                  <button className="w-full py-3 bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-200 transition-colors">
                    Copier mon lien
                  </button>
                </div>
              </div>
            </div>

            {/* Boutiques Favorites */}
            <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-[2rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <Heart className="text-rose-500 fill-rose-500" />
                  Mes Boutiques Favorites ({favoriteStores.length})
                </h3>
                <Link
                  href="/search"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  Trouver d'autres points de vente <ChevronRight size={14} />
                </Link>
              </div>

              {favoriteStores.length === 0 ? (
                <div className="text-center py-8 px-4 bg-gray-50 dark:bg-neutral-950 rounded-2xl border border-dashed border-gray-200 dark:border-neutral-800">
                  <Heart size={36} className="mx-auto text-gray-300 dark:text-neutral-700 mb-2" />
                  <p className="font-bold text-sm text-gray-700 dark:text-gray-300">
                    Vous n'avez pas encore de boutique favorite
                  </p>
                  <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-4">
                    Ajoutez vos points de vente habituels en favoris (icône cœur ❤️) pour consulter leur stock en 1 clic et commander plus rapidement.
                  </p>
                  <Link
                    href="/search"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded-xl hover:bg-pleingaz-red transition-colors"
                  >
                    Explorer la carte
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoriteStores.map((store: any) => {
                    const hasStock = store.inventory?.some((i: any) => i.status === 'En stock');
                    return (
                      <div
                        key={store.id}
                        className="p-5 rounded-2xl bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 flex flex-col justify-between gap-4 hover:border-gray-300 dark:hover:border-neutral-700 transition-all"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-base text-gray-900 dark:text-white">
                                {store.name}
                              </h4>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <MapPin size={12} className="text-pleingaz-red shrink-0" />
                                {store.neighborhood || 'Centre'}, {store.city || 'Douala'}
                                {store.landmark && ` (${store.landmark})`}
                              </p>
                            </div>
                            <FavoriteButton storeId={store.id} storeName={store.name} size={18} />
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold ${
                                hasStock
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              }`}
                            >
                              {hasStock ? 'Gaz disponible' : 'En rupture'}
                            </span>
                            {store.rating !== null && (
                              <span className="flex items-center gap-1 font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-900 px-2 py-0.5 rounded-md border border-gray-200 dark:border-neutral-800">
                                <Star size={12} className="fill-amber-400 text-amber-400" />
                                {store.rating}/5
                              </span>
                            )}
                            {store.inventory?.some((inv: any) => subscribedAlerts.includes(inv.id)) && (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/40">
                                <BellRing size={11} /> Alerte réassort active
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-neutral-800">
                          <Link
                            href={`/stores/${store.id}`}
                            className="flex-1 py-2 text-center text-xs font-bold bg-white dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-neutral-800 transition-colors"
                          >
                            Voir les stocks
                          </Link>
                          <Link
                            href={`/buyer/messages?to=${store.ownerId || store.id}`}
                            className="px-3 py-2 text-center text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors"
                          >
                            Échanger
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Historique des commandes et factures */}
            <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <ShoppingBag className="text-pleingaz-red" />
                Mes Commandes & Factures
              </h3>
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-sm">Aucune commande pour le moment.</p>
                ) : (
                  orders.map((order: any) => (
                    <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-neutral-950 rounded-xl border border-gray-100 dark:border-neutral-800 gap-4">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          Commande {order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()} - Chez {order.store?.name || 'Distributeur'}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <span className={`font-black px-3 py-1 rounded-lg text-sm ${order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'}`}>
                          {order.totalAmount} FCFA
                        </span>

                        <Link 
                          href={`/delivery?orderId=${order.id}`}
                          className="flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 px-3 py-2 rounded-lg transition-colors"
                        >
                          Suivi Live
                        </Link>

                        {(order.status === 'DELIVERED' || order.status === 'COMPLETED') && (
                          order.review ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/40">
                              <Star size={13} className="fill-amber-400 text-amber-400" />
                              {order.review.rating}/5
                            </span>
                          ) : (
                            <Link
                              href={`/delivery?orderId=${order.id}`}
                              className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100/70 hover:bg-amber-200/80 px-2.5 py-1.5 rounded-lg transition-colors animate-pulse"
                            >
                              <Star size={13} className="text-amber-500" />
                              Noter (+10 pts)
                            </Link>
                          )
                        )}
                        
                        {order.invoice && (
                          <button 
                            onClick={() => setSelectedInvoiceOrderId(order.id)}
                            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 px-3 py-2 rounded-lg transition-colors"
                          >
                            <FileText size={16} />
                            Facture
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Mobile Chat Button */}
            <Link href="/buyer/messages" className="md:hidden mt-6 w-full py-4 bg-blue-500 text-white font-black rounded-xl text-center block shadow-lg shadow-blue-500/30">
              Ouvrir la Messagerie
            </Link>

            {/* Modal Facture Officielle */}
            {selectedInvoiceOrderId && (
              <InvoiceModal
                orderId={selectedInvoiceOrderId}
                isOpen={!!selectedInvoiceOrderId}
                onClose={() => setSelectedInvoiceOrderId(null)}
              />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
