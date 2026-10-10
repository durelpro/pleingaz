'use client';

import { Activity, ShieldCheck, Server, Bug, Database, AlertCircle, RefreshCw } from 'lucide-react';

export default function SystemObservability() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <Activity className="text-blue-500" size={32} />
              État de la Plateforme (Observabilité)
            </h1>
            <p className="text-gray-500 mt-2">Monitoring Sentry, Santé des services, Sécurité et Backups.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl text-gray-700 dark:text-gray-300 font-bold hover:border-blue-500 transition-colors">
            <RefreshCw size={18} />
            Actualiser
          </button>
        </div>

        {/* Global Status */}
        <div className="bg-green-500 text-white p-6 rounded-3xl shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black">Tous les systèmes sont opérationnels</h2>
              <p className="text-green-50">Uptime: 99.98% sur les 30 derniers jours</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold opacity-80">Dernier déploiement</p>
            <p className="font-mono text-lg">v2.1.0-prod (Phase 10)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Services Health (Uptime Kuma mock) */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-6">
            <h3 className="font-black text-xl mb-4 flex items-center gap-2">
              <Server className="text-gray-400" />
              Services (Uptime)
            </h3>
            <ul className="space-y-4">
              <li className="flex justify-between items-center">
                <span className="font-bold">API Principale</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-black rounded-lg">99.9%</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="font-bold">Base de Données (Postgres)</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-black rounded-lg">100%</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="font-bold">Redis (BullMQ)</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-black rounded-lg">99.8%</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="font-bold">Passerelle Orange Money</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-black rounded-lg">98.5%</span>
              </li>
            </ul>
          </div>

          {/* Sentry Logs */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-6">
            <h3 className="font-black text-xl mb-4 flex items-center gap-2">
              <Bug className="text-red-500" />
              Exceptions (Sentry)
            </h3>
            <div className="space-y-4">
              <div className="p-3 border border-red-100 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 rounded-xl">
                <p className="text-xs text-red-600 font-bold mb-1">Il y a 10 min</p>
                <p className="font-mono text-sm text-gray-800 dark:text-gray-200">TimeoutError: Redis connection failed</p>
              </div>
              <div className="p-3 border border-gray-100 dark:border-neutral-800 rounded-xl">
                <p className="text-xs text-gray-500 font-bold mb-1">Il y a 2 heures</p>
                <p className="font-mono text-sm text-gray-800 dark:text-gray-200">PaymentWebhook verification failed</p>
              </div>
            </div>
          </div>

          {/* Backups & Security */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-6">
            <h3 className="font-black text-xl mb-4 flex items-center gap-2">
              <Database className="text-purple-500" />
              Backups & Sécurité
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <ShieldCheck className="text-green-500 mt-1" size={20} />
                <div>
                  <p className="font-bold">Helmet & Throttler</p>
                  <p className="text-xs text-gray-500">Actifs (100 req/min)</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Database className="text-green-500 mt-1" size={20} />
                <div>
                  <p className="font-bold">Dernier Backup DB</p>
                  <p className="text-xs text-gray-500">Réussi à 04:00 AM (AWS S3)</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="text-orange-500 mt-1" size={20} />
                <div>
                  <p className="font-bold">Test de Restauration</p>
                  <p className="text-xs text-gray-500">Prévu dans 5 jours</p>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
