'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, Megaphone } from 'lucide-react';

interface NoticeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  targetRole: string;
  targetCity: string;
  requiresAck: boolean;
  hasAcknowledged: boolean;
  createdAt: string;
}

export function InfoNoticesDrawer({ role = 'CUSTOMER', city = 'Douala' }: { role?: string; city?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/v1/info-notices/my?role=${role}&city=${city}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setNotices(data.notices || []);
        setUnacknowledgedCount(data.unacknowledgedCount || 0);
      } else {
        // Fallback informatif local si non authentifié ou dev
        setNotices([
          {
            id: 'demo-notice-1',
            title: 'Disponibilité du gaz au Cameroun',
            content: 'Tous les dépôts officiels PLEINGAZ sont approvisionnés aux prix réglementés.',
            category: 'INFO',
            targetRole: 'ALL',
            targetCity: 'ALL',
            requiresAck: false,
            hasAcknowledged: true,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      // Tolérance réseau
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [role, city]);

  const handleAcknowledge = async (noticeId: string) => {
    try {
      await fetch(`${apiUrl}/api/v1/info-notices/${noticeId}/ack`, {
        method: 'POST',
      });
      setNotices((prev) =>
        prev.map((n) => (n.id === noticeId ? { ...n, hasAcknowledged: true } : n))
      );
      setUnacknowledgedCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Acquittement optimiste local
      setNotices((prev) =>
        prev.map((n) => (n.id === noticeId ? { ...n, hasAcknowledged: true } : n))
      );
      setUnacknowledgedCount((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <>
      {/* Bouton Cloche avec Pastille */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-700 hover:text-red-600 transition-colors rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
        title="Rubrique Infos & Annonces"
        aria-label="Voir les annonces officielles PLEINGAZ"
      >
        <Bell className="w-6 h-6" />
        {unacknowledgedCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
            {unacknowledgedCount}
          </span>
        )}
      </button>

      {/* Tiroir coulissant (Drawer) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop sombre */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Panneau */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Header du tiroir */}
            <div className="p-4 bg-red-600 text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-2">
                <Megaphone className="w-5 h-5" />
                <h2 className="font-bold text-lg">Rubrique Infos & Annonces</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Corps du tiroir */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading && <p className="text-sm text-gray-500 text-center py-4">Chargement des annonces...</p>}

              {!loading && notices.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <Info className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Aucune nouvelle annonce pour le moment.</p>
                </div>
              )}

              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className={`border rounded-xl p-4 transition-all ${
                    notice.requiresAck && !notice.hasAcknowledged
                      ? 'border-amber-400 bg-amber-50/50 shadow-sm'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        notice.category === 'ALERT'
                          ? 'bg-red-100 text-red-700'
                          : notice.category === 'REGULATION'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {notice.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(notice.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base mb-1">{notice.title}</h3>
                  <p className="text-sm text-gray-700 mb-3 whitespace-pre-line leading-relaxed">
                    {notice.content}
                  </p>

                  {/* Accusé de lecture "J'ai compris" (D-18) */}
                  {notice.requiresAck && !notice.hasAcknowledged ? (
                    <button
                      onClick={() => handleAcknowledge(notice.id)}
                      className="w-full mt-2 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1 shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>J&apos;ai compris et pris note</span>
                    </button>
                  ) : notice.requiresAck && notice.hasAcknowledged ? (
                    <div className="flex items-center space-x-1 text-xs text-emerald-600 mt-2">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Information acquittée</span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Pied du tiroir */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                Communications officielles certifiées par la Direction PLEINGAZ
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
