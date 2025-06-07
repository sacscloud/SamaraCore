'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/components/ui/theme-toggle';
import { ArrowLeft, ArrowRight, Bot, BookOpen, Target, Shield, FileText, ChevronLeft, ChevronRight, Check, Cpu, Sliders, Network, TestTube2, Wand2 } from 'lucide-react';
import { generatePrompts as autoGeneratePrompts, generateWhenToUse } from '@/lib/agent-helpers';

// Definir tipos
interface SubAgent {
  agentId: string;
  agentName: string;
  categoria: string;
  descripcionLibre: string;
  cuandoUsar: string;
  priority: number;
}

// Definir categorías
const AGENT_CATEGORIES = [
  {
    id: 'analisis',
    name: 'Análisis',
    icon: '📊',
    description: 'Especialistas en análisis de datos, reportes y métricas',
    color: 'from-[#3B82F6] to-[#00FFC3]'
  },
  {
    id: 'contenido',
    name: 'Creación de Contenido',
    icon: '✍️',
    description: 'Generación de textos, artículos, copy y contenido creativo',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'busqueda',
    name: 'Búsqueda',
    icon: '🔍',
    description: 'Búsqueda de información, investigación y web scraping',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'comunicacion',
    name: 'Comunicación',
    icon: '📧',
    description: 'Envío de emails, notificaciones y gestión de comunicación',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'creativo',
    name: 'Creativo',
    icon: '🎨',
    description: 'Diseño, generación de imágenes y contenido visual',
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 'tecnico',
    name: 'Técnico',
    icon: '💻',
    description: 'Programación, desarrollo y tareas técnicas especializadas',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'negocios',
    name: 'Negocios',
    icon: '🏢',
    description: 'Ventas, marketing, estrategia y gestión empresarial',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'educacion',
    name: 'Educación',
    icon: '🎓',
    description: 'Tutoriales, explicaciones educativas y capacitación',
    color: 'from-teal-500 to-teal-600'
  },
  {
    id: 'utilidad',
    name: 'Utilidad',
    icon: '⚙️',
    description: 'Herramientas generales, automatización y tareas variadas',
    color: 'from-gray-500 to-gray-600'
  }
];

// Modelos disponibles
const AVAILABLE_MODELS = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Balance perfecto entre calidad y velocidad. Ideal para la mayoría de agentes.',
    category: 'Recomendado',
    icon: '⚡',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Máxima calidad para análisis complejos y tareas que requieren razonamiento avanzado.',
    category: 'Análisis Profundo',
    icon: '🧠',
    color: 'from-[#3B82F6] to-[#00FFC3]'
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Excelente para tareas creativas y generación de contenido extenso.',
    category: 'Creatividad',
    icon: '🎨',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Rápido y económico. Perfecto para respuestas directas y tareas simples.',
    category: 'Eficiencia',
    icon: '🚀',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Modelo base confiable para tareas generales que requieren precisión.',
    category: 'Confiable',
    icon: '🎯',
    color: 'from-indigo-500 to-indigo-600'
  }
];

