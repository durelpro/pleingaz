"use client";

import { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Loader2, CheckCircle, XCircle, MapPin, QrCode, Truck, Check, X, Camera, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function DistributorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING, PROCESSING, DELIVERED
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [scanningOrder, setScanningOrder] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState('');

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const h: any = { 'Content-Type': 'application/json', 'x-demo-role': 'distributor_1' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  };

  const fetchOrders = () => {
    fetch('http://localhost:3001/orders/store', {
      headers: getHeaders()
    })
    .then(res => res.json())
    .then(data => setOrders(Array.isArray(data) ? data : []))
    .catch(err => console.error(err))
    .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000); // Polling every 8s for new orders
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId: string, status: string, otp?: string) => {
    setIsUpdating(orderId);
    try {
      const res = await fetch(`http://localhost:3001/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status, otp })
      });
      if (res.ok) {
        fetchOrders();
      } else {
        const err = await res.json();
        alert(err.message || 'Erreur lors de la mise à jour');
      }
    } catch (e) {
      console.error(e);
    }
    setIsUpdating(null);
  };

  const getFilteredOrders = () => {
    if (activeTab === 'PENDING') return orders.filter(o => o.status === 'PENDING' || o.status === 'SUBMITTED');
    if (activeTab === 'PROCESSING') return orders.filter(o => o.status === 'ACCEPTED' || o.status === 'PREPARING' || o.status === 'READY_FOR_PICKUP' || o.status === 'SHIPPED');
    if (activeTab === 'DELIVERED') return orders.filter(o => o.status === 'DELIVERED' || o.status === 'CANCELLED');
    return orders;
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-pleingaz-red" size={40} /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link 
          href="/distributor/dashboard" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 hover:border-pleingaz-red hover:text-pleingaz-red dark:hover:text-pleingaz-red transition-all font-bold group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Retour au tableau de bord
        </Link>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <ShoppingBag className="text-pleingaz-red" />
              Gestion des Commandes
            </h1>
            <p className="text-gray-500 mt-2">Acceptez, préparez et gérez les livraisons.</p>
          </div>
          <Link href="/distributor/dashboard" className="text-sm font-bold bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 px-4 py-2 rounded-xl hover:text-pleingaz-red transition-colors">
            Retour au Dashboard
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['PENDING', 'PROCESSING', 'DELIVERED'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full font-bold whitespace-nowrap transition-colors \${activeTab === tab ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-white dark:bg-neutral-900 text-gray-500 border border-gray-200 dark:border-neutral-800'}`}
            >
              {tab === 'PENDING' ? 'Nouvelles Commandes' : tab === 'PROCESSING' ? 'En Cours' : 'Terminées'}
              {tab === 'PENDING' && orders.filter(o => o.status === 'PENDING' || o.status === 'SUBMITTED').length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-pleingaz-red text-white text-xs rounded-full">
                  {orders.filter(o => o.status === 'PENDING' || o.status === 'SUBMITTED').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          <AnimatePresence>
            {getFilteredOrders().length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800">
                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="font-bold text-gray-500">Aucune commande {activeTab === 'PENDING' ? 'en attente' : activeTab === 'PROCESSING' ? 'en cours' : 'terminée'}.</h3>
              </motion.div>
            ) : (
              getFilteredOrders().map((order) => (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-lg">{order.orderNumber}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold \${order.type === 'B2C_DELIVERY' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                        {order.type === 'B2C_DELIVERY' ? 'LIVRAISON' : 'RETRAIT MAGASIN'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>Client : <span className="font-bold text-gray-900 dark:text-white">{order.customer?.phone}</span></p>
                      {order.type === 'B2C_DELIVERY' && <p className="flex items-center gap-1"><MapPin size={14}/> {order.deliveryAddress}</p>}
                      <p>Total : <span className="font-bold text-pleingaz-red">{order.totalAmount} FCFA</span></p>
                    </div>

                    <div className="bg-gray-50 dark:bg-neutral-950 p-3 rounded-xl border border-gray-100 dark:border-neutral-800 text-sm">
                      <span className="font-bold">Articles : </span>
                      {order.items?.map((item: any) => (
                        <span key={item.id} className="mr-2">
                          {item.quantity}x {item.product?.brand || 'Consigne'} ({item.totalPrice} F)
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-3 min-w-[200px]">
                    {/* Action Buttons based on status */}
                    {(order.status === 'PENDING' || order.status === 'SUBMITTED') && (
                      <>
                        <button 
                          onClick={() => updateStatus(order.id, 'ACCEPTED')}
                          disabled={isUpdating === order.id}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
                        >
                          {isUpdating === order.id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                          Accepter
                        </button>
                        <button 
                          onClick={() => updateStatus(order.id, 'CANCELLED')}
                          disabled={isUpdating === order.id}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors"
                        >
                          <XCircle size={18} /> Refuser
                        </button>
                      </>
                    )}

                    {order.status === 'ACCEPTED' && order.type === 'B2C_PICKUP' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'READY_FOR_PICKUP')}
                        disabled={isUpdating === order.id}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl transition-colors"
                      >
                        Prêt pour retrait
                      </button>
                    )}

                    {order.status === 'READY_FOR_PICKUP' && order.type === 'B2C_PICKUP' && (
                      <button 
                        onClick={() => setScanningOrder(order.id)}
                        disabled={isUpdating === order.id}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-green-500/30"
                      >
                        <QrCode size={18} /> Scanner & Valider le retrait
                      </button>
                    )}

                    {order.status === 'ACCEPTED' && order.type === 'B2C_DELIVERY' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'SHIPPED')}
                        disabled={isUpdating === order.id}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors"
                      >
                        <Truck size={18} /> Confier au livreur
                      </button>
                    )}

                    {order.status === 'SHIPPED' && order.type === 'B2C_DELIVERY' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'DELIVERED')}
                        disabled={isUpdating === order.id}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
                      >
                        <Check size={18} /> Marquer comme Livré
                      </button>
                    )}

                    {order.status === 'DELIVERED' && (
                      <div className="w-full flex items-center justify-center gap-2 py-3 bg-green-50 text-green-600 font-bold rounded-xl">
                        <CheckCircle size={18} /> Terminée
                      </div>
                    )}
                    {order.status === 'CANCELLED' && (
                      <div className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 font-bold rounded-xl">
                        <XCircle size={18} /> Annulée
                      </div>
                    )}

                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {scanningOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setScanningOrder(null)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-[2rem] overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center">
                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <QrCode className="text-pleingaz-red" /> Scanner le code
                </h3>
                <button 
                  onClick={() => setScanningOrder(null)}
                  className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <p className="text-gray-500 text-center text-sm font-medium">
                  Demandez à l'acheteur de présenter le QR code de sa commande sur son téléphone.
                </p>

                {/* Simulated Camera Viewfinder */}
                <div className="relative aspect-square w-full max-w-[250px] mx-auto bg-gray-100 dark:bg-neutral-950 rounded-3xl border-4 border-dashed border-gray-300 dark:border-neutral-800 flex items-center justify-center overflow-hidden">
                  <Camera size={48} className="text-gray-300 dark:text-neutral-800" />
                  
                  {/* Scanner line animation */}
                  <motion.div 
                    animate={{ y: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute top-0 left-0 w-full h-1 bg-pleingaz-red shadow-[0_0_15px_rgba(255,0,0,0.5)]"
                  />
                  
                  {/* Corner targets */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-pleingaz-red rounded-tl-lg" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-pleingaz-red rounded-tr-lg" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-pleingaz-red rounded-bl-lg" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-pleingaz-red rounded-br-lg" />
                </div>

                {/* Manual Fallback */}
                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Saisie manuelle (Secours)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Code OTP client (ex: 4815)"
                      value={scannedCode}
                      onChange={(e) => setScannedCode(e.target.value)}
                      className="flex-1 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-pleingaz-red outline-none transition-all"
                    />
                    <button 
                      onClick={() => {
                        updateStatus(scanningOrder, 'DELIVERED', scannedCode);
                        setScanningOrder(null);
                        setScannedCode('');
                      }}
                      className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl transition-colors hover:bg-gray-800 dark:hover:bg-gray-200"
                    >
                      Valider
                    </button>
                  </div>
                </div>
                
                {/* Simulate Scan Button (For demo) */}
                <button 
                  onClick={() => {
                    updateStatus(scanningOrder, 'DELIVERED');
                    setScanningOrder(null);
                  }}
                  className="w-full mt-4 py-3 bg-green-500/10 text-green-600 font-bold rounded-xl hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> Simuler le scan avec succès
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
