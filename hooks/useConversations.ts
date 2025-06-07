import { useState, useCallback, useEffect } from 'react';
import { auth } from '@/lib/firebase';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  _id: string;
  conversationId: string;
  userId: string;
  agentId: string;
  title: string;
  messages: Message[];
  folder?: string | null;
  shared: boolean;
  shareId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const useConversations = (agentId: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');
    
    const token = await user.getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }, []);

  // Cargar conversaciones del agente
  const loadConversations = useCallback(async (folder?: string, search?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({ agentId });
      if (folder) params.append('folder', folder);
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/conversations?${params}`, { headers });
      const data = await response.json();
      
      if (data.success) {
        setConversations(data.conversations);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [agentId, getAuthHeaders]);

  // Crear nueva conversación
  const createConversation = useCallback(async (title?: string, folder?: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers,
        body: JSON.stringify({ agentId, title, folder }),
      });
      
      const data = await response.json();
      if (data.success) {
        setConversations(prev => [data.conversation, ...prev]);
        return data.conversation;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando conversación');
      return null;
    }
  }, [agentId, getAuthHeaders]);

  // Agregar mensaje a conversación
  const addMessage = useCallback(async (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/conversations', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          conversationId,
          action: 'add_message',
          data: { message }
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        // Actualizar conversación en la lista
        setConversations(prev => 
          prev.map(conv => 
            conv.conversationId === conversationId 
              ? data.conversation 
              : conv
          )
        );
        return data.conversation;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error agregando mensaje');
      return null;
    }
  }, [getAuthHeaders]);

  // Actualizar título de conversación
  const updateTitle = useCallback(async (conversationId: string, title: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/conversations', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          conversationId,
          action: 'update_title',
          data: { title }
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setConversations(prev => 
          prev.map(conv => 
            conv.conversationId === conversationId 
              ? { ...conv, title } 
              : conv
          )
        );
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando título');
      return false;
    }
  }, [getAuthHeaders]);

  // Mover conversación a carpeta
  const moveToFolder = useCallback(async (conversationId: string, folder: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/conversations', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          conversationId,
          action: 'move_to_folder',
          data: { folder }
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setConversations(prev => 
          prev.map(conv => 
            conv.conversationId === conversationId 
              ? { ...conv, folder } 
              : conv
          )
        );
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error moviendo conversación');
      return false;
    }
  }, [getAuthHeaders]);

  // Compartir/dejar de compartir conversación
  const toggleShare = useCallback(async (conversationId: string, shared: boolean) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/conversations', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          conversationId,
          action: 'toggle_share',
          data: { shared }
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setConversations(prev => 
          prev.map(conv => 
            conv.conversationId === conversationId 
              ? data.conversation 
              : conv
          )
        );
        return data.conversation;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error compartiendo conversación');
      return null;
    }
  }, [getAuthHeaders]);

  // Eliminar conversación
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/conversations?conversationId=${conversationId}`, {
        method: 'DELETE',
        headers,
      });
      
      const data = await response.json();
      if (data.success) {
        setConversations(prev => 
          prev.filter(conv => conv.conversationId !== conversationId)
        );
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando conversación');
      return false;
    }
  }, [getAuthHeaders]);

  // Cargar conversaciones al montar el componente
  useEffect(() => {
    if (agentId) {
      loadConversations();
    }
  }, [agentId, loadConversations]);

  return {
    conversations,
    loading,
    error,
    loadConversations,
    createConversation,
    addMessage,
    updateTitle,
    moveToFolder,
    toggleShare,
    deleteConversation,
    clearError: () => setError(null),
  };
}; 