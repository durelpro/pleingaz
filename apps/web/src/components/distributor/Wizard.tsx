'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, MapPin, FileText, CheckCircle, UploadCloud, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const MapPicker = dynamic(() => import('../map/MapPicker'), { ssr: false, loading: () => <div className="h-64 bg-skeleton-base animate-pulse rounded-xl" /> });

const steps = [
  { id: 1, title: 'Identité', icon: Store },
  { id: 2, title: 'Localisation', icon: MapPin },
  { id: 3, title: 'Documents', icon: FileText },
  { id: 4, title: 'Paiement', icon: CheckCircle },
];

const documentTypes = [
  { id: 'CNI_FRONT', label: 'CNI (Recto)' },
  { id: 'CNI_BACK', label: 'CNI (Verso)' },
  { id: 'REGISTRE_COMMERCE', label: 'Registre de Commerce (RCCM)' },
  { id: 'PLAN_LOCALISATION', label: 'Plan de Localisation' },
  { id: 'PHOTO_BOUTIQUE', label: 'Photo de la Boutique' },
];

export default function DistributorWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    businessName: '',
    taxId: '',
    city: 'Douala',
    neighborhood: '',
    landmark: '',
    latitude: 0,
    longitude: 0,
    momoReceiverNumber: '',
    orangeReceiverNumber: '',
  });

  const [documents, setDocuments] = useState<Record<string, { file: File | null, uploaded: boolean, url?: string }>>(
    documentTypes.reduce((acc, doc) => ({ ...acc, [doc.id]: { file: null, uploaded: false } }), {})
  );

  const getAuthHeaders = (extraHeaders: any = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const h: any = { 'x-demo-role': 'distributor_1', ...extraHeaders };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  };

  useEffect(() => {
    // Vérifier si un profil existe déjà
    fetch('http://localhost:3001/distributor/application', {
      headers: getAuthHeaders()
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.status) {
        if (data.status === 'PENDING' || data.status === 'APPROVED' || data.status === 'REJECTED') {
          router.push('/distributor/dashboard');
          return;
        }
        
        // Populate DRAFT
        setFormData({
          phone: '',
          password: '',
          businessName: data.businessName || '',
          taxId: data.taxId || '',
          city: data.city || 'Douala',
          neighborhood: data.neighborhood || '',
          landmark: data.landmark || '',
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          momoReceiverNumber: data.momoReceiverNumber || '',
          orangeReceiverNumber: data.orangeReceiverNumber || '',
        });

        // Populate documents
        if (data.documents && data.documents.length > 0) {
          const newDocs = { ...documents };
          data.documents.forEach((d: any) => {
            newDocs[d.type] = { file: null, uploaded: true, url: d.fileUrl };
          });
          setDocuments(newDocs);
        }

        setCurrentStep(data.currentStep || 1);
      }
    })
    .catch(err => console.error(err))
    .finally(() => setIsLoading(false));
  }, [router]);

  const saveStep = async () => {
    setIsSaving(true);
    try {
      await fetch('http://localhost:3001/distributor/application/step', {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ...formData, currentStep })
      });
    } catch (e) {
      console.error(e);
    }
    setIsSaving(false);
  };

  const nextStep = async () => {
    await saveStep();
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleFileUpload = async (type: string, file: File) => {
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('type', type);

    try {
      const res = await fetch('http://localhost:3001/distributor/application/upload', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formDataUpload
      });
      if (res.ok) {
        setDocuments(prev => ({
          ...prev,
          [type]: { file, uploaded: true }
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleNextOrSubmit = async () => {
    // Validation Étape 2 (Quartier et Repère indispensables)
    if (currentStep === 2) {
      if (!formData.neighborhood.trim() || !formData.landmark.trim()) {
        alert('Veuillez renseigner votre quartier et un repère (description du lieu) pour que les clients puissent vous trouver.');
        return;
      }
    }

    if (currentStep === steps.length) {
      // Sauvegarder les données du Step 4 d'abord
      await saveStep();

      // Validate documents
      const allUploaded = documentTypes.every(d => documents[d.id].uploaded);
      if (!allUploaded) {
        alert('Veuillez uploader tous les documents requis.');
        return;
      }
      
      setIsSaving(true);
      try {
        const res = await fetch('http://localhost:3001/distributor/application/submit', {
          method: 'POST',
          headers: getAuthHeaders()
        });
        if (res.ok) {
          router.push('/distributor/dashboard');
        } else {
          const err = await res.json();
          alert(err.message || 'Erreur lors de la soumission');
        }
      } catch (e) {
        console.error(e);
      }
      setIsSaving(false);
    } else {
      await nextStep();
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-pleingaz-red" size={32} /></div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-white dark:bg-neutral-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-neutral-800">
      
      {/* Stepper Header */}
      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 dark:bg-neutral-800 -z-10 rounded-full" />
        <motion.div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-pleingaz-red -z-10 rounded-full"
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
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${isActive ? 'bg-pleingaz-red text-white shadow-lg shadow-orange-500/30' : 'bg-gray-100 dark:bg-neutral-800 text-gray-400'}`}
                whileHover={{ scale: 1.05 }}
              >
                {currentStep > step.id ? <CheckCircle size={20} /> : <Icon size={20} />}
              </motion.div>
              <span className={`text-xs font-medium ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Création du Compte & Identité</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Numéro de téléphone</label>
                    <input 
                      type="text" 
                      required
                      className="w-full p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-pleingaz-red outline-none transition-all"
                      placeholder="Ex: 690000000"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mot de passe</label>
                    <input 
                      type="password" 
                      required
                      className="w-full p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-pleingaz-red outline-none transition-all"
                      placeholder="Créez un mot de passe sécurisé"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nom de la boutique</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-pleingaz-red outline-none transition-all"
                    placeholder="Ex: ETS Pleingaz Bonamoussadi"
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Localisation précise de la boutique</h2>
                <p className="text-sm text-gray-500">Renseignez votre zone et placez le curseur sur la carte pour que les clients vous retrouvent facilement.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ville</label>
                    <select
                      className="w-full p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-pleingaz-red outline-none transition-all font-medium"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    >
                      <option value="Douala">Douala</option>
                      <option value="Yaoundé">Yaoundé</option>
                      <option value="Bafoussam">Bafoussam</option>
                      <option value="Garoua">Garoua</option>
                      <option value="Kribi">Kribi</option>
                      <option value="Limbe">Limbe</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quartier</label>
                    <input 
                      type="text" 
                      required
                      className="w-full p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-pleingaz-red outline-none transition-all"
                      placeholder="Ex: Bonamoussadi, Akwa, Bastos..."
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description du lieu / Repère (Crucial pour la recherche des clients)</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-pleingaz-red outline-none transition-all"
                    placeholder="Ex: En face de la boulangerie Saker, à 50m du carrefour..."
                    value={formData.landmark}
                    onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">Les clients pourront trouver votre boutique en tapant des mots de ce repère dans la barre de recherche.</p>
                </div>

                <div className="h-64 rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-800">
                  <MapPicker 
                    onChange={(lat, lng) => setFormData({...formData, latitude: lat, longitude: lng})} 
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pièces justificatives</h2>
                <p className="text-sm text-gray-500 mb-4">Veuillez fournir les 5 documents obligatoires pour valider votre dossier.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documentTypes.map(docType => (
                    <div key={docType.id} className="border border-gray-200 dark:border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{docType.label}</span>
                        {documents[docType.id].uploaded && <CheckCircle size={18} className="text-green-500" />}
                      </div>
                      <label className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2">
                        <UploadCloud size={16} /> {documents[docType.id].uploaded ? 'Remplacer le fichier' : 'Uploader (Max 5Mo)'}
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(docType.id, e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      {documents[docType.id].file && <p className="text-xs text-gray-500 mt-1 truncate">{documents[docType.id].file?.name}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vos Numéros Commerciaux</h2>
                <p className="text-sm text-gray-500">Ces numéros seront présentés à vos clients pour recevoir leurs paiements Mobile Money. Au moins un numéro est recommandé.</p>
                
                <div className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Numéro de réception MTN MoMo</label>
                    <input 
                      type="tel" 
                      className="w-full p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                      placeholder="Ex: 670 00 00 00"
                      value={formData.momoReceiverNumber}
                      onChange={(e) => setFormData({...formData, momoReceiverNumber: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Numéro de réception Orange Money</label>
                    <input 
                      type="tel" 
                      className="w-full p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      placeholder="Ex: 690 00 00 00"
                      value={formData.orangeReceiverNumber}
                      onChange={(e) => setFormData({...formData, orangeReceiverNumber: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100 dark:border-neutral-800">
        <button
          onClick={prevStep}
          disabled={currentStep === 1 || isSaving}
          className={`px-6 py-3 font-medium rounded-xl transition-all ${currentStep === 1 ? 'opacity-50 cursor-not-allowed text-gray-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'}`}
        >
          Retour
        </button>
        <button
          onClick={handleNextOrSubmit}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 font-medium rounded-xl bg-gradient-to-r from-pleingaz-red to-[#ff6a00] text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-70"
        >
          {isSaving && <Loader2 size={16} className="animate-spin" />}
          {currentStep === steps.length ? 'Soumettre le dossier' : 'Continuer'}
        </button>
      </div>
    </div>
  );
}
