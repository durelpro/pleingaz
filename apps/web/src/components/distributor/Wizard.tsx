'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, MapPin, FileText, CheckCircle, Upload, AlertCircle, X, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('../map/MapPicker'), {
  ssr: false,
  loading: () => <div className="h-64 bg-skeleton-base animate-pulse rounded-2xl" />,
});

const steps = [
  { id: 1, title: 'Identité', icon: Store },
  { id: 2, title: 'Localisation', icon: MapPin },
  { id: 3, title: 'Documents KYC', icon: FileText },
];

export default function DistributorWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    businessName: '',
    whatsappNumber: '',
    city: 'Douala',
    neighborhood: '',
    landmark: '',
    latitude: 4.0511,
    longitude: 9.7085,
  });

  const [files, setFiles] = useState<{
    idCardFront: File | null;
    idCardBack: File | null;
    portraitPhoto: File | null;
    shopPhoto: File | null;
  }>({
    idCardFront: null,
    idCardBack: null,
    portraitPhoto: null,
    shopPhoto: null,
  });

  const [previews, setPreviews] = useState<{
    idCardFront: string | null;
    idCardBack: string | null;
    portraitPhoto: string | null;
    shopPhoto: string | null;
  }>({
    idCardFront: null,
    idCardBack: null,
    portraitPhoto: null,
    shopPhoto: null,
  });

  const fileInputRefs = {
    idCardFront: useRef<HTMLInputElement>(null),
    idCardBack: useRef<HTMLInputElement>(null),
    portraitPhoto: useRef<HTMLInputElement>(null),
    shopPhoto: useRef<HTMLInputElement>(null),
  };

  const handleFileSelect = (key: keyof typeof files, selectedFile: File | null) => {
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError(`Le fichier dépasse la limite maximale de 5 Mo.`);
      return;
    }
    setError(null);

    setFiles((prev) => ({ ...prev, [key]: selectedFile }));

    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviews((prev) => ({ ...prev, [key]: url }));
    } else {
      setPreviews((prev) => ({ ...prev, [key]: 'pdf' }));
    }
  };

  const removeFile = (key: keyof typeof files) => {
    setFiles((prev) => ({ ...prev, [key]: null }));
    setPreviews((prev) => ({ ...prev, [key]: null }));
    if (fileInputRefs[key].current) {
      fileInputRefs[key].current!.value = '';
    }
  };

  const nextStep = () => {
    setError(null);
    if (currentStep === 1) {
      if (!formData.businessName.trim() || !formData.whatsappNumber.trim()) {
        setError('Le nom de la boutique et le numéro WhatsApp sont obligatoires.');
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.city.trim() || !formData.neighborhood.trim()) {
        setError('La ville et le quartier sont obligatoires.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const payload = new FormData();
      payload.append('businessName', formData.businessName);
      payload.append('whatsappNumber', formData.whatsappNumber);
      payload.append('city', formData.city);
      payload.append('neighborhood', formData.neighborhood);
      if (formData.landmark) payload.append('landmark', formData.landmark);
      payload.append('latitude', String(formData.latitude));
      payload.append('longitude', String(formData.longitude));

      // Les documents sont optionnels à l'inscription initiale (téléversement possible ultérieurement)
      if (files.idCardFront) payload.append('idCardFront', files.idCardFront);
      if (files.idCardBack) payload.append('idCardBack', files.idCardBack);
      if (files.portraitPhoto) payload.append('portraitPhoto', files.portraitPhoto);
      if (files.shopPhoto) payload.append('shopPhoto', files.shopPhoto);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/distributor/public-apply`, {
        method: 'POST',
        body: payload,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de la transmission du dossier.');
      }

      // Sauvegarde du token pour accès direct et fluide
      if (data.accessToken) {
        localStorage.setItem('auth_token', data.accessToken);
        localStorage.setItem('user_role', 'DISTRIBUTOR');
        localStorage.setItem('distributor_phone', formData.whatsappNumber);
        if (data.store) {
          localStorage.setItem('distributor_store', JSON.stringify(data.store));
        }
      }

      setSuccessData(data);
    } catch (err: any) {
      setError(err.message || 'Impossible de soumettre le dossier. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-auto p-8 bg-neutral-900 rounded-3xl shadow-2xl border-2 border-[#E51A24]/40 text-center space-y-6 text-white"
      >
        <div className="w-20 h-20 bg-[#E51A24]/20 text-[#E51A24] mx-auto rounded-full flex items-center justify-center shadow-lg shadow-[#E51A24]/30 border border-[#E51A24]/30">
          <CheckCircle size={44} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white">Boutique Créée avec Succès !</h2>
          <p className="text-neutral-300 max-w-lg mx-auto">
            Félicitations ! Votre point de vente <strong className="text-[#E51A24]">{successData.businessName}</strong> est enregistré dans le réseau PLEINGAZ.
          </p>
        </div>

        <div className="p-5 bg-neutral-950/80 rounded-2xl border border-white/10 text-sm space-y-2 text-left">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <AlertCircle size={18} />
            <span>Mode Privé Actif (Règle de Sécurité R5)</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Votre espace distributeur est immédiatement accessible pour gérer votre stock et vos livreurs. Pour activer votre visibilité sur la carte publique auprès des clients, l'administrateur validera vos pièces justificatives.
          </p>
          {successData.documentsCount > 0 ? (
            <p className="text-xs text-emerald-400 font-semibold">
              ✓ {successData.documentsCount} document(s) KYC transmis pour révision.
            </p>
          ) : (
            <p className="text-xs text-amber-300/90 font-medium">
              ℹ️ Aucun document téléversé pour l'instant. Vous pourrez les ajouter depuis votre espace à tout moment.
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <a
            href="/distributor/inventory"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#E51A24] to-[#b30d15] text-white font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#E51A24]/40 flex items-center justify-center gap-2"
          >
            <Store size={18} />
            <span>Accéder à mon Espace Distributeur</span>
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 sm:p-8 bg-neutral-900 rounded-3xl shadow-2xl border border-white/10 text-white">
      
      {/* Stepper Header */}
      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-100 dark:bg-neutral-800 -z-10 rounded-full" />
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-pleingaz-red to-[#ff6a00] -z-10 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.3 }}
        />

        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep >= step.id;
          return (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-tr from-pleingaz-red to-[#ff6a00] text-white shadow-lg shadow-orange-500/30 scale-105'
                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-400'
                }`}
              >
                {currentStep > step.id ? <Check size={20} /> : <Icon size={20} />}
              </motion.div>
              <span className={`text-xs font-semibold ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-700 dark:text-red-300 text-sm"
        >
          <AlertCircle size={20} className="shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Step Content */}
      <div className="min-h-[420px]">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Identité de votre Dépôt</h2>
                <p className="text-sm text-gray-500 mt-1">Rejoignez le réseau officiel de distribution PLEINGAZ au Cameroun.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Nom commercial de la boutique / dépôt <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-pleingaz-red outline-none transition-all font-medium text-gray-900 dark:text-white"
                  placeholder="Ex: Dépôt Gaz Saint-Michel"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Numéro WhatsApp professionnel <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-pleingaz-red outline-none transition-all font-medium text-gray-900 dark:text-white"
                  placeholder="Ex: 699112233 ou +237699112233"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                />
                <p className="text-xs text-gray-400">Ce numéro recevra les commandes des clients et les notifications officielles.</p>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Localisation du Point de Vente</h2>
                <p className="text-sm text-gray-500 mt-1">Permet aux clients situés à proximité de vous trouver immédiatement.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Ville <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-pleingaz-red outline-none transition-all font-medium text-gray-900 dark:text-white"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  >
                    <option value="Douala">Douala</option>
                    <option value="Yaoundé">Yaoundé</option>
                    <option value="Bafoussam">Bafoussam</option>
                    <option value="Garoua">Garoua</option>
                    <option value="Autre">Autre ville</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Quartier <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-pleingaz-red outline-none transition-all font-medium text-gray-900 dark:text-white"
                    placeholder="Ex: Akwa, Bonamoussadi, Bastos"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Repère textuel familier (face à, derrière...)
                </label>
                <input
                  type="text"
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-pleingaz-red outline-none transition-all font-medium text-gray-900 dark:text-white"
                  placeholder="Ex: Face Boulangerie Saker, à côté de la pharmacie"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Positionnement sur carte (ajustez le repère)
                </label>
                <div className="h-60 rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-inner">
                  <MapPicker
                    onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dossier KYC Strict (D-04)</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Seulement 3 documents obligatoires légaux : CNI recto/verso, photo portrait et vue de votre point de vente.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. CNI Recto */}
                <DocumentUploadCard
                  title="1. CNI Recto"
                  description="Face avant de la carte d'identité"
                  file={files.idCardFront}
                  preview={previews.idCardFront}
                  inputRef={fileInputRefs.idCardFront}
                  onSelect={(f) => handleFileSelect('idCardFront', f)}
                  onRemove={() => removeFile('idCardFront')}
                />

                {/* 2. CNI Verso */}
                <DocumentUploadCard
                  title="2. CNI Verso"
                  description="Face arrière avec puce / code"
                  file={files.idCardBack}
                  preview={previews.idCardBack}
                  inputRef={fileInputRefs.idCardBack}
                  onSelect={(f) => handleFileSelect('idCardBack', f)}
                  onRemove={() => removeFile('idCardBack')}
                />

                {/* 3. Photo Portrait */}
                <DocumentUploadCard
                  title="3. Photo Portrait"
                  description="Photo nette du visage du gérant"
                  file={files.portraitPhoto}
                  preview={previews.portraitPhoto}
                  inputRef={fileInputRefs.portraitPhoto}
                  onSelect={(f) => handleFileSelect('portraitPhoto', f)}
                  onRemove={() => removeFile('portraitPhoto')}
                />

                {/* 4. Photo Boutique */}
                <DocumentUploadCard
                  title="4. Photo Boutique"
                  description="Vue extérieure avec enseigne / stock"
                  file={files.shopPhoto}
                  preview={previews.shopPhoto}
                  inputRef={fileInputRefs.shopPhoto}
                  onSelect={(f) => handleFileSelect('shopPhoto', f)}
                  onRemove={() => removeFile('shopPhoto')}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100 dark:border-neutral-800">
        <button
          onClick={prevStep}
          disabled={currentStep === 1 || loading}
          className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all ${
            currentStep === 1 || loading
              ? 'opacity-40 cursor-not-allowed text-gray-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
          }`}
        >
          <ArrowLeft size={18} />
          Retour
        </button>

        {currentStep < steps.length ? (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-8 py-3.5 font-bold rounded-xl bg-gradient-to-r from-[#E51A24] to-[#b30d15] text-white shadow-lg shadow-[#E51A24]/30 hover:shadow-[#E51A24]/50 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            Continuer
            <ArrowRight size={18} />
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-3 rounded-xl border border-white/20 hover:bg-white/10 text-neutral-300 font-semibold text-xs transition-colors"
            >
              Créer ma boutique sans documents (à fournir plus tard)
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`flex items-center gap-2 px-7 py-3.5 font-black text-sm rounded-xl bg-gradient-to-r from-[#E51A24] to-[#b30d15] text-white shadow-lg shadow-[#E51A24]/35 hover:shadow-[#E51A24]/60 hover:-translate-y-0.5 transition-all ${
                loading ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Création du compte...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Valider & Accéder à mon Espace
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentUploadCard({
  title,
  description,
  file,
  preview,
  inputRef,
  onSelect,
  onRemove,
}: {
  title: string;
  description: string;
  file: File | null;
  preview: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSelect: (file: File) => void;
  onRemove: () => void;
}) {
  return (
    <div className="relative p-4 border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-2xl bg-gray-50/60 dark:bg-neutral-950/60 flex flex-col items-center justify-center text-center transition-all hover:border-pleingaz-red/60 group">
      <input
        type="file"
        ref={inputRef as any}
        className="hidden"
        accept="image/jpeg,image/png,application/pdf"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onSelect(e.target.files[0]);
          }
        }}
      />

      {file ? (
        <div className="w-full flex flex-col items-center gap-2">
          {preview && preview !== 'pdf' ? (
            <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-700 shadow-sm">
              <img src={preview} alt={title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <FileText size={28} />
            </div>
          )}

          <div className="max-w-[180px] truncate font-bold text-xs text-gray-800 dark:text-gray-200">
            {file.name}
          </div>
          <span className="text-[11px] text-gray-400">
            {(file.size / 1024).toFixed(0)} Ko
          </span>

          <button
            type="button"
            onClick={onRemove}
            className="mt-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/50 dark:text-red-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <X size={12} />
            Supprimer
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer w-full flex flex-col items-center gap-2 py-4"
        >
          <div className="w-12 h-12 rounded-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex items-center justify-center text-gray-400 group-hover:text-pleingaz-red group-hover:border-pleingaz-red transition-colors shadow-sm">
            <Upload size={20} />
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-800 dark:text-gray-200">{title}</h4>
            <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>
          </div>
          <span className="mt-1 px-3 py-1 bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-2xs group-hover:bg-pleingaz-red group-hover:text-white group-hover:border-pleingaz-red transition-all">
            Parcourir
          </span>
        </div>
      )}
    </div>
  );
}
