import InventoryList from '@/components/distributor/InventoryList';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-12 px-4">
      <div className="max-w-4xl mx-auto mb-10">
        <Link href="/distributor/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-pleingaz-red transition-colors font-semibold mb-6">
          <ArrowLeft size={20} />
          Retour au tableau de bord
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Mon Stock 📦</h1>
        <p className="text-gray-500 mt-2">Mettez à jour vos disponibilités en un clic. Vos clients comptent sur vous !</p>
      </div>
      
      <InventoryList />
    </div>
  );
}
