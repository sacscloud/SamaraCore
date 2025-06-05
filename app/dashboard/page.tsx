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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-md"></div>
              <span className="text-xl font-bold">SamaraCore</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/dashboard/agents" className="text-sm font-medium text-muted-foreground">
                Agentes
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Bienvenido de vuelta
          </h1>
          <p className="text-muted-foreground">
            Gestiona y configura tus agentes de inteligencia artificial
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard/agents/new">
              <Button size="lg" className="w-full sm:w-auto">
                + Crear Nuevo Agente
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              📊 Ver Estadísticas
            </Button>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Mis Agentes</h2>
            <Link href="/dashboard/agents">
              <Button variant="ghost">Ver todos</Button>
            </Link>
          </div>

          {agentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-muted rounded w-full mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : agents.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No tienes agentes aún</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primer agente para comenzar a automatizar tareas con IA
              </p>
              <Link href="/dashboard/agents/new">
                <Button>Crear Mi Primer Agente</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.slice(0, 6).map((agent) => (
                <Card key={agent.agentId} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <Link href={`/dashboard/agents/${agent.agentId}`}>
                    <CardHeader>
                      <CardTitle className="text-lg">{agent.agentName}</CardTitle>
                      <CardDescription className="text-sm">
                        {agent.description || 'Sin descripción'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>🔧 {agent.tools?.length || 0} herramientas</span>
                        <span>•</span>
                        <span>🤖 {agent.agents?.length || 0} sub-agentes</span>
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