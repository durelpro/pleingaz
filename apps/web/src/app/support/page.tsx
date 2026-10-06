'use client';

import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { Mail, Phone, MapPin, AlertTriangle } from 'lucide-react';

export default function SupportPage() {
  const supportPhone = "+237 657696567";
  const supportEmail = "donfackdurel1980@icloud.com";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            Besoin d'aide ?
          </h1>
          <p className="text-gray-500 text-lg">
            Notre équipe est disponible 24/7 pour répondre à vos préoccupations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WhatsApp Direct */}
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-800 text-center space-y-6">
            <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto text-[#25D366]">
              <Phone size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">WhatsApp / Appel</h2>
              <p className="text-gray-500">{supportPhone}</p>
            </div>
            <WhatsAppButton 
              phoneNumber={supportPhone} 
              contextMessage="Bonjour PLEINGAZ, j'aimerais avoir de l'aide concernant mon compte."
              className="w-full"
            />
          </div>

          {/* Email Support */}
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-800 text-center space-y-6">
            <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto text-pleingaz-orange">
              <Mail size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email</h2>
              <p className="text-gray-500">{supportEmail}</p>
            </div>
            <a 
              href={\`mailto:\${supportEmail}\`}
              className="inline-flex w-full items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-900 dark:text-white font-bold rounded-2xl transition-all"
            >
              Nous écrire
            </a>
          </div>
        </div>

        {/* Signalement */}
        <div className="mt-12 bg-red-50 dark:bg-red-900/10 p-8 rounded-3xl border-2 border-red-100 dark:border-red-900/30">
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-red-500 shrink-0 mt-1" size={28} />
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-red-900 dark:text-red-400">Signaler un problème</h2>
              <p className="text-red-700 dark:text-red-300">
                Vous avez constaté une boutique fermée, un numéro injoignable ou un prix abusif chez l'un de nos distributeurs agréés ?
              </p>
              <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors">
                Faire un signalement
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
