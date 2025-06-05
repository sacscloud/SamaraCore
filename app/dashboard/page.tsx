'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useAgent } from '@/hooks/useAgent';

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { agents, loading: agentsLoading, fetchAgents } = useAgent();
  const router = useRouter();
  const hasFetchedAgents = useRef(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Solo fetch agents una vez cuando el usuario esté disponible
    if (user && !hasFetchedAgents.current) {
      hasFetchedAgents.current = true;
      fetchAgents();
    }
    
    // Reset flag cuando el usuario cambie
    if (!user) {
      hasFetchedAgents.current = false;
    }
  }, [user]); // Solo user como dependencia, NO fetchAgents

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0E0E10] text-white font-['Inter'] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Cargando tu espacio de trabajo...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0E0E10] text-white font-['Inter']">
      {/* Header */}
      <header className="border-b border-gray-800/50 backdrop-blur-sm sticky top-0 z-50 bg-[#0E0E10]/80">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <span className="text-sm font-bold text-[#0E0E10]">S</span>
              </div>
              <span className="text-xl font-bold text-white">SamaraCore</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-[#00FFC3] px-3 py-2 rounded-lg bg-[#00FFC3]/10 border border-[#00FFC3]/20">
                Dashboard
              </Link>
              <Link href="/dashboard/agents" className="text-sm font-medium text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-all duration-200">
                Agentes
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm text-gray-400">Bienvenido</p>
              <p className="text-sm font-medium text-white">{user.email}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-gray-600/50 text-gray-300 hover:text-white hover:bg-gray-800/50 hover:border-red-500/50 hover:text-red-400 transition-all duration-300"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/5 via-transparent to-[#00FFC3]/5 pointer-events-none"></div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 relative">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-2xl flex items-center justify-center shadow-lg shadow-[#3B82F6]/30">
              <svg className="w-8 h-8 text-[#0E0E10]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Bienvenido de vuelta
              </h1>
              <p className="text-gray-400 text-lg">
                Gestiona y configura tus agentes de inteligencia artificial
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6 text-white">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/dashboard/agents/new" className="group">
              <Card className="bg-gray-900/40 border-gray-700/50 hover:border-[#3B82F6]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#3B82F6]/10 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-[#0E0E10]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-[#00FFC3] transition-colors">Nuevo Agente</h3>
                  <p className="text-gray-400 text-sm mt-1">Crear desde cero</p>
                </CardContent>
              </Card>
            </Link>

            <Card className="bg-gray-900/40 border-gray-700/50 hover:border-[#3B82F6]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#3B82F6]/10 hover:-translate-y-1 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gray-800/50 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-[#3B82F6]/20 transition-colors duration-300">
                  <svg className="w-6 h-6 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white group-hover:text-[#00FFC3] transition-colors">Estadísticas</h3>
                <p className="text-gray-400 text-sm mt-1">Ver métricas</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/40 border-gray-700/50 hover:border-[#3B82F6]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#3B82F6]/10 hover:-translate-y-1 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gray-800/50 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-[#00FFC3]/20 transition-colors duration-300">
                  <svg className="w-6 h-6 text-[#00FFC3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white group-hover:text-[#00FFC3] transition-colors">Plantillas</h3>
                <p className="text-gray-400 text-sm mt-1">Usar templates</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/40 border-gray-700/50 hover:border-[#3B82F6]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#3B82F6]/10 hover:-translate-y-1 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gray-800/50 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors duration-300">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white group-hover:text-[#00FFC3] transition-colors">Documentación</h3>
                <p className="text-gray-400 text-sm mt-1">Guías y tutoriales</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Mis Agentes IA</h2>
            <Link href="/dashboard/agents">
              <Button 
                variant="ghost" 
                className="text-[#00FFC3] hover:text-white hover:bg-[#00FFC3]/10 border border-[#00FFC3]/20 hover:border-[#00FFC3]/50 transition-all duration-300"
              >
                Ver todos
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>

          {agentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-gray-900/40 border-gray-700/50 animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : agents.length === 0 ? (
            <Card className="bg-gray-900/40 border-gray-700/50 p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#3B82F6]/20 to-[#00FFC3]/20 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                <svg className="w-12 h-12 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">¡Comienza tu viaje con IA!</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                Crea tu primer agente para comenzar a automatizar tareas y potenciar tu productividad con inteligencia artificial.
              </p>
              <Link href="/dashboard/agents/new">
                <Button className="bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-xl hover:shadow-[#3B82F6]/30 text-[#0E0E10] font-semibold transition-all duration-300 hover:scale-105">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Mi Primer Agente
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.slice(0, 6).map((agent) => (
                <Card key={agent.agentId} className="bg-gray-900/40 border-gray-700/50 hover:border-[#3B82F6]/50 hover:shadow-lg hover:shadow-[#3B82F6]/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <Link href={`/dashboard/agents/${agent.agentId}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-white group-hover:text-[#00FFC3] transition-colors">
                            {agent.agentName}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-400 mt-1">
                            {agent.description || 'Sin descripción disponible'}
                          </CardDescription>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6]/20 to-[#00FFC3]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-6 h-6 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                          <span>{agent.tools?.length || 0} herramientas</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>{agent.agents?.length || 0} sub-agentes</span>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 