'use client';

import { useState } from 'react';
import { Database, Plus, Search, BookOpen, AlertCircle } from 'lucide-react';

export default function KnowledgeBaseAdmin() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const [docs, setDocs] = useState([
    { id: '1', title: 'Politique des prix B2C', status: 'ACTIVE', version: 2 },
    { id: '2', title: 'Horaires de livraison Standard', status: 'ACTIVE', version: 1 },
  ]);

  const handleSave = () => {
    // Appel API simulé vers /ai/knowledge
    if (!title || !content) return;
    setDocs([...docs, { id: Date.now().toString(), title, status: 'ACTIVE', version: 1 }]);
    setTitle('');
    setContent('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <Database className="text-pleingaz-orange" />
              Base de Connaissances IA (RAG)
            </h1>
            <p className="text-gray-500 mt-2">Gérez les documents officiels que l'IA utilisera pour répondre aux clients.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des documents */}
          <div className="lg:col-span-1 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Rechercher un document..." 
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl focus:border-pleingaz-orange outline-none"
              />
            </div>
            
            <div className="space-y-3">
              {docs.map(doc => (
                <div key={doc.id} className="p-4 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl cursor-pointer hover:border-pleingaz-orange transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white">{doc.title}</h3>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-lg font-bold">v{doc.version}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <BookOpen size={16} />
                    <span>{doc.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Éditeur */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 space-y-6">
              
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl flex gap-3 border border-blue-100 dark:border-blue-900/30">
                <AlertCircle className="text-blue-500 shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Important :</strong> L'IA de PLEINGAZ (Tâche 8.1) se basera exclusivement sur ces documents pour formuler ses réponses officielles. Soyez précis.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Titre du document</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Politique de retour des bouteilles vides" 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:border-pleingaz-orange outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Contenu Officiel (Markdown supporté)</label>
                  <textarea 
                    rows={12}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Écrivez le contenu ici..." 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:border-pleingaz-orange outline-none resize-y"
                  ></textarea>
                </div>
                
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
                  <button className="px-6 py-3 font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    Annuler
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-6 py-3 bg-pleingaz-orange hover:bg-orange-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5"
                  >
                    <Plus size={20} />
                    Sauvegarder le Document
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
