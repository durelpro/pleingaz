'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Store, Truck, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export default function EspaceProPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between p-4 sm:p-8">
      {/* En-tête */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-neutral-800">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/logoprincipal.png"
            alt="Logo PLEINGAZ"
            width={140}
            height={40}
            className="h-10 w-auto object-contain"
          />
        </Link>
        <Link
          href="/"
          className="text-sm text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au site public</span>
        </Link>
      </header>

      {/* Contenu principal */}
      <main className="max-w-4xl mx-auto w-full my-auto py-12">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-800 text-amber-400 mb-4 border border-neutral-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            Accès Professionnel Réservé
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Espace Professionnel PLEINGAZ
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Plateforme dédiée exclusivement aux gérants de points de vente partenaires et aux livreurs homologués.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Carte Distributeur */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-red-600/50 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-red-600/10 text-red-500 flex items-center justify-center mb-5 border border-red-600/20">
                <Store className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Point de Vente Agréé
              </h2>
              <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
                Gérez vos stocks qualitatifs en temps réel, validez les commandes de recharge au comptoir et suivez vos bordereaux.
              </p>
            </div>
            <div className="space-y-3 pt-4 border-t border-neutral-800">
              <Link
                href="/distributeur/connexion"
                className="tap-target w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>Connexion Distributeur</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/distributeur/inscription"
                className="tap-target w-full rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-medium text-xs transition-colors flex items-center justify-center"
              >
                Demander un agrément point de vente
              </Link>
            </div>
          </div>

          {/* Carte Livreur */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-amber-500/50 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5 border border-amber-500/20">
                <Truck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Livreur Partenaire
              </h2>
              <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
                Consultez vos missions de livraison urbaine, optimisez vos tournées et encaissez les règlements sécurisés.
              </p>
            </div>
            <div className="space-y-3 pt-4 border-t border-neutral-800">
              <Link
                href="/livreur/connexion"
                className="tap-target w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>Connexion Livreur</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/livreur/inscription"
                className="tap-target w-full rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-medium text-xs transition-colors flex items-center justify-center"
              >
                Postuler comme livreur partenaire
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Pied de page */}
      <footer className="max-w-4xl mx-auto w-full py-6 text-center text-xs text-neutral-500 border-t border-neutral-900">
        © 2026 PLEINGAZ Cameroun. Tous droits réservés. Accès professionnel soumis à homologation administrative.
      </footer>
    </div>
  );
}
