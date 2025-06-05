'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useAgent } from '@/hooks/useAgent';
import { ArrowLeft, Plus, Search, Trash2 } from 'lucide-react';

export default function AgentsPage() {
  const { user, loading: authLoading } = useAuth();
  const { agents, loading: agentsLoading, fetchAgents, deleteAgent } = useAgent();
  const router = useRouter();
  const hasFetchedAgents = useRef(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null);

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
  }, [user]);

  const handleDeleteAgent = async (agentId: string, agentName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm(`¿Estás seguro de que deseas eliminar el agente "${agentName}"? Esta acción no se puede deshacer.`)) {
      setDeletingAgentId(agentId);
      const result = await deleteAgent(agentId);
      
      if (result.success) {
        await fetchAgents();
      } else {
        alert(`Error al eliminar el agente: ${result.error}`);
      }
      
      setDeletingAgentId(null);
    }
  };

  const filteredAgents = agents.filter(agent => 
    agent.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (agent.description && agent.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground">
                Dashboard
              </Link>
              <Link href="/dashboard/agents" className="text-sm font-medium">
                Agentes
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">
              Mis Agentes
            </h1>
          </div>
          <p className="text-muted-foreground">
            Gestiona todos tus agentes de inteligencia artificial
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar agentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Link href="/dashboard/agents/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Nuevo Agente
            </Button>
          </Link>
        </div>

        {/* Agents Grid */}
        {agentsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        ) : filteredAgents.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No se encontraron agentes' : 'No tienes agentes aún'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Intenta con otro término de búsqueda' : 'Crea tu primer agente para comenzar a automatizar tareas con IA'}
            </p>
            {!searchTerm && (
              <Link href="/dashboard/agents/new">
                <Button>Crear Mi Primer Agente</Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <Card key={agent.agentId} className="hover:shadow-lg transition-shadow cursor-pointer relative group">
                <Link href={`/dashboard/agents/${agent.agentId}`}>
                  <CardHeader>
                    <CardTitle className="text-lg pr-8">{agent.agentName}</CardTitle>
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDeleteAgent(agent.agentId, agent.agentName, e)}
                  disabled={deletingAgentId === agent.agentId}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}