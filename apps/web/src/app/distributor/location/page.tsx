'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/map/MapPicker'), { ssr: false, loading: () => <div className="h-64 bg-gray-100 dark:bg-neutral-800 animate-pulse rounded-xl" /> });

export default function LocationPage() {
  const [formData, setFormData] = useState({
    city: 'Douala',
    neighborhood: '',
    landmark: '',
    latitude: 4.051,
    longitude: 9.708,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3001/distributor/my-store', {
      headers: { 'x-demo-role': 'distributor_1' }
    })
      .then(res => res.json())
      .then(data => {
        if (data) {
          setFormData({
            city: data.city || 'Douala',
            neighborhood: data.neighborhood || '',
            landmark: data.landmark || '',
            latitude: data.latitude || 4.051,
            longitude: data.longitude || 9.708,
          });
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('http://localhost:3001/distributor/my-store/location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': 'distributor_1',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert("Erreur lors de la mise à jour de la localisation");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur de connexion au serveur");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6 lg:p-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link href="/distributor/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-pleingaz-red transition-colors font-semibold mb-2">
            <ArrowLeft size={20} />
            Retour au tableau de bord
          </Link>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 text-pleingaz-red rounded-2xl flex items-center justify-center">
            <MapPin size={28} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">Localisation du Point de Vente</h1>
            <p className="text-gray-500 mt-1 font-medium">Mettez à jour votre quartier, repère et coordonnées pour que les clients vous trouvent en recherche</p>
          </div>
        </motion.div>

        {saveSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl flex items-center gap-3 text-green-700 dark:text-green-300 font-bold"
          >
            <CheckCircle size={22} className="shrink-0 text-green-600" />
            Localisation et repère mis à jour avec succès ! Les clients peuvent désormais vous rechercher avec ces informations.
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-[2rem] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 size={36} className="animate-spin text-pleingaz-red mr-2" />
              Chargement de vos coordonnées...
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Ville</label>
                  <select
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-pleingaz-red outline-none transition-all font-medium"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Quartier</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-pleingaz-red outline-none transition-all font-medium"
                    placeholder="Ex: Bonamoussadi, Akwa, Bastos..."
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Description du lieu / Repère (Crucial pour la recherche)
                </label>
                <input 
                  type="text" 
                  required
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 focus:ring-2 focus:ring-pleingaz-red outline-none transition-all font-medium"
                  placeholder="Ex: En face de la boulangerie Saker, carrefour Idéal..."
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                />
                <p className="text-xs text-gray-500">
                  Les clients trouveront votre boutique en tapant des mots de ce repère dans la barre de recherche.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Position sur la carte</label>
                <div className="h-[360px] rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-inner">
                  <MapPicker 
                    initialPosition={[formData.latitude, formData.longitude]}
                    onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })} 
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={isSaving}
                className="w-full py-4 bg-gradient-to-r from-pleingaz-red to-[#ff6a00] text-white font-black text-lg rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 size={24} className="animate-spin" /> : 'Enregistrer et mettre à jour ma position'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
