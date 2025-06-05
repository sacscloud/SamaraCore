'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        console.log('Manejando callback de autenticación...');
        
        const { auth } = await import('@/lib/firebase');
        const { getRedirectResult } = await import('firebase/auth');
        
        const result = await getRedirectResult(auth);
        
        if (result) {
          console.log('✅ Usuario autenticado en callback:', result.user.email);
          console.log('🔄 Redirigiendo a dashboard...');
          router.push('/dashboard');
        } else {
          console.log('❌ No hay resultado en callback, redirigiendo a login...');
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('❌ Error en callback:', error);
        router.push('/auth/login?error=auth_failed');
      }
    };

    handleRedirectResult();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Completando autenticación...</p>
      </div>
    </div>
  );
} 