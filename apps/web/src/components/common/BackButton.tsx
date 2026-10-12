'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
  className?: string;
}

export default function BackButton({
  fallbackHref = '/',
  label = 'Retour',
  className = '',
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 hover:border-pleingaz-red hover:text-pleingaz-red dark:hover:text-pleingaz-red transition-all font-bold text-sm group cursor-pointer ${className}`}
    >
      <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
      <span>{label}</span>
    </button>
  );
}
