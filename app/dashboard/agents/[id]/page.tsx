'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/components/ui/theme-toggle';
import { 
  ArrowLeft, 
  Bot, 
  Send, 
  Target, 
  Shield, 
  BookOpen, 
  Play,
  Settings,
  Trash2,
  ExternalLink,
  Edit,
  Save,
  X,
  FileText,
  MessageSquare
} from 'lucide-react';
import { API_CONFIG } from '@/lib/config';

interface Agent {
  _id: string;
  agentId: string;
  agentName: string;
  description: string;
  user_id: string;
  status: 'active' | 'inactive';
  prompt: {
    base: string;
    objectives: string[];
    rules: string[];
    examples: string;
    responseFormat?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AgentDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [testing, setTesting] = useState(false);
  
  // Estados para edición
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    base: '',
    objectives: '',
    rules: '',
    examples: '',
    responseFormat: ''
  });

  // Cargar datos del agente
  useEffect(() => {
    if (!user) return;
    
    const fetchAgent = async () => {
      try {
        // Obtener token de autenticación
        const token = await user.getIdToken();
        
        const response = await fetch(`/api/agents`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        
        if (result.success) {
          const foundAgent = result.agents.find((a: Agent) => a.agentId === agentId);
          if (foundAgent) {
            setAgent(foundAgent);
            // Inicializar datos de edición
            setEditData({
              base: foundAgent.prompt.base || '',
              objectives: foundAgent.prompt.objectives?.join('\n') || '',
              rules: foundAgent.prompt.rules?.join('\n') || '',
              examples: foundAgent.prompt.examples || '',
              responseFormat: foundAgent.prompt.responseFormat || ''
            });
          } else {
            router.push('/dashboard');
          }
        }
      } catch (error) {
        console.error('Error cargando agente:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [user, agentId, router]);

  const handleTestAgent = async () => {
    if (!testMessage.trim() || !agent) return;
    
    setTesting(true);
    
    try {
      // Llamar al Core Agent (sin historial para pruebas rápidas)
      const response = await fetch(API_CONFIG.EXECUTE_AGENT(agentId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testMessage,
          context: {},
          conversationHistory: []
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTestResponse(result.response);
      } else {
        setTestResponse(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error ejecutando agente:', error);
      setTestResponse('Error de conexión con el Core Agent. ¿Está ejecutándose en puerto 4000?');
    } finally {
      setTesting(false);
    }
  };

  const startEditing = (section: string) => {
    setEditing(section);
  };

  const cancelEditing = () => {
    if (!agent) return;
    setEditing(null);
    // Restaurar datos originales
    setEditData({
      base: agent.prompt.base || '',
      objectives: agent.prompt.objectives?.join('\n') || '',
      rules: agent.prompt.rules?.join('\n') || '',
      examples: agent.prompt.examples || '',
      responseFormat: agent.prompt.responseFormat || ''
    });
  };

  const saveSection = async (section: string) => {
    if (!agent || !user) return;
    
    setSaving(true);
    
    try {
      const token = await user.getIdToken();
      
             // Preparar los datos actualizados
       const updatedPrompt = {
         ...agent.prompt,
         [section]: section === 'objectives' || section === 'rules' 
           ? (editData[section as keyof typeof editData] as string).split('\n').filter(item => item.trim() !== '')
           : editData[section as keyof typeof editData]
       };

      const response = await fetch(`/api/agents`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          agentId: agent.agentId,
          prompt: updatedPrompt
        }),
      });

      const result = await response.json();

      if (result.success) {
        setAgent(result.agent);
        setEditing(null);
      } else {
        alert(`Error al guardar: ${result.error}`);
      }
    } catch (error) {
      console.error('Error guardando:', error);
      alert('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E0E10] text-white font-['Inter'] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Cargando agente...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-[#0E0E10] text-white font-['Inter'] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 text-lg">Agente no encontrado</p>
          <Link href="/dashboard" className="text-[#3B82F6] hover:underline">
            Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0E0E10] text-gray-900 dark:text-white font-['Inter']">
      {/* Header */}
              <header className="border-b border-gray-200 dark:border-gray-800/50 backdrop-blur-sm sticky top-0 z-50 bg-white/80 dark:bg-[#0E0E10]/80">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <span className="text-sm font-bold text-[#0E0E10]">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">SamaraCore</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Agent Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-2xl flex items-center justify-center">
                  <Bot className="w-8 h-8 text-[#0E0E10]" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {agent.agentName}
                  </h1>
                  <p className="text-gray-400 text-lg">
                    {agent.description || 'Sin descripción'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span 
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        agent.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {agent.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                    <span className="text-sm text-gray-500">ID: {agent.agentId}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration Panel */}
            <div className="space-y-6">
              {/* Base Prompt */}
              <Card className="bg-white dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Prompt Base
                    </CardTitle>
                    {editing !== 'base' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing('base')}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {editing === 'base' ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editData.base}
                        onChange={(e) => setEditData({...editData, base: e.target.value})}
                        className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-[120px]"
                        placeholder="Describe el rol y personalidad base del agente..."
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveSection('base')}
                          disabled={saving}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditing}
                          className="border-gray-300 dark:border-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-100 dark:bg-gray-800/30 p-4 rounded-lg">
                      {agent.prompt.base || 'Sin prompt base definido'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Objectives */}
              <Card className="bg-white dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Objetivos ({agent.prompt.objectives?.length || 0})
                    </CardTitle>
                    {editing !== 'objectives' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing('objectives')}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {editing === 'objectives' ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editData.objectives}
                        onChange={(e) => setEditData({...editData, objectives: e.target.value})}
                        className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-[120px]"
                        placeholder="Escribe cada objetivo en una línea separada..."
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveSection('objectives')}
                          disabled={saving}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditing}
                          className="border-gray-300 dark:border-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {agent.prompt.objectives && agent.prompt.objectives.length > 0 ? (
                        agent.prompt.objectives.map((objective, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                            <span className="text-[#00FFC3] mt-1">•</span>
                            <span>{objective}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 italic">Sin objetivos definidos</li>
                      )}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Rules */}
              <Card className="bg-white dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Reglas ({agent.prompt.rules?.length || 0})
                    </CardTitle>
                    {editing !== 'rules' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing('rules')}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {editing === 'rules' ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editData.rules}
                        onChange={(e) => setEditData({...editData, rules: e.target.value})}
                        className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-[120px]"
                        placeholder="Escribe cada regla en una línea separada..."
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveSection('rules')}
                          disabled={saving}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditing}
                          className="border-gray-300 dark:border-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {agent.prompt.rules && agent.prompt.rules.length > 0 ? (
                        agent.prompt.rules.map((rule, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                            <span className="text-[#3B82F6] mt-1">•</span>
                            <span>{rule}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 italic">Sin reglas definidas</li>
                      )}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Examples */}
              <Card className="bg-white dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Ejemplos
                    </CardTitle>
                    {editing !== 'examples' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing('examples')}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {editing === 'examples' ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editData.examples}
                        onChange={(e) => setEditData({...editData, examples: e.target.value})}
                        className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-[120px]"
                        placeholder="Ejemplos de conversaciones o casos de uso..."
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveSection('examples')}
                          disabled={saving}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditing}
                          className="border-gray-300 dark:border-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-100 dark:bg-gray-800/30 p-4 rounded-lg whitespace-pre-wrap">
                      {agent.prompt.examples || 'Sin ejemplos definidos'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Response Format */}
              <Card className="bg-white dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Formato de Respuesta
                    </CardTitle>
                    {editing !== 'responseFormat' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing('responseFormat')}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {editing === 'responseFormat' ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editData.responseFormat}
                        onChange={(e) => setEditData({...editData, responseFormat: e.target.value})}
                        className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-[120px]"
                        placeholder="Especifica cómo debe formatear las respuestas (JSON, markdown, etc.)..."
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveSection('responseFormat')}
                          disabled={saving}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditing}
                          className="border-gray-300 dark:border-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-100 dark:bg-gray-800/30 p-4 rounded-lg whitespace-pre-wrap">
                      {agent.prompt.responseFormat || 'Sin formato específico definido'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Test Panel */}
            <div className="space-y-6">
              {/* Test Interface */}
              <Card className="bg-white dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                        <Play className="w-5 h-5" />
                        Probar Agente
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Envía un mensaje para probar la respuesta del agente
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => window.open(`/chat?agentId=${agent.agentId}`, '_blank')}
                      className="bg-gradient-to-r from-green-600 to-emerald-500 hover:shadow-lg text-white font-semibold"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Abrir Chat
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      placeholder="Escribe tu mensaje aquí..."
                      className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      onKeyPress={(e) => e.key === 'Enter' && !testing && handleTestAgent()}
                    />
                    <Button 
                      onClick={handleTestAgent} 
                      disabled={!testMessage.trim() || testing}
                      className="bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-lg hover:shadow-[#3B82F6]/30 text-[#0E0E10] font-semibold"
                    >
                      {testing ? (
                        <div className="w-4 h-4 border-2 border-[#0E0E10] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {testResponse && (
                    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700/50">
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Respuesta del Agente:</h4>
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{testResponse}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-gray-300 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50"
                      onClick={() => setTestMessage('¿Cómo puedes ayudarme?')}
                    >
                      ¿Cómo puedes ayudarme?
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-gray-300 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50"
                      onClick={() => setTestMessage('Explícame qué haces')}
                    >
                      Explícame qué haces
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-gray-300 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50"
                      onClick={() => setTestMessage('Dame un ejemplo de tu trabajo')}
                    >
                      Dame un ejemplo de tu trabajo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* API Usage */}
              <Card className="bg-white dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    Uso por API
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Endpoint REST para integrar este agente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 dark:bg-gray-800/50 p-3 rounded-lg font-mono text-sm text-gray-700 dark:text-gray-300">
                    <div className="mb-2">
                      <span className="text-green-600 dark:text-green-400">POST</span> {API_CONFIG.CORE_AGENT_URL}/execute/{agentId}
                    </div>
                    <div className="text-xs text-gray-500">
                      Body: {`{"message": "tu mensaje"}`} 
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 