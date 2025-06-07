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
import { ArrowLeft, ArrowRight, Bot, BookOpen, Target, Shield, FileText, ChevronLeft, ChevronRight, Check, Cpu, Sliders, Network, TestTube2 } from 'lucide-react';

// Definir categorías
const AGENT_CATEGORIES = [
  {
    id: 'analisis',
    name: 'Análisis',
    icon: '📊',
    description: 'Especialistas en análisis de datos, reportes y métricas',
    color: 'from-blue-500 to-blue-600'
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
    color: 'from-blue-500 to-blue-600'
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
    subAgents: [],
    orchestration: {
      enabled: false,
      maxDepth: 3
    },
    
    // Paso 5: Prueba
    // (solo UI, no datos)
  });

  // Nuevo agentId para pasos 4 y 5
  const [createdAgentId, setCreatedAgentId] = useState('');

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
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Función para generar prompts automáticamente (Paso 2 → 3)
  const generatePrompts = async () => {
    setLoading(true);
    try {
      // TODO: Llamar al agente "Generador de Prompts Completos"
      // Por ahora, mock data
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular carga
      
      setFormData(prev => ({
        ...prev,
        prompt: {
          base: `Eres un asistente especializado en ${prev.categoria}. ${prev.descripcionLibre}`,
          objectives: 'Ayudar eficientemente a los usuarios\nProporcionar respuestas precisas y útiles\nMantener un tono profesional y amigable',
          rules: 'Siempre verificar la información antes de responder\nSer claro y conciso en las explicaciones\nPedir aclaración si la consulta es ambigua',
          examples: `Usuario: ¿Cómo puedes ayudarme?\nAgente: Soy un especialista en ${prev.categoria}. Puedo ayudarte con...\n\nUsuario: [Consulta específica]\nAgente: [Respuesta detallada y útil]`,
          responseFormat: 'Responder en markdown cuando sea apropiado\nUsar emojis ocasionalmente para mayor claridad\nEstructurar respuestas largas con encabezados'
        }
      }));
      
      nextStep();
    } catch (error) {
      alert('Error generando prompts automáticamente');
    } finally {
      setLoading(false);
    }
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
          prompt: cleanedPrompt
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCreatedAgentId(result.agent.agentId);
        nextStep();
        return true;
      } else {
        alert(`Error: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('Error creando agente:', error);
      alert('Error inesperado al crear el agente');
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
                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
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
          onClick={generatePrompts}
          disabled={loading || !formData.agentName.trim() || !formData.descripcionLibre.trim()}
          className="bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-lg hover:shadow-[#3B82F6]/30 text-[#0E0E10] font-semibold transition-all duration-300"
        >
          {loading ? '🤖 Generando prompts...' : 'Generar Prompts Automáticamente'} <ArrowRight className="w-4 h-4 ml-2" />
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
        <p className="text-gray-600 dark:text-gray-400">
          Revisa y ajusta la configuración generada automáticamente
        </p>
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
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
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
          onClick={saveAgentToMongoDB}
          disabled={loading || !formData.prompt.base.trim()}
          className="bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-lg hover:shadow-[#3B82F6]/30 text-[#0E0E10] font-semibold transition-all duration-300"
        >
          {loading ? 'Guardando...' : 'Guardar y Continuar'} <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  // Paso 4: Configuración Multi-Agente
  const renderStep4MultiAgent = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Configuración Multi-Agente
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configura qué otros agentes puede utilizar tu agente para tareas especializadas
        </p>
      </div>
      
      <Card className="bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Network className="w-5 h-5" />
            Orquestación de Agentes
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Permite que tu agente delegue tareas a otros agentes especializados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <Network className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Configuración Multi-Agente
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Aquí podrás seleccionar agentes de tu cuenta y agentes públicos sugeridos
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              💡 Funcionalidad próximamente disponible
            </p>
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
        <div className="flex gap-4">
          <Button 
            onClick={nextStep}
            variant="outline"
            className="border-gray-300 dark:border-gray-600/50 text-gray-700 dark:text-gray-300"
          >
            Omitir por ahora
          </Button>
          <Button 
            onClick={nextStep}
            className="bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-lg hover:shadow-[#3B82F6]/30 text-[#0E0E10] font-semibold transition-all duration-300"
          >
            Continuar <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );

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