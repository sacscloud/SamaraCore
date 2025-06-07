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
  ArrowDownTrayIcon
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
  const [regeneratingMessage, setRegeneratingMessage] = useState<string | null>(null);
  const [shareModal, setShareModal] = useState<{show: boolean, shareId: string | null}>({show: false, shareId: null});
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  
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

  // Reset imagen error cuando cambie el usuario
  useEffect(() => {
    setImageError(false);
  }, [user?.photoURL]);

  // Cargar agente
  useEffect(() => {
    if (agentId && user) {
      loadAgent();
    }
  }, [agentId, user]);

  const handleNewConversation = useCallback(async () => {
    const conversation = await createConversation('Nueva conversación');
    if (conversation) {
      setCurrentConversation(conversation);
      setSearchTerm('');
    }
  }, [createConversation]);

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

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    if (showUserMenu) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-menu-container')) {
          setShowUserMenu(false);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

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
        console.log('🏷️ Nombre del agente:', data.agent?.agentName);
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
        const response = await fetch(`http://localhost:4000/execute/${agentId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: messageContent.trim(),
            conversationHistory: conversationHistory
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
            
            // Si es el primer mensaje del usuario, generar título automático
            if (assistantMessage.messages.length === 2 && currentConversation.title === 'Nueva conversación') {
              const newTitle = generateConversationTitle(messageContent.trim());
              await updateTitle(currentConversation.conversationId, newTitle);
            }
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
      agent: agent?.agentName,
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
    
    return matchesSearch;
  });

  // Función para obtener nombre de usuario
  const getUserDisplayName = () => {
    return user?.displayName || user?.email || 'Usuario';
  };

  // Función para generar título automático
  const generateConversationTitle = (userMessage: string): string => {
    // Limpiar el mensaje y tomar las primeras palabras
    const cleanMessage = userMessage.trim();
    const words = cleanMessage.split(' ');
    
    // Si es muy corto, usar todo el mensaje
    if (words.length <= 6) {
      return cleanMessage;
    }
    
    // Si es más largo, tomar las primeras 6 palabras y agregar "..."
    return words.slice(0, 6).join(' ') + '...';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">No autenticado</h1>
          <p className="text-gray-300 mb-4">Necesitas iniciar sesión para usar el chat</p>
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
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Agente no especificado</h1>
          <p className="text-gray-300 mb-4">No se ha especificado qué agente usar para el chat</p>
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
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          {agentError ? (
            <>
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Error cargando agente</h1>
              <p className="text-gray-300 mb-2">No se pudo cargar el agente especificado</p>
              <p className="text-sm text-red-400 mb-4 font-mono bg-red-500/10 p-2 rounded">{agentError}</p>
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
              <p className="text-gray-300">Cargando agente...</p>
              <p className="text-sm text-gray-500 mt-2">ID: {agentId}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-gray-800 border-r border-gray-700 relative`} 
           style={{overflow: sidebarOpen ? 'visible' : 'hidden'}}>
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              {agent?.agentName || 'Chat'}
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-gray-700 rounded text-gray-300 hover:text-white"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Nueva conversación */}
          <button
            onClick={handleNewConversation}
            className="w-full flex items-center gap-2 p-2 text-left hover:bg-gray-700 rounded-lg mb-2 text-gray-300 hover:text-white"
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
              className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Lista de conversaciones */}
        <div className="flex-1 overflow-y-auto overflow-x-visible">
          {conversationsLoading ? (
            <div className="p-4 text-center text-gray-400">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Cargando conversaciones...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <div className="mb-4">
                {searchTerm ? 'No se encontraron conversaciones' : 'No hay conversaciones'}
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <div>👤 Usuario: {getUserDisplayName()}</div>
                <div>🤖 Agente: {agent?.agentName || 'Asistente'}</div>
                <div>📊 Total conversaciones: {conversations.length}</div>
                {conversationsError && (
                  <div className="text-red-400 mt-2">❌ Error: {conversationsError}</div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Botón Borrar todas alineado a la derecha */}
              {conversations.length > 0 && (
                <div className="px-2 pt-2 pb-1">
                  <div className="flex justify-end">
                    <button
                      onClick={async () => {
                        if (confirm('¿Estás seguro de eliminar TODAS las conversaciones? Esta acción no se puede deshacer.')) {
                          const promises = conversations.map(conv => deleteConversation(conv.conversationId));
                          await Promise.all(promises);
                          setCurrentConversation(null);
                        }
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-red-600/20 rounded text-red-400 hover:text-red-300"
                    >
                      <TrashIcon className="w-3 h-3" />
                      Borrar todas
                    </button>
                  </div>
                </div>
              )}
              
              <div className="space-y-1 p-2">
                {filteredConversations.map(conversation => (
                <ConversationItem
                  key={conversation.conversationId}
                  conversation={conversation}
                  isActive={currentConversation?.conversationId === conversation.conversationId}
                  onClick={() => setCurrentConversation(conversation)}
                  onDelete={deleteConversation}
                  onRename={updateTitle}
                  onShare={async (id: string, shared: boolean) => {
                    if (shared) {
                      // Compartir y mostrar modal
                      const result = await toggleShare(id, true);
                      if (result) {
                        // Si es la conversación actual, actualizar el estado
                        if (currentConversation?.conversationId === id) {
                          setCurrentConversation(result);
                        }
                        if (result.shareId) {
                          setShareModal({show: true, shareId: result.shareId});
                        }
                      }
                      return !!result;
                    } else {
                      // Dejar de compartir
                      const result = await toggleShare(id, false);
                      if (result && currentConversation?.conversationId === id) {
                        setCurrentConversation(result);
                      }
                      return !!result;
                    }
                  }}
                />
              ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Chat principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white"
                >
                  <Bars3Icon className="w-5 h-5" />
                </button>
              )}
              <div>
                <h1 className="text-lg font-semibold text-white">
                  {currentConversation?.title || `Chat con ${agent?.agentName || 'Asistente'}`}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {currentConversation && (
                <>
                  <button
                    onClick={handleExportConversation}
                    className="p-2 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white"
                    title="Exportar conversación"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={async () => {
                      if (currentConversation.shared) {
                        // Si ya está compartido, dejar de compartir
                        const result = await toggleShare(currentConversation.conversationId, false);
                        if (result) {
                          setCurrentConversation(result);
                        }
                      } else {
                        // Compartir y mostrar modal
                        const result = await toggleShare(currentConversation.conversationId, true);
                        if (result) {
                          setCurrentConversation(result);
                          if (result.shareId) {
                            setShareModal({show: true, shareId: result.shareId});
                          }
                        }
                      }
                    }}
                    className={`p-2 rounded-lg ${currentConversation.shared ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300 hover:text-white'}`}
                    title={currentConversation.shared ? 'Dejar de compartir' : 'Compartir conversación'}
                  >
                    <ShareIcon className="w-5 h-5" />
                  </button>
                </>
              )}
              
              {/* Avatar del usuario */}
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-600 hover:border-gray-400 transition-colors bg-gradient-to-br from-blue-500 to-purple-600"
                >
                  {user?.photoURL && !imageError ? (
                    <img 
                      src={user.photoURL} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                      onLoad={() => setImageError(false)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                      {getUserDisplayName().charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
                
                {/* Dropdown del usuario */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 py-2">
                    {/* Información del usuario */}
                    <div className="px-4 py-3 border-b border-gray-600">
                      <div className="font-medium text-white">{getUserDisplayName()}</div>
                      <div className="text-sm text-gray-400">{user?.email}</div>
                    </div>
                    
                    {/* Opciones del menú */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          router.push('/dashboard');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7zm16 0H5V5h14v2z" />
                        </svg>
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          router.push(`/dashboard/agents/${agentId}`);
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Configurar el agente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
          {!currentConversation ? (
            // Estado inicial cuando no hay conversación
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                ¡Hola! Soy {agent?.name || 'tu asistente'}
              </h3>
              <p className="text-gray-300 max-w-md mb-6">
                {agent?.description || 'Estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?'}
              </p>
              {conversationsLoading ? (
                <div className="flex items-center gap-2 text-blue-400">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
                  userName={getUserDisplayName()}
                  agentName={agent?.agentName || 'Asistente'}
                />
              ))}
              
              {isSubmitting && (
                <div className="flex items-center gap-2 text-gray-400">
                  <ArrowPathSolidIcon className="w-4 h-4 animate-spin" />
                  Escribiendo...
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="flex items-start gap-2">
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
                className="w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[44px] max-h-32 disabled:bg-gray-700 disabled:text-gray-500 bg-gray-700 text-white placeholder-gray-400"
                disabled={isSubmitting || !currentConversation}
                rows={1}
              />
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={!message.trim() || isSubmitting || !currentConversation}
              className="flex items-center justify-center h-[44px] w-[44px] bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            {currentConversation 
              ? "Presiona Enter para enviar, Shift+Enter para nueva línea"
              : "Esperando conversación..."
            }
          </div>
        </div>
      </div>

      {/* Modal de compartir */}
      {shareModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">¡Conversación compartida!</h3>
              <button
                onClick={() => setShareModal({show: false, shareId: null})}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-300 mb-4">
              Tu conversación ahora es pública. Cualquier persona con este enlace puede verla:
            </p>
            
            <div className="bg-gray-700 p-3 rounded border border-gray-600 mb-4">
              <div className="flex items-center justify-between">
                <code className="text-blue-400 text-sm break-all">
                  {`${window.location.origin}/conversations/${shareModal.shareId}`}
                </code>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(`${window.location.origin}/conversations/${shareModal.shareId}`);
                    // Mostrar feedback visual de copiado
                  }}
                  className="ml-2 p-1 hover:bg-gray-600 rounded text-gray-300 hover:text-white"
                  title="Copiar enlace"
                >
                  <ClipboardIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="text-xs text-gray-400 mb-4">
              💡 Tip: Puedes dejar de compartir esta conversación en cualquier momento usando el botón de compartir nuevamente.
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(`${window.location.origin}/conversations/${shareModal.shareId}`);
                  setShareModal({show: false, shareId: null});
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Copiar enlace
              </button>
              <button
                onClick={() => setShareModal({show: false, shareId: null})}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
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
  onShare
}: {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onDelete: (id: string) => Promise<boolean>;
  onRename: (id: string, title: string) => Promise<boolean>;
  onShare: (id: string, shared: boolean) => Promise<boolean>;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const [menuPosition, setMenuPosition] = useState({x: 0, y: 0});

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    if (showMenu) {
      const handleClickOutside = () => setShowMenu(false);
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMenu]);

  const handleRename = async () => {
    if (editTitle.trim() && editTitle !== conversation.title) {
      await onRename(conversation.conversationId, editTitle.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className={`group relative p-3 rounded-lg cursor-pointer ${isActive ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-gray-700'}`}>
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
            className="w-full text-sm font-medium bg-transparent border-none outline-none text-white"
            autoFocus
          />
        ) : (
          <div className="text-sm font-medium truncate text-white">{conversation.title}</div>
        )}
        <div className="text-xs text-gray-400 mt-1 space-y-1">
          <div>{conversation.messages.length} mensajes</div>
          <div>{new Date(conversation.updatedAt).toLocaleDateString('es-ES', {
            day: '2-digit', 
            month: '2-digit', 
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}</div>
        </div>
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();
          setMenuPosition({
            x: rect.left - 160, // Ancho del menú hacia la izquierda
            y: rect.bottom + 5   // Debajo del botón
          });
          setShowMenu(!showMenu);
        }}
        className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-600 rounded text-gray-400 hover:text-white"
      >
        <EllipsisVerticalIcon className="w-4 h-4" />
      </button>

      {showMenu && (
        <div 
          className="fixed bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-50 py-1 min-w-[160px]"
          style={{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`
          }}
        >
          <button
            onClick={() => {
              setIsEditing(true);
              setShowMenu(false);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-600 flex items-center gap-2 text-gray-300 hover:text-white"
          >
            <PencilIcon className="w-4 h-4" />
            Renombrar
          </button>
          <button
            onClick={async () => {
              await onShare(conversation.conversationId, !conversation.shared);
              setShowMenu(false);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-600 flex items-center gap-2 text-gray-300 hover:text-white"
          >
            <ShareIcon className="w-4 h-4" />
            {conversation.shared ? 'Dejar de compartir' : 'Compartir'}
          </button>
          <button
            onClick={() => {
              onDelete(conversation.conversationId);
              setShowMenu(false);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-600 text-red-400 hover:text-red-300 flex items-center gap-2"
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
  isRegenerating,
  userName,
  agentName
}: {
  message: Message;
  onCopy: () => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  userName: string;
  agentName: string;
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
      <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-800 border border-gray-700 text-white'} rounded-lg p-4 relative group`}>
        {/* Nombre del remitente */}
        <div className={`text-xs font-medium mb-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-300'}`}>
          {message.role === 'user' ? userName : agentName}
        </div>
        
        {message.role === 'assistant' ? (
          <Markdown content={message.content} />
        ) : (
          <div className="whitespace-pre-wrap">{message.content}</div>
        )}
        
        <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>

        {showActions && (
          <div className="absolute -top-8 right-0 flex items-center gap-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg p-1">
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-gray-600 rounded text-gray-300 hover:text-white"
              title="Copiar"
            >
              {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
            </button>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="p-1 hover:bg-gray-600 rounded text-gray-300 hover:text-white"
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