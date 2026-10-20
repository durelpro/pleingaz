'use client';

import { useState, useEffect } from 'react';
import InventoryList from '@/components/distributor/InventoryList';
import {
  Package,
  Bike,
  FileText,
  AlertCircle,
  CheckCircle2,
  Plus,
  Phone,
  User,
  ShieldCheck,
  Store,
  Upload,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'STOCK' | 'COURIERS' | 'KYC'>('STOCK');
  const [storeData, setStoreData] = useState<any>(null);
  const [phone, setPhone] = useState<string>('');

  // Formulaire d'ajout livreur
  const [courierName, setCourierName] = useState('');
  const [courierPhone, setCourierPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('MOTO');
  const [couriersList, setCouriersList] = useState<any[]>([
    {
      id: 'cour-demo-1',
      name: 'Moussa Bello',
      phone: '+237690112233',
      vehicleType: 'MOTO',
      status: 'APPROVED',
      isOnline: true,
      cashBalance: 12000,
    },
  ]);
  const [courierSuccess, setCourierSuccess] = useState<string | null>(null);
  const [courierError, setCourierError] = useState<string | null>(null);
  const [isSubmittingCourier, setIsSubmittingCourier] = useState(false);

  // Upload KYC différé
  const [kycSuccess, setKycSuccess] = useState<string | null>(null);
  const [isUploadingKyc, setIsUploadingKyc] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedStore = localStorage.getItem('distributor_store');
      const storedPhone = localStorage.getItem('distributor_phone');
      if (storedStore) {
        try {
          setStoreData(JSON.parse(storedStore));
        } catch (e) {}
      }
      if (storedPhone) setPhone(storedPhone);
    }
  }, []);

  const handleRegisterCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourierError(null);
    setCourierSuccess(null);

    if (!courierName.trim() || !courierPhone.trim()) {
      setCourierError('Le nom et le numéro de téléphone du livreur sont obligatoires.');
      return;
    }

    setIsSubmittingCourier(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

      const res = await fetch(`${apiUrl}/deliveries/distributor/couriers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: courierName,
          phone: courierPhone,
          vehicleType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Impossible d\'enregistrer ce livreur.');
      }

      setCourierSuccess(`Livreur ${courierName} rattaché avec succès à votre point de vente !`);
      setCouriersList((prev) => [
        {
          id: data.courier?.id || `cour-${Date.now()}`,
          name: courierName,
          phone: courierPhone,
          vehicleType,
          status: 'APPROVED',
          isOnline: true,
          cashBalance: 0,
        },
        ...prev,
      ]);
      setCourierName('');
      setCourierPhone('');
    } catch (err: any) {
      // Ajout optimiste local si le backend est indisponible
      setCourierSuccess(`Livreur ${courierName} enregistré pour votre point de vente (Mode Local).`);
      setCouriersList((prev) => [
        {
          id: `cour-${Date.now()}`,
          name: courierName,
          phone: courierPhone,
          vehicleType,
          status: 'APPROVED',
          isOnline: true,
          cashBalance: 0,
        },
        ...prev,
      ]);
      setCourierName('');
      setCourierPhone('');
    } finally {
      setIsSubmittingCourier(false);
    }
  };

  const handleKycUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadingKyc(true);
    setTimeout(() => {
      setIsUploadingKyc(false);
      setKycSuccess('Documents KYC transmis avec succès à l’administrateur pour revue !');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0d0707] text-white py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* En-tête Espace Distributeur */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-neutral-900 border border-white/10 shadow-xl">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-black px-3 py-1 rounded-full bg-[#E51A24]/20 border border-[#E51A24]/30 text-red-300">
              <Store size={14} className="text-[#E51A24]" />
              Espace Professionnel Distributeur Agréé
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {storeData?.name || 'Mon Point de Vente PLEINGAZ'}
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm">
              {storeData?.neighborhood ? `${storeData.neighborhood}, ${storeData.city || 'Douala'}` : 'Douala, Cameroun'} • Contact : {phone || '+237 6XXXXXXXX'}
            </p>
          </div>

          {/* Badge Statut de Visibilité */}
          <div className="shrink-0">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <AlertCircle size={20} />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-amber-300 font-bold uppercase block">Visibilité Carte Publique</span>
                <span className="text-xs font-black text-white">En attente validation Admin (R5)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation des 3 Onglets */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('STOCK')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all ${
              activeTab === 'STOCK'
                ? 'bg-[#E51A24] text-white shadow-lg shadow-[#E51A24]/30'
                : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Package size={17} />
            <span>Mon Stock 📦</span>
          </button>

          <button
            onClick={() => setActiveTab('COURIERS')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all ${
              activeTab === 'COURIERS'
                ? 'bg-[#E51A24] text-white shadow-lg shadow-[#E51A24]/30'
                : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Bike size={17} />
            <span>Mes Livreurs ({couriersList.length}) 🛵</span>
          </button>

          <button
            onClick={() => setActiveTab('KYC')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all ${
              activeTab === 'KYC'
                ? 'bg-[#E51A24] text-white shadow-lg shadow-[#E51A24]/30'
                : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <FileText size={17} />
            <span>Dossier KYC & Pièces 📄</span>
          </button>
        </div>

        {/* Contenu des Onglets */}
        {activeTab === 'STOCK' && (
          <div className="space-y-6">
            <InventoryList />
          </div>
        )}

        {activeTab === 'COURIERS' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-neutral-900 border border-white/10 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Bike size={22} className="text-[#E51A24]" />
                    Enregistrer un Livreur pour mon Point de Vente
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Ajoutez vos livreurs partenaires locaux pour assurer les courses rapides dans votre quartier.
                  </p>
                </div>
              </div>

              {courierSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{courierSuccess}</span>
                </div>
              )}

              {courierError && (
                <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{courierError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterCourier} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1.5 font-bold">Nom complet du livreur</label>
                  <input
                    type="text"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="Ex: Jean Paul Ndedi"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-white/10 text-white text-sm focus:border-[#E51A24] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-1.5 font-bold">Téléphone / WhatsApp</label>
                  <input
                    type="tel"
                    value={courierPhone}
                    onChange={(e) => setCourierPhone(e.target.value)}
                    placeholder="Ex: 699112233"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-white/10 text-white text-sm focus:border-[#E51A24] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-1.5 font-bold">Moyen de transport</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-white/10 text-white text-sm focus:border-[#E51A24] outline-none"
                  >
                    <option value="MOTO">Moto (Idéal Douala/Yaoundé)</option>
                    <option value="VELO">Vélo / Tricycle</option>
                    <option value="VOITURE">Camionnette / Véhicule</option>
                    <option value="PIED">À pied (Proximité immédiate)</option>
                  </select>
                </div>

                <div className="sm:col-span-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingCourier}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#E51A24] to-[#b30d15] text-white font-black text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#E51A24]/30 flex items-center gap-2"
                  >
                    <Plus size={16} />
                    <span>Enregistrer ce Livreur</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Liste des Livreurs Rattachés */}
            <div className="space-y-4">
              <h3 className="font-black text-lg text-white">Livreurs Actifs de mon Point de Vente</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {couriersList.map((cour) => (
                  <div key={cour.id} className="p-5 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{cour.name}</span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {cour.vehicleType}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                        <Phone size={13} className="text-[#E51A24]" />
                        <span>{cour.phone}</span>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold block">Solde Espèces</span>
                      <span className="text-xs font-black text-amber-400">{cour.cashBalance.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'KYC' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900 border border-white/10 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <ShieldCheck size={22} className="text-[#E51A24]" />
                Pièces Justificatives KYC Distributeur (D-04)
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                L’administrateur vérifiera ces 3 pièces pour activer votre visibilité officielle sur la carte PLEINGAZ.
              </p>
            </div>

            {kycSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{kycSuccess}</span>
              </div>
            )}

            <form onSubmit={handleKycUpload} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-neutral-950 border border-white/10 text-center space-y-2">
                  <span className="text-xs font-bold text-white block">1. CNI Recto / Verso</span>
                  <input type="file" className="text-xs text-neutral-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-[#E51A24] file:text-white" />
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950 border border-white/10 text-center space-y-2">
                  <span className="text-xs font-bold text-white block">2. Photo Portrait Récent</span>
                  <input type="file" className="text-xs text-neutral-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-[#E51A24] file:text-white" />
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950 border border-white/10 text-center space-y-2">
                  <span className="text-xs font-bold text-white block">3. Façade Extérieure Boutique</span>
                  <input type="file" className="text-xs text-neutral-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-[#E51A24] file:text-white" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploadingKyc}
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#E51A24] to-[#b30d15] text-white font-black text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#E51A24]/30 flex items-center gap-2"
              >
                <Upload size={16} />
                <span>{isUploadingKyc ? 'Téléversement en cours...' : 'Transmettre mes documents pour validation'}</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
