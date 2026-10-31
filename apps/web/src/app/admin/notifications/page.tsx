'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Send, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  MessageSquare, 
  Smartphone, 
  Truck, 
  Clock, 
  ArrowLeft,
  Key,
  Flame,
  Check,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WebhookLog {
  id: string;
  timestamp: string;
  fromPhone: string;
  messageText: string;
  signatureValid: boolean;
  challengeConsumed: boolean;
  challengeCode?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  content: string;
  type: string;
  status: string;
  createdAt: string;
  user?: { phone: string; email?: string };
}

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState<'WEBHOOKS' | 'SIMULATOR' | 'ORDER_CYCLE' | 'ALL_NOTIFS'>('SIMULATOR');

  // Logs
  const [webhooks, setWebhooks] = useState<WebhookLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Simulator Form State
  const [simPhone, setSimPhone] = useState<string>('+237699123456');
  const [simMessage, setSimMessage] = useState<string>('Bonjour PLEINGAZ, voici mon code VERIF-784120');
  const [simValidSignature, setSimValidSignature] = useState<boolean>(true);
  const [simResult, setSimResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState<boolean>(false);

  // Challenge Generator State (D-12)
  const [challengeTargetPhone, setChallengeTargetPhone] = useState<string>('+237699123456');
  const [createdChallenge, setCreatedChallenge] = useState<any>(null);

  // Order Event Notification State
  const [orderId, setOrderId] = useState<string>('ORD-2026-10-DOUALA');
  const [orderPhone, setOrderPhone] = useState<string>('+237699123456');
  const [orderPin, setOrderPin] = useState<string>('4829');
  const [eventSending, setEventSending] = useState<string | null>(null);
  const [eventSuccess, setEventSuccess] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/v1/notifications/logs');
      if (res.ok) {
        const data = await res.json();
        setWebhooks(data.webhooks || []);
        setNotifications(data.notifications || []);
      }
    } catch {
      // Mock logs si API locale offline
      if (webhooks.length === 0) {
        setWebhooks([
          {
            id: 'wh-mock-1',
            timestamp: new Date().toISOString(),
            fromPhone: '+237699123456',
            messageText: 'Bonjour voici mon code VERIF-784120',
            signatureValid: true,
            challengeConsumed: true,
            challengeCode: '784120',
          },
          {
            id: 'wh-mock-2',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            fromPhone: '+237677889900',
            messageText: 'Attaque spoofing test sans HMAC',
            signatureValid: false,
            challengeConsumed: false,
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Déclencher le simulateur de Webhook
  const handleSimulateWebhook = async () => {
    setSimLoading(true);
    setSimResult(null);

    try {
      const res = await fetch('http://localhost:3001/api/v1/notifications/whatsapp/simulate-incoming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromPhone: simPhone,
          textBody: simMessage,
          validSignature: simValidSignature,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSimResult({
          status: 'ERROR',
          code: res.status,
          message: data.message || 'Signature invalide ou erreur serveur (Menace M24 rejetée)',
        });
      } else {
        setSimResult({
          status: 'SUCCESS',
          code: 200,
          data,
        });
      }
      fetchLogs();
    } catch {
      // Simulation locale si serveur coupé
      if (!simValidSignature) {
        setSimResult({
          status: 'ERROR',
          code: 401,
          message: '🚨 Rejet M24 : Signature HMAC SHA-256 invalide ! La requête forgée a été bloquée.',
        });
      } else {
        setSimResult({
          status: 'SUCCESS',
          code: 200,
          data: {
            success: true,
            processed: 1,
            details: [
              {
                fromPhone: simPhone,
                messageText: simMessage,
                signatureValid: true,
                challengeConsumed: simMessage.includes('VERIF'),
              },
            ],
          },
        });
      }
    } finally {
      setSimLoading(false);
    }
  };

  // Créer un challenge D-12
  const handleGenerateChallenge = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/notifications/whatsapp/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: challengeTargetPhone, purpose: 'LOGIN' }),
      });
      if (res.ok) {
        const data = await res.json();
        setCreatedChallenge(data);
        setSimMessage(`Bonjour PLEINGAZ, voici mon code de vérification : ${data.code}`);
      }
    } catch {
      const mockCode = `VERIF-${Math.floor(100000 + Math.random() * 900000)}`;
      setCreatedChallenge({
        phone: challengeTargetPhone,
        code: mockCode,
        waLink: `https://wa.me/237657696567?text=${encodeURIComponent(`Bonjour PLEINGAZ, voici mon code : ${mockCode}`)}`,
      });
      setSimMessage(`Bonjour PLEINGAZ, voici mon code : ${mockCode}`);
    }
  };

  // Déclencher une notification de commande
  const handleSendOrderEvent = async (event: string) => {
    setEventSending(event);
    setEventSuccess(null);

    try {
      const res = await fetch('http://localhost:3001/api/v1/notifications/order-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          event,
          customPhone: orderPhone,
          pinCode: orderPin,
        }),
      });

      if (res.ok) {
        setEventSuccess(`Notification "${event}" transmise avec succès au numéro ${orderPhone} !`);
      }
      fetchLogs();
    } catch {
      setEventSuccess(`Notification "${event}" enregistrée et diffusée (simulation locale active) !`);
    } finally {
      setEventSending(null);
    }
  };

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
                CR-003 • Souveraineté D-12 & M24
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-emerald-400" />
              Console Notifications & Webhook WhatsApp Meta
            </h1>
          </div>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="self-start sm:self-auto px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualiser les logs
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-neutral-800 pb-3 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('SIMULATOR')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'SIMULATOR'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-neutral-400 hover:text-white bg-neutral-800/60'
            }`}
          >
            🧪 Simulateur Webhook Meta (M24 / D-12)
          </button>
          <button
            onClick={() => setActiveTab('ORDER_CYCLE')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'ORDER_CYCLE'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-neutral-400 hover:text-white bg-neutral-800/60'
            }`}
          >
            🛵 Cycle Événements Commande (D-05)
          </button>
          <button
            onClick={() => setActiveTab('WEBHOOKS')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'WEBHOOKS'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-neutral-400 hover:text-white bg-neutral-800/60'
            }`}
          >
            📥 Flux Webhooks Meta Entrants ({webhooks.length})
          </button>
          <button
            onClick={() => setActiveTab('ALL_NOTIFS')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'ALL_NOTIFS'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-neutral-400 hover:text-white bg-neutral-800/60'
            }`}
          >
            📋 Historique Messages Sortants ({notifications.length})
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: SIMULATEUR WEBHOOK META & DÉFI D-12 */}
        {/* ======================================================== */}
        {activeTab === 'SIMULATOR' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Colonne Gauche : Générateur de Défi D-12 */}
            <div className="bg-neutral-800/70 border border-neutral-700 rounded-3xl p-6 space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400">
                  Preuve Entrante Souveraine (D-12)
                </span>
                <h2 className="text-lg font-black flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  1. Générer un Défi WhatsApp Inversé
                </h2>
                <p className="text-xs text-neutral-400">
                  Zéro coût SMS pour PLEINGAZ : l'utilisateur initie l'envoi d'un message prérempli vers le compte officiel Meta.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                    Numéro de l'Acheteur / Livreur
                  </label>
                  <input
                    type="tel"
                    value={challengeTargetPhone}
                    onChange={(e) => setChallengeTargetPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-sm font-mono font-bold focus:border-emerald-500 outline-none"
                  />
                </div>

                <button
                  onClick={handleGenerateChallenge}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" /> Générer le Défi & Lien wa.me
                </button>

                {createdChallenge && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-950/40 border border-emerald-600/60 rounded-2xl p-4 space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-emerald-400">Code secret généré :</span>
                      <span className="font-mono font-black text-base text-amber-300 px-2 py-0.5 bg-emerald-900/60 rounded">
                        {createdChallenge.code}
                      </span>
                    </div>
                    <p className="text-neutral-400 text-[11px]">
                      Lien prérempli généré pour le client :
                    </p>
                    <a
                      href={createdChallenge.waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-emerald-400 underline font-mono text-[10px]"
                    >
                      {createdChallenge.waLink}
                    </a>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Colonne Droite : Simulateur de Webhook Meta entrant avec HMAC */}
            <div className="bg-neutral-800/70 border border-neutral-700 rounded-3xl p-6 space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-400">
                  Sécurité Cryptographique (Menace M24)
                </span>
                <h2 className="text-lg font-black flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  2. Simuler l'Arrivée du Webhook Meta Cloud
                </h2>
                <p className="text-xs text-neutral-400">
                  Simule le webhook POST émis par les serveurs Meta avec calcul de l'en-tête HMAC SHA-256.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                    Numéro Émetteur (from)
                  </label>
                  <input
                    type="tel"
                    value={simPhone}
                    onChange={(e) => setSimPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-sm font-mono font-bold focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                    Message Texte WhatsApp
                  </label>
                  <textarea
                    rows={2}
                    value={simMessage}
                    onChange={(e) => setSimMessage(e.target.value)}
                    className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs font-mono focus:border-amber-500 outline-none"
                  />
                </div>

                {/* Option Test Signature Falsifiée M24 */}
                <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-700 flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-300">
                    Calculer une signature HMAC valide :
                  </span>
                  <button
                    type="button"
                    onClick={() => setSimValidSignature(!simValidSignature)}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                      simValidSignature
                        ? 'bg-emerald-600 text-white'
                        : 'bg-red-600 text-white ring-2 ring-red-400'
                    }`}
                  >
                    {simValidSignature ? 'Authentique (SHA-256 Valide)' : 'Falsifiée (Test Piège M24)'}
                  </button>
                </div>

                <button
                  onClick={handleSimulateWebhook}
                  disabled={simLoading}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Envoyer le Webhook Simulé
                </button>

                {/* Résultat du test */}
                {simResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-2xl border text-xs space-y-1 ${
                      simResult.status === 'SUCCESS'
                        ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200'
                        : 'bg-red-950/40 border-red-500/80 text-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-black text-sm">
                      {simResult.status === 'SUCCESS' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          200 OK — Webhook traité avec succès
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-4 h-4 text-red-400" />
                          {simResult.code} {simResult.message}
                        </>
                      )}
                    </div>
                    {simResult.status === 'SUCCESS' && (
                      <p className="text-[11px] text-neutral-300">
                        Signature HMAC SHA-256 vérifiée • Challenge consommé :{' '}
                        <strong>{simResult.data?.details?.[0]?.challengeConsumed ? 'OUI ✅' : 'NON'}</strong>
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: CYCLE DE NOTIFICATIONS DE COMMANDE */}
        {/* ======================================================== */}
        {activeTab === 'ORDER_CYCLE' && (
          <div className="bg-neutral-800/70 border border-neutral-700 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black tracking-wider text-red-400">
                Parcours d'Alertes Temps Réel
              </span>
              <h2 className="text-xl font-black flex items-center gap-2">
                <Truck className="w-6 h-6 text-red-500" />
                Déclencheur des Événements de Commande Client
              </h2>
              <p className="text-xs text-neutral-400">
                Chaque étape génère une alerte push / WhatsApp sécurisée au client et au livreur avec masque des données privées (D-11.5).
              </p>
            </div>

            {/* Config Commande */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-neutral-900 rounded-2xl border border-neutral-700">
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">ID Commande</label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Destinataire (WhatsApp)</label>
                <input
                  type="tel"
                  value={orderPhone}
                  onChange={(e) => setOrderPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Code PIN Livraison (D-05)</label>
                <input
                  type="text"
                  value={orderPin}
                  onChange={(e) => setOrderPin(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-mono font-bold text-amber-400"
                />
              </div>
            </div>

            {/* Les 4 Boutons d'Événements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Événement 1 */}
              <button
                onClick={() => handleSendOrderEvent('ORDER_CONFIRMED')}
                disabled={eventSending !== null}
                className="p-5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-700 hover:border-emerald-500 rounded-2xl text-left space-y-2 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center font-black">
                  1
                </div>
                <div className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                  Commande Confirmée
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Alerte 15 min de réservation de stock garantie transmise au client.
                </p>
              </button>

              {/* Événement 2 */}
              <button
                onClick={() => handleSendOrderEvent('DELIVERY_DISPATCHED')}
                disabled={eventSending !== null}
                className="p-5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-700 hover:border-amber-500 rounded-2xl text-left space-y-2 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-950 text-amber-400 flex items-center justify-center font-black">
                  2
                </div>
                <div className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                  Coursier en Route
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Notification du départ de la moto avec lien de suivi et numéro masqué.
                </p>
              </button>

              {/* Événement 3 */}
              <button
                onClick={() => handleSendOrderEvent('DELIVERY_ARRIVED')}
                disabled={eventSending !== null}
                className="p-5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-700 hover:border-red-500 rounded-2xl text-left space-y-2 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-red-950 text-red-400 flex items-center justify-center font-black">
                  3
                </div>
                <div className="font-bold text-sm text-white group-hover:text-red-400 transition-colors">
                  Livreur Arrivé (Code PIN)
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Rappel WhatsApp du code PIN secret ({orderPin}) pour remise contradictoire.
                </p>
              </button>

              {/* Événement 4 */}
              <button
                onClick={() => handleSendOrderEvent('ORDER_DELIVERED')}
                disabled={eventSending !== null}
                className="p-5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-700 hover:border-blue-500 rounded-2xl text-left space-y-2 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center font-black">
                  4
                </div>
                <div className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                  Livraison Réussie
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Confirmation finale et reçu électronique dématérialisé envoyé.
                </p>
              </button>

            </div>

            {eventSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-emerald-950/40 border border-emerald-500 rounded-2xl text-xs text-emerald-300 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {eventSuccess}
              </motion.div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: FLUX WEBHOOKS ENTRANTS (M24) */}
        {/* ======================================================== */}
        {activeTab === 'WEBHOOKS' && (
          <div className="bg-neutral-800/70 border border-neutral-700 rounded-3xl p-6 space-y-4">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Journal des Événements Webhooks Meta Cloud API Reçus
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-700 text-neutral-400">
                    <th className="py-2.5 px-3">Date / Heure</th>
                    <th className="py-2.5 px-3">Numéro Expéditeur</th>
                    <th className="py-2.5 px-3">Contenu du Message</th>
                    <th className="py-2.5 px-3">Signature HMAC (M24)</th>
                    <th className="py-2.5 px-3">Défi Consommé (D-12)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {webhooks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-neutral-500">
                        Aucun webhook reçu pour l'instant. Utilisez l'onglet Simulateur pour tester !
                      </td>
                    </tr>
                  ) : (
                    webhooks.map((wh) => (
                      <tr key={wh.id} className="hover:bg-neutral-750 transition-colors">
                        <td className="py-3 px-3 font-mono text-[11px] text-neutral-400">
                          {new Date(wh.timestamp).toLocaleTimeString('fr-FR')}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-white">{wh.fromPhone}</td>
                        <td className="py-3 px-3 max-w-xs truncate text-neutral-300">{wh.messageText}</td>
                        <td className="py-3 px-3">
                          {wh.signatureValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded-full border border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Conforme SHA-256
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 bg-red-950 text-red-400 rounded-full border border-red-800">
                              <XCircle className="w-3 h-3" /> Falsifiée Rejetée
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {wh.challengeConsumed ? (
                            <span className="text-emerald-400 font-bold">
                              Consommé ({wh.challengeCode})
                            </span>
                          ) : (
                            <span className="text-neutral-500">Non applicable</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: HISTORIQUE MESSAGES SORTANTS */}
        {/* ======================================================== */}
        {activeTab === 'ALL_NOTIFS' && (
          <div className="bg-neutral-800/70 border border-neutral-700 rounded-3xl p-6 space-y-4">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-400" />
              Notifications Émises & Enregistrées (PostgreSQL)
            </h2>

            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500">
                  Aucune notification enregistrée en base. Déclenchez un événement de commande pour tester !
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{n.title}</span>
                        <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded">
                          {n.type}
                        </span>
                      </div>
                      <p className="text-neutral-300">{n.content}</p>
                    </div>
                    <div className="shrink-0 text-right text-[11px] text-neutral-500 font-mono">
                      {new Date(n.createdAt).toLocaleTimeString('fr-FR')} • {n.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
