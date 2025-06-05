'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthContext } from '@/components/AuthProvider';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { loginWithEmail, loginWithGoogle } = useAuthContext();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await loginWithEmail(email, password);
      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    
    try {
      const result = await loginWithGoogle();
      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión con Google');
      }
    } catch (error) {
      setError('Error al iniciar sesión con Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>
            Accede a tu cuenta de SamaraCore
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isGoogleLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || isGoogleLoading}
              />
            </div>
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                O continúa con
              </span>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            className="w-full"
          >
            {isGoogleLoading ? 'Redirigiendo a Google...' : 'Continuar con Google'}
          </Button>
          
          <div className="text-center text-sm">
            <span className="text-muted-foreground">¿No tienes cuenta? </span>
            <Link href="/auth/register" className="text-primary hover:underline">
              Regístrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 