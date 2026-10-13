'use client';

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiFetch, clearSession } from "@/lib/api";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si on est déjà sur la page de login, on ne bloque pas
    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      clearSession();
      router.replace('/admin/login');
      return;
    }

    apiFetch('/auth/me')
      .then(async (res) => {
        if (!res.ok) {
          clearSession();
          router.replace('/admin/login');
          return;
        }
        const data = await res.json();
        const roles = data.roles || (data.role ? [data.role] : []);
        if (!roles.includes('ADMIN')) {
          clearSession();
          router.replace('/admin/login');
          return;
        }
        setIsAuthenticated(true);
      })
      .catch(() => {
        clearSession();
        router.replace('/admin/login');
      });
  }, [router, pathname]);

  if (!isAuthenticated && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-zinc-400">Vérification des privilèges administrateur...</p>
      </div>
    );
  }

  return <>{children}</>;
}
