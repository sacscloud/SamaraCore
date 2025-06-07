'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthContext } from '@/components/AuthProvider';
import ThemeToggle from '@/components/ui/theme-toggle';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { registerWithEmail, loginWithGoogle } = useAuthContext();

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }
    
    try {
      const result = await registerWithEmail(email, password);
      if (!result.success) {
        setError(result.error || 'Error al crear cuenta');
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
        setError(result.error || 'Error al registrarse con Google');
      }
    } catch (error) {
      setError('Error al registrarse con Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0E0E10] flex items-center justify-center relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>
      
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/5 via-transparent to-[#00FFC3]/5"></div>
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#3B82F6]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-[#00FFC3]/10 rounded-full blur-3xl"></div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 relative z-10 w-full max-w-6xl mx-auto px-6 pt-16">
        {/* Left Column - Benefits */}
        <div className="flex-1 max-w-lg order-2 lg:order-1">
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Únete a la revolución de la <span className="text-[#00FFC3]">IA personalizada</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              Miles de empresas ya confían en SamaraCore para automatizar procesos y optimizar resultados.
            </p>
          </div>
          
          <div className="space-y-6">
            {[
              {
                icon: "⚡",
                title: "Setup en 5 minutos",
                description: "Desde configuración hasta tu primer agente funcionando"
              },
              {
                icon: "🔒",
                title: "Máxima seguridad",
                description: "Tus datos permanecen en tu infraestructura"
              },
              {
                icon: "∞",
                title: "Sin límites de uso",
                description: "Crea tantos agentes como necesites, sin restricciones"
              }
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-100 dark:bg-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-700/30 backdrop-blur-sm">
                <div className="text-2xl">{benefit.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{benefit.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="flex-1 w-full max-w-md order-1 lg:order-2">
          <Card className="bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50 backdrop-blur-sm shadow-2xl hover:shadow-[#3B82F6]/10 transition-all duration-300">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-[#3B82F6]/30">
                <svg className="w-8 h-8 text-[#0E0E10]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Únete a SamaraCore
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
                Crea tu cuenta y comienza a construir agentes IA personalizados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <form onSubmit={handleEmailRegister} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900 dark:text-white font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading || isGoogleLoading}
                    className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#3B82F6]/50 focus:ring-[#3B82F6]/20 transition-colors h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-900 dark:text-white font-medium">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading || isGoogleLoading}
                    className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#3B82F6]/50 focus:ring-[#3B82F6]/20 transition-colors h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-900 dark:text-white font-medium">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading || isGoogleLoading}
                    className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#3B82F6]/50 focus:ring-[#3B82F6]/20 transition-colors h-12"
                  />
                </div>
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg backdrop-blur-sm">
                    {error}
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-xl hover:shadow-[#3B82F6]/30 text-[#0E0E10] font-semibold text-base transition-all duration-300 hover:scale-[1.02]" 
                  disabled={isLoading || isGoogleLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#0E0E10]/30 border-t-[#0E0E10] rounded-full animate-spin"></div>
                      Creando cuenta...
                    </div>
                  ) : (
                    'Crear Mi Cuenta'
                  )}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300 dark:border-gray-700/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-50 dark:bg-gray-900/40 px-3 text-gray-600 dark:text-gray-400 font-medium tracking-wider">
                    O continúa con
                  </span>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isLoading || isGoogleLoading}
                className="w-full h-12 border-gray-300 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:border-[#3B82F6]/50 hover:shadow-lg hover:shadow-[#3B82F6]/20 transition-all duration-300"
              >
                {isGoogleLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin"></div>
                    Redirigiendo a Google...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continuar con Google
                  </div>
                )}
              </Button>
              
              <div className="text-center text-sm">
                <span className="text-gray-400">¿Ya tienes cuenta? </span>
                <Link href="/auth/login" className="text-[#00FFC3] hover:text-[#00FFC3]/80 font-medium hover:underline transition-colors">
                  Inicia sesión aquí
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Al crear tu cuenta, aceptas nuestros{' '}
              <Link href="/terms" className="text-[#3B82F6] hover:underline">
                Términos de Servicio
              </Link>{' '}
              y{' '}
              <Link href="/privacy" className="text-[#3B82F6] hover:underline">
                Política de Privacidad
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 