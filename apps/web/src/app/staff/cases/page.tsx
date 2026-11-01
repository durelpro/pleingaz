'use client';

import AdminCasesPage from '@/app/admin/cases/page';

export default function StaffCasesPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs flex items-center justify-between">
          <span className="font-mono text-neutral-400">
            Espace Staff Opérationnel • Rôle Gestionnaire de Compte (D-15)
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
            Maker-Checker Obligatoire
          </span>
        </div>
        <AdminCasesPage />
      </div>
    </div>
  );
}
