'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, LogIn, ArrowLeft, MessageSquare, Award, Gift, ShoppingBag, Loader2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BuyerPortal() {
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3001/users/profile', {
        headers: { 'x-demo-role': 'customer_1' }
      }).then(res => res.json()),
      fetch('http://localhost:3001/orders', {
        headers: { 'x-demo-role': 'customer_1' }
      }).then(res => res.json())
    ])
    .then(([profileData, ordersData]) => {
      if (profileData && profileData.id) {
        setProfile({ ...profileData, loyaltyPoints: profileData.user?.loyaltyPoints || profileData.loyaltyPoints || 450 });
      }
      setOrders(ordersData || []);
    })
    .catch(() => {})
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
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
                Espace <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Acheteur</span>
              </h1>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Créez un compte pour discuter avec les distributeurs de gaz, cumuler des points de fidélité, et gagner des récompenses !
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Card Register */}
              <div className="bg-white dark:bg-neutral-900 border-2 border-blue-200 dark:border-blue-900/30 p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
                <div className="z-10">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-2xl flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-900/50">
                    <User size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Nouveau client ?</h2>
                  <p className="text-gray-500 mb-6 font-medium text-sm">
                    Créez votre profil pour cumuler des points de fidélité à chaque achat.
                  </p>
                </div>
                
                <form className="space-y-4 z-10 relative" onSubmit={(e) => { e.preventDefault(); window.location.href = '/buyer/messages'; }}>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Numéro de téléphone</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: 690000000"
                      className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Créer un mot de passe</label>
                    <input 
                      type="password" 
                      required
                      placeholder="Mot de passe sécurisé"
                      className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-4 mt-2 text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white font-black text-lg rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
                  >
                    Créer mon profil
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-4 cursor-pointer hover:underline">
                    Déjà un compte ? Se connecter
                  </p>
                </form>
              </div>

              {/* Loyalty Teaser */}
              <div className="bg-gradient-to-br from-indigo-900 to-blue-900 p-8 rounded-[2rem] shadow-xl text-white flex flex-col justify-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                  <Award size={32} className="text-yellow-400" />
                </div>
                <h2 className="text-2xl font-black mb-3 text-yellow-400">Points de Fidélité Pleingaz</h2>
                <p className="text-blue-100 mb-4 font-medium leading-relaxed">
                  Gagnez des points à chaque achat. Échangez-les contre :
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                  Bonjour, {profile.firstName} 👋
                </h1>
                <p className="text-gray-500 font-medium mt-1">Gérez vos points de fidélité et vos conversations.</p>
              </div>
              <Link href="/buyer/messages" className="hidden md:flex items-center gap-2 px-6 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                <MessageSquare size={20} />
                Mes Messages
              </Link>
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
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <span className={`font-black px-3 py-1 rounded-lg text-sm ${order.status === 'COMPLETED' ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'}`}>
                          {order.totalAmount} FCFA
                        </span>
                        
                        {order.invoice && (
                          <button 
                            onClick={() => alert(`Aperçu Facture:\n\nNuméro: ${order.invoice.invoiceNumber}\nVendeur: ${order.invoice.sellerName}\nMontant: ${order.invoice.totalAmount} FCFA\nDate: ${new Date(order.invoice.createdAt).toLocaleString()}`)}
                            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 px-3 py-2 rounded-lg transition-colors"
                          >
                            <FileText size={16} />
                            Facture PDF
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
          </motion.div>
        )}
      </div>
    </div>
  );
}
