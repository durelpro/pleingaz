'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Clock, ShieldAlert, PhoneCall, MessageSquare, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function PendingApprovalContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'compte';

  const isDistributor = type === 'distributor';
  const isGestionnaire = type === 'gestionnaire';

  const roleLabel = isDistributor
    ? 'Distributeur / Revendeur Agréé'
    : isGestionnaire
    ? 'Gestionnaire de Compte / Support'
    : 'Utilisateur';

  const supportPhone = '+237 657 696 567';
  const whatsappUrl = `https://wa.me/237657696567?text=Bonjour%20PLEINGAZ,%20je%20souhaite%20suivre%20la%20validation%20de%20mon%20compte%20${encodeURIComponent(roleLabel)}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
        
        {/* Icône & Titre */}
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Clock size={36} />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            Dossier en cours d&apos;examen
          </span>
          <h1 className="text-2xl font-black text-gray-900 pt-1">
            Compte en attente de validation
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Votre profil <strong>{roleLabel}</strong> a été créé avec succès. Conformément à la politique de sécurité et de conformité PLEINGAZ, votre accès doit être formellement validé par un administrateur avant toute opération.
          </p>
        </div>

        {/* Détails du protocole */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-left space-y-2 text-xs text-amber-950">
          <div className="flex items-center space-x-2 font-bold text-amber-900">
            <ShieldAlert size={16} className="text-amber-600 shrink-0" />
            <span>Processus d&apos;approbation obligatoire</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-gray-700 list-disc list-inside">
            {isDistributor && (
              <>
                <li>Vérification de la CNI et conformité du point de vente physique.</li>
                <li>Attribution du code revendeur et rattachement au secteur.</li>
              </>
            )}
            {isGestionnaire && (
              <>
                <li>Contrôle de l&apos;habilitation sécurité par le Super Administrateur.</li>
                <li>Activation des droits d&apos;accès au module de gestion des dossiers.</li>
              </>
            )}
            <li>Délai moyen de traitement : <strong>moins de 2 heures ouvrées</strong>.</li>
          </ul>
        </div>

        {/* Assistance & Déblocage Mobile */}
        <div className="space-y-3 pt-2">
          <span className="text-xs text-gray-500 font-semibold block">
            Besoin d&apos;une activation prioritaire ? Contactez directement l&apos;administration :
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-colors"
            >
              <MessageSquare size={16} />
              <span>Message WhatsApp</span>
            </a>

            <a
              href={`tel:${supportPhone.replace(/\s+/g, '')}`}
              className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors"
            >
              <PhoneCall size={16} />
              <span>{supportPhone}</span>
            </a>
          </div>
        </div>

        {/* Boutons retour */}
        <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex-1 py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
          >
            <RefreshCw size={14} />
            <span>Vérifier si activé</span>
          </button>

          <Link
            href="/"
            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Retour à l&apos;accueil</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function PendingApprovalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-xs text-gray-500">Chargement...</div>}>
      <PendingApprovalContent />
    </Suspense>
  );
}
