'use client';

import { useState, useEffect } from 'react';
import { X, Printer, Download, FileText, ShieldCheck, Flame, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InvoiceModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function InvoiceModal({ orderId, isOpen, onClose }: InvoiceModalProps) {
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !orderId) return;

    setIsLoading(true);
    setError(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const headers: any = { 'x-demo-role': 'customer_1' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`http://localhost:3001/invoices/${orderId}`, { headers })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Impossible de charger la facture.');
        }
        return res.json();
      })
      .then((data) => setInvoiceData(data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm print:hidden"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 rounded-3xl shadow-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden z-10 my-8 print:m-0 print:border-none print:shadow-none print:w-full"
        >
          {/* Action Bar (Hidden on print) */}
          <div className="p-4 sm:p-6 bg-gray-50 dark:bg-neutral-800/60 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <FileText className="text-pleingaz-red" size={20} />
              <span className="font-bold text-sm">
                Facture Officielle PLEINGAZ
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-gray-900 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Printer size={15} />
                Imprimer / Enregistrer en PDF
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Printable Invoice Body */}
          <div className="p-6 sm:p-10 space-y-8 bg-white text-gray-900">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-400 font-bold">
                <Loader2 className="animate-spin text-pleingaz-red" size={32} />
                <span>Chargement de la facture sécurisée...</span>
              </div>
            ) : error ? (
              <div className="py-12 text-center text-red-500 font-bold space-y-2">
                <p>Erreur : {error}</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                {/* Header Facture */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-gray-200 pb-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-pleingaz-red font-black text-2xl tracking-tight">
                      <Flame className="fill-pleingaz-red" size={28} />
                      <span>PLEINGAZ</span>
                    </div>
                    <p className="text-xs font-bold text-gray-800">
                      {invoiceData.companyDetails.companyName}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      RCCM : {invoiceData.companyDetails.rccm} • NIU : {invoiceData.companyDetails.niu}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Siège : {invoiceData.companyDetails.headquarters}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Tél : {invoiceData.companyDetails.supportPhone} • {invoiceData.companyDetails.website}
                    </p>
                  </div>

                  <div className="text-left sm:text-right space-y-1">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-[11px] font-black rounded-md tracking-wider uppercase mb-1">
                      FACTURE ACQUITTÉE
                    </span>
                    <h2 className="text-xl font-black text-gray-900">
                      {invoiceData.invoice.invoiceNumber}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">
                      Date : {new Date(invoiceData.invoice.createdAt).toLocaleString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      Réf. Commande : <strong>{invoiceData.orderNumber}</strong>
                    </p>
                  </div>
                </div>

                {/* Info Client & Vendeur */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-2xl border border-gray-200">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Point de vente agréé vendeur :
                    </span>
                    <p className="font-bold text-sm text-gray-900">
                      {invoiceData.seller.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {invoiceData.seller.neighborhood}, {invoiceData.seller.city}
                      {invoiceData.seller.landmark && ` (${invoiceData.seller.landmark})`}
                    </p>
                    <p className="text-xs text-gray-600">
                      Contact : {invoiceData.seller.phone}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Client / Destinataire :
                    </span>
                    <p className="font-bold text-sm text-gray-900">
                      {invoiceData.customer.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      Téléphone : {invoiceData.customer.phone}
                    </p>
                    {invoiceData.deliveryAddress && (
                      <p className="text-xs text-gray-600">
                        Adresse : {invoiceData.deliveryAddress}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 font-medium">
                      Mode : {invoiceData.type === 'B2C_DELIVERY' ? 'Livraison à domicile' : 'Retrait en magasin'}
                    </p>
                  </div>
                </div>

                {/* Tableau des Articles */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 text-gray-600 font-bold border-b border-gray-200">
                      <tr>
                        <th className="p-3.5">Désignation</th>
                        <th className="p-3.5 text-center">Quantité</th>
                        <th className="p-3.5 text-right">Prix Unitaire</th>
                        <th className="p-3.5 text-right">Total Net</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {invoiceData.items.map((item: any) => (
                        <tr key={item.id}>
                          <td className="p-3.5 font-bold text-gray-900">
                            Recharge Gaz {item.brand} ({item.weight})
                          </td>
                          <td className="p-3.5 text-center font-bold">{item.quantity}</td>
                          <td className="p-3.5 text-right font-medium">{item.unitPrice.toLocaleString('fr-FR')} FCFA</td>
                          <td className="p-3.5 text-right font-black text-gray-900">{item.totalPrice.toLocaleString('fr-FR')} FCFA</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totaux & Mentions de Paiement */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
                  <div className="text-xs text-gray-500 space-y-1.5 max-w-sm">
                    <div className="flex items-center gap-1.5 text-green-700 font-bold">
                      <ShieldCheck size={16} /> Paiement 100% Vérifié & Sécurisé
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Conforme aux lois régissant le commerce électronique et la distribution de gaz domestique au Cameroun. Prix du gaz homologué par l'État.
                    </p>
                  </div>

                  <div className="w-full sm:w-64 space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                    <div className="flex justify-between text-xs font-semibold text-gray-600">
                      <span>Total HT :</span>
                      <span>{invoiceData.totalAmount.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-gray-600">
                      <span>TVA (0% Gaz) :</span>
                      <span>0 FCFA</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-black text-pleingaz-red">
                      <span>Total TTC :</span>
                      <span>{invoiceData.totalAmount.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>
                </div>

                {/* Footer Signature */}
                <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left text-[11px] text-gray-400 gap-2">
                  <p>Document généré électroniquement par le réseau PLEINGAZ Digital Network.</p>
                  <p className="font-mono">ID: {invoiceData.invoice.id}</p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
