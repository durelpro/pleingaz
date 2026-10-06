'use client';

import { useState } from 'react';
import { Truck, CheckCircle2, PackageSearch, PackageOpen, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DeliveryTracker() {
  const [status, setStatus] = useState<'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED'>('IN_TRANSIT');
  const otpCode = "4815"; // Code OTP simulé

  const steps = [
    { key: 'PENDING', label: 'Commande Validée', icon: CheckCircle2 },
    { key: 'ASSIGNED', label: 'Livreur Assigné', icon: PackageSearch },
    { key: 'PICKED_UP', label: 'Commande Récupérée', icon: PackageOpen },
    { key: 'IN_TRANSIT', label: 'En Route', icon: Truck },
    { key: 'DELIVERED', label: 'Livré', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === status);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-12 px-4">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Suivi de Livraison
          </h1>
          <p className="text-gray-500 font-medium">Commande #ORD-20261006-89A4</p>
        </div>

        {/* Tracker Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-neutral-800">
          <div className="relative">
            {/* Ligne verticale de fond */}
            <div className="absolute left-[27px] top-4 bottom-4 w-1 bg-gray-100 dark:bg-neutral-800 rounded-full" />
            
            <div className="space-y-8 relative">
              {steps.map((step, index) => {
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const Icon = step.icon;
                
                return (
                  <div key={step.key} className="flex items-center gap-6">
                    <motion.div 
                      initial={false}
                      animate={{ 
                        backgroundColor: isActive ? '#f97316' : '#f3f4f6',
                        scale: isCurrent ? 1.2 : 1
                      }}
                      className={\`w-14 h-14 rounded-full flex items-center justify-center z-10 \${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-600 dark:bg-neutral-800'}\`}
                    >
                      <Icon size={24} />
                    </motion.div>
                    
                    <div>
                      <h3 className={\`font-bold text-lg \${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'}\`}>
                        {step.label}
                      </h3>
                      {isCurrent && step.key === 'IN_TRANSIT' && (
                        <p className="text-pleingaz-orange font-medium mt-1">
                          Le livreur arrive bientôt ! Préparez le code.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Code OTP */}
        {status !== 'DELIVERED' && (
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-3xl p-6 border-2 border-orange-200 dark:border-orange-800/50 text-center space-y-4">
            <h3 className="font-bold text-orange-800 dark:text-orange-400 text-lg">Code de confirmation</h3>
            <p className="text-orange-700 dark:text-orange-300 text-sm">
              Donnez ce code au livreur uniquement lorsqu'il vous remet votre bouteille de gaz.
            </p>
            <div className="text-5xl font-black text-pleingaz-orange tracking-[0.25em]">
              {otpCode}
            </div>
          </div>
        )}

        {/* Facture */}
        {status === 'DELIVERED' && (
          <button className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
            <Download size={20} />
            Télécharger la facture
          </button>
        )}

        {/* Pour la démo : simulateur */}
        <div className="pt-8 border-t border-gray-200 dark:border-neutral-800 text-center">
          <p className="text-xs text-gray-400 mb-4 uppercase tracking-widest font-bold">Simulateur (Dev)</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {steps.map(s => (
              <button 
                key={s.key} 
                onClick={() => setStatus(s.key as any)}
                className="px-3 py-1 bg-gray-200 dark:bg-neutral-800 text-xs font-bold rounded"
              >
                {s.key}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
