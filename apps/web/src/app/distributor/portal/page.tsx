import Link from 'next/link';
import { Store, LogIn, ArrowLeft } from 'lucide-react';

export default function DistributorPortal() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Decorative background */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-pleingaz-red/5 rounded-full filter blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full filter blur-[100px] -z-10" />

      <div className="w-full max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-pleingaz-red transition-colors font-semibold mb-8">
          <ArrowLeft size={20} />
          Retour à l'accueil
        </Link>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Espace <span className="text-transparent bg-clip-text bg-gradient-to-r from-pleingaz-red to-[#ff6a00]">Distributeur</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Gérez votre point de vente, mettez à jour votre stock et augmentez votre visibilité sur PLEINGAZ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card Login */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <LogIn size={32} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Déjà partenaire ?</h2>
              <p className="text-gray-500 mb-8 font-medium">
                Connectez-vous pour accéder à votre tableau de bord, mettre à jour votre stock et suivre vos statistiques.
              </p>
            </div>
            <Link 
              href="/distributor/dashboard"
              className="w-full py-4 text-center bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-900 dark:text-white font-black text-lg rounded-xl transition-colors"
            >
              Se Connecter
            </Link>
          </div>

          {/* Card Register */}
          <div className="bg-white dark:bg-neutral-900 border-2 border-orange-200 dark:border-orange-900/30 p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="z-10">
              <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/30 text-pleingaz-red rounded-2xl flex items-center justify-center mb-6 border border-orange-100 dark:border-orange-900/50">
                <Store size={32} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Nouveau ici ?</h2>
              <p className="text-gray-500 mb-8 font-medium">
                Créez votre profil distributeur. Nous examinerons vos pièces justificatives pour vous référencer sur notre carte.
              </p>
            </div>
            <Link 
              href="/distributor/apply"
              className="w-full py-4 text-center bg-gradient-to-r from-pleingaz-red to-[#ff6a00] text-white font-black text-lg rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all z-10 relative"
            >
              Créer mon profil
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
