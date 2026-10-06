import DistributorWizard from '@/components/distributor/Wizard';

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-12 px-4">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
          Devenez Distributeur <span className="text-transparent bg-clip-text bg-gradient-to-r from-pleingaz-orange to-pleingaz-red">PLEINGAZ</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Rejoignez le réseau leader au Cameroun. Suivez ces 3 étapes simples pour activer votre point de vente.
        </p>
      </div>
      
      <DistributorWizard />
    </div>
  );
}
