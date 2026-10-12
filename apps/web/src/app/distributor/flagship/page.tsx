'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { 
  Building2, Truck, DollarSign, Package, CheckCircle2, 
  Clock, AlertTriangle, ArrowUpRight, Phone, MessageSquare, 
  MapPin, Printer, ShieldCheck, ChevronRight, Loader2, Sparkles,
  BarChart3, FileSpreadsheet, RefreshCw, Send, Check, Lock, LogOut, ArrowRight, UserCheck, Eye, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InvoiceModal from '@/components/invoice/InvoiceModal';

// Dynamically import Leaflet Map to avoid SSR errors
const FlagshipDeliveryMap = dynamic(
  () => import('@/components/distributor/FlagshipDeliveryMap'),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-full w-full min-h-[350px] bg-gray-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center text-gray-400">
        <Loader2 className="animate-spin text-red-500 mr-2" size={24} />
        Chargement de la carte de livraison temps réel...
      </div>
    ) 
  }
);

export default function FlagshipDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'DELIVERIES' | 'FINANCE' | 'INVENTORY'>('DELIVERIES');
  const [selectedInvoiceOrderId, setSelectedInvoiceOrderId] = useState<string | null>(null);
  const [validatingOrderId, setValidatingOrderId] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    // Vérifier si une session Flagship est déjà ouverte
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('pleingaz_flagship_auth');
      if (auth === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleFlagshipLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError('');

    // Vérification d'identité demandée par l'utilisateur : mot de passe 12345
    const cleanName = loginName.trim();
    if (loginPassword !== '12345') {
      setAuthError('Mot de passe incorrect. Veuillez saisir le mot de passe habilité.');
      setIsAuthenticating(false);
      return;
    }

    if (!cleanName) {
      setAuthError('Veuillez renseigner votre nom ou identifiant de service.');
      setIsAuthenticating(false);
      return;
    }

    // Authentification réussie
    localStorage.setItem('pleingaz_flagship_auth', 'true');
    localStorage.setItem('pleingaz_flagship_user', cleanName);
    setIsAuthenticated(true);
    setIsAuthenticating(false);
  };

  const handleFlagshipLogout = () => {
    localStorage.removeItem('pleingaz_flagship_auth');
    localStorage.removeItem('pleingaz_flagship_user');
    setIsAuthenticated(false);
    setLoginPassword('');
  };

  const fetchFlagshipData = async () => {
    try {
      const res = await fetch('http://localhost:3001/distributor/flagship', {
        headers: { 'x-demo-role': 'admin_1' }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlagshipData();
  }, []);

  const handleConfirmDelivery = async (orderId: string) => {
    setIsActionLoading(true);
    setValidationError('');
    try {
      const res = await fetch(`http://localhost:3001/distributor/flagship/deliveries/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-demo-role': 'admin_1' },
        body: JSON.stringify({ status: 'DELIVERED', otp: otpInput })
      });
      if (res.ok) {
        setValidatingOrderId(null);
        setOtpInput('');
        await fetchFlagshipData();
      } else {
        const err = await res.json();
        setValidationError(err.message || 'Code OTP invalide.');
      }
    } catch (e) {
      setValidationError('Erreur réseau lors de la validation.');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-red-600 mb-4" size={36} />
        <p className="text-gray-500 font-bold">Connexion au Dépôt Flagship PLEINGAZ (INFOTECH S.A.)...</p>
      </div>
    );
  }

  // ÉCRAN DE VÉRIFICATION D'IDENTITÉ OBLIGATOIRE
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-hidden text-white">
        {/* Glow Effects */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10 space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-semibold mb-2">
            ← Retour à l'accueil
          </Link>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-900/90 border border-neutral-800 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-600 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/30">
                <Lock className="text-white" size={30} />
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <span className="px-2.5 py-0.5 bg-red-600 text-white font-black text-[10px] rounded-full uppercase tracking-wider">
                  Accès Restreint
                </span>
                <span className="text-xs text-amber-400 font-bold">INFOTECH S.A.</span>
              </div>
              <h2 className="text-2xl font-black text-white">
                Vérification d'Identité Dépôt Central
              </h2>
              <p className="text-xs text-gray-400">
                Yaoundé — Mvog-Mbi (Au niveau de Total Magzi)
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold text-center">
                {authError}
              </div>
            )}

            <form onSubmit={handleFlagshipLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Nom du responsable ou livreur autorisé
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Jean-Pierre Mvondo ou INFOTECH"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white placeholder-gray-500 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1.5">
                  Mot de passe de sécurité
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="•••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white placeholder-gray-500 rounded-xl py-3.5 pl-11 pr-11 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono tracking-widest font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                    title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isAuthenticating ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                Déverrouiller le Dépôt
              </button>
            </form>

            <div className="pt-2 border-t border-neutral-800/80 text-center">
              <p className="text-[11px] text-gray-500">
                Habilitation de service : Mot de passe <code className="text-amber-400 font-mono font-bold">12345</code>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const { store, kpis, driver, orders } = data || {};

  // Formatter la liste des livraisons pour la carte
  const mapDeliveries = orders?.map((o: any) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: `${o.customer?.customerProfile?.firstName || 'Client'} ${o.customer?.customerProfile?.lastName || ''}`,
    customerPhone: o.customer?.phone || '+2376...',
    address: o.deliveryAddress || 'Douala',
    notes: o.deliveryNotes,
    lat: o.deliveryLat,
    lng: o.deliveryLng,
    status: o.delivery?.status || o.status,
    totalAmount: o.totalAmount,
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-gray-100 p-4 md:p-8">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 rounded-full filter blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full filter blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* En-tête Institutionnel Flagship */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 p-6 md:p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <Building2 size={240} />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-red-600 text-white font-black text-xs rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-red-600/30">
                  <ShieldCheck size={14} /> Dépôt Entreprise Officiel
                </span>
                <span className="px-3 py-1 bg-neutral-800 text-gray-300 font-bold text-xs rounded-full border border-neutral-700">
                  INFOTECH S.A.
                </span>
                <span className="px-3 py-1 bg-emerald-950/80 text-emerald-400 font-bold text-xs rounded-full border border-emerald-800/40 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Service Livraison Flotte Ouvert
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                {store?.name || 'PLEINGAZ Flagship & Dépôt Central'}
              </h1>
              <p className="text-gray-400 text-sm max-w-2xl flex items-center gap-2">
                <MapPin size={16} className="text-red-500 shrink-0" />
                {store?.landmark || 'Boulevard de la Liberté, Akwa'} — {store?.city}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/dashboard"
                className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 text-gray-200 font-bold text-sm rounded-xl transition-all border border-neutral-700 flex items-center gap-2"
              >
                Supervision Control Center
              </Link>
              <button 
                onClick={() => window.print()} 
                className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-red-600/30 flex items-center gap-2"
              >
                <Printer size={18} />
                Imprimer Bilan
              </button>
              <button
                onClick={handleFlagshipLogout}
                className="px-4 py-3 bg-neutral-800/80 hover:bg-red-950/40 text-red-400 font-bold text-sm rounded-xl border border-red-500/20 flex items-center gap-2 transition-all"
                title="Verrouiller la session"
              >
                <LogOut size={16} />
                Verrouiller
              </button>
            </div>
          </div>

          {/* Quick Metrics Header Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-neutral-800/80">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Ventes Directes (Jour)</p>
              <p className="text-2xl md:text-3xl font-black text-white mt-1">
                {(kpis?.totalSales || 0).toLocaleString('fr-FR')} <span className="text-sm font-normal text-gray-400">FCFA</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Courses Livrées</p>
              <p className="text-2xl md:text-3xl font-black text-emerald-400 mt-1">
                {kpis?.deliveredCount || 0} <span className="text-sm font-normal text-gray-400">/ {kpis?.totalOrders || 0}</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">En Cours de Livraison</p>
              <p className="text-2xl md:text-3xl font-black text-blue-400 mt-1">
                {kpis?.inTransitCount || 0} course(s)
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Marge Brute Dépôt</p>
              <p className="text-2xl md:text-3xl font-black text-yellow-400 mt-1">
                +{(kpis?.totalMargin || 0).toLocaleString('fr-FR')} <span className="text-sm font-normal text-gray-400">FCFA</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-neutral-800 gap-8">
          <button
            onClick={() => setActiveTab('DELIVERIES')}
            className={`pb-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'DELIVERIES'
                ? 'border-red-600 text-red-600 dark:text-red-500'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <Truck size={18} />
            Supervision Flotte & Livraisons GPS ({orders?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('FINANCE')}
            className={`pb-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'FINANCE'
                ? 'border-red-600 text-red-600 dark:text-red-500'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <DollarSign size={18} />
            Compte-Rendu des Ventes & Factures
          </button>
          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={`pb-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'INVENTORY'
                ? 'border-red-600 text-red-600 dark:text-red-500'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <Package size={18} />
            Rotation Bouteilles & Consignes
          </button>
        </div>

        {/* CONTENU ONGLET 1 : SUPERVISION LIVRAISON & CARTE GPS */}
        {activeTab === 'DELIVERIES' && (
          <div className="space-y-6">
            
            {/* Coursier Dédié Pleingaz Info Banner */}
            {driver && (
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/30">
                    🛵
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-gray-900 dark:text-white">{driver.name}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                        {driver.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      Véhicule d'intervention : <span className="font-semibold">{driver.vehicle}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a 
                    href={`tel:${driver.phone}`}
                    className="px-4 py-2 bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl border border-blue-200 dark:border-neutral-700 flex items-center gap-1.5 hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    <Phone size={14} />
                    {driver.phone}
                  </a>
                  <a 
                    href={`https://wa.me/${driver.phone.replace('+', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <MessageSquare size={14} />
                    WhatsApp Livreur
                  </a>
                </div>
              </div>
            )}

            {/* Layout Carte & Dispatch Missions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Carte Leaflet Temps Réel */}
              <div className="lg:col-span-7 bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-3 px-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-red-600" size={18} />
                    <h3 className="font-black text-sm text-gray-900 dark:text-white">
                      Carte Géographique des Livraisons en Direct
                    </h3>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    Yaoundé (Total Magzi) • Actualisé en direct
                  </span>
                </div>

                <div className="h-[420px] w-full">
                  <FlagshipDeliveryMap 
                    storeLat={store?.latitude || 3.8420}
                    storeLng={store?.longitude || 11.5210}
                    driverLat={3.8445}
                    driverLng={11.5230}
                    deliveries={mapDeliveries}
                  />
                </div>
              </div>

              {/* Liste des Livraisons & Validation OTP */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="font-black text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="text-red-600" size={18} />
                  Missions de Livraison Dépôt
                </h3>

                <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                  {orders?.map((order: any) => {
                    const isDelivered = order.status === 'DELIVERED';
                    const isValidating = validatingOrderId === order.id;

                    return (
                      <div 
                        key={order.id} 
                        className={`p-4 rounded-2xl border transition-all ${
                          isDelivered 
                            ? 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 opacity-90' 
                            : 'bg-white dark:bg-neutral-900 border-blue-400 dark:border-blue-800 shadow-md ring-1 ring-blue-500/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="font-mono text-xs font-black text-gray-500">{order.orderNumber}</span>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                              {order.customer?.customerProfile?.firstName || 'Client'} {order.customer?.customerProfile?.lastName || ''}
                            </h4>
                          </div>
                          <span className={`px-2.5 py-1 text-[11px] font-black rounded-full ${
                            isDelivered 
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' 
                              : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                          }`}>
                            {isDelivered ? 'LIVRÉ ✅' : 'EN ROUTE 🛵'}
                          </span>
                        </div>

                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 my-2">
                          <p className="flex items-center gap-1.5 font-medium">
                            <MapPin size={13} className="text-red-500 shrink-0" />
                            {order.deliveryAddress || 'Adresse non spécifiée'}
                          </p>
                          {order.deliveryNotes && (
                            <p className="bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 p-1.5 rounded-lg text-[11px] font-medium border border-amber-200/50">
                              Repère : {order.deliveryNotes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-neutral-800 text-xs">
                          <span className="font-black text-gray-900 dark:text-white text-sm">
                            {order.totalAmount?.toLocaleString('fr-FR')} FCFA
                          </span>

                          <div className="flex items-center gap-2">
                            {isDelivered ? (
                              <button 
                                onClick={() => setSelectedInvoiceOrderId(order.id)}
                                className="px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors"
                              >
                                Facture PDF
                              </button>
                            ) : (
                              <>
                                {isValidating ? (
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="text" 
                                      placeholder="Code OTP..."
                                      value={otpInput}
                                      onChange={(e) => setOtpInput(e.target.value)}
                                      className="w-24 p-1.5 text-xs rounded-lg border border-blue-400 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-center font-mono font-bold"
                                      maxLength={6}
                                    />
                                    <button 
                                      onClick={() => handleConfirmDelivery(order.id)}
                                      disabled={isActionLoading}
                                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs"
                                    >
                                      {isActionLoading ? <Loader2 size={12} className="animate-spin" /> : 'Valider'}
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => { setValidatingOrderId(order.id); setValidationError(''); }}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm transition-colors"
                                  >
                                    <Check size={14} /> Clôturer course
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {isValidating && validationError && (
                          <p className="text-[11px] text-red-500 font-bold mt-2">{validationError}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTENU ONGLET 2 : COMPTE-RENDU FINANCIER & FACTURES */}
        {activeTab === 'FINANCE' && (
          <div className="space-y-6">
            
            {/* Ventilation des Encaissements */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-sm text-gray-500">Mobile Money (MTN / Orange)</span>
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                    MoMo
                  </div>
                </div>
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  {(kpis?.momoCollected || 0).toLocaleString('fr-FR')} FCFA
                </p>
                <p className="text-xs text-gray-500 mt-2">Virements directs sur le compte marchand INFOTECH S.A.</p>
              </div>

              <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-sm text-gray-500">Espèces Encaissées Livreur</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    CASH
                  </div>
                </div>
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  {(kpis?.cashCollected || 0).toLocaleString('fr-FR')} FCFA
                </p>
                <p className="text-xs text-gray-500 mt-2">À reverser en caisse centrale en fin de tournée</p>
              </div>

              <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-sm text-gray-500">Marge Commerciale Réalisée</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                    NET
                  </div>
                </div>
                <p className="text-3xl font-black text-purple-600 dark:text-purple-400">
                  +{(kpis?.totalMargin || 0).toLocaleString('fr-FR')} FCFA
                </p>
                <p className="text-xs text-gray-500 mt-2">Calculée sur le différentiel prix de gros / détail</p>
              </div>
            </div>

            {/* Tableau du Journal des Ventes */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-black text-lg text-gray-900 dark:text-white">
                    Journal Comptable des Ventes du Dépôt Flagship
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Historique certifié conforme aux normes camerounaises</p>
                </div>

                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <FileSpreadsheet size={15} /> Exporter Rapport
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-neutral-800/50 text-gray-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 rounded-l-xl">N° Commande</th>
                      <th className="p-3.5">Client</th>
                      <th className="p-3.5">Articles</th>
                      <th className="p-3.5">Frais Livr.</th>
                      <th className="p-3.5">Total Encaissé</th>
                      <th className="p-3.5">Statut</th>
                      <th className="p-3.5 rounded-r-xl text-right">Facture</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                    {orders?.map((o: any) => (
                      <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-gray-700 dark:text-gray-300">
                          {o.orderNumber}
                        </td>
                        <td className="p-3.5 font-medium">
                          {o.customer?.customerProfile?.firstName || 'Client'} ({o.customer?.phone})
                        </td>
                        <td className="p-3.5 text-gray-600 dark:text-gray-400">
                          {o.items?.map((it: any) => `${it.quantity}x ${it.product?.brand} 12.5Kg`).join(', ')}
                        </td>
                        <td className="p-3.5 font-semibold text-gray-500">
                          1 000 FCFA
                        </td>
                        <td className="p-3.5 font-black text-gray-900 dark:text-white">
                          {o.totalAmount?.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            o.status === 'DELIVERED' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {o.status === 'DELIVERED' ? 'ENCAISSÉ & LIVRÉ' : 'EN COURS'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setSelectedInvoiceOrderId(o.id)}
                            className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                          >
                            <Printer size={12} /> Facture PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CONTENU ONGLET 3 : GESTION DES BOUTEILLES & CONSIGNES */}
        {activeTab === 'INVENTORY' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-black text-lg text-gray-900 dark:text-white">
                    Stock Physique en Dépôt Central PLEINGAZ
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Suivi des bouteilles pleines prêtes pour la vente et des consignes vides en attente du camion d'emplissage
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs">
                  Stock Homologué Conforme
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {store?.inventories?.map((inv: any) => {
                  const isStockHigh = inv.level === 'HIGH';
                  const isStockMedium = inv.level === 'MEDIUM';
                  const badgeColor = isStockHigh 
                    ? 'bg-emerald-500 text-white' 
                    : isStockMedium 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-red-500 text-white';
                  const badgeLabel = isStockHigh ? 'STOCK OPTIMAL' : isStockMedium ? 'STOCK MOYEN' : 'STOCK BAS';

                  return (
                    <div key={inv.id} className="p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-base text-gray-900 dark:text-white">
                          {inv.product?.brand} {inv.product?.weightKg || 12.5} Kg
                        </span>
                        <span className={`px-2 py-0.5 font-black text-[10px] rounded uppercase ${badgeColor}`}>
                          {badgeLabel}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-200 dark:border-neutral-700">
                        <div>
                          <p className="text-gray-500 font-medium">Bouteilles Pleines</p>
                          <p className="text-xl font-black text-emerald-600 mt-0.5">
                            {inv.fullBottlesCount ?? 0} unités
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Vides récupérées</p>
                          <p className="text-xl font-black text-amber-600 mt-0.5">
                            {inv.emptyBottlesCount ?? 0} consignes
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 text-gray-500">
                        <span>
                          Prix recharge : <strong>{(inv.product?.publicPrice || 6500).toLocaleString('fr-FR')} FCFA</strong>
                        </span>
                        <span>
                          Consigne : <strong>{(inv.depositPrice || 15000).toLocaleString('fr-FR')} FCFA</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modal de facture officielle PLEINGAZ / INFOTECH S.A. */}
      {selectedInvoiceOrderId && (
        <InvoiceModal 
          orderId={selectedInvoiceOrderId} 
          isOpen={!!selectedInvoiceOrderId}
          onClose={() => setSelectedInvoiceOrderId(null)} 
        />
      )}
    </div>
  );
}
