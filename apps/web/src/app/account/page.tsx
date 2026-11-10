'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Award, ShoppingBag, MapPin, ArrowRight, ShieldCheck, LogOut, CheckCircle2, AlertOctagon, RefreshCw, PhoneCall } from 'lucide-react';
import Link from 'next/link';
import { InfoNoticesDrawer } from '@/components/common/InfoNoticesDrawer';
import { QuotaGauge, InfoNoticeBanner } from '@/components/cr003';

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
  const [quota, setQuota] = useState<{
    usedCount: number;
    remainingCount: number;
    limit: number;
    earliestReleaseDate: string | null;
  }>({
    usedCount: 1,
    remainingCount: 4,
    limit: 5,
    earliestReleaseDate: null,
  });
  const [notice, setNotice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleLogout = () => {
    localStorage.removeItem('pleingaz_token');
    localStorage.removeItem('pleingaz_user');
    router.push('/login');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('pleingaz_user');
    const token = localStorage.getItem('pleingaz_token');

    if (!token && !storedUser) {
      setUser({
        firstName: 'Paul',
        lastName: 'Kamga',
        phone: '+237699112233',
        whatsappPhone: '+237699112233',
        loyaltyPoints: 100,
      });
      setLoading(false);
      return;
    }

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        // Interroger l'API pour récupérer le quota exact sur 30 jours
        fetch(`${apiUrl}/api/v1/counter-sales/check-quota`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerPhone: parsed.whatsappPhone || parsed.phone }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((q) => {
            if (q) setQuota(q);
          })
          .catch(() => {});
      } catch (e) {
        setUser({ firstName: 'Acheteur', loyaltyPoints: 100 });
      }
    }

    if (token) {
      fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .catch(() => {
        // Garder le quota par défaut
      });
    }

    // 3. Chargement des annonces officielles (D-18)
    fetch(`${apiUrl}/api/v1/cr003/notices`)
      .then((res) => (res.ok ? res.json() : null))
      .then((notices) => {
        if (Array.isArray(notices) && notices.length > 0) {
          setNotice(notices[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiUrl]);

  // Acquittement de l'annonce officielle (D-18)
  const handleAckNotice = async () => {
    if (!notice) return;
    try {
      await fetch(`${apiUrl}/api/v1/cr003/notices/ack`, {
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

  const points = user?.loyaltyPoints ?? 100;
  const quotaPercent = Math.min(100, (quota.usedCount / quota.limit) * 100);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-16">
      {/* Top Bar avec Logo & Tiroir Infos */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xl shadow-sm">
              PG
            </span>
            <span className="font-extrabold text-xl tracking-tight text-gray-900">
              PLEINGAZ <span className="text-red-600 text-xs uppercase font-bold px-2 py-0.5 rounded bg-red-50 border border-red-200">Acheteur</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Composant transversal Infos & Annonces (ADR D18) */}
            <InfoNoticesDrawer role="CUSTOMER" city="Douala" />

            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors"
              title="Déconnexion"
              aria-label="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Bandeau d'Annonce Officielle Horodatée (ADR D18) */}
        {notice && (
          <InfoNoticeBanner
            id={notice.id}
            title={notice.title}
            content={notice.content}
            category={notice.category || 'INFO'}
            requiresAck={true}
            onAck={handleAckNotice}
          />
        )}

        {/* Encart Salutation & Jauge de Quota (ADR D14) */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                Bonjour, {user?.firstName || 'Paul'} !
              </h1>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                {user?.whatsappPhone || user?.phone || '+237 699 11 22 33'} • Compte Vérifié
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full flex items-center gap-1">
                <CheckCircle2 size={14} />
                Fidélité : {points} pts ({(points * 10).toLocaleString()} F)
              </span>
            </div>
          </div>

          {/* Jauge Visuelle de Quota 5 Bouteilles / 30 Jours Officielle (D-14) */}
          <QuotaGauge
            consumed={quota.usedCount}
            limit={quota.limit}
            remaining={quota.remainingCount}
            phone={user?.whatsappPhone || user?.phone}
            onOrderClick={() => router.push('/search')}
          />
        </section>

        {/* Bouton Proéminent "J'ai besoin de gaz maintenant" (D-14) */}
        <section>
          <Link
            href="/search"
            className="w-full py-5 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-lg shadow-lg shadow-red-600/25 flex items-center justify-center space-x-3 transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <Flame className="w-7 h-7 text-amber-300 animate-pulse" />
            <span>J&apos;AI BESOIN DE GAZ MAINTENANT</span>
            <ArrowRight className="w-6 h-6" />
          </Link>
        </section>

        {/* Raccourci Réassort 1-Clic & Mes Distributeurs Habituels (C-01) */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag size={18} className="text-red-600" />
              Mes Distributeurs Habituels & Réassort Rapide
            </h2>
          </div>

          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-gray-900">Dépôt Officiel Akwa Nord</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  Stock BON (confirmé il y a 1h)
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Dernière commande : 1 x Bouteille 12.5kg (6 500 FCFA) • Total 4 commandes sur 12 mois
              </p>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Link
                href="/checkout?repeat=last"
                className="py-2.5 px-4 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
              >
                <RefreshCw size={14} />
                <span>Recommander en 1 clic</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Bouton d'Urgence Fuite de Gaz (ADR D14) */}
        <section className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertOctagon size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-900">Urgence : Odeur ou fuite suspectée ?</h3>
              <p className="text-xs text-red-700">Fermez le détendeur et appelez immédiatement l&apos;assistance.</p>
            </div>
          </div>

          <a
            href="tel:+237699000000"
            className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg flex items-center space-x-1 transition-colors shadow-xs shrink-0"
          >
            <PhoneCall size={14} />
            <span>Appel d&apos;urgence</span>
          </a>
        </section>
      </main>
    </div>
  );
}
