'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  ShieldCheck, 
  ShieldAlert, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  PhoneCall, 
  Banknote, 
  RefreshCw, 
  ArrowLeft, 
  AlertTriangle,
  UserCheck,
  Clock,
  Send,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccountCaseItem {
  id: string;
  caseNumber: string;
  status: 'OPEN' | 'PROPOSED' | 'ADMIN_APPROVED' | 'REJECTED' | 'CLOSED';
  reason: string;
  proposedAction: string;
  agent?: { id: string; email?: string; phone: string };
  targetUser?: { id: string; phone: string; whatsappPhone?: string };
  adminNotes?: string;
  createdAt: string;
}

export default function AdminCasesPage() {
  const [activeTab, setActiveTab] = useState<'LIST' | 'NEW_LOST_PHONE' | 'NEW_DEPOSIT_REFUND'>('LIST');
  const [cases, setCases] = useState<AccountCaseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Formulaire Perte de Numéro WhatsApp (D-15, C-07)
  const [targetPhone, setTargetPhone] = useState<string>('+237699123456');
  const [newPhone, setNewPhone] = useState<string>('+237677998877');
  const [reasonLost, setReasonLost] = useState<string>('Vol de téléphone portable et perte définitive de la carte SIM');
  const [backupPhoneCalled, setBackupPhoneCalled] = useState<boolean>(false);
  const [creatingLostCase, setCreatingLostCase] = useState<boolean>(false);
  const [lostCaseSuccess, setLostCaseSuccess] = useState<string | null>(null);

  // Formulaire Restitution Consigne (+25 000 FCFA)
  const [depositCustomerPhone, setDepositCustomerPhone] = useState<string>('+237699123456');
  const [depositBottleType, setDepositBottleType] = useState<string>('Bouteille 12.5 kg PLEINGAZ');
  const [depositAmount, setDepositAmount] = useState<number>(25000);
  const [refundingDeposit, setRefundingDeposit] = useState<boolean>(false);
  const [depositSuccess, setDepositSuccess] = useState<string | null>(null);

  // Simulation ID de l'utilisateur connecté (pour test Maker-Checker)
  const [currentUserId, setCurrentUserId] = useState<string>('admin-distinct-user-2');

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/v1/cr003/cases');
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      }
    } catch {
      // Mock data si API locale offline
      if (cases.length === 0) {
        setCases([
          {
            id: 'case-mock-1',
            caseNumber: 'CASE-202610-0001',
            status: 'PROPOSED',
            reason: 'Perte de carte SIM MTN suite à vol à Bonamoussadi',
            proposedAction: JSON.stringify({ action: 'UPDATE_PHONE', newPhone: '+237677998877', backupPhoneVerified: true }),
            agent: { id: 'agent-account-manager-1', phone: '+237650000001', email: 'manager1@pleingaz.cm' },
            targetUser: { id: 'usr-client-1', phone: '+237699123456', whatsappPhone: '+237699123456' },
            createdAt: new Date().toISOString(),
          },
          {
            id: 'case-mock-2',
            caseNumber: 'CONSIGNE-2026-0002',
            status: 'ADMIN_APPROVED',
            reason: 'Restitution de bouteille consignée (12.5 kg)',
            proposedAction: JSON.stringify({ action: 'REFUND_DEPOSIT', amount: 25000 }),
            agent: { id: 'agent-account-manager-1', phone: '+237650000001' },
            targetUser: { id: 'usr-client-2', phone: '+237677112233' },
            adminNotes: 'Bouteille en bon état avec scellé retourné. 25 000 FCFA restitués en espèces.',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  // Création dossier Perte de Téléphone (D-15)
  const handleCreateLostPhoneCase = async () => {
    if (!backupPhoneCalled) {
      alert('⚠️ OBLIGATION SOUVERAINE D-15 / D-12.3 :\nVous devez obligatoirement effectuer un contre-appel de vérification sur le numéro secondaire (backupPhone) avant de soumettre ce dossier.');
      return;
    }

    setCreatingLostCase(true);
    setLostCaseSuccess(null);

    const payload = {
      agentId: 'agent-account-manager-1',
      targetPhone,
      reason: reasonLost,
      proposedAction: JSON.stringify({ action: 'UPDATE_PHONE', newPhone, backupPhoneVerified: true }),
      evidenceUrls: ['https://pleingaz.cm/evidence/kyc-backup-call-log.pdf'],
    };

    try {
      const res = await fetch('http://localhost:3001/api/v1/cr003/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        setLostCaseSuccess(`Dossier ${created.caseNumber} créé avec succès en statut PROPOSED. En attente de validation par un ADMIN distinct.`);
      }
      fetchCases();
    } catch {
      setLostCaseSuccess(`Dossier CASE-202610-0099 créé (simulation locale). En attente de validation contradictoire.`);
    } finally {
      setCreatingLostCase(false);
    }
  };

  // Remboursement de consigne (+25 000 FCFA)
  const handleRefundDeposit = async () => {
    setRefundingDeposit(true);
    setDepositSuccess(null);

    try {
      const res = await fetch('http://localhost:3001/api/v1/cr003/refund-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'agent-account-manager-1',
          customerPhone: depositCustomerPhone,
          bottleType: depositBottleType,
          amount: depositAmount,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDepositSuccess(`✅ Remboursement validé : ${data.caseNumber} pour un montant de ${data.refundAmount.toLocaleString('fr-FR')} FCFA.`);
      }
      fetchCases();
    } catch {
      setDepositSuccess(`✅ Remboursement de 25 000 FCFA validé (simulation locale active).`);
    } finally {
      setRefundingDeposit(false);
    }
  };

  // Décision Maker-Checker par un Administrateur
  const handleReviewCase = async (caseId: string, agentCreatorId: string, decision: 'APPROVE' | 'REJECT') => {
    if (agentCreatorId === currentUserId) {
      alert('🚨 VIOLATION MAKER-CHECKER (D-15) :\nUn gestionnaire ne peut JAMAIS approuver son propre dossier. Basculez sur un autre profil ADMIN pour valider.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/v1/cr003/cases/${caseId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: currentUserId,
          decision,
          notes: decision === 'APPROVE' ? 'Identité vérifiée contradictoirement' : 'Rejeté pour justificatif insuffisant',
        }),
      });

      if (res.ok) {
        alert(`Dossier ${decision === 'APPROVE' ? 'approuvé et appliqué' : 'rejeté'} avec succès !`);
      }
      fetchCases();
    } catch {
      alert(`Décision "${decision}" enregistrée dans le journal d'audit (simulation locale).`);
    }
  };

  const filteredCases = cases.filter((c) => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href="/admin/dashboard"
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Dashboard Admin
              </Link>
              <span className="text-neutral-600">•</span>
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                CR-003 • Souveraineté D-15 & C-07
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <FileText className="w-8 h-8 text-amber-400" />
              Gestion des Litiges, Dossiers AccountCase & Consignes
            </h1>
            <p className="text-xs text-neutral-400">
              Traitement formel sous rôle <strong className="text-amber-300">ACCOUNT_MANAGER</strong> avec approbation contradictoire <strong className="text-emerald-300">ADMIN</strong> (Maker-Checker strict).
            </p>
          </div>

          {/* Sélecteur de Rôle Simulatif pour Maker-Checker */}
          <div className="bg-neutral-800 border border-neutral-700 p-2.5 rounded-2xl flex items-center gap-2 text-xs">
            <span className="text-neutral-400 font-bold">Session active :</span>
            <select
              value={currentUserId}
              onChange={(e) => setCurrentUserId(e.target.value)}
              className="bg-neutral-900 border border-neutral-600 rounded-lg px-2.5 py-1 text-xs font-bold text-amber-300 outline-none"
            >
              <option value="admin-distinct-user-2">Paul M. (ADMIN Distinct - Valideur)</option>
              <option value="agent-account-manager-1">Marie T. (ACCOUNT_MANAGER - Créateur)</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-neutral-800 pb-3 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('LIST')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'LIST'
                ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white bg-neutral-800/60'
            }`}
          >
            📋 Tous les Dossiers ({cases.length})
          </button>
          <button
            onClick={() => setActiveTab('NEW_LOST_PHONE')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'NEW_LOST_PHONE'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-neutral-400 hover:text-white bg-neutral-800/60'
            }`}
          >
            📱 Perte Numéro WhatsApp (D-15)
          </button>
          <button
            onClick={() => setActiveTab('NEW_DEPOSIT_REFUND')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'NEW_DEPOSIT_REFUND'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-neutral-400 hover:text-white bg-neutral-800/60'
            }`}
          >
            💵 Restitution Consigne (+25 000 F)
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: LISTE DES DOSSIERS ACCOUNT_CASE */}
        {/* ======================================================== */}
        {activeTab === 'LIST' && (
          <div className="space-y-4">
            
            {/* Filtres de statut */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2 text-xs font-bold">
                {['ALL', 'PROPOSED', 'ADMIN_APPROVED', 'REJECTED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg border transition-all ${
                      statusFilter === st
                        ? 'bg-neutral-100 text-neutral-900 border-white'
                        : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                    }`}
                  >
                    {st === 'ALL' ? 'Tous' : st === 'PROPOSED' ? 'En attente (PROPOSED)' : st === 'ADMIN_APPROVED' ? 'Approuvés' : 'Rejetés'}
                  </button>
                ))}
              </div>

              <button
                onClick={fetchCases}
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Actualiser
              </button>
            </div>

            {/* Grille / Liste des Dossiers */}
            <div className="space-y-3">
              {filteredCases.length === 0 ? (
                <div className="p-8 text-center bg-neutral-800/50 rounded-2xl border border-neutral-700 text-neutral-500 text-xs">
                  Aucun dossier dans cette catégorie.
                </div>
              ) : (
                filteredCases.map((c) => {
                  const isCreator = c.agent?.id === currentUserId;
                  return (
                    <div
                      key={c.id}
                      className="p-5 bg-neutral-800/70 border border-neutral-700 rounded-2xl space-y-3 hover:border-neutral-600 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-700/60 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-amber-400 text-sm">
                            {c.caseNumber}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            c.status === 'PROPOSED'
                              ? 'bg-amber-950 text-amber-400 border-amber-800'
                              : c.status === 'ADMIN_APPROVED'
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                : 'bg-red-950 text-red-400 border-red-800'
                          }`}>
                            {c.status}
                          </span>
                        </div>

                        <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-neutral-500" />
                          {new Date(c.createdAt).toLocaleString('fr-FR')}
                        </div>
                      </div>

                      {/* Corps du dossier */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-neutral-500 block">Motif formel :</span>
                          <p className="text-neutral-200 font-medium">{c.reason}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-neutral-500 block">Action proposée :</span>
                          <p className="text-neutral-300 font-mono text-[11px] bg-neutral-900/60 p-1.5 rounded border border-neutral-800">
                            {c.proposedAction}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-[11px] text-neutral-400">
                        <div>
                          Agent instructeur : <strong className="text-neutral-300">{c.agent?.phone || 'Account Manager'}</strong>
                          {isCreator && <span className="ml-2 text-amber-400 font-bold">(Vous avez créé ce dossier)</span>}
                        </div>

                        {/* Actions Maker-Checker */}
                        {c.status === 'PROPOSED' && (
                          <div className="flex items-center gap-2">
                            {isCreator ? (
                              <span className="text-[10px] text-red-400 italic flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Approbation bloquée : vous êtes le créateur (Maker-Checker)
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleReviewCase(c.id, c.agent?.id || '', 'APPROVE')}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-xs flex items-center gap-1 transition-all"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Approuver (ADMIN)
                                </button>
                                <button
                                  onClick={() => handleReviewCase(c.id, c.agent?.id || '', 'REJECT')}
                                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-lg text-xs flex items-center gap-1 transition-all"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Rejeter
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: OUVERTURE DOSSIER PERTE DE NUMÉRO WHATSAPP */}
        {/* ======================================================== */}
        {activeTab === 'NEW_LOST_PHONE' && (
          <div className="max-w-2xl bg-neutral-800/70 border border-neutral-700 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400">
                Instruction Procédurale Sécurisée (D-15, C-07)
              </span>
              <h2 className="text-xl font-black flex items-center gap-2">
                <PhoneCall className="w-6 h-6 text-emerald-400" />
                Procédure de Perte de Numéro WhatsApp
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Interdiction formelle d'usurpation d'identité (*"voir comme"* banni). L'agent procède à un contre-appel de sécurité sur le numéro de secours avant de soumettre la demande.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                  Numéro WhatsApp Perdu (Identifiant Actuel)
                </label>
                <input
                  type="tel"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-sm font-mono font-bold text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                  Nouveau Numéro WhatsApp à Associer
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-sm font-mono font-bold text-emerald-400 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                  Motif Formel Documenté
                </label>
                <textarea
                  rows={2}
                  value={reasonLost}
                  onChange={(e) => setReasonLost(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-neutral-300 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Checkbox Obligatoire Contre-Appel D-12.3 */}
              <div className="p-4 bg-neutral-900 rounded-2xl border-2 border-emerald-500/60 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={backupPhoneCalled}
                    onChange={(e) => setBackupPhoneCalled(e.target.checked)}
                    className="mt-0.5 text-emerald-600 rounded focus:ring-emerald-500 w-4 h-4"
                  />
                  <div className="text-xs">
                    <strong className="text-emerald-300 block">
                      Vérification par contre-appel téléphonique effectuée (D-12.3)
                    </strong>
                    <span className="text-neutral-400 text-[11px]">
                      Je certifie sous serment avoir composé le numéro secondaire de secours (backupPhone) enregistré lors de l'inscription pour confirmer l'identité de l'usager.
                    </span>
                  </div>
                </label>
              </div>

              <button
                onClick={handleCreateLostPhoneCase}
                disabled={creatingLostCase || !backupPhoneCalled}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Soumettre le Dossier à Validation ADMIN
              </button>

              {lostCaseSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-emerald-950/60 border border-emerald-500 rounded-2xl text-xs text-emerald-300 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {lostCaseSuccess}
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: RESTITUTION & REMBOURSEMENT CONSIGNE (+25 000 FCFA) */}
        {/* ======================================================== */}
        {activeTab === 'NEW_DEPOSIT_REFUND' && (
          <div className="max-w-2xl bg-neutral-800/70 border border-neutral-700 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black tracking-wider text-blue-400">
                Guichet de Restitution de Consigne
              </span>
              <h2 className="text-xl font-black flex items-center gap-2">
                <Banknote className="w-6 h-6 text-blue-400" />
                Remboursement Immédiat de Consigne (+25 000 FCFA)
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Règlement en espèces ou Mobile Money contre remise physique de la bouteille vide consignée PLEINGAZ avec bon de restitution certifié.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                  Numéro de Téléphone du Client Bénéficiaire
                </label>
                <input
                  type="tel"
                  value={depositCustomerPhone}
                  onChange={(e) => setDepositCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-sm font-mono font-bold text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                  Type de Bouteille Restituée
                </label>
                <select
                  value={depositBottleType}
                  onChange={(e) => setDepositBottleType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs font-bold text-white focus:border-blue-500 outline-none"
                >
                  <option value="Bouteille 12.5 kg PLEINGAZ">Bouteille 12.5 kg PLEINGAZ</option>
                  <option value="Bouteille 6 kg PLEINGAZ">Bouteille 6 kg PLEINGAZ</option>
                  <option value="Bouteille 50 kg PLEINGAZ">Bouteille 50 kg PLEINGAZ</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                  Montant Forfaitaire de Consigne Remboursé
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  readOnly
                  className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-base font-black font-mono text-emerald-400 outline-none"
                />
              </div>

              <button
                onClick={handleRefundDeposit}
                disabled={refundingDeposit}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Banknote className="w-4 h-4" /> Émettre le Bon de Remboursement (25 000 FCFA)
              </button>

              {depositSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-blue-950/60 border border-blue-500 rounded-2xl text-xs text-blue-200 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {depositSuccess}
                </motion.div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
