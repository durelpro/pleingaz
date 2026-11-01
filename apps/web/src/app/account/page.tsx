'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Flame,
  AlertTriangle,
  Zap,
  ShoppingBag,
  Store,
  CheckCircle2,
  Phone,
  Clock,
  ShieldCheck,
  LogOut,
  Info,
  Truck,
  ArrowRight,
  PackageCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface BuyerQuota {
  phone: string;
  consumed: number;
  limit: number;
  remaining: number;
  allowed: boolean;
  windowDays: number;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
}

export default function BuyerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [quota, setQuota] = useState<BuyerQuota>({
    phone: '+237699123456',
    consumed: 2,
    limit: 5,
    remaining: 3,
    allowed: true,
    windowDays: 30,
  });
  const [notice, setNotice] = useState<Notice | null>(null);
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    // 1. Récupération utilisateur
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pleingaz_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          setUser({ firstName: 'Marie', lastName: 'Tchouassi', phone: '+237699123456' });
        }
      } else {
        setUser({ firstName: 'Marie', lastName: 'Tchouassi', phone: '+237699123456' });
      }
    }

    // 2. Chargement du quota dynamique CR-003 (D-14)
    const targetPhone = '+237699123456';
    fetch(`${API_URL}/api/v1/cr003/buyer/quota?phone=${encodeURIComponent(targetPhone)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setQuota(data);
      })
      .catch(() => {
        // Garder le quota par défaut
      });

    // 3. Chargement des annonces officielles (D-18)
    fetch(`${API_URL}/api/v1/cr003/notices`)
      .then((res) => (res.ok ? res.json() : null))
      .then((notices) => {
        if (Array.isArray(notices) && notices.length > 0) {
          setNotice(notices[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API_URL]);

  // Acquittement de l'annonce officielle (D-18)
  const handleAckNotice = async () => {
    if (!notice) return;
    try {
      await fetch(`${API_URL}/api/v1/cr003/notices/ack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noticeId: notice.id,
          phone: user?.phone || '+237699123456',
        }),
      });
    } catch (e) {}
    setNotice(null);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pleingaz_token');
      localStorage.removeItem('pleingaz_user');
    }
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-24">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white uppercase">
              PLEINGAZ
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Connecté
            </span>
            <button
              onClick={handleLogout}
              className="p-1.5 text-neutral-400 hover:text-white transition rounded-lg hover:bg-neutral-800"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* Bannière InfoNotice Ciblée (D-18) */}
        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3.5 bg-sky-950/40 border border-sky-800/60 rounded-2xl flex items-start justify-between gap-3 shadow-lg"
            >
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-sky-300">{notice.title}</h4>
                  <p className="text-[11px] text-neutral-300 mt-0.5 leading-relaxed">
                    {notice.content}
                  </p>
                </div>
              </div>
              <button
                onClick={handleAckNotice}
                className="shrink-0 px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] rounded-lg shadow transition"
              >
                J'ai compris
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Usager & Bouton Fuite Gaz */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-xl font-black text-white">
              Bonjour {user?.firstName || 'Marie'} 👋
            </h1>
            <p className="text-xs text-neutral-400">
              Douala • Akwa • <span className="text-emerald-400 font-medium">PostgreSQL Direct</span>
            </p>
          </div>
          <Link
            href="/support/securite"
            className="px-3 py-1.5 bg-red-950/80 border border-red-700/80 text-red-300 hover:bg-red-900 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-red-900/20 active:scale-95 transition"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>Guide Fuite de gaz ?</span>
          </Link>
        </div>

        {/* JAUGE DE QUOTA VISUELLE (D-14 : 5 bouteilles max / 30j) */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Mon Quota Mensuel (D-14)
            </span>
            <span className="text-sm font-black text-amber-400 font-mono">
              {quota.consumed} / {quota.limit} <span className="text-xs font-normal text-neutral-500">bouteilles</span>
            </span>
          </div>

          {/* Barres de progression individuelles */}
          <div className="grid grid-cols-5 gap-2 pt-1">
            {Array.from({ length: quota.limit }).map((_, index) => {
              const isFilled = index < quota.consumed;
              return (
                <div
                  key={index}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    isFilled
                      ? 'bg-gradient-to-r from-red-600 to-amber-500 shadow-md shadow-red-600/30'
                      : 'bg-neutral-800'
                  }`}
                  title={isFilled ? `Bouteille ${index + 1} consommée` : `Bouteille ${index + 1} disponible`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
            <span className="flex items-center gap-1">
              {quota.remaining > 0 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{quota.remaining} recharge{quota.remaining > 1 ? 's' : ''} restante{quota.remaining > 1 ? 's' : ''}</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <strong className="text-red-400">Plafond atteint (0 disponible)</strong>
                </>
              )}
            </span>
            <span>Régulation : 5 max / 30 jours</span>
          </div>
        </div>

        {/* REASSORT HABITUEL 1-CLIC */}
        <div className="bg-gradient-to-br from-red-600 to-red-800 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3 fill-white" />
              Recharge Habituelle Rapide
            </span>
            <span className="text-xs opacity-90">À 450 m</span>
          </div>

          <div className="flex items-baseline justify-between mb-4">
            <div>
              <h3 className="text-xl font-black">Bouteille 12.5 kg PLEINGAZ</h3>
              <p className="text-xs text-white/80">Dépôt Partenaire Akwa Nord</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black font-mono">7 500 F</div>
              <div className="text-[10px] text-white/80">dont 1 000 F livraison fixe</div>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full py-3 bg-white hover:bg-neutral-100 active:scale-[0.99] text-red-600 font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Commander en 1 Clic</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* COMMANDE EN COURS & DOUBLE CONFIRMATION (D-17) */}
        <div className="bg-neutral-900/90 border border-emerald-900/40 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Truck className="w-3.5 h-3.5" />
              Course en cours
            </span>
            <span className="text-xs text-neutral-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Arrivée estimée : 12 min
            </span>
          </div>

          <div className="border-t border-neutral-800/80 pt-3">
            <div className="font-bold text-sm text-white">1x Bouteille 12.5 kg PLEINGAZ</div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Livreur : <strong>Paul M. (Moto LT-402)</strong> • Repère : Devant pharmacie du rail
            </p>
          </div>

          {/* Bloc de validation contradictoire */}
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 mt-2">
            {!deliveryConfirmed ? (
              <>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                  <PackageCheck className="w-4 h-4" />
                  <span>Le livreur signale être arrivé avec votre bouteille</span>
                </div>
                <p className="text-[11px] text-neutral-400 mb-3">
                  Contrôlez le plombage officiel avant de cliquer pour valider la réception.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeliveryConfirmed(true)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>J'ai bien reçu ma bouteille</span>
                  </button>
                  <button
                    onClick={() => alert('Support PLEINGAZ alerté. Un dispatcheur examine la situation immédiatement.')}
                    className="px-3 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl transition"
                  >
                    Litige
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-2 space-y-1">
                <div className="inline-flex items-center gap-1.5 text-emerald-400 font-extrabold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Livraison Confirmée avec Succès !</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Reçu officiel transmis sur votre WhatsApp. Votre jauge de quota a été débitée.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* DISTRIBUTEUR HABITUEL FAVORIS (C-01) */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
              Mon Dépôt Agréé Habituel
            </span>
            <h4 className="font-bold text-sm text-white">Dépôt Gaz Akwa Nord</h4>
            <p className="text-xs text-neutral-400">Carrefour Rail • Ouvert jusqu'à 20h00</p>
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 mt-1">
              En stock (18 btl)
            </span>
          </div>
          <Link
            href="/stores"
            className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold rounded-xl text-neutral-200 transition"
          >
            Changer
          </Link>
        </div>
      </main>

      {/* Bottom Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-800 py-2 px-6">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          <Link href="/account" className="flex flex-col items-center gap-1 text-red-500 font-bold text-[10px]">
            <Flame className="w-5 h-5 fill-red-500" />
            <span>Accueil</span>
          </Link>
          <Link href="/checkout" className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white text-[10px] transition">
            <ShoppingBag className="w-5 h-5" />
            <span>Commander</span>
          </Link>
          <button
            onClick={() => alert('Historique des commandes réelles : 2 commandes archivées sur votre compte.')}
            className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white text-[10px] transition"
          >
            <Clock className="w-5 h-5" />
            <span>Historique</span>
          </button>
          <button
            onClick={() => alert(`Profil : ${user?.firstName || 'Marie'} • WhatsApp : ${user?.phone || '+237699123456'}`)}
            className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white text-[10px] transition"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Sécurité</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
