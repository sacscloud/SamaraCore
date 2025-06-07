'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useConversations, type Conversation, type Message } from '@/hooks/useConversations';
import Markdown from '@/components/ui/markdown';
import { 
  PaperAirplaneIcon,
  Bars3Icon,
  XMarkIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  ClipboardIcon,
  ArrowPathIcon,
  CheckIcon,
  ArrowDownTrayIcon,
  FolderPlusIcon
} from '@heroicons/react/24/outline';
import { ArrowPathIcon as ArrowPathSolidIcon } from '@heroicons/react/24/solid';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, loading] = useAuthState(auth);
  
  // Parámetros de URL
  const agentId = searchParams.get('agentId');
  const initialConversationId = searchParams.get('conversationId');
  
  // Estados principales
  const [agent, setAgent] = useState<any>(null);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [regeneratingMessage, setRegeneratingMessage] = useState<string | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Hook de conversaciones
  const {
    conversations,
    loading: conversationsLoading,
    createConversation,
    addMessage,
    updateTitle,
    moveToFolder,
    toggleShare,
    deleteConversation,
    error: conversationsError
  } = useConversations(agentId || '');

  // Verificar autenticación
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Cargar agente
  useEffect(() => {
    if (agentId && user) {
      loadAgent();
    }
  }, [agentId, user]);

  const handleNewConversation = useCallback(async () => {
    const conversation = await createConversation(`Nueva conversación con ${agent?.name}`);
    if (conversation) {
      setCurrentConversation(conversation);
      setSearchTerm('');
    }
  }, [createConversation, agent?.name]);

  // Seleccionar conversación inicial
  useEffect(() => {
    if (conversations.length > 0 && !currentConversation) {
      // Si hay conversaciones pero ninguna seleccionada, seleccionar la primera
      setCurrentConversation(conversations[0]);
    }
  }, [conversations, currentConversation]);

  // Seleccionar conversación inicial específica
  useEffect(() => {
    if (initialConversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.conversationId === initialConversationId);
      if (conversation) {
        setCurrentConversation(conversation);
      }
    }
  }, [initialConversationId, conversations]);

  // Auto-scroll a nuevos mensajes
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages, scrollToBottom]);

  // Ajustar altura del textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const loadAgent = async () => {
    try {
      console.log('🔍 Cargando agente:', agentId);
      setAgentError(null);
      
      const token = await user?.getIdToken();
      console.log('🔑 Token obtenido:', token ? 'Sí' : 'No');
      
      const response = await fetch(`/api/agents/${agentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('📡 Respuesta del servidor:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Datos del agente:', data);
        setAgent(data.agent);
      } else {
        const errorData = await response.text();
        console.error('❌ Error del servidor:', errorData);
        setAgentError(`Error ${response.status}: ${errorData}`);
      }
    } catch (error) {
      console.error('💥 Error cargando agente:', error);
      setAgentError(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleSendMessage = async (messageContent: string = message) => {
    if (!messageContent.trim() || !currentConversation || isSubmitting) return;

    setIsSubmitting(true);
    setMessage('');

    try {
      // Agregar mensaje del usuario
      const userMessage = await addMessage(currentConversation.conversationId, {
        role: 'user',
        content: messageContent.trim()
      });

      if (userMessage) {
        setCurrentConversation(userMessage);
        
        // Preparar historial de conversación
        const conversationHistory = userMessage.messages.map((msg: Message) => ({
          role: msg.role,
          content: msg.content
        }));

        // Enviar al agente
        const token = await user?.getIdToken();
        const response = await fetch(`/api/agents/${agentId}/chat`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: conversationHistory
          })
        });

        if (response.ok) {
          const data = await response.json();
          
          // Agregar respuesta del asistente
          const assistantMessage = await addMessage(currentConversation.conversationId, {
            role: 'assistant',
            content: data.response
          });

          if (assistantMessage) {
            setCurrentConversation(assistantMessage);
          }
        } else {
          throw new Error('Error enviando mensaje');
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyMessage = async (content: string) => {
    await navigator.clipboard.writeText(content);
  };

  const handleRegenerateResponse = async (messageId: string) => {
    if (!currentConversation) return;
    
    setRegeneratingMessage(messageId);
    
    try {
      // Encontrar el mensaje del usuario previo al mensaje que queremos regenerar
      const messageIndex = currentConversation.messages.findIndex(m => m.id === messageId);
      if (messageIndex <= 0) return;
      
      const userMessage = currentConversation.messages[messageIndex - 1];
      if (userMessage.role !== 'user') return;
      
      // Reenviar el mensaje del usuario
      await handleSendMessage(userMessage.content);
    } catch (error) {
      console.error('Error regenerando respuesta:', error);
    } finally {
      setRegeneratingMessage(null);
    }
  };

  const handleExportConversation = () => {
    if (!currentConversation) return;
    
    const exportData = {
      title: currentConversation.title,
      agent: agent?.name,
      messages: currentConversation.messages,
      createdAt: currentConversation.createdAt
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentConversation.title}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = !searchTerm || 
      conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.messages.some(msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFolder = !selectedFolder || conv.folder === selectedFolder;
    
    return matchesSearch && matchesFolder;
  });

  const folders = Array.from(new Set(conversations.map(c => c.folder).filter(Boolean))) as string[];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">No autenticado</h1>
          <p className="text-gray-600 mb-4">Necesitas iniciar sesión para usar el chat</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  if (!agentId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Agente no especificado</h1>
          <p className="text-gray-600 mb-4">No se ha especificado qué agente usar para el chat</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          {agentError ? (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Error cargando agente</h1>
              <p className="text-gray-600 mb-2">No se pudo cargar el agente especificado</p>
              <p className="text-sm text-red-600 mb-4 font-mono bg-red-50 p-2 rounded">{agentError}</p>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    setAgentError(null);
                    loadAgent();
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Reintentar
                </button>
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Ir al Dashboard
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando agente...</p>
              <p className="text-sm text-gray-400 mt-2">ID: {agentId}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {agent?.name || 'Chat'}
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Nueva conversación */}
          <button
            onClick={handleNewConversation}
            className="w-full flex items-center gap-2 p-2 text-left hover:bg-gray-100 rounded-lg mb-4"
          >
            <PlusIcon className="w-5 h-5" />
            Nueva conversación
          </button>
          
          {/* Búsqueda */}
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filtros por carpeta */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Carpetas</span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedFolder(null)}
                className={`w-full text-left px-2 py-1 rounded text-sm ${
                  !selectedFolder ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
              >
                Todas
              </button>
              {folders.map(folder => (
                <button
                  key={folder}
                  onClick={() => setSelectedFolder(folder)}
                  className={`w-full text-left px-2 py-1 rounded text-sm ${
                    selectedFolder === folder ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  📁 {folder}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de conversaciones */}
        <div className="flex-1 overflow-y-auto">
          {conversationsLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Cargando conversaciones...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <div className="mb-4">
                {searchTerm ? 'No se encontraron conversaciones' : 'No hay conversaciones'}
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <div>👤 Usuario: {user?.uid || 'No ID'}</div>
                <div>🤖 Agente: {agentId}</div>
                <div>📊 Total conversaciones: {conversations.length}</div>
                {conversationsError && (
                  <div className="text-red-500 mt-2">❌ Error: {conversationsError}</div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredConversations.map(conversation => (
                <ConversationItem
                  key={conversation.conversationId}
                  conversation={conversation}
                  isActive={currentConversation?.conversationId === conversation.conversationId}
                  onClick={() => setCurrentConversation(conversation)}
                  onDelete={deleteConversation}
                  onRename={updateTitle}
                  onMove={moveToFolder}
                  onShare={toggleShare}
                  folders={folders}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Bars3Icon className="w-5 h-5" />
                </button>
              )}
              <div>
                <h1 className="text-lg font-semibold">
                  {currentConversation?.title || 'Selecciona una conversación'}
                </h1>
                <p className="text-sm text-gray-500">
                  {agent?.name}
                </p>
              </div>
            </div>
            
            {currentConversation && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportConversation}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Exportar conversación"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => toggleShare(currentConversation.conversationId, !currentConversation.shared)}
                  className={`p-2 rounded-lg ${currentConversation.shared ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                  title={currentConversation.shared ? 'Dejar de compartir' : 'Compartir conversación'}
                >
                  <ShareIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!currentConversation ? (
            // Estado inicial cuando no hay conversación
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Hola! Soy {agent?.name || 'tu asistente'}
              </h3>
              <p className="text-gray-600 max-w-md mb-6">
                {agent?.description || 'Estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?'}
              </p>
              {conversationsLoading ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Preparando el chat...</span>
                </div>
              ) : (
                <button
                  onClick={handleNewConversation}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Comenzar conversación
                </button>
              )}
            </div>
          ) : (
            // Mensajes de la conversación
            <>
              {currentConversation.messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onCopy={() => handleCopyMessage(msg.content)}
                  onRegenerate={msg.role === 'assistant' ? () => handleRegenerateResponse(msg.id) : undefined}
                  isRegenerating={regeneratingMessage === msg.id}
                />
              ))}
              
              {isSubmitting && (
                <div className="flex items-center gap-2 text-gray-500">
                  <ArrowPathSolidIcon className="w-4 h-4 animate-spin" />
                  Escribiendo...
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={currentConversation ? "Escribe tu mensaje..." : "Creando conversación..."}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[44px] max-h-32 disabled:bg-gray-50 disabled:text-gray-400"
                disabled={isSubmitting || !currentConversation}
                rows={1}
              />
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={!message.trim() || isSubmitting || !currentConversation}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {currentConversation 
              ? "Presiona Enter para enviar, Shift+Enter para nueva línea"
              : "Esperando conversación..."
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para cada conversación en la sidebar
function ConversationItem({ 
  conversation, 
  isActive, 
  onClick, 
  onDelete, 
  onRename,
  onMove,
  onShare,
  folders
}: {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onDelete: (id: string) => Promise<boolean>;
  onRename: (id: string, title: string) => Promise<boolean>;
  onMove: (id: string, folder: string) => Promise<boolean>;
  onShare: (id: string, shared: boolean) => Promise<boolean>;
  folders: string[];
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);

  const handleRename = async () => {
    if (editTitle.trim() && editTitle !== conversation.title) {
      await onRename(conversation.conversationId, editTitle.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className={`group relative p-3 rounded-lg cursor-pointer ${isActive ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}>
      <div onClick={onClick} className="flex-1">
        {isEditing ? (
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setEditTitle(conversation.title);
                setIsEditing(false);
              }
            }}
            className="w-full text-sm font-medium bg-transparent border-none outline-none"
            autoFocus
          />
        ) : (
          <div className="text-sm font-medium truncate">{conversation.title}</div>
        )}
        <div className="text-xs text-gray-500 mt-1">
          {conversation.messages.length} mensajes
        </div>
        {conversation.folder && (
          <div className="text-xs text-blue-600 mt-1">📁 {conversation.folder}</div>
        )}
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded"
      >
        <EllipsisVerticalIcon className="w-4 h-4" />
      </button>

      {showMenu && (
        <div className="absolute top-8 right-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[160px]">
          <button
            onClick={() => {
              setIsEditing(true);
              setShowMenu(false);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <PencilIcon className="w-4 h-4" />
            Renombrar
          </button>
          <button
            onClick={() => {
              onShare(conversation.conversationId, !conversation.shared);
              setShowMenu(false);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <ShareIcon className="w-4 h-4" />
            {conversation.shared ? 'Dejar de compartir' : 'Compartir'}
          </button>
          <button
            onClick={() => {
              onDelete(conversation.conversationId);
              setShowMenu(false);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
          >
            <TrashIcon className="w-4 h-4" />
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}

// Componente para cada mensaje
function MessageBubble({ 
  message, 
  onCopy,
  onRegenerate,
  isRegenerating
}: {
  message: Message;
  onCopy: () => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}) {
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200'} rounded-lg p-4 relative group`}>
        {message.role === 'assistant' ? (
          <Markdown content={message.content} />
        ) : (
          <div className="whitespace-pre-wrap">{message.content}</div>
        )}
        
        <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>

        {showActions && (
          <div className="absolute -top-8 right-0 flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1">
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-gray-100 rounded text-gray-600"
              title="Copiar"
            >
              {copied ? <CheckIcon className="w-4 h-4 text-green-600" /> : <ClipboardIcon className="w-4 h-4" />}
            </button>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="p-1 hover:bg-gray-100 rounded text-gray-600"
                title="Regenerar respuesta"
              >
                <ArrowPathIcon className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 