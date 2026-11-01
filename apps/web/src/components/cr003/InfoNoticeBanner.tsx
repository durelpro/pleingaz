'use client';

import React, { useState } from 'react';

interface InfoNoticeBannerProps {
  id: string;
  title: string;
  content: string;
  category?: 'INFO' | 'WARNING' | 'CRITICAL' | string;
  requiresAck?: boolean;
  onAck?: (noticeId: string) => Promise<void>;
}

export const InfoNoticeBanner: React.FC<InfoNoticeBannerProps> = ({
  id,
  title,
  content,
  category = 'INFO',
  requiresAck = true,
  onAck,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  if (dismissed) return null;

  const isWarning = category === 'WARNING';
  const isCritical = category === 'CRITICAL';

  const borderColor = isCritical
    ? 'border-red-500/40 bg-red-950/40'
    : isWarning
    ? 'border-amber-500/40 bg-amber-950/40'
    : 'border-blue-500/40 bg-blue-950/40';

  const badgeColor = isCritical
    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
    : isWarning
    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30';

  const handleAck = async () => {
    if (onAck) {
      setLoading(true);
      try {
        await onAck(id);
      } finally {
        setLoading(false);
      }
    }
    setDismissed(true);
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-xl backdrop-blur-xl transition-all ${borderColor}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${badgeColor}`}>
              {category}
            </span>
            <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed pr-4">{content}</p>
        </div>

        {requiresAck && (
          <button
            disabled={loading}
            onClick={handleAck}
            className="self-start sm:self-auto shrink-0 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 px-4 py-2 text-xs font-bold text-white transition-all border border-white/15"
          >
            {loading ? 'Validation...' : 'J\'ai compris'}
          </button>
        )}
      </div>
    </div>
  );
};
