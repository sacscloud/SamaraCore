'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/components/ui/theme-toggle';
import { API_CONFIG } from '@/lib/config';
import { 
  ArrowLeft, 
  Bot, 
  Send, 
  Wand2, 
  MessageCircle, 
  TestTube2,
  Sparkles,
  ChevronRight,
  Copy,
  Check,
  Settings,
  Layers
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface SubAgent {
  agentId: string;
  agentName: string;
  categoria: string;
  descripcionLibre: string;
  cuandoUsar: string;
  priority: number;
}

interface AgentDetails {
  agentId: string;
  agentName: string;
  description: string;
  categoria: string;
  prompt?: {
    full: string;
  };
  configuracion?: {
    modelo: string;
    temperatura: number;
  };
  subAgents?: SubAgent[];
  createdAt?: string;
}

export default function AgentSandboxPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const agentId = params.id as string;
  
  // Estados para chat del Prompt Engineer
  const [promptEngineerMessages, setPromptEngineerMessages] = useState<Message[]>([]);
  const [promptEngineerInput, setPromptEngineerInput] = useState('');
  const [isPromptEngineerLoading, setIsPromptEngineerLoading] = useState(false);
  
  // Estados para chat del agente
  const [agentTestMessages, setAgentTestMessages] = useState<Message[]>([]);
  const [agentTestInput, setAgentTestInput] = useState('');
  const [isAgentTestLoading, setIsAgentTestLoading] = useState(false);
  
  // Estados de UI
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  // Estados para la tercera columna
  const [agentDetails, setAgentDetails] = useState<AgentDetails | null>(null);
  const [selectedAgentModal, setSelectedAgentModal] = useState<AgentDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoadingAgent, setIsLoadingAgent] = useState(true);
  
  // Referencias para scroll automático
  const promptEngineerMessagesEndRef = useRef<HTMLDivElement>(null);
  const agentTestMessagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automático
  const scrollToBottom = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom(promptEngineerMessagesEndRef);
  }, [promptEngineerMessages]);

  useEffect(() => {
    scrollToBottom(agentTestMessagesEndRef);
  }, [agentTestMessages]);

  // Cargar agente al montar el componente
  useEffect(() => {
    if (agentId && user) {
      loadAgentFromId();
    }
  }, [agentId, user]);

  // Cargar agente por ID
  const loadAgentFromId = async () => {
    if (!user || !agentId) return;
    
    setIsLoadingAgent(true);
    try {
      const response = await fetch(API_CONFIG.AGENT_INFO(agentId), {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success && result.agent) {
        const agent = result.agent;
        setAgentDetails(agent);
        
        // Inicializar chat del Prompt Engineer con contexto del agente
        setPromptEngineerMessages([{
          id: '1',
          type: 'assistant',
          content: `¡Hola! 👋 Soy tu Prompt Engineer Assistant.\n\nEstás trabajando con el agente **"${agent.agentName}"** (${agent.description}).\n\n¿Qué quieres modificar o configurar hoy?\n\n• **Actualizar el prompt** del agente\n• **Agregar o quitar sub-agentes**\n• **Modificar configuración** (modelo, temperatura)\n• **Cambiar descripción** o comportamiento\n\n¡Describe lo que necesitas y yo me encargo del resto! 🚀`,
          timestamp: new Date()
        }]);
        
        // Inicializar chat del agente
        const hasSubAgents = agent.subAgents && agent.subAgents.length > 0;
                 const subAgentsList = hasSubAgents 
           ? `\n\nMis especialistas disponibles:\n${agent.subAgents.map((sa: SubAgent) => `• **${sa.agentName}**: ${sa.cuandoUsar}`).join('\n')}`
           : '';
          
        setAgentTestMessages([{
          id: '1',
          type: 'assistant',
          content: `¡Hola! Soy **${agent.agentName}**. ${agent.description}${subAgentsList}\n\n¿En qué puedo ayudarte hoy? 🤖`,
          timestamp: new Date()
        }]);
        
      } else {
        console.error('Error cargando agente:', result.error);
        router.push('/dashboard/agents');
      }
    } catch (error) {
      console.error('Error cargando agente:', error);
      router.push('/dashboard/agents');
    } finally {
      setIsLoadingAgent(false);
    }
  };

  // Enviar mensaje al Prompt Engineer
  const sendToPromptEngineer = async () => {
    if (!promptEngineerInput.trim() || !user || !agentDetails) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: promptEngineerInput.trim(),
      timestamp: new Date()
    };

    setPromptEngineerMessages(prev => [...prev, userMessage]);
    setPromptEngineerInput('');
    setIsPromptEngineerLoading(true);

    // Mensaje de typing
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      type: 'assistant',
      content: '...',
      timestamp: new Date(),
      isTyping: true
    };
    setPromptEngineerMessages(prev => [...prev, typingMessage]);

    try {
      // Construir historial para el contexto
      const conversationHistory = promptEngineerMessages
        .filter(msg => !msg.isTyping)
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

      const response = await fetch(API_CONFIG.EXECUTE_AGENT('prompt-engineer-assistant'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory,
          context: {
            user_id: user?.uid,
            targetAgent: {
              agentId: agentDetails.agentId,
              agentName: agentDetails.agentName,
              description: agentDetails.description,
              categoria: agentDetails.categoria
            }
          }
        })
      });

      const result = await response.json();

      // Remover mensaje de typing
      setPromptEngineerMessages(prev => prev.filter(msg => !msg.isTyping));

      if (result.success) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: result.response || 'Respuesta recibida.',
          timestamp: new Date()
        };

        setPromptEngineerMessages(prev => [...prev, assistantMessage]);

        // Recargar detalles del agente si se modificó
        if (result.response.includes('modificado') || result.response.includes('actualizado')) {
          setTimeout(() => {
            loadAgentFromId();
          }, 1000);
        }

      } else {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          type: 'assistant',
          content: `❌ Error: ${result.error || 'No se pudo procesar tu solicitud'}`,
          timestamp: new Date()
        };
        setPromptEngineerMessages(prev => [...prev, errorMessage]);
      }

    } catch (error) {
      console.error('Error enviando mensaje al Prompt Engineer:', error);
      
      // Remover mensaje de typing
      setPromptEngineerMessages(prev => prev.filter(msg => !msg.isTyping));
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: '❌ Error de conexión. Por favor, intenta nuevamente.',
        timestamp: new Date()
      };
      setPromptEngineerMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsPromptEngineerLoading(false);
    }
  };

  // Enviar mensaje al agente (con capacidad de usar sub-agentes)
  const sendToCreatedAgent = async () => {
    if (!agentTestInput.trim() || !user || !agentDetails) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: agentTestInput.trim(),
      timestamp: new Date()
    };

    setAgentTestMessages(prev => [...prev, userMessage]);
    setAgentTestInput('');
    setIsAgentTestLoading(true);

    // Mensaje de typing
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      type: 'assistant',
      content: '...',
      timestamp: new Date(),
      isTyping: true
    };
    setAgentTestMessages(prev => [...prev, typingMessage]);

    try {
      // Construir historial para el contexto
      const conversationHistory = agentTestMessages
        .filter(msg => !msg.isTyping)
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

      // Usar el agente con sus sub-agentes (orquestación completa)
      const response = await fetch(API_CONFIG.EXECUTE_AGENT(agentDetails.agentId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory,
          context: {
            user_id: user?.uid
          }
        })
      });

      const result = await response.json();

      // Remover mensaje de typing
      setAgentTestMessages(prev => prev.filter(msg => !msg.isTyping));

      if (result.success) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: result.response || 'Respuesta recibida.',
          timestamp: new Date()
        };

        setAgentTestMessages(prev => [...prev, assistantMessage]);

      } else {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          type: 'assistant',
          content: `❌ Error: ${result.error || 'No se pudo procesar tu solicitud'}`,
          timestamp: new Date()
        };
        setAgentTestMessages(prev => [...prev, errorMessage]);
      }

    } catch (error) {
      console.error('Error enviando mensaje al agente:', error);
      
      // Remover mensaje de typing
      setAgentTestMessages(prev => prev.filter(msg => !msg.isTyping));
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: '❌ Error de conexión. Por favor, intenta nuevamente.',
        timestamp: new Date()
      };
      setAgentTestMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAgentTestLoading(false);
    }
  };

  // Copiar mensaje
  const copyMessage = async (content: string, messageId: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Obtener detalles de un sub-agente
  const getSubAgentDetails = async (subAgentId: string) => {
    if (!user) return null;
    
    try {
      const response = await fetch(API_CONFIG.AGENT_INFO(subAgentId), {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        return result.agent;
      }
    } catch (error) {
      console.error('Error cargando sub-agente:', error);
    }
    return null;
  };

  // Renderizar mensaje individual
  const renderMessage = (message: Message, showCopy: boolean = true) => (
    <div
      key={message.id}
      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4 group`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          message.type === 'user'
            ? 'bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] text-[#0E0E10]'
            : message.isTyping
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
        } relative`}
      >
        {message.isTyping ? (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        ) : (
          <>
            <div className="whitespace-pre-wrap">{message.content}</div>
            {showCopy && message.type === 'assistant' && (
              <Button
                size="sm"
                variant="ghost"
                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => copyMessage(message.content, message.id)}
              >
                {copiedMessageId === message.id ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            )}
          </>
        )}
        
        <div className={`text-xs mt-2 ${
          message.type === 'user' ? 'text-[#0E0E10]/70' : 'text-gray-500 dark:text-gray-400'
        }`}>
          {message.timestamp.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );

  if (isLoadingAgent) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0E0E10] text-gray-900 dark:text-white font-['Inter'] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando agente...</p>
        </div>
      </div>
    );
  }

  if (!agentDetails) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0E0E10] text-gray-900 dark:text-white font-['Inter'] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Error: Agente no encontrado</p>
          <Button 
            onClick={() => router.push('/dashboard/agents')}
            className="mt-4"
          >
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0E0E10] text-gray-900 dark:text-white font-['Inter']">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-[#0E0E10]/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/agents/${agentId}`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-blue-500" />
              <div>
                <h1 className="text-xl font-semibold">Sandbox: {agentDetails.agentName}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{agentDetails.description}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/agents/${agentId}`)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Dashboard
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Contenido principal - 3 columnas */}
      <div className="h-[calc(100vh-80px)] flex">
        {/* Chat del Prompt Engineer (Izquierda) */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-950/20 dark:to-pink-950/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">Prompt Engineer Assistant</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Modifica y configura agentes IA</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {promptEngineerMessages.map(message => renderMessage(message))}
            <div ref={promptEngineerMessagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex gap-2">
              <Input
                value={promptEngineerInput}
                onChange={(e) => setPromptEngineerInput(e.target.value)}
                placeholder="Describe qué quieres modificar del agente..."
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendToPromptEngineer();
                  }
                }}
                disabled={isPromptEngineerLoading}
              />
              <Button
                onClick={sendToPromptEngineer}
                disabled={!promptEngineerInput.trim() || isPromptEngineerLoading}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat del Agente (Centro) */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <TestTube2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">{agentDetails.agentName}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{agentDetails.description}</p>
                {agentDetails.subAgents && agentDetails.subAgents.length > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Con {agentDetails.subAgents.length} sub-agentes especializados
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {agentTestMessages.map(message => renderMessage(message))}
            <div ref={agentTestMessagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex gap-2">
              <Input
                value={agentTestInput}
                onChange={(e) => setAgentTestInput(e.target.value)}
                placeholder="Prueba tu agente aquí..."
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendToCreatedAgent();
                  }
                }}
                disabled={isAgentTestLoading}
              />
              <Button
                onClick={sendToCreatedAgent}
                disabled={!agentTestInput.trim() || isAgentTestLoading}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Estructura del Agente (Derecha) */}
        <div className="w-1/3 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">Estructura del Agente</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Visualiza la arquitectura y sub-agentes</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-4">
              {/* Agente Principal */}
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow border-purple-200 dark:border-purple-800"
                onClick={() => setSelectedAgentModal(agentDetails)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                    <Bot className="w-5 h-5" />
                    {agentDetails.agentName}
                    <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-full ml-auto">
                      AGENTE PRINCIPAL
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {agentDetails.description}
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {agentDetails.configuracion?.modelo || 'GPT-4'}
                  </div>
                </CardContent>
              </Card>

              {/* Sub-agentes */}
              {agentDetails.subAgents && agentDetails.subAgents.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" />
                    Sub-agentes ({agentDetails.subAgents.length})
                  </h3>
                  
                  {agentDetails.subAgents.map((subAgent, index) => (
                    <Card 
                      key={subAgent.agentId}
                      className="cursor-pointer hover:shadow-md transition-shadow border-indigo-200 dark:border-indigo-800 ml-4"
                      onClick={async () => {
                        const details = await getSubAgentDetails(subAgent.agentId);
                        if (details) {
                          setSelectedAgentModal(details);
                        }
                      }}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-sm">
                          <Bot className="w-4 h-4" />
                          {subAgent.agentName}
                          <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded-full ml-auto">
                            SUB-AGENTE
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {subAgent.descripcionLibre}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          <strong>Cuándo usar:</strong> {subAgent.cuandoUsar}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalles del agente */}
      {selectedAgentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedAgentModal.agentName}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAgentModal(null)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Descripción</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedAgentModal.description}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Configuración</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
                    <div>Modelo: {selectedAgentModal.configuracion?.modelo || 'GPT-4'}</div>
                    <div>Temperatura: {selectedAgentModal.configuracion?.temperatura || 0.7}</div>
                  </div>
                </div>
                
                {selectedAgentModal.prompt?.full && (
                  <div>
                    <h3 className="font-medium mb-2">Prompt</h3>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm max-h-40 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">{selectedAgentModal.prompt.full}</pre>
                    </div>
                  </div>
                )}
                
                {selectedAgentModal.subAgents && selectedAgentModal.subAgents.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Sub-agentes</h3>
                    <div className="space-y-2">
                      {selectedAgentModal.subAgents.map((subAgent) => (
                        <div key={subAgent.agentId} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <div className="font-medium text-sm">{subAgent.agentName}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {subAgent.cuandoUsar}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 