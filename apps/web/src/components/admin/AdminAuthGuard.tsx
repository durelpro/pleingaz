"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si on est déjà sur la page de login, on ne fait rien de spécial au départ
    if (pathname === '/admin/login') {
      setIsAuthenticated(true); // Pour laisser la page se rendre
      return;
    }

    try {
      const userRaw = localStorage.getItem("pleingaz_user");
      const legacyAuth = localStorage.getItem("pleingaz_admin_auth");
      
      if (userRaw) {
        const user = JSON.parse(userRaw);
        if (['ADMIN', 'SUPER_ADMIN', 'ACCOUNT_MANAGER', 'AUDITOR'].includes(user.role)) {
          setIsAuthenticated(true);
          return;
        }
      }
      
      if (legacyAuth === "true") {
        setIsAuthenticated(true);
        return;
      }

      router.replace("/login/personnel?redirect=" + encodeURIComponent(pathname));
    } catch {
      router.replace("/login/personnel?redirect=" + encodeURIComponent(pathname));
    }
  }, [router, pathname]);

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div><p className="mt-4">Vérification des accès...</p></div>;
  }

  return <>{children}</>;
}
