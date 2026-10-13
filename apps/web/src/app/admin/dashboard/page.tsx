'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, AlertTriangle, PackageX, 
  MapPin, Store, Star, Download, Filter, FileText, CheckCircle, XCircle, Search, Eye, X, LogOut, Printer, ChevronDown
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BackButton from '@/components/common/BackButton';
import { apiFetch, clearSession, getToken, API_URL } from '@/lib/api';

export default function PilotageDashboard() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState('semaine');
  const [selectedCity, setSelectedCity] = useState('all');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [viewingDoc, setViewingDoc] = useState<{ id: string, name: string } | null>(null);
  const [pendingDocs, setPendingDocs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ outOfStockCount: 0, outOfStockStores: [], averageReliability: 100, pendingDocsCount: 0, cities: [] });
  const [chartData, setChartData] = useState<any[]>([]);
  const [distributorRankings, setDistributorRankings] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Modification de prix
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [newPublicPrice, setNewPublicPrice] = useState<number>(0);
  const [newDistributorPrice, setNewDistributorPrice] = useState<number>(0);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);

  const handleLogout = () => {
    clearSession();
    router.replace('/admin/login');
  };

  const loadData = () => {
    const cityParam = selectedCity !== 'all' ? `&city=${encodeURIComponent(selectedCity)}` : '';
    const cityQueryOnly = selectedCity !== 'all' ? `?city=${encodeURIComponent(selectedCity)}` : '';

    Promise.all([
      apiFetch('/admin/distributors/pending').then(res => res.json()),
      apiFetch(`/admin/system/dashboard-metrics${cityQueryOnly}`).then(res => res.json()),
      apiFetch(`/admin/system/sales-stats?timeframe=${timeframe}${cityParam}`).then(res => res.json()),
      apiFetch(`/admin/system/distributors/rankings${cityQueryOnly}`).then(res => res.json()),
      apiFetch('/catalog/products').then(res => res.json())
    ])
    .then(([pendingData, metricsData, chartDataRes, rankingsData, productsData]) => {
      if (Array.isArray(pendingData)) setPendingDocs(pendingData);
      if (metricsData) {
        setMetrics(metricsData);
        if (Array.isArray(metricsData.cities) && metricsData.cities.length > 0) {
          setAvailableCities(metricsData.cities);
        }
      }
      if (Array.isArray(chartDataRes)) setChartData(chartDataRes);
      if (Array.isArray(rankingsData)) setDistributorRankings(rankingsData);
      if (Array.isArray(productsData)) setProducts(productsData);
    })
    .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, [timeframe, selectedCity]);

  const handleValidation = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      const endpoint = action === 'APPROVED' ? 'approve' : 'reject';
      await apiFetch(`/admin/distributors/${id}/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify({ reason: action === 'REJECTED' ? 'Dossier incomplet' : undefined })
      });
      // Mettre à jour la liste localement
      setPendingDocs(prev => prev.map(doc => doc.id === id ? { ...doc, status: action } : doc));
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCsv = async (type: 'orders' | 'stores') => {
    try {
      const cityParam = selectedCity !== 'all' ? `?city=${encodeURIComponent(selectedCity)}` : '';
      const endpoint = type === 'orders' 
        ? `/admin/system/export/orders${cityParam ? cityParam + `&timeframe=${timeframe}` : `?timeframe=${timeframe}`}`
        : `/admin/system/export/stores${cityParam}`;
      
      const res = await apiFetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([data.content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename || `export-${type}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        alert("Erreur lors de l'exportation CSV");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur réseau");
    } finally {
      setShowExportMenu(false);
    }
  };

  const handlePrintPdf = () => {
    setShowExportMenu(false);
    window.print();
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsUpdatingPrice(true);
    try {
      const res = await apiFetch(`/catalog/admin/products/${editingProduct.id}/price`, {
        method: 'PUT',
        body: JSON.stringify({
          publicPrice: Number(newPublicPrice),
          distributorPrice: Number(newDistributorPrice),
        })
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, publicPrice: newPublicPrice, distributorPrice: newDistributorPrice } : p));
        setEditingProduct(null);
      } else {
        alert("Erreur lors de la mise à jour du prix");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur réseau");
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6 lg:p-10 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pleingaz-red/5 rounded-full filter blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full filter blur-[100px] -z-10" />
      
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation retour */}
        <div className="flex items-center justify-between">
          <BackButton fallbackHref="/" label="Retour à l'accueil" />
        </div>

        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <BarChart3 className="text-pleingaz-red" size={32} />
              Pilotage & Analytique
            </h1>
            <p className="text-gray-500 mt-2">Vision globale, fiabilité des distributeurs et prévention des ruptures.</p>
          </div>
          <div className="flex gap-3 relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl font-bold transition-colors ${showFilters ? 'bg-orange-50 border-pleingaz-red text-pleingaz-red dark:bg-orange-950/30' : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-300 hover:border-pleingaz-red'}`}
            >
              <Filter size={18} />
              Filtres {selectedCity !== 'all' && `(${selectedCity})`}
              <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                <Download size={18} />
                Exporter (PDF/CSV)
                <ChevronDown size={14} />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                  <button 
                    onClick={() => handleExportCsv('orders')}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2"
                  >
                    <FileText size={16} className="text-pleingaz-red" />
                    Exporter Commandes (CSV)
                  </button>
                  <button 
                    onClick={() => handleExportCsv('stores')}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2"
                  >
                    <Store size={16} className="text-blue-500" />
                    Exporter Distributeurs (CSV)
                  </button>
                  <div className="border-t border-gray-100 dark:border-neutral-800 my-1" />
                  <button 
                    onClick={handlePrintPdf}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2"
                  >
                    <Printer size={16} className="text-purple-500" />
                    Imprimer / Sauvegarder en PDF
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl border border-red-500/20 transition-colors"
              title="Se déconnecter"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Panneau de filtres dynamique */}
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-sm space-y-4"
          >
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">Filtrer par Ville :</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCity('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedCity === 'all' ? 'bg-pleingaz-red text-white' : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300'}`}
                  >
                    Toutes les villes
                  </button>
                  {availableCities.map(city => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedCity === city ? 'bg-pleingaz-red text-white' : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300'}`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">Période du Graphique :</label>
                <div className="flex gap-2">
                  {(['jour', 'semaine', 'mois'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setTimeframe(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${timeframe === p ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300'}`}
                    >
                      {p === 'jour' ? "Aujourd'hui" : p === 'semaine' ? '7 jours' : '4 semaines'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actionable Insights (Tâche 9.1) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InsightCard 
            title="Risque de Rupture" 
            value={`${metrics.outOfStockCount}`} 
            desc="Boutiques en stock critique" 
            icon={<PackageX />} 
            alert={metrics.outOfStockCount > 0 ? "HIGH" : "GOOD"}
          />
          <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-pleingaz-red to-red-500 p-6 rounded-3xl text-white shadow-lg shadow-orange-500/20 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-white/80">Alerte IA (Tâche 9.3)</h3>
              <AlertTriangle className="text-white/80" />
            </div>
            <div>
              <p className="text-3xl font-black mt-2">Ruptures signalées</p>
              <p className="text-white/90 mt-1">
                {metrics.outOfStockCount === 0 
                  ? "Aucune rupture de stock signalée actuellement sur le réseau." 
                  : `${metrics.outOfStockCount} distributeur(s) ont signalé une rupture de stock et attendent d'être approvisionnés.`
                }
              </p>
            </div>
          </div>
          <InsightCard 
            title="Fiabilité Moyenne" 
            value={`${metrics.averageReliability}/100`} 
            desc="Score réseau global (Tâche 9.4)" 
            icon={<Star />} 
            alert={metrics.averageReliability >= 80 ? "GOOD" : "MEDIUM"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xl text-gray-900 dark:text-white">Ventes vs Ruptures</h3>
              <select 
                className="bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-2 font-bold text-sm outline-none text-gray-900 dark:text-white"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="jour">Aujourd'hui</option>
                <option value="semaine">7 derniers jours</option>
                <option value="mois">4 dernières semaines</option>
              </select>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="ventes" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorVentes)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Heatmap Preview (Tâche 9.2) */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-xl text-gray-900 dark:text-white">Heatmap (Demande)</h3>
              <MapPin className="text-gray-400" />
            </div>
            <div className="flex-1 bg-gray-100 dark:bg-neutral-950 rounded-2xl relative overflow-hidden flex items-center justify-center border border-gray-200 dark:border-neutral-800">
              {/* Mock Map Background */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
              
              {/* Heat spots */}
              <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
              <div className="absolute top-1/2 left-2/3 w-24 h-24 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-60"></div>
              <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>

              <div className="z-10 text-center flex flex-col items-center">
                <p className="font-bold text-gray-700 dark:text-gray-300">Carte de chaleur active</p>
                <p className="text-xs text-gray-500 mt-1 mb-3">Basée sur les recherches sans résultat</p>
                <Link href="/admin/map" className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                  <Eye size={16} /> Ouvrir le Radar National
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Validation des Distributeurs (Tâche 3.3) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-xl text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="text-orange-500" />
              Dossiers en attente de validation
            </h3>
            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold rounded-full text-sm">
              {pendingDocs.filter(d => d.status === 'PENDING').length} Nouveaux
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 border-b border-gray-100 dark:border-neutral-800">
                  <th className="pb-3 font-bold">Boutique</th>
                  <th className="pb-3 font-bold">Localisation</th>
                  <th className="pb-3 font-bold">Documents</th>
                  <th className="pb-3 font-bold">Date</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                <AnimatePresence>
                  {pendingDocs.map((dossier) => (
                    <motion.tr 
                      key={dossier.id} 
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group hover:bg-gray-50 dark:hover:bg-neutral-950/50 transition-colors"
                    >
                      <td className="py-4 font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center">
                          <Store size={18} className="text-gray-500" />
                        </div>
                        {dossier.businessName || 'Demande sans nom'}
                      </td>
                      <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{dossier.city ? `${dossier.city}, ${dossier.neighborhood}` : 'Non défini'}</td>
                      <td className="py-4">
                        <div className="flex gap-2 flex-wrap">
                          {dossier.documents && dossier.documents.map((doc: any, i: number) => (
                            <button 
                              key={i}
                              onClick={() => setViewingDoc({ id: doc.id, name: `${dossier.businessName} - ${doc.type}` })}
                              className="px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-600 text-xs font-bold rounded-lg border border-gray-200 dark:border-neutral-700 transition-colors flex items-center gap-1"
                              title="Voir le document"
                            >
                              <Eye size={12} /> {doc.type}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 text-sm font-medium text-gray-500">{new Date(dossier.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 flex justify-end gap-2">
                        {dossier.status === 'PENDING' ? (
                          <>
                            <button 
                              onClick={() => handleValidation(dossier.id, 'APPROVED')}
                              className="p-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-500 hover:text-white rounded-xl transition-all shadow-sm" 
                              title="Accepter"
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button 
                              onClick={() => handleValidation(dossier.id, 'REJECTED')}
                              className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm" 
                              title="Refuser"
                            >
                              <XCircle size={20} />
                            </button>
                          </>
                        ) : (
                          <span className={`px-3 py-1 text-xs font-bold rounded-lg ${dossier.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {dossier.status === 'APPROVED' ? 'Approuvé' : 'Refusé'}
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {pendingDocs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 font-medium">
                      Aucun dossier en attente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Top Distributeurs Réels */}
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-6">
          <h3 className="font-black text-xl text-gray-900 dark:text-white mb-6">Classement Distributeurs (Fiabilité Réelle)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 border-b border-gray-100 dark:border-neutral-800">
                  <th className="pb-3 font-bold">Boutique</th>
                  <th className="pb-3 font-bold">Ville & Quartier</th>
                  <th className="pb-3 font-bold">Score Interne</th>
                  <th className="pb-3 font-bold">Badges</th>
                  <th className="pb-3 font-bold">Taux de Rupture</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {distributorRankings.map((store, i) => (
                  <tr key={store.id || i} className="group hover:bg-gray-50 dark:hover:bg-neutral-950/50 transition-colors">
                    <td className="py-4 font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                        <Store size={14} />
                      </div>
                      {store.name}
                    </td>
                    <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                      {store.city || 'Douala'} {store.neighborhood ? `• ${store.neighborhood}` : ''}
                    </td>
                    <td className="py-4">
                      <span className={`font-black ${store.score > 80 ? 'text-green-500' : store.score > 50 ? 'text-orange-500' : 'text-red-500'}`}>
                        {store.score}/100
                      </span>
                    </td>
                    <td className="py-4 flex gap-2">
                      {store.badges && store.badges.length > 0 ? (
                        store.badges.map((b: string) => (
                          <span key={b} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-lg border border-blue-200 dark:border-blue-800">
                            {b}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">Standard</span>
                      )}
                    </td>
                    <td className="py-4 font-bold text-gray-700 dark:text-gray-300">{store.rupture}</td>
                  </tr>
                ))}
                {distributorRankings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 font-medium">
                      Aucun distributeur enregistré pour cette sélection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gestion du Catalogue Réel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-black text-xl text-gray-900 dark:text-white flex items-center gap-2">
                <PackageX className="text-blue-500" />
                Catalogue Produits Officiel
              </h3>
              <p className="text-xs text-gray-500 mt-1">Prix homologués et tarifs distributeurs administrés</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 border-b border-gray-100 dark:border-neutral-800">
                  <th className="pb-3 font-bold">Produit</th>
                  <th className="pb-3 font-bold">Marque</th>
                  <th className="pb-3 font-bold">Poids</th>
                  <th className="pb-3 font-bold">Prix Public (XAF)</th>
                  <th className="pb-3 font-bold">Prix Distributeur (XAF)</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {products.map((prod) => (
                  <tr key={prod.id} className="group hover:bg-gray-50 dark:hover:bg-neutral-950/50 transition-colors">
                    <td className="py-4 font-bold text-gray-900 dark:text-white">{prod.brand} {prod.weightKg}kg</td>
                    <td className="py-4">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg border border-gray-200 dark:border-neutral-700">
                        {prod.brand}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{prod.weightKg} kg</td>
                    <td className="py-4 font-bold text-green-600">{new Intl.NumberFormat('fr-CM').format(prod.publicPrice)} FCFA</td>
                    <td className="py-4 font-medium text-gray-500">{new Intl.NumberFormat('fr-CM').format(prod.distributorPrice || prod.publicPrice)} FCFA</td>
                    <td className="py-4 flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEditingProduct(prod);
                          setNewPublicPrice(prod.publicPrice);
                          setNewDistributorPrice(prod.distributorPrice || prod.publicPrice);
                        }}
                        className="text-sm font-bold text-blue-500 hover:text-blue-600 underline cursor-pointer"
                      >
                        Modifier prix
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 font-medium">
                      Aucun produit dans le catalogue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Modal d'édition des prix */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  Modifier le prix : {editingProduct.brand} {editingProduct.weightKg}kg
                </h3>
                <button onClick={() => setEditingProduct(null)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSavePrice} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Prix Public Homologué (FCFA)</label>
                  <input
                    type="number"
                    value={newPublicPrice}
                    onChange={(e) => setNewPublicPrice(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Prix Distributeur / Dépôt (FCFA)</label>
                  <input
                    type="number"
                    value={newDistributorPrice}
                    onChange={(e) => setNewDistributorPrice(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 font-bold"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 py-3 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingPrice}
                    className="flex-1 py-3 bg-pleingaz-red text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
                  >
                    {isUpdatingPrice ? 'Enregistrement...' : 'Valider'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
      
      {/* Document View Modal (Tâche 3.3 Admin validation) */}
      <AnimatePresence>
        {viewingDoc && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setViewingDoc(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden max-w-4xl w-full h-[80vh] flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-neutral-800 shrink-0">
                <h3 className="font-black text-xl text-gray-900 dark:text-white truncate pr-4">Visionneuse : {viewingDoc.name}</h3>
                <button onClick={() => setViewingDoc(null)} className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors shrink-0">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 bg-gray-100 dark:bg-neutral-950 overflow-hidden">
                <iframe 
                  src={`${API_URL}/admin/distributors/documents/${viewingDoc.id}/file?token=${encodeURIComponent(getToken() || '')}`} 
                  className="w-full h-full border-0"
                  title="Document Admin"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function InsightCard({ title, value, desc, icon, alert }: { title: string, value: string, desc: string, icon: any, alert: 'HIGH' | 'MEDIUM' | 'GOOD' }) {
  const colors = {
    HIGH: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-600',
    MEDIUM: 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30 text-orange-600',
    GOOD: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30 text-green-600'
  };

  return (
    <div className={`p-6 rounded-3xl border \${colors[alert]} flex flex-col justify-between`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-white dark:bg-neutral-900 rounded-xl shadow-sm">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm font-bold opacity-80 mb-1">{title}</p>
        <h3 className="text-3xl font-black">{value}</h3>
        <p className="text-xs mt-2 opacity-75 font-medium">{desc}</p>
      </div>
    </div>
  );
}
