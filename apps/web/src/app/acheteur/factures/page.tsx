'use client';

import { useState } from 'react';
import { FileText, Download, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AcheteurFacturesPage() {
  const invoices = [
    {
      id: 'REC-2026-0891',
      date: '01/11/2026',
      orderRef: 'cmd-pg-2026-0891',
      description: 'Recharge Gaz Butane PLEINGAZ 12.5 kg',
      amount: 6500,
      paymentMethod: 'Paiement à la livraison',
      status: 'ÉMISE',
    },
    {
      id: 'REC-2026-0742',
      date: '14/10/2026',
      orderRef: 'cmd-pg-2026-0742',
      description: 'Recharge Gaz Butane PLEINGAZ 12.5 kg',
      amount: 6500,
      paymentMethod: 'Paiement à la livraison',
      status: 'ACQUITTÉE',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          Mes Reçus Fiscaux & Factures
        </h1>
        <p className="text-xs text-neutral-400">
          Téléchargez vos justificatifs numériques de recharge homologuée certifiés PLEINGAZ S.A.
        </p>
      </div>

      <div className="glass-panel rounded-2xl border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/60 text-neutral-400 uppercase tracking-wider text-[10px] border-b border-neutral-800">
              <tr>
                <th className="py-3.5 px-4">N° Reçu</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Désignation</th>
                <th className="py-3.5 px-4">Montant TTC</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4 text-right">Téléchargement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-neutral-200">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-neutral-900/40 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-white">{inv.id}</td>
                  <td className="py-4 px-4 text-neutral-400">{inv.date}</td>
                  <td className="py-4 px-4">{inv.description}</td>
                  <td className="py-4 px-4 font-extrabold text-red-400">
                    {inv.amount.toLocaleString()} FCFA
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => alert(`Téléchargement du reçu ${inv.id} au format PDF certifié.`)}
                      className="tap-target inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors text-[11px]"
                    >
                      <Download className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Reçu PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
