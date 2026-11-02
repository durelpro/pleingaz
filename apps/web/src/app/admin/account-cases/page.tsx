'use client';

import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Lock, Unlock, PhoneCall, Eye, Plus, CheckCircle2, AlertTriangle, FileText, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface AccountCaseItem {
  id: string;
  caseNumber: string;
  status: string;
  reason: string;
  proposedAction: string;
  targetUser: {
    id: string;
    phone: string;
    whatsappPhone?: string;
    callPhone?: string;
  };
  agentId: string;
  createdAt: string;
}

export default function AccountCasesPage() {
  const [cases, setCases] = useState<AccountCaseItem[]>([
    {
      id: 'demo-case-1',
      caseNumber: 'CASE-8491',
      status: 'OPEN',
      reason: 'Perte de carte SIM déclarée par le client en boutique',
      proposedAction: 'ASSISTANCE_REQUEST',
      targetUser: {
        id: 'u-1',
        phone: '+237 6******12',
        whatsappPhone: '+237 6******12',
        callPhone: '+237 6******56',
      },
      agentId: 'agent-marct',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-case-2',
      caseNumber: 'CASE-8490',
      status: 'PROPOSED',
      reason: 'Demande de remplacement de numéro suite à vol de téléphone',
      proposedAction: JSON.stringify({ actionType: 'PHONE_CHANGE', newPhone: '+237699445566' }),
      targetUser: {
        id: 'u-2',
        phone: '+237 6******99',
        whatsappPhone: '+237 6******99',
        callPhone: '+237 6******77',
      },
      agentId: 'agent-marct',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState<AccountCaseItem | null>(null);
  const [unmaskedPhone, setUnmaskedPhone] = useState<string | null>(null);
  const [unmaskReason, setUnmaskReason] = useState('');
  const [showUnmaskModal, setShowUnmaskModal] = useState(false);

  // Modal nouveau dossier
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [newTargetPhone, setNewTargetPhone] = useState('');
  const [newReason, setNewReason] = useState('');

  // Modal proposition changement de numéro
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [newPhoneProposal, setNewPhoneProposal] = useState('');
  const [explanationProposal, setExplanationProposal] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUnlock = async (caseId: string) => {
    showToast('Compte usager déverrouillé avec succès (Lockout levé et tracé dans AuditLog).');
  };

  const handleRevokeSessions = async (caseId: string) => {
    showToast('Toutes les sessions actives de l’usager ont été révoquées.');
  };

  const handleUnmaskSubmit = () => {
    if (!unmaskReason.trim() || unmaskReason.length < 5) {
      alert('Veuillez indiquer un motif explicite d’au moins 5 caractères.');
      return;
    }
    setUnmaskedPhone('+237 699 12 34 56 (Secours: +237 670 12 34 56)');
    setShowUnmaskModal(false);
    showToast('Démasquage temporaire accordé et tracé dans AuditLog (D-15.2).');
  };

  const handleProposeSubmit = () => {
    if (!newPhoneProposal.trim() || !explanationProposal.trim()) {
      alert('Veuillez renseigner le nouveau numéro et le motif.');
      return;
    }
    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCase?.id
          ? { ...c, status: 'PROPOSED', proposedAction: JSON.stringify({ newPhone: newPhoneProposal }) }
          : c
      )
    );
    setShowProposeModal(false);
    showToast('Proposition de nouveau numéro soumise. En attente de validation formelle par un ADMIN distinct (Maker-Checker).');
  };

  const handleCreateCase = () => {
    if (!newTargetPhone.trim() || !newReason.trim()) {
      alert('Le numéro client et le motif sont obligatoires.');
      return;
    }
    const newCase: AccountCaseItem = {
      id: `case-${Date.now()}`,
      caseNumber: `CASE-${Date.now().toString().slice(-4)}`,
      status: 'OPEN',
      reason: newReason,
      proposedAction: 'ASSISTANCE_REQUEST',
      targetUser: {
        id: `u-${Date.now()}`,
        phone: `+237 ${newTargetPhone.slice(0, 1)}******${newTargetPhone.slice(-2)}`,
      },
      agentId: 'agent-current',
      createdAt: new Date().toISOString(),
    };
    setCases([newCase, ...cases]);
    setShowNewCaseModal(false);
    setNewTargetPhone('');
    setNewReason('');
    showToast(`Dossier ${newCase.caseNumber} ouvert et tracé dans AuditLog.`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Header Staff */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xl shadow-xs">
              <Shield size={22} />
            </span>
            <div>
              <span className="font-extrabold text-sm text-white block">PLEINGAZ Staff & Assistance</span>
              <span className="text-[10px] text-slate-400">Espace Gestionnaire de Compte (D-15) • Double Contrôle</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
              Agent #MGR-07
            </span>
            <Link
              href="/admin/dashboard"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Control Center
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Toast Notif */}
        {toastMessage && (
          <div className="p-4 bg-emerald-500 text-white rounded-xl shadow-xl font-bold text-xs flex items-center gap-2 animate-in slide-in-from-top">
            <CheckCircle2 size={18} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Encadré d'avertissement formel ADR D-15 */}
        <div className="bg-red-950/40 border border-red-800/60 p-4 rounded-2xl flex items-start space-x-3">
          <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-red-300 text-sm">
              🔒 Règle de Sécurité et Traçabilité Obligatoire (Décision Souveraine D-15)
            </h3>
            <p className="text-slate-300 leading-relaxed">
              <strong>Aucune mutation directe autorisée.</strong> Toute intervention sur le compte d&apos;un usager exige impérativement l&apos;ouverture d&apos;un dossier <code>AccountCase</code> motivé. Toute modification de numéro est soumise à la double approbation formelle d&apos;un administrateur distinct (Maker-Checker). Usurpation d&apos;identité (impersonation) strictement bannie.
            </p>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-white">Dossiers d&apos;Assistance Actifs</h1>
            <p className="text-xs text-slate-400">Gestion des litiges d&apos;accès, pertes de SIM et déverrouillages de compte.</p>
          </div>

          <button
            onClick={() => setShowNewCaseModal(true)}
            className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center space-x-1.5"
          >
            <Plus size={16} />
            <span>Ouvrir un nouveau dossier</span>
          </button>
        </div>

        {/* Liste des Dossiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cases.map((c) => (
            <div
              key={c.id}
              className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-4 hover:border-slate-600 transition-all shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-xs font-black text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-900/50">
                    {c.caseNumber}
                  </span>
                  <h3 className="font-bold text-sm text-white mt-1.5">{c.reason}</h3>
                </div>

                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    c.status === 'OPEN'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : c.status === 'PROPOSED'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {c.status === 'OPEN'
                    ? 'En cours'
                    : c.status === 'PROPOSED'
                    ? 'En attente Admin'
                    : 'Validé'}
                </span>
              </div>

              {/* Coordonnées Masquées */}
              <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Numéro client :</span>
                  <span className="text-white font-bold">
                    {unmaskedPhone && selectedCase?.id === c.id ? unmaskedPhone : c.targetUser.phone}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Gestionnaire instructeur : {c.agentId}
                </div>
              </div>

              {/* Barre d'Actions Gestionnaire */}
              <div className="flex flex-wrap gap-2 pt-1 text-xs font-bold">
                <button
                  onClick={() => {
                    setSelectedCase(c);
                    setShowUnmaskModal(true);
                  }}
                  className="py-1.5 px-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg flex items-center space-x-1"
                >
                  <Eye size={13} />
                  <span>Démasquer (Justifié)</span>
                </button>

                <button
                  onClick={() => handleUnlock(c.id)}
                  className="py-1.5 px-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg flex items-center space-x-1"
                >
                  <Unlock size={13} />
                  <span>Lever Lockout</span>
                </button>

                <button
                  onClick={() => handleRevokeSessions(c.id)}
                  className="py-1.5 px-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg flex items-center space-x-1"
                >
                  <Lock size={13} />
                  <span>Déconnecter sessions</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedCase(c);
                    setShowProposeModal(true);
                  }}
                  className="py-1.5 px-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-1 ml-auto"
                >
                  <span>Changement numéro (Admin)</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Démasquage Audité (D-15.2) */}
        {showUnmaskModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 max-w-md w-full rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Eye size={16} className="text-amber-400" />
                  Démasquage Coordonnées Complètes
                </h3>
                <button onClick={() => setShowUnmaskModal(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Conformité RGPD / Loi Camerounaise : Toute révélation de numéro en clair est tracée nominativement dans <code>AuditLog</code>. Indiquez votre motif professionnel :
              </p>

              <textarea
                rows={3}
                placeholder="Ex: Contre-appel vocal de sécurité effectué auprès du client pour confirmation de perte de SIM"
                value={unmaskReason}
                onChange={(e) => setUnmaskReason(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowUnmaskModal(false)}
                  className="flex-1 py-2 bg-slate-700 text-xs font-bold rounded-lg text-slate-300"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUnmaskSubmit}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-xs font-bold rounded-lg text-white"
                >
                  Révéler et consigner
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Proposition Changement Numéro (Maker-Checker D-15.2) */}
        {showProposeModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 max-w-md w-full rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Shield size={16} className="text-red-500" />
                  Demande de Changement de Numéro
                </h3>
                <button onClick={() => setShowProposeModal(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-300">
                <strong>Principe Maker-Checker :</strong> En tant que gestionnaire, vous soumettez une proposition motivée. Seul un administrateur distinct pourra appliquer la modification.
              </p>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nouveau numéro E.164 (+237...) :</label>
                <input
                  type="tel"
                  placeholder="+237699445566"
                  value={newPhoneProposal}
                  onChange={(e) => setNewPhoneProposal(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Explication & Pièces vérifiées :</label>
                <textarea
                  rows={3}
                  placeholder="Ex: CNI physique présentée en agence, identité concordante avec les commandes passées."
                  value={explanationProposal}
                  onChange={(e) => setExplanationProposal(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowProposeModal(false)}
                  className="flex-1 py-2 bg-slate-700 text-xs font-bold rounded-lg text-slate-300"
                >
                  Annuler
                </button>
                <button
                  onClick={handleProposeSubmit}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-xs font-bold rounded-lg text-white"
                >
                  Transmettre à l&apos;Admin
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Nouveau Dossier */}
        {showNewCaseModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 max-w-md w-full rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-sm">Ouvrir un Dossier d&apos;Assistance Formel</h3>
                <button onClick={() => setShowNewCaseModal(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Numéro usager concerné :</label>
                <input
                  type="tel"
                  placeholder="+237 6XX XX XX XX"
                  value={newTargetPhone}
                  onChange={(e) => setNewTargetPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Motif formel d&apos;ouverture (D-15) :</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Compte bloqué suite à 5 tentatives erronées, usager sollicite assistance"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowNewCaseModal(false)}
                  className="flex-1 py-2 bg-slate-700 text-xs font-bold rounded-lg text-slate-300"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateCase}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-xs font-bold rounded-lg text-white"
                >
                  Créer dossier
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
