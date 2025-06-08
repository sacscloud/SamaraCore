import { API_CONFIG } from './config';

const { SYSTEM_AGENTS } = API_CONFIG;

// Función para llamar a cualquier agente
async function callAgent(agentId: string, message: string) {
  try {
    const response = await fetch(API_CONFIG.EXECUTE_AGENT(agentId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        context: {},
        conversationHistory: []
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      return { success: true, data: result.response };
    } else {
      throw new Error(result.error || 'Error del agente');
    }
  } catch (error) {
    console.error(`Error llamando agente ${agentId}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

// Generar prompts completos basado en categoría y descripción
export async function generatePrompts(categoria: string, descripcion: string) {
  const message = `Descripción: ${descripcion}`;
  
  const result = await callAgent(SYSTEM_AGENTS.PROMPT_GENERATOR, message);
  
  if (result.success) {
    try {
      // Intentar parsear el JSON devuelto por el agente

      //limpiar el prompt del agente
      const prompt = result.data.replace(/^```json\n|```$/g, ''); 
      const promptData = JSON.parse(prompt);
      return {
        success: true,
        prompts: {
          base: promptData.base || '',
          objectives: Array.isArray(promptData.objectives) ? promptData.objectives : [],
          rules: Array.isArray(promptData.rules) ? promptData.rules : [],
          examples: promptData.examples || '',
          responseFormat: promptData.responseFormat || ''
        }
      };
    } catch (parseError) {
      console.error('Error parseando JSON del generador:', parseError);
      return { 
        success: false, 
        error: 'El generador no devolvió JSON válido' 
      };
    }
  }
  
  return result;
}

// Generar campo "cuandoUsar" basado en información del agente
export async function generateWhenToUse(agentName: string, categoria: string, descripcion: string, prompts: any) {
  // Manejar si objectives es string o array
  const objectives = Array.isArray(prompts.objectives) 
    ? prompts.objectives.join(', ')
    : prompts.objectives || '';
    
  const message = `Información del agente:
Nombre: ${agentName}
Categoría: ${categoria}
Descripción: ${descripcion}
Prompt Base: ${prompts.base}
Objetivos: ${objectives}`;
  
  const result = await callAgent(SYSTEM_AGENTS.WHEN_TO_USE_GENERATOR, message);
  
  if (result.success) {
    return {
      success: true,
      cuandoUsar: result.data.trim()
    };
  }
  
  return result;
} 