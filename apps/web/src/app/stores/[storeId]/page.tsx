"use client";

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, ShieldCheck, ShoppingCart, MessageCircle, Star } from 'lucide-react';
import Link from 'next/link';

// Chargement dynamique de la carte pour éviter les erreurs SSR Leaflet
const StoreMap = dynamic(() => import('@/components/map/StoreMap'), { ssr: false });

function StoreProfileContent() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const [store, setStore] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    if (!storeId) return;

    fetch(`http://localhost:3001/search/stores/${storeId}`)
      .then(res => res.json())
      .then(data => setStore(data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [storeId]);

  if (!isMounted) return null;
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950">Chargement de la boutique...</div>;
  if (!store) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950">Boutique introuvable</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 pb-20">
      
      {/* Cover Banner */}
      <div className="h-64 md:h-80 w-full bg-gradient-to-r from-pleingaz-red to-red-900 relative">
        <div className="absolute inset-0 bg-black/20"></div>
        {/* Mockup image for shop cover */}
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center mix-blend-overlay"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 border border-gray-100 dark:border-neutral-800"
        >
          {/* Logo / Badge */}
          <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 dark:bg-neutral-800 rounded-2xl border-4 border-white dark:border-neutral-900 shadow-md flex items-center justify-center shrink-0 -mt-16 md:-mt-20">
            <ShieldCheck className="text-pleingaz-red w-12 h-12 md:w-16 md:h-16" />
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                  {store.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-md font-medium">
                    <ShieldCheck size={16} /> Agréé
                  </span>
                  {store.rating !== null && (
                    <span className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      {store.rating} ({store.reviews} avis)
                    </span>
                  )}
                </div>
              </div>
              
              <Link 
                href={`/buyer/messages?to=${store.ownerId || store.id}`} 
                className="flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1ebd5a] transition-colors shadow-lg shadow-[#25D366]/30"
              >
                <MessageCircle size={20} />
                Contacter
              </Link>
            </div>

            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
              {store.description || (store.landmark ? `Repère : ${store.landmark}` : 'Point de vente agréé PLEINGAZ.')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin size={18} className="text-pleingaz-red" />
                {store.address || store.neighborhood}, {store.city || 'Douala'}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock size={18} className="text-pleingaz-red" />
                {store.hours || '7h30 - 20h00 (7j/7)'}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone size={18} className="text-pleingaz-red" />
                {store.phone || '+237 690 00 00 00'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          
          {/* Left Column: Products */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingCart className="text-pleingaz-red" />
              Stock Disponible
            </h2>
            
            {store.inventory && store.inventory.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {store.inventory.map((item: any) => (
                  <motion.div 
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-2xl border-2 ${item.status === 'En stock' ? 'border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900' : 'border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 opacity-75'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.brand}</h3>
                        </div>
                        <p className="text-gray-500 font-medium">{item.weight}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-xl text-pleingaz-red">{item.price} FCFA</p>
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${item.status === 'En stock' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500 font-medium flex items-center justify-between">
                      <span>Mise à jour: {item.freshness || "Inconnu"}</span>
                    </div>
                    
                    <Link 
                      href={item.status === 'En stock' ? `/checkout/${store.id}?inventoryId=${item.id}&productId=${item.productId || ''}` : '#'}
                      className={`mt-4 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${item.status === 'En stock' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-pleingaz-red hover:text-white' : 'bg-gray-200 dark:bg-neutral-800 text-gray-400 cursor-not-allowed pointer-events-none'}`}
                    >
                      <ShoppingCart size={18} />
                      {item.status === 'En stock' ? 'Commander' : 'Indisponible'}
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 text-gray-500">
                Aucune bouteille enregistrée pour ce point de vente pour le moment.
              </div>
            )}
          </div>

          {/* Right Column: Map & Info */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="text-pleingaz-red" />
              Localisation
            </h2>
            
            <div className="bg-white dark:bg-neutral-900 p-2 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm h-64">
              <StoreMap lat={store.latitude} lng={store.longitude} storeName={store.name} />
            </div>

            <div className="bg-pleingaz-red/10 dark:bg-red-900/20 p-5 rounded-2xl border border-pleingaz-red/20 text-center space-y-2">
              <h3 className="font-bold text-pleingaz-red">Besoin d'aide ?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Vous pouvez commander directement via l'application et suivre votre livreur en temps réel.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function StoreProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950 font-bold text-gray-500">Chargement de la boutique...</div>}>
      <StoreProfileContent />
    </Suspense>
  );
}
