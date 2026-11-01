'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  MapPin,
  ShoppingBag,
  FileText,
  LifeBuoy,
  LogOut,
  User,
  Shield,
  Menu,
  X,
} from 'lucide-react';

export default function AcheteurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    phone?: string;
    customerProfile?: { firstName?: string; lastName?: string };
  } | null>(null);

  // Ne pas appliquer la mise en page d'espace connecté aux routes d'authentification
  const isAuthPage =
    pathname === '/acheteur/connexion' ||
    pathname === '/acheteur/inscription' ||
    pathname === '/acheteur/mot-de-passe-oublie';

  useEffect(() => {
    if (!isAuthPage) {
      try {
        const stored = localStorage.getItem('pleingaz_buyer_profile');
        if (stored) {
          setUserProfile(JSON.parse(stored));
        }
      } catch {}
    }
  }, [isAuthPage]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    localStorage.removeItem('pleingaz_buyer_token');
    localStorage.removeItem('pleingaz_buyer_profile');
    // Supprimer le cookie de session acheteur
    document.cookie = 'pleingaz_session_buyer=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/');
  };

  // Les 5 entrées obligatoires et exclusives de l'espace Acheteur (R-01 Souverain)
  const navItems = [
    { label: 'Accueil', href: '/acheteur', icon: Home },
    { label: 'Trouver du gaz', href: '/acheteur/trouver-gaz', icon: MapPin },
    { label: 'Mes commandes', href: '/acheteur/commandes', icon: ShoppingBag },
    { label: 'Mes factures', href: '/acheteur/factures', icon: FileText },
    { label: 'Aide & Sécurité', href: '/acheteur/aide', icon: LifeBuoy },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row">
      {/* Barre latérale Bureau */}
      <aside className="hidden md:flex flex-col justify-between w-64 border-r border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl p-5 shrink-0">
        <div className="space-y-6">
          <Link href="/acheteur" className="flex items-center gap-2 px-2">
            <Image
              src="/logoprincipal.png"
              alt="Logo PLEINGAZ"
              width={140}
              height={40}
              className="h-9 w-auto object-contain"
            />
          </Link>

          {/* Badge Espace Acheteur */}
          <div className="px-3 py-2 rounded-xl bg-red-600/10 border border-red-600/20 text-xs text-red-400 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>Espace Client Particulier</span>
          </div>

          {/* Navigation 5 entrées */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profil connecté & Déconnexion */}
        <div className="pt-4 border-t border-neutral-900 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center font-bold text-xs border border-neutral-700">
              {userProfile?.customerProfile?.firstName?.[0] || 'C'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">
                {userProfile?.customerProfile?.firstName || 'Client'} {userProfile?.customerProfile?.lastName || ''}
              </p>
              <p className="text-[11px] text-neutral-500 truncate">
                {userProfile?.phone || '+237 6...'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="tap-target w-full rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Barre supérieure Mobile */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950 sticky top-0 z-40">
        <Link href="/acheteur">
          <Image
            src="/logoprincipal.png"
            alt="Logo PLEINGAZ"
            width={120}
            height={34}
            className="h-8 w-auto object-contain"
          />
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-neutral-900 text-neutral-300"
          aria-label="Menu de navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Tiroir Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
              <Image
                src="/logoprincipal.png"
                alt="Logo PLEINGAZ"
                width={120}
                height={34}
                className="h-8 w-auto object-contain"
              />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-neutral-900 text-neutral-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="mt-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold transition-all ${
                      isActive
                        ? 'bg-red-600 text-white'
                        : 'text-neutral-300 hover:bg-neutral-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-neutral-800 space-y-3">
            <button
              onClick={handleLogout}
              className="tap-target w-full rounded-xl bg-neutral-900 text-red-400 font-semibold text-sm flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
