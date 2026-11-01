'use client';

import React from 'react';

interface QuotaGaugeProps {
  consumed: number;
  limit?: number;
  remaining?: number;
  phone?: string;
  onOrderClick?: () => void;
}

export const QuotaGauge: React.FC<QuotaGaugeProps> = ({
  consumed = 0,
  limit = 5,
  remaining = 5,
  phone,
  onOrderClick,
}) => {
  const currentConsumed = Math.min(consumed, limit);
  const currentRemaining = Math.max(0, limit - currentConsumed);
  const isBlocked = currentConsumed >= limit;
  const isWarning = currentConsumed === limit - 1;

  // Calcul couleur d'accentuation
  const statusColor = isBlocked
    ? 'bg-red-600 border-red-500'
    : isWarning
    ? 'bg-amber-500 border-amber-400'
    : 'bg-emerald-500 border-emerald-400';

  const statusText = isBlocked
    ? 'Plafond mensuel atteint (5/5)'
    : isWarning
    ? 'Attention : 1 dernière recharge autorisée ce mois'
    : 'Quota mensuel disponible';

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-neutral-900/90 to-neutral-950/90 p-5 shadow-2xl backdrop-blur-xl transition-all">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/20 text-red-500 shadow-inner">
            <span className="text-xl">🔥</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Quota de Gaz Particulier</h3>
            <p className="text-xs text-neutral-400">Plafond souverain de 5 bouteilles / 30 jours (D-14)</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-white">{currentConsumed}</span>
          <span className="text-sm font-semibold text-neutral-400">/{limit}</span>
        </div>
      </div>

      {/* Barre segmentée à 5 crans distincts */}
      <div className="my-3 grid grid-cols-5 gap-2">
        {Array.from({ length: limit }).map((_, idx) => {
          const isFilled = idx < currentConsumed;
          return (
            <div
              key={idx}
              className={`h-4 rounded-full border transition-all duration-300 ${
                isFilled
                  ? `${statusColor} shadow-[0_0_12px_rgba(220,38,38,0.4)]`
                  : 'border-white/10 bg-neutral-800/60'
              }`}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2 text-xs">
        <span
          className={`font-semibold ${
            isBlocked ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
          }`}
        >
          {statusText}
        </span>
        <span className="text-neutral-400 font-medium">
          {currentRemaining} restante{currentRemaining > 1 ? 's' : ''}
        </span>
      </div>

      {isBlocked ? (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-950/30 p-3 text-center text-xs text-red-300">
          ⚠️ Vos 5 bouteilles allouées ce mois-ci ont été consommées. Prochaine recharge autorisée dans quelques jours.
        </div>
      ) : (
        onOrderClick && (
          <button
            onClick={onOrderClick}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-red-600 to-red-700 py-3 text-center text-sm font-bold text-white shadow-lg shadow-red-900/30 transition-all hover:scale-[0.99] active:scale-[0.97]"
          >
            Commander ma recharge (6 500 FCFA)
          </button>
        )
      )}
    </div>
  );
};
