'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Award, Gift, Sparkles, ShoppingBag, MapPin, ArrowRight, ShieldCheck, LogOut, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('pleingaz_user');
    const token = localStorage.getItem('pleingaz_token');

    if (!token && !storedUser) {
      // Démo : charger un profil invité ou rediriger
      setUser({
        firstName: 'Client',
        lastName: 'Privilégié',
        phone: '+237690000000',
        loyaltyPoints: 100,
      });
      setLoading(false);
      return;
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser({ firstName: 'Client', loyaltyPoints: 100 });
      }
    }

    // Tenter de rafraîchir depuis l'API /auth/me
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    if (token) {
      fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setUser({
              ...data,
              firstName: data.customerProfile?.firstName || data.phone,
              lastName: data.customerProfile?.lastName || '',
              loyaltyPoints: data.customerProfile?.loyaltyPoints ?? 100,
            });
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('pleingaz_token');
    localStorage.removeItem('pleingaz_user');
    router.push('/');
  };

  const points = user?.loyaltyPoints ?? 100;
  const fcfaEquiv = points * 10; // 100 pts = 1 000 FCFA

  return (
    <div className="min-h-screen bg-neutral-950 text-white py-12 px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-96 bg-orange-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-orange-500/30">
              {user?.firstName?.[0] || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  Bonjour, {user?.firstName || 'Client'} {user?.lastName || ''}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold uppercase tracking-wider">
                  Membre Vérifié
                </span>
              </div>
              <p className="text-neutral-400 text-sm mt-0.5">{user?.phone || '+237 6XX XX XX XX'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <Link
              href="/search"
              className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm shadow-md hover:shadow-orange-500/40 hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <Flame size={16} />
              Commander du gaz
            </Link>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl border border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
              title="Déconnexion"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Loyalty Rewards Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 : Points Balance */}
          <motion.div
            whileHover={{ y: -4 }}
            className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-orange-950/60 via-neutral-900/80 to-neutral-950 border border-orange-500/30 shadow-2xl relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles size={160} />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                  <Award size={16} />
                  Cagnotte de Fidélité PLEINGAZ
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  Actif
                </span>
              </div>

              <div>
                <div className="text-5xl sm:text-6xl font-black text-white tracking-tight flex items-baseline gap-2">
                  {points}
                  <span className="text-2xl font-bold text-orange-400">pts</span>
                </div>
                <p className="text-sm text-neutral-300 mt-2 font-medium">
                  Soit <strong className="text-white text-base">{fcfaEquiv.toLocaleString()} FCFA</strong> utilisables dès votre prochaine recharge en livraison à domicile !
                </p>
              </div>

              {/* Progress bar towards next VIP tier */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-neutral-400 font-semibold">
                  <span>Niveau actuel : Bronze</span>
                  <span>Prochain palier : Argent (200 pts)</span>
                </div>
                <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((points / 200) * 100, 100)}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>+20 points cumulés par bouteille 12.5kg commandée</span>
              </div>
              <Link href="/checkout" className="text-orange-400 font-bold hover:underline flex items-center gap-1">
                Utiliser mes points <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>

          {/* Card 2 : VIP Benefits */}
          <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Gift className="text-orange-400" size={20} />
                Vos Privilèges
              </h3>
              <p className="text-xs text-neutral-400 mt-1">Avantages réservés aux clients PLEINGAZ :</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-0.5">
                <p className="font-bold text-orange-300">🔥 Prix officiel garanti</p>
                <p className="text-neutral-400">6 500 FCFA la recharge 12.5kg, sans surfacturation illégale.</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-0.5">
                <p className="font-bold text-orange-300">⚡ Réservation 15 min</p>
                <p className="text-neutral-400">Votre bouteille est physiquement bloquée le temps du retrait.</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-0.5">
                <p className="font-bold text-orange-300">🛡️ Code Secret SHA-256</p>
                <p className="text-neutral-400">Sécurité maximale lors de la livraison à domicile.</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/stores"
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <MapPin size={14} />
                Voir les dépôts agréés
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Action Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-600 to-red-600 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white">Besoin d'une recharge maintenant ?</h3>
            <p className="text-orange-100 text-sm max-w-xl">
              Détectez immédiatement les points de vente ayant du stock optimal vérifié dans votre quartier.
            </p>
          </div>
          <Link
            href="/search"
            className="px-8 py-3.5 rounded-2xl bg-white text-neutral-900 font-extrabold shadow-lg hover:scale-105 active:scale-95 transition-all text-sm shrink-0"
          >
            Recherche de Gaz Immédiate
          </Link>
        </div>
      </div>
    </div>
  );
}
