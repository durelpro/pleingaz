'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle, UploadCloud, X, Eye, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import BackButton from '@/components/common/BackButton';

export default function DocumentsPage() {
  const [viewingDoc, setViewingDoc] = useState<{ id: string, name: string, type: string } | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['x-demo-role'] = 'distributor_1';
    }
    return headers;
  };

  useEffect(() => {
    fetch('http://localhost:3001/distributor/documents', {
      headers: getAuthHeaders()
    })
    .then(res => res.json())
    .then(data => setDocuments(data || []))
    .catch(err => console.error(err))
    .finally(() => setIsLoading(false));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'AUTRE'); // Or let them select type

    try {
      const res = await fetch('http://localhost:3001/distributor/application/upload', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });
      if (res.ok) {
        const doc = await res.json();
        setDocuments(prev => [doc, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6 lg:p-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <BackButton fallbackHref="/distributor/dashboard" label="Retour au tableau de bord" />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 text-pleingaz-red rounded-2xl flex items-center justify-center">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">Mes Documents</h1>
            <p className="text-gray-500 mt-1 font-medium">Gérez vos pièces justificatives (Synchronisé avec le backend)</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-[2rem] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          {isLoading ? (
            <div className="flex justify-center items-center py-12"><Loader2 className="animate-spin text-pleingaz-red" size={32} /></div>
          ) : (
            <div className="space-y-6">
              {documents.length === 0 ? (
                <div className="p-6 bg-orange-50 dark:bg-orange-900/10 text-orange-800 dark:text-orange-400 rounded-2xl flex items-center gap-4">
                  <AlertCircle size={24} />
                  <p className="font-medium">Aucun document trouvé. Veuillez compléter votre profil.</p>
                </div>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="p-6 border border-gray-100 dark:border-neutral-800 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${doc.isValid === false ? 'bg-red-50 text-red-500' : doc.isValid ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-500'}`}>
                        {doc.isValid ? <CheckCircle size={24} /> : doc.isValid === false ? <X size={24} /> : <FileText size={24} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{doc.type}</h3>
                        <p className="text-sm text-gray-500">
                          {doc.isValid === null ? 'En attente de validation' : doc.isValid ? 'Validé' : `Refusé: ${doc.rejectedReason}`}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setViewingDoc({ id: doc.id, name: doc.fileName || doc.type, type: doc.mimeType })}
                      className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors flex items-center gap-2"
                    >
                      <Eye size={16} /> Voir
                    </button>
                  </div>
                ))
              )}
              
              <label className="block border-2 border-dashed border-gray-300 dark:border-neutral-800 rounded-2xl p-8 text-center hover:border-pleingaz-red transition-colors cursor-pointer group bg-gray-50 dark:bg-neutral-950">
                <div className="w-16 h-16 bg-gray-100 dark:bg-neutral-900 text-gray-400 group-hover:text-pleingaz-red group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all">
                  <UploadCloud size={24} />
                </div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Ajouter un document additionnel</p>
                <p className="text-xs text-gray-500 mt-2">JPEG, PNG ou PDF (Max 5Mo)</p>
                <input type="file" className="hidden" onChange={handleUpload} accept=".jpg,.jpeg,.png,.pdf" />
              </label>
            </div>
          )}
        </motion.div>
      </div>

      {/* Document View Modal via API */}
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
                <h3 className="font-black text-xl text-gray-900 dark:text-white truncate pr-4">{viewingDoc.name}</h3>
                <button onClick={() => setViewingDoc(null)} className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 bg-gray-100 dark:bg-neutral-950 overflow-hidden">
                <iframe 
                  src={`http://localhost:3001/distributor/documents/${viewingDoc.id}/file`} 
                  className="w-full h-full border-0"
                  title="Document"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
