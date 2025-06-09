'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Check
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface CreatedAgent {
  agentId: string;
  agentName: string;
  description: string;
  categoria: string;
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

export default function NewAgentChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Estados para chat del Prompt Engineer
  const [promptEngineerMessages, setPromptEngineerMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '¡Hola! 👋 Soy tu Prompt Engineer Assistant. Te ayudo a crear agentes IA de manera conversacional.\n\n¿Qué tipo de agente quieres crear hoy? Puedes contarme:\n\n• **Qué función debe cumplir** tu agente\n• **En qué categoría** encaja (análisis, contenido, técnico, etc.)\n• **Cómo debe comportarse** o responder\n• **Si necesita sub-agentes** especializados\n\n¡Describe tu idea y yo me encargo del resto! 🚀',
      timestamp: new Date()
    }
  ]);
  const [promptEngineerInput, setPromptEngineerInput] = useState('');
  const [isPromptEngineerLoading, setIsPromptEngineerLoading] = useState(false);
  
  // Estados para chat del agente creado
  const [createdAgent, setCreatedAgent] = useState<CreatedAgent | null>(null);
  const [agentTestMessages, setAgentTestMessages] = useState<Message[]>([]);
  const [agentTestInput, setAgentTestInput] = useState('');
  const [isAgentTestLoading, setIsAgentTestLoading] = useState(false);
  
  // Estados de UI
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  // Estados para la tercera columna
  const [agentDetails, setAgentDetails] = useState<AgentDetails | null>(null);
  const [selectedAgentModal, setSelectedAgentModal] = useState<AgentDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
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

  // Enviar mensaje al Prompt Engineer
  const sendToPromptEngineer = async () => {
    if (!promptEngineerInput.trim() || !user) return;

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
            targetAgent: createdAgent ? {
              agentId: createdAgent.agentId,
              agentName: createdAgent.agentName,
              description: createdAgent.description,
              categoria: createdAgent.categoria
            } : null
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

        // Detectar si se creó un nuevo agente
        if (result.agentCreated) {
          const newAgent = {
            agentId: result.agentCreated.agentId,
            agentName: result.agentCreated.agentName,
            description: result.agentCreated.description,
            categoria: result.agentCreated.categoria
          };
          
          setCreatedAgent(newAgent);
          
          // Cargar detalles completos del agente (incluyendo sub-agentes)
          loadAgentDetails(newAgent.agentId);
          
          // Inicializar chat del agente
          setAgentTestMessages([{
            id: '1',
            type: 'assistant',
            content: `¡Hola! Soy **${result.agentCreated.agentName}**. ${result.agentCreated.description}\n\n¿En qué puedo ayudarte hoy? 🤖`,
            timestamp: new Date()
          }]);
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

  // Enviar mensaje al agente creado para prueba
  const sendToCreatedAgent = async () => {
    if (!agentTestInput.trim() || !user || !createdAgent) return;

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

      const response = await fetch(API_CONFIG.EXECUTE_AGENT(createdAgent.agentId), {
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

  // Cargar detalles completos del agente
  const loadAgentDetails = async (agentId: string) => {
    if (!user) return;
    
    setIsLoadingDetails(true);
    try {
      const response = await fetch(API_CONFIG.AGENT_INFO(agentId), {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setAgentDetails(result.agent);
      } else {
        console.error('Error cargando detalles del agente:', result.error);
      }
    } catch (error) {
      console.error('Error cargando detalles del agente:', error);
    } finally {
      setIsLoadingDetails(false);
    }
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
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-[#3B82F6]/10 to-[#00FFC3]/10 border border-[#3B82F6]/20 rounded-lg">
              <Sparkles className="w-4 h-4 text-[#3B82F6]" />
              <span className="text-sm font-medium text-[#3B82F6] dark:text-[#00FFC3]">
                Chat Interactivo
              </span>
            </div>
            <ThemeToggle />
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-73px)] flex">
        {/* Chat del Prompt Engineer - Izquierda */}
        <div className={`${agentDetails ? 'w-1/3' : 'w-1/2'} border-r border-gray-200 dark:border-gray-800/50 flex flex-col transition-all duration-300`}>
          {/* Header del chat */}
          <div className="border-b border-gray-200 dark:border-gray-800/50 p-6 bg-gradient-to-r from-[#3B82F6]/5 to-[#00FFC3]/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-xl flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-[#0E0E10]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Prompt Engineer Assistant
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Especialista en crear y modificar agentes IA
                </p>
              </div>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {promptEngineerMessages.map(message => renderMessage(message))}
            <div ref={promptEngineerMessagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 dark:border-gray-800/50 p-6">
            <div className="flex gap-3">
              <Input
                value={promptEngineerInput}
                onChange={(e) => setPromptEngineerInput(e.target.value)}
                placeholder="Describe qué agente quieres crear o modificar..."
                className="flex-1 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600/50"
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendToPromptEngineer()}
                disabled={isPromptEngineerLoading}
              />
              <Button
                onClick={sendToPromptEngineer}
                disabled={!promptEngineerInput.trim() || isPromptEngineerLoading}
                className="bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-lg hover:shadow-[#3B82F6]/30 text-[#0E0E10] font-semibold transition-all duration-300"
              >
                {isPromptEngineerLoading ? (
                  <div className="w-4 h-4 border-2 border-[#0E0E10] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Chat del Agente Creado - Centro */}
        <div className={`${agentDetails ? 'w-1/3' : 'w-1/2'} ${agentDetails ? 'border-r border-gray-200 dark:border-gray-800/50' : ''} flex flex-col transition-all duration-300`}>
          {!createdAgent ? (
            /* Estado vacío */
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <TestTube2 className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Zona de Pruebas
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                  Aquí aparecerá tu agente una vez que sea creado. Podrás probarlo y conversear con él para validar su funcionamiento.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <ChevronRight className="w-4 h-4" />
                  <span>Habla con el Prompt Engineer para crear tu primer agente</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Header del agente creado */}
              <div className="border-b border-gray-200 dark:border-gray-800/50 p-6 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {createdAgent.agentName}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {createdAgent.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mensajes del agente */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {agentTestMessages.map(message => renderMessage(message))}
                <div ref={agentTestMessagesEndRef} />
              </div>

              {/* Input del agente */}
              <div className="border-t border-gray-200 dark:border-gray-800/50 p-6">
                <div className="flex gap-3">
                  <Input
                    value={agentTestInput}
                    onChange={(e) => setAgentTestInput(e.target.value)}
                    placeholder="Prueba tu agente aquí..."
                    className="flex-1 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600/50"
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendToCreatedAgent()}
                    disabled={isAgentTestLoading}
                  />
                  <Button
                    onClick={sendToCreatedAgent}
                    disabled={!agentTestInput.trim() || isAgentTestLoading}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/30 text-white font-semibold transition-all duration-300"
                  >
                    {isAgentTestLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Tercera Columna - Estructura del Agente */}
        {agentDetails && (
          <div className="w-1/3 flex flex-col bg-gray-50 dark:bg-gray-900/20">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-800/50 p-6 bg-gradient-to-r from-purple-500/5 to-indigo-500/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Estructura del Agente
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Visualiza la arquitectura y sub-agentes
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoadingDetails ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-3" />
                  <span className="text-gray-600 dark:text-gray-400">Cargando estructura...</span>
                </div>
              ) : (
                <>
                  {/* Agente Principal */}
                  <Card 
                    className="bg-white dark:bg-gray-800/50 border-purple-200 dark:border-purple-700/50 cursor-pointer hover:shadow-lg transition-all duration-300"
                    onClick={async () => {
                      const details = await getSubAgentDetails(agentDetails.agentId);
                      if (details) setSelectedAgentModal(details);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {agentDetails.agentName}
                          </h3>
                          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                            AGENTE PRINCIPAL
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {agentDetails.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                          {agentDetails.categoria}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                          {agentDetails.configuracion?.modelo || 'GPT-4'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sub-Agentes */}
                  {agentDetails.subAgents && agentDetails.subAgents.length > 0 && (
                    <>
                      <div className="flex items-center gap-2 mt-6 mb-4">
                        <div className="h-px bg-gray-300 dark:bg-gray-700 flex-1"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 px-3">
                          SUB-AGENTES ({agentDetails.subAgents.length})
                        </span>
                        <div className="h-px bg-gray-300 dark:bg-gray-700 flex-1"></div>
                      </div>

                      {agentDetails.subAgents
                        .sort((a, b) => (a.priority || 0) - (b.priority || 0))
                        .map((subAgent, index) => (
                          <Card 
                            key={subAgent.agentId}
                            className="bg-white dark:bg-gray-800/50 border-indigo-200 dark:border-indigo-700/50 cursor-pointer hover:shadow-lg transition-all duration-300"
                            onClick={async () => {
                              const details = await getSubAgentDetails(subAgent.agentId);
                              if (details) setSelectedAgentModal(details);
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
                                  <span className="text-white text-sm font-bold">{index + 1}</span>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {subAgent.agentName}
                                  </h3>
                                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                    SUB-AGENTE
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {subAgent.descripcionLibre}
                              </p>
                              {subAgent.cuandoUsar && (
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg mb-3">
                                  <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-1">
                                    Cuándo usar:
                                  </p>
                                  <p className="text-xs text-indigo-600 dark:text-indigo-400">
                                    {subAgent.cuandoUsar}
                                  </p>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                                  {subAgent.categoria}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                                  Prioridad {subAgent.priority || 1}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Modal de Detalles del Agente */}
        {selectedAgentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedAgentModal(null)}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedAgentModal.agentName}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedAgentModal.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAgentModal(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-6">
                {/* Información Básica */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Información Básica
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Categoría</label>
                      <p className="text-gray-900 dark:text-white">{selectedAgentModal.categoria}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Modelo</label>
                      <p className="text-gray-900 dark:text-white">{selectedAgentModal.configuracion?.modelo || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Temperatura</label>
                      <p className="text-gray-900 dark:text-white">{selectedAgentModal.configuracion?.temperatura || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Creado</label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedAgentModal.createdAt ? new Date(selectedAgentModal.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Prompt */}
                {selectedAgentModal.prompt?.full && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Prompt del Agente
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 max-h-60 overflow-y-auto">
                      <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedAgentModal.prompt.full}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Sub-Agentes */}
                {selectedAgentModal.subAgents && selectedAgentModal.subAgents.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Sub-Agentes ({selectedAgentModal.subAgents.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedAgentModal.subAgents.map((subAgent) => (
                        <div key={subAgent.agentId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">{subAgent.agentName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{subAgent.descripcionLibre}</p>
                          {subAgent.cuandoUsar && (
                            <div className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded">
                              <strong>Cuándo usar:</strong> {subAgent.cuandoUsar}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 