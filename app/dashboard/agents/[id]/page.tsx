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
      <div className="min-h-screen bg-[#0E0E10] text-white font-['Inter'] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Cargando configuración del agente...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0E0E10] text-white font-['Inter']">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/5 via-transparent to-[#00FFC3]/5 pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-gray-800/50 sticky top-0 bg-[#0E0E10]/80 backdrop-blur-sm z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="w-8 h-8 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <span className="text-sm font-bold text-[#0E0E10]">S</span>
                </div>
                <span className="text-xl font-bold text-white">SamaraCore</span>
              </Link>
              <span className="text-gray-500">/</span>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-sm font-medium text-white">
                  {isNew ? 'Nuevo Agente' : formData.agentName || 'Editando Agente'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button 
                  variant="outline"
                  className="border-gray-600/50 text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
                >
                  Cancelar
                </Button>
              </Link>
              <Button 
                onClick={handleSave} 
                disabled={saving || !formData.agentId || !formData.agentName}
                className="bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-xl hover:shadow-[#3B82F6]/30 text-[#0E0E10] font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#0E0E10]/30 border-t-[#0E0E10] rounded-full animate-spin"></div>
                    Guardando...
                  </div>
                ) : (
                  'Guardar Agente'
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 relative">
        {error && (
          <div className="mb-6 p-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm">
            {error}
          </div>
        )}

        <Tabs defaultValue="form" className="space-y-8">
          <TabsList className="bg-gray-900/40 border border-gray-700/50 backdrop-blur-sm">
            <TabsTrigger 
              value="form"
              className="data-[state=active]:bg-[#3B82F6] data-[state=active]:text-[#0E0E10] text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Editor Visual
            </TabsTrigger>
            <TabsTrigger 
              value="json"
              className="data-[state=active]:bg-[#00FFC3] data-[state=active]:text-[#0E0E10] text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              JSON Crudo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-8">
            {/* Basic Info */}
            <Card className="bg-gray-900/40 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6]/20 to-[#00FFC3]/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-white">Información Básica</CardTitle>
                    <CardDescription className="text-gray-400">
                      Configura los datos fundamentales de tu agente IA
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">ID del Agente</label>
                    <Input
                      type="text"
                      placeholder="mi-agente-unico"
                      value={formData.agentId}
                      onChange={(e) => handleInputChange('agentId', e.target.value)}
                      className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-[#3B82F6]/50 focus:ring-[#3B82F6]/20"
                    />
                    <p className="text-xs text-gray-500">Identificador único para el agente</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Nombre del Agente</label>
                    <Input
                      type="text"
                      placeholder="Mi Asistente IA"
                      value={formData.agentName}
                      onChange={(e) => handleInputChange('agentName', e.target.value)}
                      className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-[#3B82F6]/50 focus:ring-[#3B82F6]/20"
                    />
                    <p className="text-xs text-gray-500">Nombre descriptivo del agente</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Descripción</label>
                  <Textarea
                    placeholder="Describe qué hace tu agente y cómo puede ayudar..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-[#3B82F6]/50 focus:ring-[#3B82F6]/20"
                  />
                  <p className="text-xs text-gray-500">Explicación clara de las capacidades del agente</p>
                </div>
              </CardContent>
            </Card>

            {/* Prompt Configuration */}
            <Card className="bg-gray-900/40 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#00FFC3]/20 to-[#3B82F6]/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#00FFC3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-white">Configuración del Prompt</CardTitle>
                    <CardDescription className="text-gray-400">
                      Define cómo debe comportarse y responder tu agente
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Prompt Base</label>
                  <Textarea
                    placeholder="Eres un asistente experto en..."
                    value={formData.prompt.base}
                    onChange={(e) => handlePromptChange('base', e.target.value)}
                    rows={4}
                    className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-[#3B82F6]/50 focus:ring-[#3B82F6]/20"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Ejemplos</label>
                    <Textarea
                      placeholder="Ejemplos de interacciones..."
                      value={formData.prompt.examples}
                      onChange={(e) => handlePromptChange('examples', e.target.value)}
                      rows={3}
                      className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-[#3B82F6]/50 focus:ring-[#3B82F6]/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Reglas</label>
                    <Textarea
                      placeholder="Reglas que debe seguir..."
                      value={formData.prompt.rules}
                      onChange={(e) => handlePromptChange('rules', e.target.value)}
                      rows={3}
                      className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-[#3B82F6]/50 focus:ring-[#3B82F6]/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Lógica de Decisión</label>
                    <Textarea
                      placeholder="Cómo debe tomar decisiones..."
                      value={formData.prompt.decision_logic}
                      onChange={(e) => handlePromptChange('decision_logic', e.target.value)}
                      rows={3}
                      className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-[#3B82F6]/50 focus:ring-[#3B82F6]/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Formato de Respuesta</label>
                    <Textarea
                      placeholder="Cómo debe formatear las respuestas..."
                      value={formData.prompt.response_format}
                      onChange={(e) => handlePromptChange('response_format', e.target.value)}
                      rows={3}
                      className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-[#3B82F6]/50 focus:ring-[#3B82F6]/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Instrucciones Adicionales</label>
                  <Textarea
                    placeholder="Cualquier otra instrucción específica..."
                    value={formData.prompt.other_instructions}
                    onChange={(e) => handlePromptChange('other_instructions', e.target.value)}
                    rows={3}
                    className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-[#3B82F6]/50 focus:ring-[#3B82F6]/20"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tools Configuration */}
            <Card className="bg-gray-900/40 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-white">Herramientas Disponibles</CardTitle>
                    <CardDescription className="text-gray-400">
                      Selecciona qué herramientas puede usar tu agente
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {availableTools.map((tool) => (
                    <div
                      key={tool}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                        formData.tools.includes(tool)
                          ? 'bg-[#3B82F6]/10 border-[#3B82F6]/50 shadow-lg shadow-[#3B82F6]/10'
                          : 'bg-gray-800/30 border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/50'
                      }`}
                      onClick={() => handleToolToggle(tool)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          formData.tools.includes(tool)
                            ? 'bg-[#3B82F6] text-[#0E0E10]'
                            : 'bg-gray-700/50 text-gray-400'
                        }`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className={`text-sm font-medium ${
                          formData.tools.includes(tool) ? 'text-[#3B82F6]' : 'text-gray-300'
                        }`}>
                          {tool.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="json" className="space-y-6">
            <Card className="bg-gray-900/40 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#00FFC3]/20 to-[#3B82F6]/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#00FFC3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-white">Configuración JSON</CardTitle>
                    <CardDescription className="text-gray-400">
                      Edita directamente la configuración del agente en formato JSON
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {jsonError && (
                  <div className="mb-4 p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg">
                    Error en JSON: {jsonError}
                  </div>
                )}
                <Textarea
                  value={jsonData}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  rows={20}
                  className="font-mono text-sm bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-[#3B82F6]/50 focus:ring-[#3B82F6]/20"
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