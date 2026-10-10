'use client';

import { useState } from 'react';
import { CreditCard, Banknote, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutPage() {
  const [method, setMethod] = useState<'MTN_MOMO' | 'ORANGE_MONEY' | 'CASH'>('MTN_MOMO');
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS'>('IDLE');
  const [phone, setPhone] = useState('670000000');

  const handlePay = () => {
    setStatus('PROCESSING');
    
    // Simulate payment API call and webhook delay
    setTimeout(() => {
      setStatus('SUCCESS');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-12 px-4">
      <div className="max-w-md mx-auto space-y-6">
        
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Paiement</h1>
          <p className="text-gray-500">Choisissez votre méthode de paiement</p>
        </div>

        {status === 'SUCCESS' ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-3xl p-8 text-center space-y-4"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full text-white mb-4 shadow-lg shadow-green-500/30">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">Paiement Réussi !</h2>
            <p className="text-green-600 dark:text-green-500">Votre commande est confirmée et partira en livraison sous peu.</p>
            
            <button className="mt-6 w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl hover:bg-pleingaz-red transition-colors">
              Suivre ma livraison
            </button>
          </motion.div>
        ) : (
          <>
            {/* Amount Summary */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-neutral-800">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 font-medium">Bouteille 12.5Kg (SCTM)</span>
                <span className="font-bold text-gray-900 dark:text-white">6 500 FCFA</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-neutral-800">
                <span className="text-gray-500 font-medium">Frais de livraison</span>
                <span className="font-bold text-gray-900 dark:text-white">1 000 FCFA</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-lg font-bold text-gray-900 dark:text-white">Total à payer</span>
                <span className="text-2xl font-black text-pleingaz-red">7 500 FCFA</span>
              </div>
            </div>

            {/* Methods */}
            <div className="space-y-3">
              {[
                { id: 'MTN_MOMO', label: 'MTN Mobile Money', color: 'border-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/10' },
                { id: 'ORANGE_MONEY', label: 'Orange Money', color: 'border-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/10' },
                { id: 'CASH', label: 'Paiement à la livraison', color: 'border-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id as any)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${method === m.id ? m.color + ' ' + m.bg + ' ring-4 ring-opacity-50 ring-' + m.color.replace('border-', '') : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'}`}
                >
                  <div className="flex items-center gap-3">
                    {m.id === 'CASH' ? <Banknote className={method === m.id ? 'text-blue-500' : 'text-gray-400'} /> : <CreditCard className={method === m.id ? 'text-gray-900 dark:text-white' : 'text-gray-400'} />}
                    <span className="font-bold text-gray-900 dark:text-white">{m.label}</span>
                  </div>
                  {method === m.id && <CheckCircle2 className="text-gray-900 dark:text-white" />}
                </button>
              ))}
            </div>

            {/* Form */}
            <AnimatePresence>
              {method !== 'CASH' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Numéro de téléphone</label>
                    <input 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-4 bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-800 rounded-xl text-lg font-bold focus:border-pleingaz-red outline-none transition-colors"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pay Button */}
            <button 
              onClick={handlePay}
              disabled={status === 'PROCESSING'}
              className="w-full py-4 bg-pleingaz-red text-white font-black text-lg rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-3 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {status === 'PROCESSING' ? (
                <>
                  <Loader2 className="animate-spin" />
                  Paiement en cours...
                </>
              ) : (
                <>
                  <ShieldCheck />
                  {method === 'CASH' ? 'Confirmer la commande' : 'Payer 7 500 FCFA'}
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 font-medium">Paiement 100% sécurisé</p>
          </>
        )}
      </div>
    </div>
  );
}
