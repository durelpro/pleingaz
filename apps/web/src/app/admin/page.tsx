'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BarChart3, ShieldCheck, Database, FileText, 
  Server, BookOpen, ArrowRight, Shield 
} from 'lucide-react';

export default function AdminIndexPage() {
  const router = useRouter();

  const modules = [
    {
      title: 'Pilotage & Analytique',
      desc: 'Supervision globale des ventes, risques de rupture et scores des distributeurs.',
      href: '/admin/dashboard',
      icon: <BarChart3 className="text-pleingaz-red" size={28} />,
      badge: 'Principal',
    },
    {
      title: 'Revendications Distributeurs',
      desc: 'Arbitrage et validation des demandes de prise en gestion des boutiques (CR-002).',
      href: '/admin/claims',
      icon: <ShieldCheck className="text-emerald-500" size={28} />,
      badge: 'Nouveau (CR-002)',
    },
    {
      title: 'Imports Réseau & Traçabilité',
      desc: 'Auditabilité cryptographique SHA-256 et quarantaine D-08 des points My Maps.',
      href: '/admin/imports',
      icon: <Database className="text-blue-500" size={28} />,
      badge: 'Nouveau (CR-002)',
    },
    {
      title: 'Rapports & Régulation',
      desc: 'Génération et export des états comptables et rapports d\'activité périodiques.',
      href: '/admin/reports',
      icon: <FileText className="text-amber-500" size={28} />,
      badge: 'Comptabilité',
    },
    {
      title: 'État du Système & Santé',
      desc: 'Métriques des services Docker, PostgreSQL PostGIS, Redis et workers BullMQ.',
      href: '/admin/system',
      icon: <Server className="text-purple-500" size={28} />,
      badge: 'Infra',
    },
    {
      title: 'Base de Connaissances',
      desc: 'Règles de conformité, guides opérateurs et procédures de contrôle qualité.',
      href: '/admin/knowledge',
      icon: <BookOpen className="text-teal-500" size={28} />,
      badge: 'Documentation',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-xl bg-pleingaz-red/10 text-pleingaz-red flex items-center justify-center font-black text-sm">
                PG
              </span>
              <span className="text-xs font-black uppercase tracking-widest text-pleingaz-red">
                Control Center Souverain
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
              Portail d'Administration PLEINGAZ
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Accès centralisé aux 6 modules de pilotage, régulation et supervision réseau.
            </p>
          </div>

          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-pleingaz-red text-white font-black text-sm shadow-lg shadow-red-500/25 hover:bg-red-700 transition-all self-start sm:self-auto"
          >
            <span>Ouvrir le Dashboard</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Grille des modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((m, i) => (
            <Link
              key={i}
              href={m.href}
              className="group bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm hover:border-pleingaz-red hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-2xl group-hover:scale-110 transition-transform">
                    {m.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400">
                    {m.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-pleingaz-red transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-neutral-800 mt-6 flex items-center justify-between text-xs font-bold text-gray-400 group-hover:text-pleingaz-red">
                <span>Accéder au module</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
