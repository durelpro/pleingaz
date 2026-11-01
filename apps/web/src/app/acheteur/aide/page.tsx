'use client';

import { ShieldCheck, PhoneCall, AlertTriangle, MessageCircle, HelpCircle, Flame } from 'lucide-react';

export default function AcheteurAidePage() {
  const faqs = [
    {
      q: 'Comment m\'assurer que ma bouteille PLEINGAZ est neuve ou scellée d\'origine ?',
      a: 'Chaque bouteille pleine livrée ou retirée chez un distributeur officiel porte une capsule de scellage plastique inviolable thermocollée sur le robinet, portant le logo PLEINGAZ gravé.',
    },
    {
      q: 'Quel est le tarif officiel réglementé d\'une recharge 12.5 kg ?',
      a: 'Le prix homologué de la recharge de butane 12.5 kg au Cameroun est strictement plafonné à 6 500 FCFA. Aucun distributeur ou livreur agréé ne peut facturer un montant supérieur pour le gaz.',
    },
    {
      q: 'Quelle est la limite mensuelle de commande ?',
      a: 'Conformément aux directives de sécurité et de prévention des pénuries domestiques, un acheteur particulier est alloué à 5 bouteilles maximum par fenêtre glissante de 30 jours.',
    },
    {
      q: 'Quand dois-je remplacer mon détendeur et mon tuyau flexible ?',
      a: 'La date limite d\'utilisation est imprimée directement en blanc sur le tuyau en caoutchouc. Nous recommandons un renouvellement tous les 5 ans pour le détendeur et selon la date fabricant pour le tuyau.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          Aide, Sécurité & Assistance
        </h1>
        <p className="text-xs text-neutral-400">
          Guide de sécurité domestique et contact d'assistance directe PLEINGAZ.
        </p>
      </div>

      {/* Cartes d'urgence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-red-950/40 border border-red-800/40 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Urgence Fuite ou Incendie</h3>
              <p className="text-xs text-neutral-400">Pompiers du Cameroun : composez le 118</p>
            </div>
          </div>
          <a
            href="tel:118"
            className="tap-target w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Appel d'urgence gratuit (118)</span>
          </a>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-600/20 text-green-400 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Support Client WhatsApp</h3>
              <p className="text-xs text-neutral-400">Réponse sous quelques minutes</p>
            </div>
          </div>
          <a
            href="https://wa.me/237699000000?text=Bonjour%20PLEINGAZ%20Acheteur,%20j'ai%20besoin%20d'aide."
            target="_blank"
            rel="noopener noreferrer"
            className="tap-target w-full rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Discuter avec un conseiller</span>
          </a>
        </div>
      </div>

      {/* Foire aux questions */}
      <div className="glass-panel rounded-2xl p-6 border border-neutral-800 space-y-4">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-red-500" />
          <span>Foire Aux Questions</span>
        </h3>

        <div className="space-y-4 pt-2">
          {faqs.map((f, i) => (
            <div key={i} className="space-y-1.5 pb-3 border-b border-neutral-900 last:border-b-0">
              <h4 className="text-xs font-bold text-white">{f.q}</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
