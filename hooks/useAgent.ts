import { useState, useEffect, useCallback } from 'react';
import { Agent } from '@/lib/schemas';

// Función auxiliar para obtener el token de Firebase
const getAuthToken = async () => {
  try {
    const { auth } = await import('@/lib/firebase');
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Función auxiliar para crear headers con autenticación
const getAuthHeaders = async () => {
  const token = await getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const useAgent = (agentId?: string) => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener lista de agentes (usando useCallback para evitar recreación)
  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/agents', { headers });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicia sesión.');
        }
        throw new Error('Error al obtener agentes');
      }
      
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias ya que es una función independiente

  // Obtener un agente específico (usando useCallback)
  const fetchAgent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/agents/${id}`, { headers });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicia sesión.');
        }
        if (response.status === 404) {
          throw new Error('Agente no encontrado');
        }
        throw new Error('Error al obtener el agente');
      }
      
      const data = await response.json();
      setAgent(data.agent);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Guardar agente (crear o actualizar)
  const saveAgent = useCallback(async (agentData: Agent) => {
    setLoading(true);
    setError(null);
    try {
      const method = agent ? 'PUT' : 'POST';
      const url = agent ? `/api/agents/${agent.agentId}` : '/api/agents';
      const headers = await getAuthHeaders();
      
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicia sesión.');
        }
        if (response.status === 400) {
          const data = await response.json();
          throw new Error(data.error || 'Datos inválidos');
        }
        throw new Error('Error al guardar el agente');
      }

      const data = await response.json();
      setAgent(data.agent);
      return { success: true, agent: data.agent };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [agent]);

  // Eliminar agente
  const deleteAgent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/agents/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado. Por favor, inicia sesión.');
        }
        if (response.status === 404) {
          throw new Error('Agente no encontrado');
        }
        throw new Error('Error al eliminar el agente');
      }

      setAgents(prevAgents => prevAgents.filter(a => a.agentId !== id));
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect optimizado - solo se ejecuta cuando cambia agentId
  useEffect(() => {
    if (agentId) {
      fetchAgent(agentId);
    }
    // NO llamamos fetchAgents aquí para evitar el loop
  }, [agentId, fetchAgent]);

  return {
    agent,
    agents,
    loading,
    error,
    fetchAgents,
    fetchAgent,
    saveAgent,
    deleteAgent,
    setAgent
  };
}; 