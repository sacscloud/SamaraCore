'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useAgent } from '@/hooks/useAgent';
import ThemeToggle from '@/components/ui/theme-toggle';
import { Trash2, Copy, Check, Globe, Lock } from 'lucide-react';
import { useConfirmationModal } from '@/components/ui/confirmation-modal';

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { agents, loading: agentsLoading, fetchAgents, deleteAgent } = useAgent();
  const router = useRouter();
  const hasFetchedAgents = useRef(false);
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null);
  const [copiedAgentId, setCopiedAgentId] = useState<string | null>(null);
  const { showConfirmation, ConfirmationModal } = useConfirmationModal();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && !hasFetchedAgents.current) {
      hasFetchedAgents.current = true;
      fetchAgents();
    }
    
    if (!user) {
      hasFetchedAgents.current = false;
    }
  }, [user, fetchAgents]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleCopyAgentId = async (agentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(agentId);
      setCopiedAgentId(agentId);
      setTimeout(() => setCopiedAgentId(null), 2000);
    } catch (error) {
      console.error('Error copiando ID:', error);
    }
  };

  const handleDeleteAgent = async (agentId: string, agentName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    showConfirmation({
      title: 'Eliminar Agente',
      description: `¿Estás seguro de que deseas eliminar el agente "${agentName}"? Esta acción no se puede deshacer y perderás toda su configuración.`,
      confirmText: 'Sí, Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
      setDeletingAgentId(agentId);
      
      try {
        const result = await deleteAgent(agentId);
        
        if (result.success) {
          await fetchAgents();
        } else {
            throw new Error(result.error || 'Error al eliminar el agente');
        }
      } catch (error) {
        console.error('Error al eliminar agente:', error);
          throw error;
      } finally {
        setDeletingAgentId(null);
      }
    }
    });
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
    <div className="min-h-screen bg-white dark:bg-[#0E0E10] text-gray-900 dark:text-white font-['Inter']">
      {/* Header */}
              <header className="border-b border-gray-200 dark:border-gray-800/50 backdrop-blur-sm sticky top-0 z-50 bg-white/80 dark:bg-[#0E0E10]/80">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <span className="text-sm font-bold text-[#0E0E10]">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">SamaraCore</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-[#00FFC3] px-3 py-2 rounded-lg bg-[#00FFC3]/10 border border-[#00FFC3]/20">
                Dashboard
              </Link>
              <Link href="/agentes-publicos" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#3B82F6] px-3 py-2 rounded-lg hover:bg-[#3B82F6]/10 transition-colors">
                Agentes Públicos
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm text-gray-400">Bienvenido</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
            </div>
            <ThemeToggle />
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-gray-300 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:border-red-500/50 hover:text-red-400 transition-all duration-300"
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
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Bienvenido de vuelta
              </h1>
              <p className="text-gray-400 text-lg">
                Gestiona y configura tus agentes de inteligencia artificial
              </p>
            </div>
          </div>
        </div>

        {/* Agents Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tus Agentes</h2>
            <Link href="/dashboard/agents/new">
              <Button className="bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-lg hover:shadow-[#3B82F6]/30 text-[#0E0E10] font-semibold transition-all duration-300 hover:scale-105">
                + Crear Agente
              </Button>
            </Link>
          </div>

          {agentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-xl mb-4"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : agents.length === 0 ? (
            <Card className="bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50">
              <CardContent className="p-12 text-center">
                                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800/50 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  ¡Es hora de crear tu primer agente!
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Los agentes de IA te ayudarán a automatizar tareas, analizar datos y mejorar tu productividad.
                </p>
                <Link href="/dashboard/agents/new">
                  <Button className="bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-lg hover:shadow-[#3B82F6]/30 text-[#0E0E10] font-semibold transition-all duration-300 hover:scale-105">
                    Crear Mi Primer Agente
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Link key={agent.agentId} href={`/dashboard/agents/${agent.agentId}`} className="group">
                  <Card className="bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50 hover:border-[#3B82F6]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#3B82F6]/10 hover:-translate-y-1 cursor-pointer relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-6 h-6 text-[#0E0E10]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleCopyAgentId(agent.agentId, e)}
                            className="text-gray-400 hover:text-[#00FFC3] hover:bg-[#00FFC3]/10 transition-colors p-2"
                            title="Copiar ID del agente"
                          >
                            {copiedAgentId === agent.agentId ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteAgent(agent.agentId, agent.agentName, e)}
                            disabled={deletingAgentId === agent.agentId}
                            className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors p-2"
                            title="Eliminar agente"
                          >
                            {deletingAgentId === agent.agentId ? (
                              <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-gray-900 dark:text-white group-hover:text-[#00FFC3] transition-colors">
                          {agent.agentName}
                        </CardTitle>
                        <span 
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            agent.isPublic 
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}
                        >
                          {agent.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          {agent.isPublic ? 'Público' : 'Privado'}
                        </span>
                      </div>
                      <CardDescription className="text-gray-400 mb-2">
                        {agent.description || 'Sin descripción'}
                      </CardDescription>
                      <div className="bg-gray-100 dark:bg-gray-800/30 rounded-lg p-2 mb-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          ID: {agent.agentId}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                          <span>{agent.tools?.length || 0} herramientas</span>
                        </div>
                        <span className="w-2 h-2 bg-[#00FFC3] rounded-full"></span>
                        <span className="text-[#00FFC3]">Activo</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      <ConfirmationModal />
    </div>
  );
} 