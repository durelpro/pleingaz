'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Sparkles, Gift, Phone, User, MapPin, Lock, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    phone: '',
    firstName: '',
    lastName: '',
    password: '',
    city: 'Douala',
    neighborhood: '',
    landmark: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.phone.trim()) {
      setError('Veuillez renseigner un numéro de téléphone.');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'inscription.");
      }

      // Enregistrer le token et l'utilisateur dans localStorage
      if (data.accessToken) {
        localStorage.setItem('pleingaz_token', data.accessToken);
        localStorage.setItem('pleingaz_user', JSON.stringify(data.user));
      }

      router.push('/account');
    } catch (err: any) {
      setError(err.message || 'Impossible de créer le compte. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4 relative overflow-hidden py-12">
      {/* Background Animated Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-orange-600/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl bg-white/5 backdrop-blur-2xl border border-white/10 p-6 sm:p-10 rounded-3xl shadow-2xl relative z-10"
      >
        {/* Header & Loyalty Incentive */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold tracking-wide uppercase">
            <Sparkles size={14} className="animate-spin" />
            100 Points Fidélité Offerts
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Créer mon compte <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">PLEINGAZ</span>
          </h1>

          <p className="text-sm text-neutral-400 max-w-md mx-auto">
            Rechargez votre gaz en toute tranquillité, cumulez des points sur chaque commande et bénéficiez de réductions exclusives.
          </p>
        </div>

        {/* Benefits Card */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-orange-950/40 to-red-950/40 border border-orange-800/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/30">
            <Gift size={24} />
          </div>
          <div className="text-xs space-y-0.5">
            <h4 className="font-bold text-white text-sm">Avantage immédiat de bienvenue :</h4>
            <p className="text-orange-200/90">
              <strong>100 points</strong> crédités immédiatement pour débloquer votre première réduction sur livraison.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <User size={14} className="text-orange-400" />
                Prénom
              </label>
              <input
                type="text"
                placeholder="Ex: Jean"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-white placeholder-neutral-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <User size={14} className="text-orange-400" />
                Nom de famille
              </label>
              <input
                type="text"
                placeholder="Ex: Kamga"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-white placeholder-neutral-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Phone size={14} className="text-orange-400" />
              Numéro de téléphone / WhatsApp <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="Ex: 699112233 ou +237699112233"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-white placeholder-neutral-600 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <MapPin size={14} className="text-orange-400" />
                Ville
              </label>
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-white"
              >
                <option value="Douala">Douala</option>
                <option value="Yaoundé">Yaoundé</option>
                <option value="Bafoussam">Bafoussam</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <MapPin size={14} className="text-orange-400" />
                Quartier
              </label>
              <input
                type="text"
                placeholder="Ex: Akwa, Bastos..."
                value={form.neighborhood}
                onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-white placeholder-neutral-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <MapPin size={14} className="text-orange-400" />
              Repère familier pour la livraison
            </label>
            <input
              type="text"
              placeholder="Ex: Face Boulangerie Saker, Barrière verte"
              value={form.landmark}
              onChange={(e) => setForm({ ...form, landmark: e.target.value })}
              className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-white placeholder-neutral-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Lock size={14} className="text-orange-400" />
              Mot de passe
            </label>
            <input
              type="password"
              placeholder="Créez un mot de passe sécurisé"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-white placeholder-neutral-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-6 py-4 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 ${
              loading ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                Recevoir mes 100 points et créer mon compte
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-neutral-400 space-y-2">
          <p>
            Vous avez déjà un compte ?{' '}
            <Link href="/checkout" className="text-orange-400 font-bold hover:underline">
              Commander directement
            </Link>
          </p>
          <div className="flex items-center justify-center gap-2 text-neutral-500">
            <ShieldCheck size={14} />
            <span>Données confidentielles protégées par PLEINGAZ Cameroun</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
