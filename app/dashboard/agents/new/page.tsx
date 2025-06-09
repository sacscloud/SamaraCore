'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  
  // Estados de UI
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  // Referencias para scroll automático
  const promptEngineerMessagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automático
  const scrollToBottom = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom(promptEngineerMessagesEndRef);
  }, [promptEngineerMessages]);



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
            user_id: user?.uid
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
          // Redirigir automáticamente al sandbox después de un breve delay
          setTimeout(() => {
            router.push(`/dashboard/agents/${result.agentCreated.agentId}/sandbox`);
          }, 2000);
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



  // Copiar mensaje
  const copyMessage = async (content: string, messageId: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
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
        {/* Chat del Prompt Engineer - Solo columna */}
        <div className="w-full max-w-4xl mx-auto flex flex-col">
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
      </main>
    </div>
  );
} 