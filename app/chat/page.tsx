'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  User, 
  Trash2,
  MessageSquare,
  Plus
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  agentId: string;
  agentName: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export default function ChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentId = searchParams.get('agentId');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [agent, setAgent] = useState<any>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load agent info
  useEffect(() => {
    if (!user || !agentId) return;
    
    const fetchAgent = async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/agents`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success) {
          const foundAgent = result.agents.find((a: any) => a.agentId === agentId);
          if (foundAgent) {
            setAgent(foundAgent);
            // Create initial session
            createNewSession(foundAgent);
          }
        }
      } catch (error) {
        console.error('Error loading agent:', error);
      }
    };

    fetchAgent();
  }, [user, agentId]);

  const createNewSession = (agentData: any) => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      agentId: agentData.agentId,
      agentName: agentData.agentName,
      title: 'Nueva conversación',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
  };

  const updateSessionTitle = (sessionId: string, firstMessage: string) => {
    const title = firstMessage.length > 30 
      ? firstMessage.substring(0, 30) + '...' 
      : firstMessage;
    
    setChatSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, title, updatedAt: new Date() }
          : session
      )
    );
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || loading || !agent) return;
    
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setLoading(true);

    // Update session title if it's the first message
    if (messages.length === 0 && currentSessionId) {
      updateSessionTitle(currentSessionId, currentMessage);
    }

    try {
      const response = await fetch(`http://localhost:4000/execute/${agentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentMessage,
          context: { sessionId: currentSessionId }
        }),
      });

      const result = await response.json();

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: result.success ? result.response : `Error: ${result.error}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update session with new messages
      if (currentSessionId) {
        setChatSessions(prev =>
          prev.map(session =>
            session.id === currentSessionId
              ? { 
                  ...session, 
                  messages: [...session.messages, userMessage, assistantMessage],
                  updatedAt: new Date()
                }
              : session
          )
        );
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: 'Error de conexión. ¿Está el Core Agent ejecutándose?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const selectSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
  };

  const deleteSession = (sessionId: string) => {
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  };

  if (!agent) {
    return (
      <div className="min-h-screen bg-[#0E0E10] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0E10] text-white flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 border-r border-gray-800/50 bg-[#0E0E10]/50 flex flex-col overflow-hidden`}>
        {sidebarOpen && (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-800/50">
              <Link href={`/dashboard/agents/${agentId}`} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al agente</span>
              </Link>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[#0E0E10]" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">{agent.agentName}</h2>
                  <p className="text-xs text-gray-400">Chat Mode</p>
                </div>
              </div>

              <Button 
                onClick={() => createNewSession(agent)}
                className="w-full bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-lg text-[#0E0E10] font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva conversación
              </Button>
            </div>

            {/* Chat Sessions */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  className={`group p-3 rounded-lg cursor-pointer transition-all ${
                    currentSessionId === session.id 
                      ? 'bg-gray-800/50 border border-[#3B82F6]/30' 
                      : 'hover:bg-gray-800/30'
                  }`}
                  onClick={() => selectSession(session)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-white truncate">{session.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {session.messages.length} mensajes
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="border-b border-gray-800/50 p-4 flex items-center justify-between bg-[#0E0E10]/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="text-gray-400 hover:text-white"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            )}
            {sidebarOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <h1 className="text-xl font-semibold text-white">Chat con {agent.agentName}</h1>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-2xl flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-[#0E0E10]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">¡Hola! Soy {agent.agentName}</h3>
              <p className="text-gray-400 max-w-md">
                {agent.description || 'Estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?'}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-[#0E0E10]" />
                  </div>
                )}
                
                <Card className={`max-w-[70%] p-4 ${
                  message.role === 'user' 
                    ? 'bg-[#3B82F6] text-white' 
                    : 'bg-gray-900/40 border-gray-700/50 text-gray-100'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </Card>

                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#0E0E10]" />
              </div>
              <Card className="bg-gray-900/40 border-gray-700/50 p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="text-gray-400 text-sm ml-2">Escribiendo...</span>
                </div>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800/50 p-4 bg-[#0E0E10]/80 backdrop-blur-sm">
          <div className="flex gap-3 max-w-4xl mx-auto items-end">
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-gray-800/50 border-gray-600/50 text-white resize-none min-h-[44px] max-h-32"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={loading}
              rows={1}
            />
            <Button 
              onClick={sendMessage}
              disabled={!currentMessage.trim() || loading}
              className="bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-lg text-[#0E0E10] font-semibold px-6 h-11"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Presiona Enter para enviar, Shift+Enter para nueva línea
          </p>
        </div>
      </div>
    </div>
  );
} 