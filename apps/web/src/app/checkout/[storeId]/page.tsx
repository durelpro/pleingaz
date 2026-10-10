"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, MapPin, CreditCard, Banknote, FileText, ChevronLeft, Loader2, Info, Flame, Store } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

function CheckoutContent({ params }: { params: { storeId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const inventoryId = searchParams.get('inventoryId');

  const [store, setStore] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [deliveryMethod, setDeliveryMethod] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [address, setAddress] = useState('');
  const [needsConsigne, setNeedsConsigne] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'MOMO' | 'OM' | 'CASH'>('MOMO');

  useEffect(() => {
    if (!inventoryId) {
      router.push(`/stores/${params.storeId}`);
      return;
    }

    fetch(`http://localhost:3001/search/stores/${params.storeId}`)
      .then(res => res.json())
      .then(data => {
        setStore(data);
        const item = data.inventory.find((i: any) => i.id === inventoryId);
        if (item) setProduct(item);
        else router.push(`/stores/${params.storeId}`);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [params.storeId, inventoryId, router]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-pleingaz-red" size={40} /></div>;
  if (!store || !product) return null;

  // Calcul du total
  const gasPrice = product.price;
  const consignePrice = needsConsigne ? 15000 : 0; // Prix de consigne fictif pour MVP
  const deliveryPrice = deliveryMethod === 'DELIVERY' ? 1000 : 0;
  const total = gasPrice + consignePrice + deliveryPrice;

  const handleSubmit = async () => {
    if (deliveryMethod === 'DELIVERY' && !address) {
      alert("Veuillez indiquer votre adresse de livraison.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:3001/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-demo-role': 'buyer_1' },
        body: JSON.stringify({
          storeId: store.id,
          inventoryId: product.id,
          deliveryMethod,
          address: deliveryMethod === 'DELIVERY' ? address : store.address,
          needsConsigne,
          paymentMethod,
          totalAmount: total
        })
      });

      if (res.ok) {
        const orderData = await res.json();
        // Redirect to success/invoice page
        router.push(`/buyer/portal?orderSuccess=${orderData.id}`);
      } else {
        const err = await res.json();
        alert(err.message || 'Erreur lors de la création de la commande');
      }
    } catch (e) {
      console.error(e);
      alert("Erreur de connexion");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href={`/stores/${store.id}`} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
            <ChevronLeft size={24} className="text-gray-700 dark:text-gray-300" />
          </Link>
          <h1 className="font-bold text-gray-900 dark:text-white text-lg">Finaliser la commande</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* Résumé Produit */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Résumé de l'article</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${product.color} flex items-center justify-center shadow-inner`}>
                <Flame size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{product.brand} - {product.weight}</h3>
                <p className="text-sm text-gray-500">Vendu par {store.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-xl text-pleingaz-red">{gasPrice} FCFA</p>
            </div>
          </div>
        </div>

        {/* Options de Commande */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-neutral-800 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Options de commande</h2>
          
          {/* Consigne */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Avez-vous une bouteille vide à échanger ?</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setNeedsConsigne(false)}
                className={`p-4 rounded-xl border-2 font-medium transition-all ${!needsConsigne ? 'border-pleingaz-red bg-red-50 dark:bg-red-900/10 text-pleingaz-red' : 'border-gray-100 dark:border-neutral-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800'}`}
              >
                Oui (Échange)
              </button>
              <button 
                onClick={() => setNeedsConsigne(true)}
                className={`p-4 rounded-xl border-2 font-medium transition-all ${needsConsigne ? 'border-pleingaz-red bg-red-50 dark:bg-red-900/10 text-pleingaz-red' : 'border-gray-100 dark:border-neutral-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800'}`}
              >
                Non (Achat consigne)
              </button>
            </div>
            {needsConsigne && (
              <p className="text-xs text-orange-600 flex items-center gap-1 bg-orange-50 p-2 rounded-lg">
                <Info size={14} /> Le prix de la consigne (15 000 FCFA) s'ajoute au total.
              </p>
            )}
          </div>

          {/* Mode de récupération */}
          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Mode de récupération</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setDeliveryMethod('PICKUP')}
                className={`p-4 rounded-xl border-2 font-medium transition-all flex flex-col items-center justify-center gap-2 ${deliveryMethod === 'PICKUP' ? 'border-pleingaz-red bg-red-50 dark:bg-red-900/10 text-pleingaz-red' : 'border-gray-100 dark:border-neutral-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800'}`}
              >
                <Store size={24} />
                <span>En point de vente</span>
              </button>
              <button 
                onClick={() => setDeliveryMethod('DELIVERY')}
                className={`p-4 rounded-xl border-2 font-medium transition-all flex flex-col items-center justify-center gap-2 ${deliveryMethod === 'DELIVERY' ? 'border-pleingaz-red bg-red-50 dark:bg-red-900/10 text-pleingaz-red' : 'border-gray-100 dark:border-neutral-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800'}`}
              >
                <MapPin size={24} />
                <span>Livraison</span>
              </button>
            </div>
          </div>

          {/* Adresse de livraison */}
          {deliveryMethod === 'DELIVERY' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Votre adresse détaillée</label>
              <input 
                type="text" 
                placeholder="Ex: Bonamoussadi, face marché, portail noir" 
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-pleingaz-red outline-none"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </motion.div>
          )}
        </div>

        {/* Paiement */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-neutral-800 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Paiement</h2>
          <div className="space-y-3">
            {[
              { id: 'MOMO', name: 'MTN Mobile Money', icon: CreditCard, color: 'text-yellow-500', number: store.momoReceiverNumber || 'Indisponible' },
              { id: 'OM', name: 'Orange Money', icon: CreditCard, color: 'text-orange-500', number: store.orangeReceiverNumber || 'Indisponible' },
              { id: 'CASH', name: 'Paiement Espèces (Livraison/Retrait)', icon: Banknote, color: 'text-green-500', number: '' }
            ].map((method) => (
              <button 
                key={method.id}
                onClick={() => setPaymentMethod(method.id as any)}
                disabled={method.id !== 'CASH' && method.number === 'Indisponible'}
                className={`w-full p-4 flex items-center justify-between rounded-xl border-2 transition-all ${paymentMethod === method.id ? 'border-pleingaz-red bg-red-50 dark:bg-red-900/10' : 'border-gray-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800'} ${method.id !== 'CASH' && method.number === 'Indisponible' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <method.icon className={method.color} size={24} />
                  <div className="text-left">
                    <span className="font-bold text-gray-900 dark:text-white block">{method.name}</span>
                    {method.id !== 'CASH' && (
                      <span className="text-xs text-gray-500 block">Reçoit via : {method.number}</span>
                    )}
                  </div>
                </div>
                {paymentMethod === method.id && <ShieldCheck className="text-pleingaz-red" size={20} />}
              </button>
            ))}
          </div>
        </div>

        {/* Total & Submit */}
        <div className="bg-gray-900 dark:bg-neutral-800 rounded-3xl p-6 text-white space-y-4 shadow-xl">
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex justify-between"><span>Gaz ({product.brand})</span><span>{gasPrice} FCFA</span></div>
            {needsConsigne && <div className="flex justify-between"><span>Consigne Bouteille</span><span>{consignePrice} FCFA</span></div>}
            {deliveryMethod === 'DELIVERY' && <div className="flex justify-between"><span>Frais de livraison</span><span>{deliveryPrice} FCFA</span></div>}
            <div className="flex justify-between border-t border-gray-700 pt-2 mt-2 font-bold text-lg text-white">
              <span>Total à payer</span>
              <span className="text-pleingaz-red">{total} FCFA</span>
            </div>
          </div>
          
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-pleingaz-red to-[#ff6a00] hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <FileText size={20} />}
            {isSubmitting ? 'Traitement en cours...' : 'Payer et Confirmer'}
          </button>
          
          <p className="text-xs text-center text-gray-400">
            En confirmant, une facture certifiée sera générée automatiquement.
          </p>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage({ params }: { params: { storeId: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-pleingaz-red" size={40} /></div>}>
      <CheckoutContent params={params} />
    </Suspense>
  );
}
