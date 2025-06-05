'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useAgent } from '@/hooks/useAgent';
import { ArrowLeft } from 'lucide-react';

export default function NewAgentPage() {
  const { user, loading: authLoading } = useAuth();
  const { saveAgent } = useAgent();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    agentName: '',
    description: '',
    systemPrompt: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agentName.trim()) {
      alert('Por favor, ingresa un nombre para el agente');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newAgent = {
        agentId: `agent_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        agentName: formData.agentName.trim(),
        description: formData.description.trim(),
        prompt: {
          base: formData.systemPrompt.trim() || 'You are a helpful AI assistant.',
          examples: '',
          rules: '',
          decision_logic: '',
          response_format: '',
          other_instructions: ''
        },
        tools: [],
        agents: []
      };

      const result = await saveAgent(newAgent);
      
      if (result.success && result.agent) {
        router.push(`/dashboard/agents/${result.agent.agentId}`);
      } else {
        alert(`Error al crear el agente: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al crear agente:', error);
      alert(`Error inesperado al crear el agente: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
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
    router.push('/auth/login');
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
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard/agents">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">
              Crear Nuevo Agente
            </h1>
          </div>
          <p className="text-muted-foreground">
            Configura un nuevo agente de inteligencia artificial
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Agente</CardTitle>
            <CardDescription>
              Define las características básicas de tu nuevo agente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="agentName">Nombre del Agente *</Label>
                <Input
                  id="agentName"
                  type="text"
                  placeholder="Ej: Asistente de Ventas"
                  value={formData.agentName}
                  onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el propósito y capacidades del agente..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemPrompt">Prompt del Sistema</Label>
                <Textarea
                  id="systemPrompt"
                  placeholder="Define el comportamiento y personalidad del agente..."
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  disabled={isSubmitting}
                  rows={5}
                />
                <p className="text-sm text-muted-foreground">
                  Este prompt define cómo se comportará el agente. Si lo dejas vacío, se usará un prompt genérico.
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creando...' : 'Crear Agente'}
                </Button>
                <Link href="/dashboard/agents">
                  <Button type="button" variant="outline" disabled={isSubmitting}>
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}