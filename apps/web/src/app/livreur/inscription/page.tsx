'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Truck, Phone, CheckCircle2, ArrowLeft, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function LivreurInscriptionPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('MOTO');
  const [city, setCity] = useState('Douala');
  const [zone, setZone] = useState('');
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
          href="/livreur/connexion"
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
              Devenir Livreur Partenaire
            </h1>
            <p className="text-xs text-neutral-400">
              Rejoignez le réseau logistique urbain de distribution de bouteilles PLEINGAZ.
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
                Candidature enregistrée
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                Merci {fullName}. Nos superviseurs logistiques de la zone {zone || city} vont vérifier vos documents de transport et vous contacter sous 24h.
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
                  Nom et prénom complet
                </label>
                <input
                  type="text"
                  required
                  placeholder="Paul Mbianda"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    WhatsApp principal
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+237 6..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Appel vocal (secours)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+237 6..."
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Véhicule
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="MOTO">Moto adaptée</option>
                    <option value="TRICYCLE">Tricycle utilitaire</option>
                    <option value="FOURGON">Camionnette / Fourgon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Ville principale
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="Douala">Douala</option>
                    <option value="Yaoundé">Yaoundé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Secteur / Quartiers de prédilection
                </label>
                <input
                  type="text"
                  required
                  placeholder="Deido, Bali, Bonanjo"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="tap-target w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-sm transition-colors mt-6 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                    <span>Envoi du dossier...</span>
                  </>
                ) : (
                  <>
                    <span>Envoyer ma candidature</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="max-w-md mx-auto w-full py-4 text-center text-[11px] text-neutral-500 border-t border-neutral-900">
        © 2026 PLEINGAZ Cameroun • Réseau logistique certifié
      </footer>
    </div>
  );
}
