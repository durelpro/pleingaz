'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Phone,
  Lock,
  User,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  MessageCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function AcheteurInscriptionPage() {
  const router = useRouter();

  // Étape courante (1 à 4)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Données du formulaire
  const [phone, setPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('Douala');
  const [neighborhood, setNeighborhood] = useState('');
  const [landmark, setLandmark] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // État du défi WhatsApp
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [challengeCode, setChallengeCode] = useState<string | null>(null);
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);
  const [officialNumber, setOfficialNumber] = useState<string>('+237699000000');
  const [isPolling, setIsPolling] = useState(false);
  const [verified, setVerified] = useState(false);

  // État UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formatage helper pour le Cameroun
  const normalizeCameroonPhone = (raw: string) => {
    let p = raw.trim().replace(/\s+/g, '');
    if (p.startsWith('6') && p.length === 9) {
      return '+237' + p;
    }
    if (p.startsWith('237') && p.length === 12) {
      return '+' + p;
    }
    return p;
  };

  // 1. Démarrage de l'inscription (Génération du défi WhatsApp)
  const handleStartChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const clean = normalizeCameroonPhone(phone);
      if (!clean.startsWith('+237') || clean.length < 13) {
        throw new Error('Veuillez entrer un numéro camerounais valide (+237 6...)');
      }

      const res = await fetch('http://localhost:3001/api/v1/buyer/auth/register/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: clean }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Impossible de générer le défi WhatsApp.');
      }

      setChallengeId(data.challengeId);
      setChallengeCode(data.code);
      setWhatsappLink(data.whatsappLink);
      if (data.officialNumber) setOfficialNumber(data.officialNumber);

      setStep(2);
      setIsPolling(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Polling automatique de l'état du défi
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPolling && challengeId && step === 2 && !verified) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(
            `http://localhost:3001/api/v1/buyer/auth/challenges/${challengeId}/status`,
            { credentials: 'include' }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'VERIFIED') {
              setVerified(true);
              setIsPolling(false);
              // Passer directement à l'étape suivante après un court délai visuel
              setTimeout(() => {
                setStep(3);
              }, 1200);
            }
          }
        } catch {
          // Ignorer les erreurs temporaires de polling
        }
      }, 2500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPolling, challengeId, step, verified]);

  // Simulation locale en dev si bouton cliqué
  const handleSimulateInboundProof = async () => {
    if (!challengeCode) return;
    try {
      setLoading(true);
      const clean = normalizeCameroonPhone(phone);
      const res = await fetch('http://localhost:3001/api/v1/dev/whatsapp/simulate-inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: clean,
          text: `Code PLEINGAZ : ${challengeCode}`,
        }),
      });
      if (res.ok) {
        setVerified(true);
        setIsPolling(false);
        setTimeout(() => setStep(3), 800);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Validation des coordonnées (Étape 3 -> Étape 4)
  const handleProceedToPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPrimary = normalizeCameroonPhone(phone);
    const cleanSecondary = normalizeCameroonPhone(secondaryPhone);

    if (cleanPrimary === cleanSecondary) {
      setError('Le numéro d\'appel vocal secondaire doit être STRICTEMENT différent du numéro WhatsApp (exigence D-12.3).');
      return;
    }

    if (!cleanSecondary.startsWith('+237') || cleanSecondary.length < 13) {
      setError('Veuillez entrer un numéro secondaire camerounais valide (+237 6...).');
      return;
    }

    setStep(4);
  };

  // 4. Finalisation de la création de compte
  const handleFinalizeRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Le mot de passe doit comporter au moins 8 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      const cleanPrimary = normalizeCameroonPhone(phone);
      const cleanSecondary = normalizeCameroonPhone(secondaryPhone);

      const res = await fetch('http://localhost:3001/api/v1/buyer/auth/register/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          challengeId,
          phone: cleanPrimary,
          secondaryPhone: cleanSecondary,
          password,
          firstName,
          lastName,
          city,
          neighborhood,
          landmark,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Échec de la finalisation de l\'inscription.');
      }

      if (data.accessToken) {
        localStorage.setItem('pleingaz_buyer_token', data.accessToken);
        localStorage.setItem('pleingaz_buyer_profile', JSON.stringify(data.user || {}));
      }

      // Redirection immédiate vers l'espace acheteur
      router.push('/acheteur');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la création de votre compte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between p-4 sm:p-8">
      {/* En-tête */}
      <header className="max-w-lg mx-auto w-full flex items-center justify-between py-4 border-b border-neutral-800">
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
          href="/acheteur/connexion"
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>Déjà inscrit ?</span>
          <span className="text-red-400 font-semibold">Connexion</span>
        </Link>
      </header>

      {/* Assistant d'inscription */}
      <main className="max-w-lg mx-auto w-full my-auto py-8">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-neutral-800">
          {/* Indicateur d'étapes */}
          <div className="flex items-center justify-between mb-8">
            {[
              { num: 1, label: 'Ligne' },
              { num: 2, label: 'Preuve' },
              { num: 3, label: 'Profil' },
              { num: 4, label: 'Sécurité' },
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step === s.num
                      ? 'bg-red-600 text-white ring-4 ring-red-600/20'
                      : step > s.num
                      ? 'bg-green-600 text-white'
                      : 'bg-neutral-800 text-neutral-500'
                  }`}
                >
                  {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 font-medium">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ÉTAPE 1 : Numéro WhatsApp */}
          {step === 1 && (
            <div>
              <div className="text-center mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Rejoignez PLEINGAZ Acheteur
                </h1>
                <p className="text-xs text-neutral-400">
                  Inscription 100% gratuite garantie par vérification WhatsApp entrante.
                </p>
              </div>

              <form onSubmit={handleStartChallenge} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Votre numéro WhatsApp principal
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="+237 699 00 00 00"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Un lien prérempli gratuit vous permettra de prouver la ligne sans aucun SMS payant.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="tap-target w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors mt-6 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Génération du défi...</span>
                    </>
                  ) : (
                    <>
                      <span>Continuer vers la vérification</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ÉTAPE 2 : Défi entrant WhatsApp */}
          {step === 2 && (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-600/10 text-green-500 flex items-center justify-center mx-auto mb-4 border border-green-600/20">
                <MessageCircle className="w-6 h-6" />
              </div>

              <h2 className="text-xl font-bold text-white mb-2">
                Prouvez votre numéro WhatsApp
              </h2>
              <p className="text-xs text-neutral-400 mb-6">
                Cliquez ci-dessous pour envoyer le code prérempli au numéro officiel PLEINGAZ.
              </p>

              {/* Encadré Code */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-6">
                <span className="text-[11px] text-neutral-500 uppercase tracking-wider block mb-1">
                  Votre code unique de vérification
                </span>
                <span className="text-2xl font-mono font-extrabold text-amber-400 tracking-widest">
                  {challengeCode}
                </span>
                <span className="text-[11px] text-neutral-500 block mt-1">
                  Expéditeur attendu : {phone}
                </span>
              </div>

              {/* Bouton Click-to-Chat WhatsApp */}
              <a
                href={whatsappLink || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target w-full rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 mb-4"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Ouvrir WhatsApp & Envoyer le code</span>
              </a>

              {/* Indicateur de détection automatique */}
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center gap-3 text-xs text-neutral-300">
                {verified ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-semibold">
                      Ligne vérifiée ! Redirection...
                    </span>
                  </>
                ) : (
                  <>
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>En attente de réception du message WhatsApp...</span>
                  </>
                )}
              </div>

              {/* Bouton de simulation Dev (Environnement local) */}
              <div className="mt-6 pt-4 border-t border-neutral-800/60">
                <button
                  type="button"
                  onClick={handleSimulateInboundProof}
                  disabled={loading || verified}
                  className="text-[11px] text-neutral-400 hover:text-amber-400 transition-colors underline"
                >
                  [Dev] Simuler la réception instantanée de la preuve
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : Profil et 2e Numéro obligatoire D-12.3 */}
          {step === 3 && (
            <div>
              <div className="text-center mb-6">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-600/10 text-green-400 mb-2 border border-green-600/20">
                  Ligne {phone} vérifiée ✓
                </span>
                <h2 className="text-xl font-bold text-white mb-1">
                  Vos Coordonnées de Livraison
                </h2>
                <p className="text-xs text-neutral-400">
                  Ces informations permettent au livreur de vous déposer la bouteille sans encombre.
                </p>
              </div>

              <form onSubmit={handleProceedToPassword} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Prénom
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Samuel"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Eto'o"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Numéro d'appel vocal secondaire (Obligatoire D-12.3)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+237 677 00 00 00"
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
                  />
                  <p className="text-[11px] text-amber-400/90 mt-1">
                    Exigence vitale : doit être distinct de votre WhatsApp pour vous joindre en cas de coupure internet.
                  </p>
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
                      placeholder="Bonapriso"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Repère précis (Facultatif mais recommandé)
                  </label>
                  <input
                    type="text"
                    placeholder="Face pharmacie du rond-point, portail noir"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="tap-target w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors mt-6 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                >
                  <span>Étape suivante : Mot de passe</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* ÉTAPE 4 : Mot de passe et finalisation */}
          {step === 4 && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-1">
                  Sécurisez Votre Compte
                </h2>
                <p className="text-xs text-neutral-400">
                  Définissez votre mot de passe pour vous connecter facilement lors de vos prochaines visites.
                </p>
              </div>

              <form onSubmit={handleFinalizeRegistration} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Mot de passe (8 caractères minimum)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Confirmez le mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Vos avantages acheteur PLEINGAZ :</span>
                  </div>
                  <p>• Recharge 12.5 kg au tarif officiel réglementé de 6 500 FCFA</p>
                  <p>• Suivi en direct de votre jauge légale (5 bouteilles max / 30 jours)</p>
                  <p>• Commande express 1-clic avec distributeur habituel</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="tap-target w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors mt-6 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Création de votre compte...</span>
                    </>
                  ) : (
                    <>
                      <span>Valider & Accéder à mon espace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Pied de page */}
      <footer className="max-w-lg mx-auto w-full py-4 text-center text-[11px] text-neutral-500 border-t border-neutral-900">
        © 2026 PLEINGAZ Cameroun • Données protégées et auditées en temps réel
      </footer>
    </div>
  );
}
