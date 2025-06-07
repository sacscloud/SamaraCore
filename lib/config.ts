// Configuración de URLs de APIs
export const API_CONFIG = {
  // URL del Core Agent Backend - configurable por entorno
  CORE_AGENT_URL: process.env.NEXT_PUBLIC_CORE_AGENT_URL || 'http://localhost:4000',
  
  // Endpoints específicos
  EXECUTE_AGENT: (agentId: string) => `${API_CONFIG.CORE_AGENT_URL}/execute/${agentId}`,
  AGENT_INFO: (agentId: string) => `${API_CONFIG.CORE_AGENT_URL}/execute/${agentId}/info`,
} as const;

// Validación de configuración en desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Configuration:', {
    CORE_AGENT_URL: API_CONFIG.CORE_AGENT_URL,
    NODE_ENV: process.env.NODE_ENV
  });
} 