export default function NewAgentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form state
  const [formData, setFormData] = useState({
    // Paso 1: Categoría
    categoria: '',
    
    // Paso 2: Descripción libre
    agentName: '',
    descripcionLibre: '',
    
    // Paso 3: Prompts (generados automáticamente + editables)
    prompt: {
      base: '',
      objectives: '',
      rules: '',
      examples: '',
      responseFormat: ''
    },
    
    // Configuración técnica
    configuracion: {
      modelo: 'gpt-4o-mini',
      temperatura: 0.7
    },
    
    // Paso 4: Multi-agente
    subAgents: [] as SubAgent[],
    orchestration: {
      enabled: false,
      maxDepth: 3
    },
    
    // Paso 5: Prueba
    // (solo UI, no datos)
  });

  // Nuevo agentId para pasos 4 y 5
  const [createdAgentId, setCreatedAgentId] = useState('');
  
  // Estados para auto-generación
  const [generatingPrompts, setGeneratingPrompts] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Estados para Paso 4 - Multi-Agent
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [selectedSubAgents, setSelectedSubAgents] = useState<any[]>([]);
  const [generatingRelation, setGeneratingRelation] = useState<string | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePromptChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      prompt: {
        ...prev.prompt,
        [field]: value
      }
    }));
  };

  const handleConfigChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      configuracion: {
        ...prev.configuracion,
        [field]: value
      }
    }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      
      // Si vamos al paso 4 (multi-agente), sincronizar los estados
      if (currentStep + 1 === 4) {
        setSelectedSubAgents(formData.subAgents);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Función para generar prompts automáticamente (Paso 2 → 3)
  const generatePrompts = async () => {
    if (!formData.categoria || !formData.descripcionLibre.trim()) {
      // En lugar de alert, simplemente no hacer nada - el botón ya está disabled
      return;
    }

    setGeneratingPrompts(true);
    
    try {
      const categoryName = AGENT_CATEGORIES.find(c => c.id === formData.categoria)?.name || '';
      
      // Llamar al agente generador de prompts
      const result = await autoGeneratePrompts(categoryName, formData.descripcionLibre);
      
      if (result.success && 'prompts' in result && result.prompts) {
        // Auto-completar con los prompts generados por IA
        setFormData(prev => ({
          ...prev,
          prompt: {
            base: result.prompts.base,
            objectives: result.prompts.objectives.join('\n'),
            rules: result.prompts.rules.join('\n'),
            examples: result.prompts.examples,
            responseFormat: result.prompts.responseFormat
          }
        }));
        
        nextStep();
      } else {
        setErrorMessage('Error generando prompts. Inténtalo nuevamente.');
        console.error('Error generando prompts:', result.error);
      }
    } catch (error) {
      setErrorMessage('Error conectando con el generador de prompts');
      console.error('Error conectando con el generador de prompts:', error);
    } finally {
      setGeneratingPrompts(false);
    }
  };

  // Cargar agentes disponibles para orquestación
  const loadAvailableAgents = async () => {
    if (!user) return;
    
    setLoadingAgents(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/agents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const result = await response.json();
      if (result.success) {
        // Filtrar agentes que no sean el actual
        const otherAgents = result.agents.filter((agent: any) => agent.agentId !== createdAgentId);
        setAvailableAgents(otherAgents);
      }
    } catch (error) {
      console.error('Error cargando agentes:', error);
    } finally {
      setLoadingAgents(false);
    }
  };

  // Generar "cuandoUsar" para relación específica orquestador → orquestado
  const generateRelationCuandoUsar = async (subAgent: any) => {
    setGeneratingRelation(subAgent.agentId);
    
    try {
      const contextMessage = `
AGENTE ORQUESTADOR: ${formData.agentName}
Descripción: ${formData.descripcionLibre}

AGENTE A USAR: ${subAgent.agentName}  
Descripción: ${subAgent.descripcionLibre || 'No especificada'}

Genera un texto que indique cuándo el agente "${formData.agentName}" debe usar al agente "${subAgent.agentName}".

Ejemplo: "Usa al agente ${subAgent.agentName} cuando el usuario solicite..."`;

      const result = await generateWhenToUse(
        formData.agentName,
        'Orquestación',
        contextMessage,
        { base: contextMessage, objectives: '' }
      );
      
      if (result.success && 'cuandoUsar' in result) {
        // Actualizar el sub-agente con el cuandoUsar generado
        setSelectedSubAgents(prev => 
          prev.map(sa => 
            sa.agentId === subAgent.agentId 
              ? { ...sa, cuandoUsar: result.cuandoUsar }
              : sa
          )
        );
        // También actualizar formData.subAgents
        setFormData(prev => ({
          ...prev,
          subAgents: prev.subAgents.map(sa => 
            sa.agentId === subAgent.agentId 
              ? { ...sa, cuandoUsar: result.cuandoUsar }
              : sa
          )
        }));
      } else {
        console.error('Error generando relación:', 'error' in result ? result.error : 'Error desconocido');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setGeneratingRelation(null);
    }
  };

  // Agregar sub-agente a la orquestación
  const addSubAgent = async (agent: any) => {
    const subAgent = {
      agentId: agent.agentId,
      agentName: agent.agentName,
      categoria: agent.categoria,
      descripcionLibre: agent.descripcionLibre,
      cuandoUsar: '', // Se generará automáticamente
      priority: selectedSubAgents.length + 1
    };
    
    setSelectedSubAgents(prev => [...prev, subAgent]);
    // También actualizar formData.subAgents
    setFormData(prev => ({
      ...prev,
      subAgents: [...prev.subAgents, subAgent]
    }));
    setShowAgentSelector(false);
    
    // Generar automáticamente el "cuandoUsar" para esta relación
    await generateRelationCuandoUsar(subAgent);
  };

  // Remover sub-agente
  const removeSubAgent = (agentId: string) => {
    setSelectedSubAgents(prev => prev.filter(sa => sa.agentId !== agentId));
    // También actualizar formData.subAgents
    setFormData(prev => ({
      ...prev,
      subAgents: prev.subAgents.filter(sa => sa.agentId !== agentId)
    }));
  };

  // Actualizar "cuandoUsar" de sub-agente
  const updateSubAgentCuandoUsar = (agentId: string, cuandoUsar: string) => {
    setSelectedSubAgents(prev => 
      prev.map(sa => 
        sa.agentId === agentId ? { ...sa, cuandoUsar } : sa
      )
    );
    // También actualizar formData.subAgents
    setFormData(prev => ({
      ...prev,
      subAgents: prev.subAgents.map(sa => 
        sa.agentId === agentId ? { ...sa, cuandoUsar } : sa
      )
    }));
  };

  // Función para guardar agente en MongoDB (Paso 3 → 4)
  const saveAgentToMongoDB = async () => {
    if (!user) return false;
    
    setLoading(true);
    try {
      // Convertir objetivos y reglas de texto a arrays
      const cleanedPrompt = {
        ...formData.prompt,
        objectives: formData.prompt.objectives
          .split('\n')
          .map(obj => obj.trim())
          .filter(obj => obj !== ''),
        rules: formData.prompt.rules
          .split('\n')
          .map(rule => rule.trim())
          .filter(rule => rule !== '')
      };

      // Obtener token de autenticación
      const token = await user.getIdToken();
      
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          agentName: formData.agentName,
          description: formData.descripcionLibre,
          categoria: formData.categoria,
          configuracion: formData.configuracion,
          prompt: cleanedPrompt,
          // Configuración multi-agente
          subAgents: formData.subAgents,
          orchestration: {
            enabled: formData.subAgents.length > 0,
            maxDepth: 3
          }
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCreatedAgentId(result.agent.agentId);
        nextStep();
        return true;
      } else {
        setErrorMessage(`Error creando agente: ${result.error}`);
        console.error('Error creando agente:', result.error);
        return false;
      }
    } catch (error) {
      setErrorMessage('Error inesperado al crear el agente');
      console.error('Error creando agente:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para finalizar y redirigir
  const finishWizard = () => {
    if (createdAgentId) {
      router.push(`/dashboard/agents/${createdAgentId}`);
    } else {
      router.push('/dashboard');
    }
  };

  // Renderizar step indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
              step === currentStep 
                ? 'bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] text-[#0E0E10]' 
                : step < currentStep 
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              {step < currentStep ? <Check className="w-5 h-5" /> : step}
            </div>
            {step < 5 && (
              <div className={`w-16 h-1 transition-all duration-300 ${
                step < currentStep ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Renderizar contenido de cada paso
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1CategorySelection();
      case 2:
        return renderStep2Description();
      case 3:
        return renderStep3PromptConfiguration();
      case 4:
        return renderStep4MultiAgent();
      case 5:
        return renderStep5Congratulations();
      default:
        return null;
    }
  };

  // Paso 1: Selección de Categoría
  const renderStep1CategorySelection = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          ¿Qué tipo de agente quieres crear?
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Elige la categoría que mejor describe las funciones de tu agente
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AGENT_CATEGORIES.map((category) => (
          <Card 
            key={category.id}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              formData.categoria === category.id 
                ? 'ring-2 ring-[#3B82F6] bg-gradient-to-r from-[#3B82F6]/10 to-[#00FFC3]/10' 
                : 'bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/50'
            }`}
            onClick={() => {
              handleInputChange('categoria', category.id);
              nextStep();
            }}
          >
            <CardContent className="p-6 text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl`}>
                {category.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {category.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {category.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center mt-8">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          💡 Haz clic en cualquier categoría para continuar
        </p>
      </div>
    </div>
  );

  // Paso 2: Descripción libre
  const renderStep2Description = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Describe tu agente
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Proporciona el nombre y una descripción detallada de lo que debe hacer tu agente
        </p>
      </div>
      
      <Card className="bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50">
        <CardContent className="p-8 space-y-6">
          <div>
            <Label htmlFor="agentName" className="text-gray-900 dark:text-white text-lg font-semibold mb-3 block">
              Nombre del Agente
            </Label>
            <Input
              id="agentName"
              value={formData.agentName}
              onChange={(e) => handleInputChange('agentName', e.target.value)}
              placeholder="Ej: Asistente de Análisis de Ventas"
              className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg p-4"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="descripcionLibre" className="text-gray-900 dark:text-white text-lg font-semibold mb-3 block">
              Describe tu agente en detalle
            </Label>
            <Textarea
              id="descripcionLibre"
              value={formData.descripcionLibre}
              onChange={(e) => handleInputChange('descripcionLibre', e.target.value)}
              placeholder="Describe qué debe hacer tu agente, cómo debe comportarse, qué tipo de respuestas debe dar, en qué contextos debe actuar, etc. Sé específico sobre sus funciones y personalidad..."
              className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base p-4"
              rows={8}
              required
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              💡 Esta descripción se utilizará para generar automáticamente todos los prompts del agente
            </p>
            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
                <button 
                  onClick={() => setErrorMessage('')}
                  className="text-xs text-red-500 hover:text-red-700 mt-1"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button 
          onClick={prevStep}
          variant="outline"
          className="border-gray-300 dark:border-gray-600/50 text-gray-700 dark:text-gray-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
        </Button>
        <Button 
          onClick={() => {
            // Validación en Paso 2
            if (!formData.agentName.trim()) {
              setErrorMessage('Por favor ingresa el nombre del agente');
              return;
            }
            if (formData.agentName.trim().length < 3 || formData.agentName.trim().length > 50) {
              setErrorMessage('El nombre del agente debe tener entre 3 y 50 caracteres');
              return;
            }
            if (!formData.descripcionLibre.trim()) {
              setErrorMessage('Por favor describe tu agente');
              return;
            }
            if (formData.descripcionLibre.trim().length < 10) {
              setErrorMessage('La descripción debe tener al menos 10 caracteres');
              return;
            }
            if (formData.descripcionLibre.trim().length > 1000) {
              setErrorMessage('La descripción no puede exceder 1000 caracteres');
              return;
            }
            setErrorMessage(''); // Limpiar errores
            generatePrompts();
          }}
          disabled={generatingPrompts}
          className="bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-lg hover:shadow-[#3B82F6]/30 text-[#0E0E10] font-semibold transition-all duration-300"
        >
          {generatingPrompts ? (
            <>
              <div className="w-4 h-4 border-2 border-[#0E0E10] border-t-transparent rounded-full animate-spin mr-2" />
              🤖 Generando prompts...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generar Prompts Automáticamente
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // Paso 3: Configuración de prompts (pre-poblado + editable)
  const renderStep3PromptConfiguration = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Configuración del Agente
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Revisa y ajusta la configuración generada automáticamente
        </p>
        <Button
          onClick={generatePrompts}
          disabled={generatingPrompts}
          variant="outline"
          className="border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6]/10"
        >
          {generatingPrompts ? (
            <>
              <div className="w-4 h-4 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin mr-2" />
              Re-generando...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Re-generar Prompts
            </>
          )}
        </Button>
      </div>

      {/* Configuración del Modelo */}
      <Card className="bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            Modelo de IA
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Selecciona el modelo que mejor se adapte a las funciones de tu agente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {AVAILABLE_MODELS.map((model) => (
              <Card 
                key={model.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                  formData.configuracion.modelo === model.id 
                    ? 'ring-2 ring-[#3B82F6] bg-gradient-to-r from-[#3B82F6]/10 to-[#00FFC3]/10' 
                    : 'bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
                onClick={() => handleConfigChange('modelo', model.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${model.color} flex items-center justify-center text-xl`}>
                    {model.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {model.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {model.category}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {model.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div>
            <Label className="text-gray-900 dark:text-white font-semibold mb-3 block">
              <Sliders className="w-4 h-4 inline mr-2" />
              Temperatura: {formData.configuracion.temperatura}
            </Label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={formData.configuracion.temperatura}
              onChange={(e) => handleConfigChange('temperatura', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
              <span>0.0 - Más preciso</span>
              <span>1.0 - Balanceado</span>
              <span>2.0 - Más creativo</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prompt Base */}
      <Card className="bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Prompt Base
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.prompt.base}
            onChange={(e) => handlePromptChange('base', e.target.value)}
            className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600/50 text-gray-900 dark:text-white"
            rows={4}
            required
          />
        </CardContent>
      </Card>

      {/* Objetivos */}
      <Card className="bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5" />
            Objetivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.prompt.objectives}
            onChange={(e) => handlePromptChange('objectives', e.target.value)}
            className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600/50 text-gray-900 dark:text-white"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Reglas */}
      <Card className="bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Reglas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.prompt.rules}
            onChange={(e) => handlePromptChange('rules', e.target.value)}
            className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600/50 text-gray-900 dark:text-white"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Ejemplos */}
      <Card className="bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Ejemplos de Interacción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.prompt.examples}
            onChange={(e) => handlePromptChange('examples', e.target.value)}
            className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600/50 text-gray-900 dark:text-white"
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Formato de Respuesta */}
      <Card className="bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Formato de Respuesta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.prompt.responseFormat}
            onChange={(e) => handlePromptChange('responseFormat', e.target.value)}
            className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600/50 text-gray-900 dark:text-white"
            rows={3}
          />
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button 
          onClick={prevStep}
          variant="outline"
          className="border-gray-300 dark:border-gray-600/50 text-gray-700 dark:text-gray-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
        </Button>
        <Button 
          onClick={nextStep}
          disabled={!formData.prompt.base.trim()}
          className="bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-lg hover:shadow-[#3B82F6]/30 text-[#0E0E10] font-semibold transition-all duration-300"
        >
          Continuar <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  // Paso 4: Configuración Multi-Agente
  const renderStep4MultiAgent = () => {
    // Cargar agentes cuando se entra al paso 4
    if (currentStep === 4 && availableAgents.length === 0 && !loadingAgents) {
      loadAvailableAgents();
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-2xl flex items-center justify-center">
            <Network className="w-8 h-8 text-[#0E0E10]" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Configuración Multi-Agente
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Conecta agentes especializados para crear workflows inteligentes
          </p>
        </div>

        {/* Sub-agentes seleccionados */}
        {selectedSubAgents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                Agentes Orquestados ({selectedSubAgents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedSubAgents.map((subAgent, index) => (
                <div key={subAgent.agentId} className="border border-gray-200 dark:border-gray-700/50 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/40">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] rounded-full flex items-center justify-center text-[#0E0E10] text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {subAgent.agentName}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {AGENT_CATEGORIES.find(c => c.id === subAgent.categoria)?.name || 'Sin categoría'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeSubAgent(subAgent.agentId)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      ✕
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Cuándo usar este agente:</Label>
                    {generatingRelation === subAgent.agentId ? (
                      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-[#3B82F6]/10 to-[#00FFC3]/10 border border-[#3B82F6]/20 rounded-lg">
                        <div className="w-4 h-4 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-[#3B82F6] dark:text-[#00FFC3]">
                          Generando contexto de uso automáticamente...
                        </span>
                      </div>
                    ) : (
                      <Textarea
                        value={subAgent.cuandoUsar}
                        onChange={(e) => updateSubAgentCuandoUsar(subAgent.agentId, e.target.value)}
                        placeholder="Describe cuándo este agente orquestador debe usar este sub-agente..."
                        className="min-h-[80px]"
                      />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Selector de agentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Agregar Agentes
            </CardTitle>
            <CardDescription>
              Selecciona agentes existentes para orquestar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showAgentSelector ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Agentes disponibles:</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAgentSelector(false)}
                  >
                    Cancelar
                  </Button>
                </div>
                
                {loadingAgents ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin mr-3" />
                    <span className="text-gray-600 dark:text-gray-400">Cargando agentes...</span>
                  </div>
                ) : availableAgents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No tienes otros agentes disponibles</p>
                    <p className="text-sm">Crea más agentes para poder orquestarlos</p>
                  </div>
                ) : (
                  <div className="grid gap-3 max-h-64 overflow-y-auto">
                    {availableAgents
                      .filter(agent => !selectedSubAgents.some(sa => sa.agentId === agent.agentId))
                      .map((agent) => (
                        <div 
                          key={agent.agentId}
                          className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                          onClick={() => addSubAgent(agent)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm">
                              {AGENT_CATEGORIES.find(c => c.id === agent.categoria)?.icon || '🤖'}
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">
                                {agent.agentName}
                              </h5>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {AGENT_CATEGORIES.find(c => c.id === agent.categoria)?.name || 'Sin categoría'}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="text-[#3B82F6] hover:text-[#00FFC3] hover:bg-gradient-to-r hover:from-[#3B82F6]/10 hover:to-[#00FFC3]/10">
                            Agregar
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <Button 
                  onClick={() => setShowAgentSelector(true)}
                  className="bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-lg hover:shadow-[#3B82F6]/30 text-[#0E0E10] font-semibold transition-all duration-300"
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Seleccionar Agentes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          <Button 
            onClick={saveAgentToMongoDB}
            disabled={loading}
            className="bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-lg hover:shadow-[#3B82F6]/30 text-[#0E0E10] font-semibold transition-all duration-300"
          >
            {loading ? 'Guardando...' : (selectedSubAgents.length > 0 ? 'Crear Agente' : 'Crear Agente sin Orquestación')} 
            {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    );
  };

  // Paso 5: Felicitación y finalización
  const renderStep5Congratulations = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
          <span className="text-4xl">🎉</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          ¡Felicidades!
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
          Has creado exitosamente tu agente <strong>{formData.agentName}</strong>
        </p>
        

        <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/50 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${AGENT_CATEGORIES.find(c => c.id === formData.categoria)?.color} flex items-center justify-center text-xl`}>
              {AGENT_CATEGORIES.find(c => c.id === formData.categoria)?.icon}
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">{formData.agentName}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {AGENT_CATEGORIES.find(c => c.id === formData.categoria)?.name} • {AVAILABLE_MODELS.find(m => m.id === formData.configuracion.modelo)?.name}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <Button 
          onClick={finishWizard}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg hover:shadow-green-500/30 text-white font-semibold transition-all duration-300 text-lg px-8 py-3"
        >
          🚀 Ir al Dashboard del Agente
        </Button>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Podrás configurar más opciones y probar tu agente desde el dashboard
        </p>
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
            <ThemeToggle />
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-2xl flex items-center justify-center">
                <Bot className="w-8 h-8 text-[#0E0E10]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Asistente de Creación de Agentes
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Te guiaremos paso a paso para crear tu agente perfecto
                </p>
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Step Content */}
          {renderStepContent()}
        </div>
      </main>
    </div>
  );
} 