'use client';

import { useState, useEffect } from 'react';
import { 
  Database, FileCode, CheckCircle, AlertTriangle, ShieldCheck, 
  ExternalLink, Layers, ArrowLeft, RefreshCw, FileText, Lock
} from 'lucide-react';
import Link from 'next/link';

interface BatchItem {
  id: string;
  sourceFile: string;
  sourceSha256: string;
  totalParsed: number;
  totalImported: number;
  totalQuarantined: number;
  createdAt: string;
  executedBy: string;
}

interface BatchDetails {
  batch: BatchItem;
  records: Array<{
    id: string;
    placemarkName: string;
    status: string;
    decision: string;
    rejectionReason: string | null;
    isDepot: boolean;
    storeId: string | null;
    phoneExtracted: string | null;
  }>;
}

export default function AdminImportsPage() {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [batchDetails, setBatchDetails] = useState<BatchDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/imports/batches`);
      if (res.ok) {
        const data = await res.json();
        setBatches(data);
        if (data.length > 0 && !selectedBatchId) {
          setSelectedBatchId(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (!selectedBatchId) return;
    async function loadDetails() {
      try {
        const res = await fetch(`http://localhost:3001/imports/batches/${selectedBatchId}`);
        if (res.ok) {
          const data = await res.json();
          setBatchDetails(data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadDetails();
  }, [selectedBatchId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold mb-1">
              <Link href="/admin/dashboard" className="hover:text-pleingaz-red">Admin</Link>
              <span>/</span>
              <Link href="/admin/claims" className="hover:text-pleingaz-red">Revendications</Link>
              <span>/</span>
              <span>Imports Réseau</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <Database className="text-pleingaz-red" size={32} />
              Lots d'Importation Réseau (CR-002)
            </h1>
            <p className="text-gray-500 mt-1">
              Auditabilité cryptographique, traçabilité des placemarks Google My Maps et quarantaine D-08.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchBatches}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl text-gray-700 dark:text-gray-300 font-bold hover:border-pleingaz-red transition-colors"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              Actualiser
            </button>
            <Link
              href="/admin/claims"
              className="flex items-center gap-2 px-4 py-2.5 bg-pleingaz-red text-white font-bold rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-700 transition-colors"
            >
              Superviser les Revendications
            </Link>
          </div>
        </div>

        {/* Métriques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-200 dark:border-neutral-800 space-y-1">
            <span className="text-xs font-bold uppercase text-gray-400">Total Fichiers Lots</span>
            <div className="text-3xl font-black text-gray-900 dark:text-white">{batches.length}</div>
            <p className="text-xs text-gray-500">Archives d'importation certifiées</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-200 dark:border-neutral-800 space-y-1">
            <span className="text-xs font-bold uppercase text-emerald-600">Points Insérés (LISTED)</span>
            <div className="text-3xl font-black text-emerald-600">
              {batches.reduce((acc, b) => acc + b.totalImported, 0)}
            </div>
            <p className="text-xs text-gray-500">Points de vente visibles sur la carte</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-200 dark:border-neutral-800 space-y-1">
            <span className="text-xs font-bold uppercase text-amber-600">Dépôts Logistiques Détectés</span>
            <div className="text-3xl font-black text-amber-600">
              {batchDetails ? batchDetails.records.filter(r => r.isDepot).length : 7}
            </div>
            <p className="text-xs text-gray-500">Non ouverts au grand public direct</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-200 dark:border-neutral-800 space-y-1">
            <span className="text-xs font-bold uppercase text-red-500">Quarantaine D-08</span>
            <div className="text-3xl font-black text-red-500">
              {batches.reduce((acc, b) => acc + b.totalQuarantined, 0)}
            </div>
            <p className="text-xs text-gray-500">Particuliers non distribuables</p>
          </div>
        </div>

        {/* Détails du lot sélectionné */}
        {batchDetails && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-xs font-mono bg-gray-100 dark:bg-neutral-800 px-3 py-1 rounded-md text-gray-600 dark:text-gray-400 font-bold">
                    Lot ID: {batchDetails.batch.id}
                  </span>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white mt-2">
                    Fichier source : {batchDetails.batch.sourceFile}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Exécuté par <span className="font-bold text-gray-700 dark:text-gray-300">{batchDetails.batch.executedBy}</span> le {new Date(batchDetails.batch.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-neutral-800/80 rounded-2xl border border-slate-200 dark:border-neutral-700 max-w-md">
                  <div className="text-xs font-bold uppercase text-gray-400 mb-1 flex items-center gap-1.5">
                    <Lock size={12} className="text-emerald-500" /> Empreinte d'intégrité SHA-256
                  </div>
                  <div className="font-mono text-xs break-all text-gray-700 dark:text-gray-300">
                    {batchDetails.batch.sourceSha256}
                  </div>
                </div>
              </div>
            </div>

            {/* Table des placemarks */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-neutral-800 flex justify-between items-center">
                <h3 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  <Layers size={20} className="text-pleingaz-red" />
                  Liste des {batchDetails.records.length} Points de Vente & Dépôts
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-neutral-800/50 text-gray-500 text-xs uppercase font-black tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Nom Placemark</th>
                      <th className="px-6 py-4">Téléphone</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Décision D-08</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4 text-right">Fiche</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                    {batchDetails.records.map((rec) => (
                      <tr key={rec.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/40 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                          {rec.placemarkName}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                          {rec.phoneExtracted || '—'}
                        </td>
                        <td className="px-6 py-4">
                          {rec.isDepot ? (
                            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
                              Dépôt logistique
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400">
                              Point de vente
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">
                            {rec.decision}
                          </span>
                          {rec.rejectionReason && (
                            <div className="text-xs text-red-500 mt-0.5">{rec.rejectionReason}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                            rec.status === 'IMPORTED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                          }`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {rec.storeId && (
                            <Link
                              href={`/stores/${rec.storeId}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-xs font-bold text-pleingaz-red hover:underline"
                            >
                              <span>Voir</span>
                              <ExternalLink size={14} />
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
