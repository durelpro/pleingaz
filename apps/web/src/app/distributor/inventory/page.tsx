import InventoryList from '@/components/distributor/InventoryList';
import BackButton from '@/components/common/BackButton';
import { PackageCheck } from 'lucide-react';

export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-12 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-orange-100/50 to-transparent dark:from-orange-900/10 -z-10" />
      
      <div className="max-w-4xl mx-auto mb-10">
        <div className="mb-8">
          <BackButton fallbackHref="/distributor/dashboard" label="Retour au tableau de bord" />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white dark:bg-neutral-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl flex items-center justify-center text-pleingaz-red">
            <PackageCheck size={32} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Mon Stock</h1>
            <p className="text-gray-500 mt-1 font-medium">Mettez à jour vos disponibilités en un clic. Vos clients comptent sur vous !</p>
          </div>
        </div>
      </div>
      
      <InventoryList />
    </div>
  );
}
