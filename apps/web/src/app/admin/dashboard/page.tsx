'use client';

import { useState } from 'react';
import { 
  BarChart3, TrendingUp, AlertTriangle, PackageX, 
  MapPin, Store, Star, Download, Filter, FileText, CheckCircle, XCircle, Search, Eye, X
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const mockChartData = [
  { name: 'Lun', ventes: 4000, ruptures: 24 },
  { name: 'Mar', ventes: 3000, ruptures: 13 },
  { name: 'Mer', ventes: 2000, ruptures: 98 },
  { name: 'Jeu', ventes: 2780, ruptures: 39 },
  { name: 'Ven', ventes: 1890, ruptures: 48 },
  { name: 'Sam', ventes: 2390, ruptures: 38 },
  { name: 'Dim', ventes: 3490, ruptures: 43 },
];

export default function PilotageDashboard() {
  const [timeframe, setTimeframe] = useState('semaine');
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);
  const [pendingDocs, setPendingDocs] = useState([
    { id: 1, name: 'ETS Pleingaz Bonamoussadi', loc: 'Douala, Bonamoussadi', docs: ['CNI', 'RCCM'], date: 'Il y a 1h', status: 'PENDING' },
    { id: 2, name: 'Maman Gaz Makepe', loc: 'Douala, Makepe', docs: ['CNI'], date: 'Il y a 3h', status: 'PENDING' },
    { id: 3, name: 'Dépôt Central Yaoundé', loc: 'Yaoundé, Biyem-Assi', docs: ['CNI', 'RCCM', 'NIU'], date: 'Hier', status: 'PENDING' },
  ]);

  const handleValidation = (id: number, action: 'APPROVED' | 'REJECTED') => {
    setPendingDocs(prev => prev.map(doc => doc.id === id ? { ...doc, status: action } : doc));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6 lg:p-10 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pleingaz-red/5 rounded-full filter blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full filter blur-[100px] -z-10" />
      
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <BarChart3 className="text-pleingaz-red" size={32} />
              Pilotage & Analytique
            </h1>
            <p className="text-gray-500 mt-2">Vision globale, fiabilité des distributeurs et prévention des ruptures.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl text-gray-700 dark:text-gray-300 font-bold hover:border-pleingaz-red transition-colors">
              <Filter size={18} />
              Filtres
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-opacity">
              <Download size={18} />
              Exporter (PDF/CSV)
            </button>
          </div>
        </div>

        {/* Actionable Insights (Tâche 9.1) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InsightCard 
            title="Risque de Rupture" 
            value="14" 
            desc="Boutiques en stock critique (Camgaz 12Kg)" 
            icon={<PackageX />} 
            alert="HIGH"
          />
          <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-pleingaz-red to-red-500 p-6 rounded-3xl text-white shadow-lg shadow-orange-500/20 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-white/80">Alerte IA (Tâche 9.3)</h3>
              <AlertTriangle className="text-white/80" />
            </div>
            <div>
              <p className="text-3xl font-black mt-2">Ruptures signalées</p>
              <p className="text-white/90 mt-1">2 distributeurs (dont ETS Pleingaz Bonamoussadi) ont signalé une rupture de stock récente et attendent d'être approvisionnés.</p>
            </div>
          </div>
          <InsightCard 
            title="Fiabilité Moyenne" 
            value="92/100" 
            desc="Score réseau global (Tâche 9.4)" 
            icon={<Star />} 
            alert="GOOD"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xl text-gray-900 dark:text-white">Ventes vs Ruptures</h3>
              <select 
                className="bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-2 font-bold text-sm outline-none"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="jour">Aujourd'hui</option>
                <option value="semaine">7 derniers jours</option>
                <option value="mois">Ce mois</option>
              </select>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

              <div className="z-10 text-center">
                <p className="font-bold text-gray-700 dark:text-gray-300">Carte de chaleur active</p>
                <p className="text-xs text-gray-500 mt-1">Basée sur les recherches sans résultat</p>
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
                        {dossier.name}
                      </td>
                      <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{dossier.loc}</td>
                      <td className="py-4">
                        <div className="flex gap-2 flex-wrap">
                          {dossier.docs.map((doc, i) => (
                            <button 
                              key={i}
                              onClick={() => setViewingDoc(`${dossier.name} - ${doc}`)}
                              className="px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-600 text-xs font-bold rounded-lg border border-gray-200 dark:border-neutral-700 transition-colors flex items-center gap-1"
                              title="Voir le document"
                            >
                              <Eye size={12} /> {doc}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 text-sm font-medium text-gray-500">{dossier.date}</td>
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
                          <span className={`px-3 py-1 text-xs font-bold rounded-lg \${dossier.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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

        {/* Top Distributeurs (Tâche 9.4) */}
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-6">
          <h3 className="font-black text-xl text-gray-900 dark:text-white mb-6">Classement Distributeurs (Fiabilité)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 border-b border-gray-100 dark:border-neutral-800">
                  <th className="pb-3 font-bold">Boutique</th>
                  <th className="pb-3 font-bold">Score Interne</th>
                  <th className="pb-3 font-bold">Badges</th>
                  <th className="pb-3 font-bold">Taux de Rupture</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {[
                  { name: 'Total Énergies Akwa', score: 98, badges: ['TOP_SELLER', 'FAST_DELIVERY'], rupture: '2%' },
                  { name: 'Boutique Maman Gaz', score: 85, badges: ['RELIABLE'], rupture: '12%' },
                  { name: 'Dépôt SCTM Bonamoussadi', score: 45, badges: [], rupture: '48%' },
                ].map((store, i) => (
                  <tr key={i} className="group hover:bg-gray-50 dark:hover:bg-neutral-950/50 transition-colors">
                    <td className="py-4 font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                        <Store size={14} />
                      </div>
                      {store.name}
                    </td>
                    <td className="py-4">
                      <span className={`font-black \${store.score > 80 ? 'text-green-500' : store.score > 50 ? 'text-orange-500' : 'text-red-500'}`}>
                        {store.score}/100
                      </span>
                    </td>
                    <td className="py-4 flex gap-2">
                      {store.badges.map(b => (
                        <span key={b} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-lg border border-blue-200 dark:border-blue-800">
                          {b}
                        </span>
                      ))}
                      {store.badges.length === 0 && <span className="text-gray-400">-</span>}
                    </td>
                    <td className="py-4 font-bold text-gray-700 dark:text-gray-300">{store.rupture}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gestion du Catalogue (Tâche 4.1) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-xl text-gray-900 dark:text-white flex items-center gap-2">
              <PackageX className="text-blue-500" />
              Catalogue Produits
            </h3>
            <button className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold rounded-xl text-sm border border-blue-200 dark:border-blue-900/30 hover:bg-blue-100 transition-colors">
              + Nouveau Produit
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 border-b border-gray-100 dark:border-neutral-800">
                  <th className="pb-3 font-bold">Produit</th>
                  <th className="pb-3 font-bold">Marque</th>
                  <th className="pb-3 font-bold">Poids</th>
                  <th className="pb-3 font-bold">Prix Public (XAF)</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {[
                  { id: 1, name: 'Bouteille 12.5Kg', brand: 'Camgaz', weight: '12.5 kg', price: '6 500' },
                  { id: 2, name: 'Bouteille 12.5Kg', brand: 'SCTM', weight: '12.5 kg', price: '6 500' },
                  { id: 3, name: 'Bouteille 12.5Kg', brand: 'Tradex', weight: '12.5 kg', price: '6 500' },
                ].map((prod) => (
                  <tr key={prod.id} className="group hover:bg-gray-50 dark:hover:bg-neutral-950/50 transition-colors">
                    <td className="py-4 font-bold text-gray-900 dark:text-white">{prod.name}</td>
                    <td className="py-4">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg border border-gray-200 dark:border-neutral-700">
                        {prod.brand}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{prod.weight}</td>
                    <td className="py-4 font-bold text-green-600">{prod.price}</td>
                    <td className="py-4 flex justify-end gap-2">
                      <button className="text-sm font-bold text-blue-500 hover:text-blue-600 underline">Éditer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

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
              className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-neutral-800">
                <h3 className="font-black text-xl text-gray-900 dark:text-white truncate pr-4">Visionneuse : {viewingDoc}</h3>
                <button onClick={() => setViewingDoc(null)} className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors shrink-0">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 flex flex-col items-center justify-center bg-gray-50 dark:bg-neutral-950 min-h-[400px]">
                {/* Mock document visual */}
                <div className="w-64 h-80 bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-gray-200 dark:border-neutral-700 p-6 flex flex-col gap-4">
                  <div className="w-full h-8 bg-gray-200 dark:bg-neutral-700 rounded-md" />
                  <div className="w-3/4 h-4 bg-gray-200 dark:bg-neutral-700 rounded-md" />
                  <div className="w-1/2 h-4 bg-gray-200 dark:bg-neutral-700 rounded-md" />
                  <div className="mt-auto w-16 h-16 bg-gray-200 dark:bg-neutral-700 rounded-full self-end" />
                </div>
                <p className="mt-6 text-gray-500 font-medium">Ceci est un aperçu simulé du document.</p>
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
