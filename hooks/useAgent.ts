import { useState, useEffect } from 'react';
import { Agent } from '@/lib/schemas';

export const useAgent = (agentId?: string) => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener lista de agentes
  const fetchAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/agents');
      if (!response.ok) {
        throw new Error('Error al obtener agentes');
      }
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtener un agente específico
  const fetchAgent = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/agents/${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener el agente');
      }
      const data = await response.json();
      setAgent(data.agent);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Guardar agente (crear o actualizar)
  const saveAgent = async (agentData: Agent) => {
    setLoading(true);
    setError(null);
    try {
      const method = agent ? 'PUT' : 'POST';
      const url = agent ? `/api/agents/${agent.agentId}` : '/api/agents';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
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
  };

  // Eliminar agente
  const deleteAgent = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
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
  };

  useEffect(() => {
    if (agentId) {
      fetchAgent(agentId);
    } else {
      fetchAgents();
    }
  }, [agentId]);

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