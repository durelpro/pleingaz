'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, UserCheck, Lock, Unlock, PhoneCall, Eye, EyeOff, 
  Plus, CheckCircle2, AlertTriangle, FileText, X, ArrowRight, 
  RotateCcw, History, RefreshCw, Smartphone, Search, Check
} from 'lucide-react';
import Link from 'next/link';

interface AccountCaseItem {
  id: string;
  caseNumber: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'CLOSED';
  reason: string;
  proposedAction?: string;
  internalNotes?: string;
  targetUserId: string;
  targetUser: {
    id: string;
    phone: string;
    whatsappPhone?: string;
    callPhone?: string;
    lockedUntil?: string | null;
    failedAttempts?: number;
  };
  agentId: string;
  createdAt: string;
}

export default function GestionnaireComptePage() {
  const [cases, setCases] = useState<AccountCaseItem[]>([
    {
      id: 'case-demo-1',
      caseNumber: 'DOS-2026-001',
      status: 'OPEN',
      reason: 'Perte de carte SIM et demande de déblocage suite à 5 tentatives infructueuses',
      internalNotes: 'Client s’est présenté au siège avec CNI physique vérifiée conforme.',
      targetUserId: 'user-c1',
      targetUser: {
        id: 'user-c1',
        phone: '+237 6******12',
        whatsappPhone: '+237 6******12',
        callPhone: '+237 6******88',
        lockedUntil: new Date(Date.now() + 1800000).toISOString(),
        failedAttempts: 5,
      },
      agentId: 'agent-support-01',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'case-demo-2',
      caseNumber: 'DOS-2026-002',
      status: 'PROPOSED',
      reason: 'Vol de smartphone avec demande de bascule de numéro WhatsApp vers nouveau terminal',
      proposedAction: JSON.stringify({ actionType: 'PHONE_CHANGE', newPhone: '+237699445566' }),
      internalNotes: 'Déclaration de perte fournie. Soumis en attente de double regard Superviseur.',
      targetUserId: 'user-c2',
      targetUser: {
        id: 'user-c2',
        phone: '+237 6******99',
        whatsappPhone: '+237 6******99',
        callPhone: '+237 6******77',
        lockedUntil: null,
        failedAttempts: 0,
      },
      agentId: 'agent-support-01',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ]);

  const [selectedCase, setSelectedCase] = useState<AccountCaseItem | null>(null);
  const [unmaskedData, setUnmaskedData] = useState<{ [caseId: string]: string }>({});
  const [unmaskReason, setUnmaskReason] = useState('');
  const [showUnmaskModal, setShowUnmaskModal] = useState(false);
  const [caseToUnmask, setCaseToUnmask] = useState<AccountCaseItem | null>(null);

  // Formulaire nouvelle proposition Maker-Checker
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [changeJustification, setChangeJustification] = useState('');

  // Formulaire ouverture nouveau dossier
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCasePhone, setNewCasePhone] = useState('');
  const [newCaseReason, setNewCaseReason] = useState('');
  const [newCaseNotes, setNewCaseNotes] = useState('');

  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Démasquage sous motif obligatoire et journalisé (D-15.1)
  const handleConfirmUnmask = () => {
    if (!unmaskReason.trim() || !caseToUnmask) return;
    
    // Démasquage sécurisé (simulation backend trace audit log)
    const realPhone = '+237 699 00 11 22';
    setUnmaskedData(prev => ({ ...prev, [caseToUnmask.id]: realPhone }));
    setShowUnmaskModal(false);
    setUnmaskReason('');
    showToast(`Numéro démasqué avec trace d'audit immuable [account:unmask_phone].`);
  };

  // 2. Déverrouillage compte client dans un dossier ouvert (D-15)
  const handleUnlockAccount = (caseItem: AccountCaseItem) => {
    setCases(prev => prev.map(c => {
      if (c.id === caseItem.id) {
        return {
          ...c,
          status: 'IN_PROGRESS',
          targetUser: { ...c.targetUser, lockedUntil: null, failedAttempts: 0 }
        };
      }
      return c;
    }));
    showToast(`Compte client ${caseItem.caseNumber} déverrouillé avec succès.`);
  };

  // 3. Déconnexion globale des sessions
  const handleRevokeSessions = (caseItem: AccountCaseItem) => {
    showToast(`Toutes les sessions actives du compte ont été révoquées.`);
  };

  // 4. Proposition de changement de numéro (Maker-Checker D-15.2)
  const handleProposePhoneChange = () => {
    if (!selectedCase || !newPhoneNumber.trim() || !changeJustification.trim()) return;

    setCases(prev => prev.map(c => {
      if (c.id === selectedCase.id) {
        return {
          ...c,
          status: 'PROPOSED',
          proposedAction: JSON.stringify({ actionType: 'PHONE_CHANGE', newPhone: newPhoneNumber }),
          internalNotes: `${c.internalNotes || ''} | Proposition changement vers ${newPhoneNumber}: ${changeJustification}`
        };
      }
      return c;
    }));

    setShowProposeModal(false);
    setNewPhoneNumber('');
    setChangeJustification('');
    showToast(`Proposition soumise au Superviseur (Maker-Checker : statut PROPOSED).`);
  };

  // 5. Création nouveau dossier AccountCase
  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCasePhone.trim() || !newCaseReason.trim()) return;

    const newCase: AccountCaseItem = {
      id: `case-${Date.now()}`,
      caseNumber: `DOS-2026-${(cases.length + 1).toString().padStart(3, '0')}`,
      status: 'OPEN',
      reason: newCaseReason,
      internalNotes: newCaseNotes,
      targetUserId: `user-generated-${Date.now()}`,
      targetUser: {
        id: `user-generated-${Date.now()}`,
        phone: newCasePhone.replace(/(\d{4})$/, '****'),
        whatsappPhone: newCasePhone.replace(/(\d{4})$/, '****'),
        callPhone: newCasePhone.replace(/(\d{4})$/, '****'),
        lockedUntil: new Date().toISOString(),
        failedAttempts: 3,
      },
      agentId: 'agent-support-01',
      createdAt: new Date().toISOString(),
    };

    setCases([newCase, ...cases]);
    setShowCreateModal(false);
    setNewCasePhone('');
    setNewCaseReason('');
    setNewCaseNotes('');
    showToast(`Dossier ${newCase.caseNumber} créé avec succès.`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-[#E51A24] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/20 animate-bounce">
          <CheckCircle2 size={20} />
          <span className="text-sm font-bold">{notification}</span>
        </div>
      )}

      {/* Header Portail Gestionnaire de Compte */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <UserCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg text-white">Espace Gestionnaire de Compte</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold uppercase px-2 py-0.5 rounded-full border border-amber-500/30">
                Rôle ACCOUNT_MANAGER
              </span>
            </div>
            <p className="text-xs text-slate-400">Assistance client encadrée • Zéro usurpation • Traçabilité stricte D-15</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Plus size={16} />
            <span>Ouvrir un Dossier Client</span>
          </button>
          <div className="h-6 w-px bg-slate-800" />
          <div className="text-right">
            <span className="text-xs font-bold text-slate-300 block">Agent Support</span>
            <span className="text-[10px] text-emerald-400 block font-mono">Session Sécurisée TOTP</span>
          </div>
        </div>
      </header>

      {/* Règle Déontologique D-15 Rappel permanent */}
      <div className="bg-amber-950/40 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between text-xs text-amber-300">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-amber-400 flex-shrink-0" />
          <span>
            <strong>Règle de gouvernance D-15 :</strong> Aucune mutation directe de compte autorisée. Toute action s’exécute obligatoirement au sein d’un dossier formel et les modifications de numéros requièrent la validation d’un Superviseur (Maker-Checker).
          </span>
        </div>
        <span className="font-mono text-[11px] text-amber-400/80">Code Déontologique PLEINGAZ</span>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Colonne Gauche : Liste des Dossiers AccountCase */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileText size={16} className="text-amber-400" />
              Dossiers d’Assistance en Cours ({cases.length})
            </h2>
            <span className="text-xs text-slate-400">Classés par récence</span>
          </div>

          <div className="space-y-3">
            {cases.map((c) => {
              const isSelected = selectedCase?.id === c.id;
              const isLocked = Boolean(c.targetUser.lockedUntil);
              const unmasked = unmaskedData[c.id];

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-slate-800/90 border-amber-500 shadow-xl shadow-amber-500/10' 
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-amber-400">{c.caseNumber}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          c.status === 'OPEN' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                          c.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                          c.status === 'PROPOSED' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                          'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {c.status}
                        </span>
                        {isLocked && (
                          <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-full border border-red-500/30 flex items-center gap-1">
                            <Lock size={10} /> Compte Verrouillé
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-slate-100">{c.reason}</p>
                      
                      {c.internalNotes && (
                        <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                          Note : {c.internalNotes}
                        </p>
                      )}
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-[11px] text-slate-500 block font-mono">
                        {new Date(c.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Numéro concerné :</span>
                      <span className="font-mono font-bold text-slate-200">
                        {unmasked || c.targetUser.phone}
                      </span>
                      {!unmasked && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCaseToUnmask(c);
                            setShowUnmaskModal(true);
                          }}
                          className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-amber-400 transition-colors"
                          title="Démasquer sous motif journalisé"
                        >
                          <Eye size={14} />
                        </button>
                      )}
                    </div>

                    <span className="text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Traiter ce dossier <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Colonne Droite : Console d'Action du Gestionnaire (Sur dossier sélectionné) */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert size={16} className="text-amber-400" />
            Console d’Intervention Encadrée
          </h2>

          {selectedCase ? (
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-amber-400 font-black">{selectedCase.caseNumber}</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">Dossier Actif</span>
                </div>
                <h3 className="font-bold text-base text-slate-100">{selectedCase.reason}</h3>
                <p className="text-xs text-slate-400 mt-1">Identifiant cible : <code className="text-slate-300">{selectedCase.targetUserId}</code></p>
              </div>

              {/* Actions Autorisées au Gestionnaire */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Actions Autorisées (Avec Audit Log)
                </span>

                {/* Action 1 : Déverrouillage */}
                <button
                  onClick={() => handleUnlockAccount(selectedCase)}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-between transition-colors border border-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <Unlock size={16} className="text-emerald-400" />
                    Lever le verrouillage tentative
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Immédiat</span>
                </button>

                {/* Action 2 : Révocation sessions */}
                <button
                  onClick={() => handleRevokeSessions(selectedCase)}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-between transition-colors border border-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <RotateCcw size={16} className="text-amber-400" />
                    Déconnecter toutes les sessions
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">Sécurité</span>
                </button>

                {/* Action 3 : Proposition de changement de numéro (Maker-Checker) */}
                <button
                  onClick={() => setShowProposeModal(true)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-900/60 to-purple-800/60 hover:from-purple-800/70 hover:to-purple-700/70 text-purple-200 rounded-xl font-bold text-xs flex items-center justify-between transition-colors border border-purple-500/30"
                >
                  <span className="flex items-center gap-2">
                    <Smartphone size={16} className="text-purple-300" />
                    Proposer changement de numéro
                  </span>
                  <span className="text-[10px] bg-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded font-mono">Maker-Checker</span>
                </button>
              </div>

              {/* État de la proposition en cours */}
              {selectedCase.proposedAction && (
                <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Demande soumise au Superviseur
                  </span>
                  <p className="text-xs text-slate-300 font-mono bg-purple-950/60 p-2 rounded border border-purple-900">
                    {selectedCase.proposedAction}
                  </p>
                  <span className="text-[10px] text-slate-400 block">
                    En attente de signature numérique d’un ADMIN (ADR D15.2). Le gestionnaire ne peut pas valider sa propre proposition.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-950/50 p-8 rounded-2xl border border-dashed border-slate-800 text-center space-y-2">
              <FileText size={32} className="mx-auto text-slate-600" />
              <p className="text-xs text-slate-400">Sélectionnez un dossier à gauche pour ouvrir la console d’intervention.</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal Démasquage Numéro sous motif D-15.1 */}
      {showUnmaskModal && caseToUnmask && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-amber-500/40 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <ShieldAlert className="text-amber-400" size={20} />
                Démasquage de Coordonnées Cible
              </h3>
              <button onClick={() => setShowUnmaskModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Conformément à la réglementation sur les données personnelles (D-15.1), le numéro de téléphone complet du client est masqué par défaut. Tout démasquage est enregistré de manière immuable dans l’<strong>AuditLog</strong>.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Motif obligatoire de consultation :
              </label>
              <textarea
                value={unmaskReason}
                onChange={(e) => setUnmaskReason(e.target.value)}
                placeholder="Ex: Rappel client pour vérification physique suite à alerte..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[80px]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUnmaskModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!unmaskReason.trim()}
                onClick={handleConfirmUnmask}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-600/30"
              >
                Confirmer & Journaliser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Proposition Changement Numéro (Maker-Checker D-15.2) */}
      {showProposeModal && selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-purple-500/40 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Smartphone className="text-purple-400" size={20} />
                Proposer un Remplacement de Numéro
              </h3>
              <button onClick={() => setShowProposeModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Dossier : <strong className="text-purple-400">{selectedCase.caseNumber}</strong>. La demande sera soumise en revue au Superviseur.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Nouveau numéro de téléphone E.164 (Cameroun) :
                </label>
                <input
                  type="tel"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  placeholder="+237699112233"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Justification détaillée & Références justificatives :
                </label>
                <textarea
                  value={changeJustification}
                  onChange={(e) => setChangeJustification(e.target.value)}
                  placeholder="Ex: CNI présentée n°... et déclaration de perte n°..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 min-h-[70px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowProposeModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!newPhoneNumber.trim() || !changeJustification.trim()}
                onClick={handleProposePhoneChange}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-lg shadow-purple-600/30"
              >
                Transmettre pour Approbation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ouverture Dossier */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateCase} className="bg-slate-950 border border-slate-700 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus className="text-amber-400" size={20} />
                Ouvrir un Nouveau Dossier Litige
              </h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Numéro de téléphone du client :
                </label>
                <input
                  type="tel"
                  required
                  value={newCasePhone}
                  onChange={(e) => setNewCasePhone(e.target.value)}
                  placeholder="+237699112233"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Motif du litige ou demande :
                </label>
                <input
                  type="text"
                  required
                  value={newCaseReason}
                  onChange={(e) => setNewCaseReason(e.target.value)}
                  placeholder="Ex: Blocage de compte, perte de carte SIM..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Notes internes d’ouverture :
                </label>
                <textarea
                  value={newCaseNotes}
                  onChange={(e) => setNewCaseNotes(e.target.value)}
                  placeholder="Détails relevés lors de l'appel ou de la visite..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[60px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-600/30"
              >
                Créer le Dossier
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
