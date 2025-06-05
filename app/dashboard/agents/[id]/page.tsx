'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useAgent } from '@/hooks/useAgent';
import { Agent, AgentSchema } from '@/lib/schemas';

export default function AgentEditorPage() {
  const { user, loading: authLoading } = useAuth();
  const { agent, loading, saveAgent, fetchAgent } = useAgent();
  const router = useRouter();
  const params = useParams();
  const agentId = params.id as string;
  const isNew = agentId === 'new';

  const [formData, setFormData] = useState<Agent>({
    agentId: '',
    agentName: '',
    description: '',
    prompt: {
      base: '',
      examples: '',
      rules: '',
      decision_logic: '',
      response_format: '',
      other_instructions: ''
    },
    agents: [],
    tools: []
  });

  const [jsonData, setJsonData] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Lista de herramientas disponibles
  const availableTools = [
    'web_search',
    'file_upload',
    'image_generation',
    'data_analysis',
    'email_sender',
    'calendar_integration',
    'database_query',
    'api_calls'
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!isNew && agentId) {
      fetchAgent(agentId);
    }
  }, [isNew, agentId, fetchAgent]);

  useEffect(() => {
    if (agent) {
      setFormData(agent);
      setJsonData(JSON.stringify(agent, null, 2));
    }
  }, [agent]);

  const handleInputChange = (field: keyof Agent, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handlePromptChange = (field: keyof Agent['prompt'], value: string) => {
    setFormData(prev => ({
      ...prev,
      prompt: { ...prev.prompt, [field]: value }
    }));
    setError('');
  };

  const handleToolToggle = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }));
  };

  const handleJsonChange = (value: string) => {
    setJsonData(value);
    setJsonError('');
    
    try {
      const parsed = JSON.parse(value);
      const validated = AgentSchema.parse(parsed);
      setFormData(validated);
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const result = await saveAgent(formData);
      
      if (result.success) {
        if (isNew) {
          router.push(`/dashboard/agents/${formData.agentId}`);
        }
      } else {
        setError(result.error || 'Error al guardar agente');
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar agente');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || (!isNew && loading)) {
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
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-md"></div>
                <span className="text-xl font-bold">SamaraCore</span>
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium">
                {isNew ? 'Nuevo Agente' : formData.agentName || 'Editando Agente'}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button 
                onClick={handleSave} 
                disabled={saving || !formData.agentId || !formData.agentName}
              >
                {saving ? 'Guardando...' : 'Guardar Agente'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 text-sm text-destructive bg-destructive/10 border border-destructive rounded-md">
            {error}
          </div>
        )}

        <Tabs defaultValue="form" className="space-y-6">
          <TabsList>
            <TabsTrigger value="form">Editor Visual</TabsTrigger>
            <TabsTrigger value="json">JSON Crudo</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
                <CardDescription>
                  Configura los datos básicos de tu agente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="agentId" className="text-sm font-medium">
                      ID del Agente *
                    </label>
                    <Input
                      id="agentId"
                      placeholder="mi-agente-ia"
                      value={formData.agentId}
                      onChange={(e) => handleInputChange('agentId', e.target.value)}
                      disabled={!isNew}
                    />
                    <p className="text-xs text-muted-foreground">
                      Identificador único del agente (solo letras, números y guiones)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="agentName" className="text-sm font-medium">
                      Nombre del Agente *
                    </label>
                    <Input
                      id="agentName"
                      placeholder="Mi Agente de IA"
                      value={formData.agentName}
                      onChange={(e) => handleInputChange('agentName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Descripción
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Describe qué hace este agente..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tools */}
            <Card>
              <CardHeader>
                <CardTitle>Herramientas</CardTitle>
                <CardDescription>
                  Selecciona las herramientas que puede usar tu agente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableTools.map((tool) => (
                    <div
                      key={tool}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.tools.includes(tool)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleToolToggle(tool)}
                    >
                      <div className="text-sm font-medium">
                        {tool.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Prompt Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Prompt</CardTitle>
                <CardDescription>
                  Define cómo debe comportarse tu agente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="base" className="text-sm font-medium">
                    Prompt Base
                  </label>
                  <Textarea
                    id="base"
                    placeholder="Eres {agentName}, un asistente de IA especializado en..."
                    value={formData.prompt.base}
                    onChange={(e) => handlePromptChange('base', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="rules" className="text-sm font-medium">
                      Reglas
                    </label>
                    <Textarea
                      id="rules"
                      placeholder="1. Siempre sé cortés&#10;2. Proporciona información precisa..."
                      value={formData.prompt.rules}
                      onChange={(e) => handlePromptChange('rules', e.target.value)}
                      rows={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="examples" className="text-sm font-medium">
                      Ejemplos
                    </label>
                    <Textarea
                      id="examples"
                      placeholder="Usuario: ¿Cómo funciona X?&#10;Agente: X funciona de la siguiente manera..."
                      value={formData.prompt.examples}
                      onChange={(e) => handlePromptChange('examples', e.target.value)}
                      rows={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="decision_logic" className="text-sm font-medium">
                    Lógica de Decisión
                  </label>
                  <Textarea
                    id="decision_logic"
                    placeholder="Para resolver problemas complejos, primero analiza..."
                    value={formData.prompt.decision_logic}
                    onChange={(e) => handlePromptChange('decision_logic', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="response_format" className="text-sm font-medium">
                    Formato de Respuesta
                  </label>
                  <Textarea
                    id="response_format"
                    placeholder="Responde siempre en JSON con la estructura: {...}"
                    value={formData.prompt.response_format}
                    onChange={(e) => handlePromptChange('response_format', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="other_instructions" className="text-sm font-medium">
                    Otras Instrucciones
                  </label>
                  <Textarea
                    id="other_instructions"
                    placeholder="Instrucciones adicionales específicas..."
                    value={formData.prompt.other_instructions}
                    onChange={(e) => handlePromptChange('other_instructions', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="json" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Editor JSON</CardTitle>
                <CardDescription>
                  Edita la configuración completa del agente en formato JSON
                </CardDescription>
              </CardHeader>
              <CardContent>
                {jsonError && (
                  <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive rounded-md">
                    Error JSON: {jsonError}
                  </div>
                )}
                <Textarea
                  value={jsonData}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  rows={25}
                  className="font-mono text-sm"
                  placeholder="Configuración JSON del agente..."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
} 