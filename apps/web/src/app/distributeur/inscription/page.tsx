'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Store, Phone, MapPin, CheckCircle2, ArrowLeft, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function DistributeurInscriptionPage() {
  const [storeName, setStoreName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [phone, setPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [city, setCity] = useState('Douala');
  const [neighborhood, setNeighborhood] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (phone === secondaryPhone) {
      setError('Le numéro d\'appel vocal secondaire doit être différent du numéro WhatsApp.');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between p-4 sm:p-8">
      <header className="max-w-md mx-auto w-full flex items-center justify-between py-4 border-b border-neutral-800">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Image
            src="/logoprincipal.png"
            alt="Logo PLEINGAZ"
            width={130}
            height={38}
            className="h-9 w-auto object-contain"
          />
        </Link>
        <Link
          href="/distributeur/connexion"
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Connexion</span>
        </Link>
      </header>

      <main className="max-w-md mx-auto w-full my-auto py-8">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-neutral-800">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              Agrément Point de Vente
            </h1>
            <p className="text-xs text-neutral-400">
              Déposez votre candidature pour devenir distributeur officiel de bouteilles PLEINGAZ.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-600/10 text-green-400 flex items-center justify-center mx-auto mb-4 border border-green-600/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-semibold text-white mb-2">
                Dossier transmis avec succès
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                Notre équipe logistique examinera l'emplacement de votre point de vente ({storeName} à {neighborhood}) et vous contactera sous 48h.
              </p>
              <Link
                href="/espace-pro"
                className="tap-target w-full rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>Retour à l'espace professionnel</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Nom du point de vente
                </label>
                <input
                  type="text"
                  required
                  placeholder="Dépôt Gaz La Grâce"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Nom et prénom du gérant
                </label>
                <input
                  type="text"
                  required
                  placeholder="Jean Dupont"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    WhatsApp gérant
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+237 6..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Appel vocal
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+237 6..."
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Ville
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
                  >
                    <option value="Douala">Douala</option>
                    <option value="Yaoundé">Yaoundé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Quartier
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Akwa"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="tap-target w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors mt-6 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmission...</span>
                  </>
                ) : (
                  <>
                    <span>Soumettre ma candidature</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="max-w-md mx-auto w-full py-4 text-center text-[11px] text-neutral-500 border-t border-neutral-900">
        © 2026 PLEINGAZ Cameroun • Réseau de distribution homologué
      </footer>
    </div>
  );
}
