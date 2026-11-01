'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search, MapPin, Store, CheckCircle2, Phone, Navigation, ArrowRight } from 'lucide-react';

export default function TrouverGazPage() {
  const [selectedCity, setSelectedCity] = useState('Douala');
  const [searchTerm, setSearchTerm] = useState('');

  const stores = [
    {
      id: 'store-1',
      name: 'Dépôt Gaz Akwa Central',
      city: 'Douala',
      neighborhood: 'Akwa (Face Hôtel)',
      phone: '+237 699 10 20 30',
      stock: 'BON',
      distance: '850 m',
      opening: '07h30 - 20h00',
    },
    {
      id: 'store-2',
      name: 'Point Relais Bonapriso',
      city: 'Douala',
      neighborhood: 'Bonapriso (Rue Njo-Njo)',
      phone: '+237 677 40 50 60',
      stock: 'BON',
      distance: '1.2 km',
      opening: '08h00 - 21h00',
    },
    {
      id: 'store-3',
      name: 'Dépôt Deido Rond-Point',
      city: 'Douala',
      neighborhood: 'Deido (Total)',
      phone: '+237 655 70 80 90',
      stock: 'MOYEN',
      distance: '2.4 km',
      opening: '07h00 - 19h30',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Points de Vente & Recharges Agréés
          </h1>
          <p className="text-xs text-neutral-400">
            Localisez les dépositaires officiels PLEINGAZ disposant de stock homologué en temps réel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['Douala', 'Yaoundé'].map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                selectedCity === city
                  ? 'bg-red-600 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Barre de recherche quartier */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Rechercher par quartier ou repère (ex: Bonapriso, Akwa, Deido...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
        />
      </div>

      {/* Liste des points de vente */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map((s) => (
          <div
            key={s.id}
            className="glass-panel rounded-2xl p-5 border border-neutral-800 flex flex-col justify-between hover:border-red-600/40 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Stock : {s.stock}
                </span>
                <span className="text-[11px] font-semibold text-neutral-400">
                  {s.distance}
                </span>
              </div>

              <h3 className="font-bold text-base text-white mb-1">{s.name}</h3>
              <p className="text-xs text-neutral-400 mb-4 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{s.neighborhood}</span>
              </p>

              <div className="text-xs text-neutral-400 space-y-1 pt-3 border-t border-neutral-900 mb-4">
                <p>Horaires : {s.opening}</p>
                <p>Téléphone : {s.phone}</p>
              </div>
            </div>

            <a
              href={`https://wa.me/237699000000?text=Je%20souhaite%20retirer%20une%20recharge%20au%20point%20${encodeURIComponent(s.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target w-full rounded-xl bg-neutral-900 hover:bg-red-600 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Réserver mon échange standard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
