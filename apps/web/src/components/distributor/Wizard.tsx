'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, MapPin, FileText, CheckCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const MapPicker = dynamic(() => import('../map/MapPicker'), { ssr: false, loading: () => <div className="h-64 bg-skeleton-base animate-pulse rounded-xl" /> });

const steps = [
  { id: 1, title: 'Identité', icon: Store },
  { id: 2, title: 'Localisation', icon: MapPin },
  { id: 3, title: 'Documents', icon: FileText },
];

export default function DistributorWizard() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    taxId: '',
    landmark: '',
    latitude: 0,
    longitude: 0,
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleNextOrSubmit = () => {
    if (currentStep === steps.length) {
      router.push('/distributor/onboarding');
    } else {
      nextStep();
    }
  };

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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dites-nous en plus sur vous</h2>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nom de la boutique</label>
                  <input 
                    type="text" 
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Localisation précise</h2>
                <p className="text-sm text-gray-500">Placez le curseur sur la carte pour nous aider à vous trouver.</p>
                <div className="h-64 rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-800">
                  <MapPicker 
                    onChange={(lat, lng) => setFormData({...formData, latitude: lat, longitude: lng})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Repère textuel (Facultatif)</label>
                  <input 
                    type="text" 
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-pleingaz-red outline-none transition-all"
                    placeholder="Ex: Derrière la boulangerie Saker"
                    value={formData.landmark}
                    onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pièces justificatives</h2>
                <label className="block border-2 border-dashed border-gray-300 dark:border-neutral-800 rounded-2xl p-8 text-center hover:border-pleingaz-red transition-colors cursor-pointer group bg-gray-50 dark:bg-neutral-950">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-pleingaz-red rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    {selectedFile ? <CheckCircle size={24} /> : <FileText size={24} />}
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedFile ? selectedFile.name : 'Uploader votre CNI et Registre de Commerce'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {selectedFile ? 'Fichier sélectionné avec succès' : 'JPEG, PNG ou PDF (Max 5Mo)'}
                  </p>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    accept=".jpg,.jpeg,.png,.pdf"
                  />
                </label>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100 dark:border-neutral-800">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-6 py-3 font-medium rounded-xl transition-all ${currentStep === 1 ? 'opacity-50 cursor-not-allowed text-gray-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'}`}
        >
          Retour
        </button>
        <button
          onClick={handleNextOrSubmit}
          className="px-8 py-3 font-medium rounded-xl bg-gradient-to-r from-pleingaz-red to-[#ff6a00] text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all"
        >
          {currentStep === steps.length ? 'Soumettre le dossier' : 'Continuer'}
        </button>
      </div>
    </div>
  );
}
