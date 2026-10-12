'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const FAVORITES_KEY = 'pleingaz_favorite_stores';

export function getFavoriteStoreIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isStoreFavorite(storeId: string): boolean {
  const favs = getFavoriteStoreIds();
  return favs.includes(storeId);
}

export function toggleFavoriteStore(storeId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const favs = getFavoriteStoreIds();
    let updated: string[];
    let isNowFav = false;

    if (favs.includes(storeId)) {
      updated = favs.filter((id) => id !== storeId);
    } else {
      updated = [...favs, storeId];
      isNowFav = true;
    }

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('pleingaz_favorites_changed'));
    return isNowFav;
  } catch {
    return false;
  }
}

interface FavoriteButtonProps {
  storeId: string;
  storeName?: string;
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function FavoriteButton({
  storeId,
  storeName,
  size = 20,
  className = '',
  showText = false,
}: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    setIsFav(isStoreFavorite(storeId));

    const handleUpdate = () => {
      setIsFav(isStoreFavorite(storeId));
    };

    window.addEventListener('pleingaz_favorites_changed', handleUpdate);
    return () => window.removeEventListener('pleingaz_favorites_changed', handleUpdate);
  }, [storeId]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleFavoriteStore(storeId);
    setIsFav(result);
  };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={handleToggle}
      aria-label={isFav ? `Retirer ${storeName || 'cette boutique'} des favoris` : `Ajouter ${storeName || 'cette boutique'} aux favoris`}
      className={`p-2 rounded-xl transition-all flex items-center gap-1.5 focus:outline-none ${
        isFav
          ? 'bg-rose-50 text-rose-500 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400'
          : 'bg-gray-100/80 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:bg-neutral-800 dark:hover:bg-neutral-700'
      } ${className}`}
    >
      <Heart
        size={size}
        className={isFav ? 'fill-rose-500 text-rose-500' : 'transition-colors'}
      />
      {showText && (
        <span className="text-xs font-bold">
          {isFav ? 'Favori' : 'Ajouter aux favoris'}
        </span>
      )}
    </motion.button>
  );
}
