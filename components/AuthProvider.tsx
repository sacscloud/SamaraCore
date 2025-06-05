'use client';

import { createContext, useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const AuthContext = createContext<any>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si el usuario está autenticado y está en páginas de auth, redirigir al dashboard
    if (auth.user && !auth.loading) {
      if (pathname === '/auth/login' || pathname === '/auth/register' || pathname === '/') {
        router.push('/dashboard');
      }
    }
  }, [auth.user, auth.loading, pathname, router]);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
} 