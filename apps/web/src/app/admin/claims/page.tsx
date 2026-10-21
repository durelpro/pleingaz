'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Clock, 
  Search, RefreshCw, Store, Phone, User, ExternalLink, Filter 
} from 'lucide-react';
import Link from 'next/link';

interface ClaimItem {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  claimStatus: string;
  verificationLevel: string;
  metadata: any;
  updatedAt: string;
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING_VERIFICATION' | 'PHONE_OTP_PENDING' | 'CLAIMED' | 'UNCLAIMED'>('PENDING_VERIFICATION');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ClaimItem | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [ownerUserId, setOwnerUserId] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchClaims = async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const url = filter === 'ALL' 
        ? `http://localhost:3001/imports/claims`
        : `http://localhost:3001/imports/claims?status=${filter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setClaims(data);
      }
    } catch (e: any) {
      console.error(e);
      setActionError('Erreur de connexion au serveur.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [filter]);

  const handleReview = async (decision: 'APPROVE' | 'REJECT') => {
    if (!selectedClaim) return;
    setIsLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`http://localhost:3001/imports/claims/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: selectedClaim.id,
          decision,
          ownerUserId: decision === 'APPROVE' ? (ownerUserId.trim() || undefined) : undefined,
          notes: adminNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Échec de l\'opération.');
      }

      setActionSuccess(`Demande ${decision === 'APPROVE' ? 'approuvée' : 'rejetée'} avec succès pour "${selectedClaim.name}".`);
      setSelectedClaim(null);
      setAdminNotes('');
      setOwnerUserId('');
      fetchClaims();
    } catch (e: any) {
      setActionError(e.message || 'Erreur lors du traitement de la revendication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold mb-1">
              <Link href="/admin/dashboard" className="hover:text-pleingaz-red">Admin</Link>
              <span>/</span>
              <span>Réseau & Revendications</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <ShieldCheck className="text-pleingaz-red" size={32} />
              Revendications Distributeurs (CR-002)
            </h1>
            <p className="text-gray-500 mt-1">
              Supervision des demandes de prise en gestion des boutiques issues de la carte PLEINGAZ.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchClaims}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl text-gray-700 dark:text-gray-300 font-bold hover:border-pleingaz-red transition-colors"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              Actualiser
            </button>
            <Link
              href="/admin/imports"
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Historique des Imports (Lots)
            </Link>
          </div>
        </div>

        {/* Filtres de statut */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-neutral-800 pb-4">
          {[
            { id: 'PENDING_VERIFICATION', label: 'En attente de revue admin' },
            { id: 'PHONE_OTP_PENDING', label: 'OTP envoyé (en cours)' },
            { id: 'CLAIMED', label: 'Approuvées & Revendiquées' },
            { id: 'UNCLAIMED', label: 'Non revendiquées (Listed)' },
            { id: 'ALL', label: 'Toutes les boutiques' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === tab.id
                  ? 'bg-pleingaz-red text-white shadow-md shadow-red-500/20'
                  : 'bg-white dark:bg-neutral-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 flex items-center gap-3">
            <CheckCircle2 size={20} className="shrink-0" />
            <span className="text-sm font-semibold">{actionSuccess}</span>
          </div>
        )}

        {actionError && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900 flex items-center gap-3">
            <AlertTriangle size={20} className="shrink-0" />
            <span className="text-sm font-semibold">{actionError}</span>
          </div>
        )}

        {/* Liste des boutiques */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {claims.length === 0 ? (
              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-12 text-center border border-gray-200 dark:border-neutral-800">
                <Store size={48} className="mx-auto text-gray-400 mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Aucun point dans cet état</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Sélectionnez un autre filtre pour visualiser les autres points de vente.
                </p>
              </div>
            ) : (
              claims.map((store) => (
                <div
                  key={store.id}
                  onClick={() => setSelectedClaim(store)}
                  className={`bg-white dark:bg-neutral-900 rounded-2xl p-5 border cursor-pointer transition-all hover:border-pleingaz-red ${
                    selectedClaim?.id === store.id 
                      ? 'border-pleingaz-red ring-2 ring-red-500/20 shadow-md' 
                      : 'border-gray-200 dark:border-neutral-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-gray-900 dark:text-white text-base">
                          {store.name}
                        </h3>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          store.claimStatus === 'CLAIMED' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : store.claimStatus === 'PENDING_VERIFICATION'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 animate-pulse'
                            : store.claimStatus === 'PHONE_OTP_PENDING'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300'
                        }`}>
                          {store.claimStatus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{store.city} — {store.address || 'Sans adresse textuelle'}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 font-mono">
                        <span className="flex items-center gap-1">
                          <Phone size={14} className="text-gray-400" />
                          {store.phone || 'Non renseigné'}
                        </span>
                        <span>Niveau : <strong className="text-gray-700 dark:text-gray-300">{store.verificationLevel}</strong></span>
                      </div>
                    </div>

                    <Link
                      href={`/stores/${store.id}`}
                      target="_blank"
                      className="p-2 text-gray-400 hover:text-pleingaz-red hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Voir la fiche publique"
                    >
                      <ExternalLink size={18} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Panneau latéral de détails & action */}
          <div className="space-y-6">
            {selectedClaim ? (
              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-gray-200 dark:border-neutral-800 shadow-xl space-y-6 sticky top-6">
                <div>
                  <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Détails de la demande</span>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white mt-1">
                    {selectedClaim.name}
                  </h2>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {selectedClaim.id}</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-100 dark:border-neutral-700 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ville :</span>
                    <span className="font-bold text-gray-900 dark:text-white">{selectedClaim.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Téléphone contact :</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">{selectedClaim.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Statut actuel :</span>
                    <span className="font-bold text-amber-600">{selectedClaim.claimStatus}</span>
                  </div>
                  {selectedClaim.metadata?.claimantName && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Demandeur :</span>
                      <span className="font-bold text-gray-900 dark:text-white">{selectedClaim.metadata.claimantName}</span>
                    </div>
                  )}
                  {selectedClaim.metadata?.claimantNotes && (
                    <div className="pt-2 border-t border-gray-200 dark:border-neutral-700">
                      <span className="text-gray-500 block mb-1">Notes du distributeur :</span>
                      <p className="italic text-gray-700 dark:text-gray-300">{selectedClaim.metadata.claimantNotes}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      ID Utilisateur Distributeur (optionnel pour rattachement de compte)
                    </label>
                    <input
                      type="text"
                      value={ownerUserId}
                      onChange={(e) => setOwnerUserId(e.target.value)}
                      placeholder="Ex: usr_xxxx ou laisser vide"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Motif / Remarque admin
                    </label>
                    <textarea
                      rows={2}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Ex: Confirmation physique effectuée par l'agent de zone"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleReview('APPROVE')}
                      disabled={isLoading}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle2 size={16} />
                      Approuver
                    </button>
                    <button
                      onClick={() => handleReview('REJECT')}
                      disabled={isLoading}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <XCircle size={16} />
                      Rejeter
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-dashed border-gray-300 dark:border-neutral-800 text-center text-gray-400">
                <ShieldCheck size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm font-semibold">Sélectionnez une boutique dans la liste pour examiner ou traiter la revendication.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
