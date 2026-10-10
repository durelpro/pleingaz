'use client';

import { useState } from 'react';
import { Store, ShieldCheck, Map, CheckCircle2 } from 'lucide-react';

export default function DistributorOnboarding() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-8 shadow-xl">
        
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-2 flex-1 rounded-full \${step >= i ? 'bg-pleingaz-red' : 'bg-gray-100 dark:bg-neutral-800'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 text-pleingaz-red rounded-full flex items-center justify-center mx-auto mb-6">
              <Store size={40} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Bienvenue sur Pleingaz !</h1>
            <p className="text-gray-500">Votre boutique est prête à recevoir des commandes. Suivez ce guide rapide pour comprendre le fonctionnement.</p>
            <button 
              onClick={() => setStep(2)}
              className="w-full py-3.5 bg-pleingaz-red text-white font-bold rounded-xl mt-6 hover:opacity-90 transition-opacity"
            >
              Suivant
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={40} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Gérer votre stock</h1>
            <p className="text-gray-500">Mettez à jour votre stock quotidiennement. Une alerte sera envoyée si votre stock est bas, ce qui pourrait baisser votre score de fiabilité.</p>
            <button 
              onClick={() => setStep(3)}
              className="w-full py-3.5 bg-pleingaz-red text-white font-bold rounded-xl mt-6 hover:opacity-90 transition-opacity"
            >
              Suivant
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Vous êtes prêt !</h1>
            <p className="text-gray-500">Activez votre géolocalisation pour que les clients vous trouvent facilement. Gardez un oeil sur vos alertes SMS.</p>
            <button 
              onClick={() => window.location.href = '/distributor/dashboard'}
              className="w-full py-3.5 bg-green-500 text-white font-bold rounded-xl mt-6 hover:bg-green-600 transition-colors"
            >
              Aller à mon tableau de bord
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
