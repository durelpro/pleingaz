"use client";

import { useState, useEffect } from 'react';
import { Shield, Activity, Database, Users, AlertCircle, FileText, Download, Fingerprint, Lock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import BackButton from '@/components/common/BackButton';

export default function SystemAuditPage() {
  const [kpis, setKpis] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch KPIs and Logs
    Promise.all([
      fetch('http://localhost:3001/admin/system/kpis', { headers: { 'x-demo-role': 'admin_1' } }).then(res => res.json()),
      fetch('http://localhost:3001/admin/system/audit?limit=20', { headers: { 'x-demo-role': 'admin_1' } }).then(res => res.json())
    ])
    .then(([kpisData, logsData]) => {
      setKpis(kpisData);
      setLogs(logsData);
    })
    .catch(console.error)
    .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div>
          <BackButton fallbackHref="/admin/dashboard" label="Retour au dashboard admin" />
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <Shield className="text-pleingaz-red" size={32} />
              Sécurité & Audit Trail
            </h1>
            <p className="text-gray-500 mt-2">Traçabilité complète du système et indicateurs clés de performance globale.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-opacity">
              <Download size={18} />
              Exporter Registre (CSV)
            </button>
          </div>
        </div>

        {/* Global KPIs (Phase 6.4) */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard 
              title="Revenus Générés (FCFA)" 
              value={new Intl.NumberFormat('fr-CM').format(kpis.totalRevenue)} 
              icon={<Activity />} 
              color="text-green-500"
              bg="bg-green-50 dark:bg-green-900/20"
            />
            <KpiCard 
              title="Commandes Livrées" 
              value={kpis.deliveredOrders.toString()} 
              icon={<CheckCircle2 />} 
              color="text-blue-500"
              bg="bg-blue-50 dark:bg-blue-900/20"
            />
            <KpiCard 
              title="Taux de Livraison" 
              value={`${kpis.deliveryRate}%`} 
              icon={<Database />} 
              color="text-purple-500"
              bg="bg-purple-50 dark:bg-purple-900/20"
            />
            <KpiCard 
              title="Distributeurs Actifs" 
              value={kpis.activeStores.toString()} 
              icon={<Users />} 
              color="text-orange-500"
              bg="bg-orange-50 dark:bg-orange-900/20"
            />
          </div>
        )}

        {/* Audit Log (Phase 6.5) */}
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-gray-50/50 dark:bg-neutral-900/50">
            <h3 className="font-black text-xl text-gray-900 dark:text-white flex items-center gap-2">
              <Fingerprint className="text-gray-400" />
              Registre d'Activité Système
            </h3>
            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold rounded-full flex items-center gap-1">
              <Lock size={12} /> Confidentiel Admin
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950">
                  <th className="px-6 py-4 font-bold">Horodatage</th>
                  <th className="px-6 py-4 font-bold">Action</th>
                  <th className="px-6 py-4 font-bold">Entité</th>
                  <th className="px-6 py-4 font-bold">Utilisateur / IP</th>
                  <th className="px-6 py-4 font-bold">Détails techniques</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800 font-mono">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">Chargement sécurisé des logs...</td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">Aucune activité récente.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-neutral-950/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold \${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {log.entity} <span className="text-gray-400">({log.entityId?.slice(0,8)}...)</span>
                      </td>
                      <td className="px-6 py-4">
                        {log.user ? (
                          <div className="flex flex-col">
                            <span className="font-sans font-bold text-gray-900 dark:text-white">{log.user.name || 'Admin'}</span>
                            <span className="text-xs text-gray-500">{log.user.role}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">Système / Anonyme</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs truncate text-xs text-gray-500 bg-gray-100 dark:bg-neutral-950 p-2 rounded border border-gray-200 dark:border-neutral-800">
                          {log.details ? JSON.stringify(log.details) : '-'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, color, bg }: { title: string, value: string, icon: any, color: string, bg: string }) {
  return (
    <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 \${bg} rounded-xl shadow-sm \${color}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-black text-gray-900 dark:text-white">{value}</h3>
      </div>
    </div>
  );
}

function getActionColor(action: string) {
  if (action.includes('APPROVE') || action.includes('SUCCESS') || action.includes('DELIVER')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (action.includes('REJECT') || action.includes('FAIL') || action.includes('DELETE') || action.includes('CANCEL')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  if (action.includes('VIEW') || action.includes('LOGIN')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
}
