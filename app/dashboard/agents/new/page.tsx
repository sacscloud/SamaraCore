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
import { ArrowLeft, Bot, BookOpen, Target, Shield, FileText } from 'lucide-react';

export default function NewAgentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    agentName: '',
    description: '',
    prompt: {
      base: '',
      objectives: '',
      rules: '',
      examples: '',
      responseFormat: ''
    }
  });

  const handleInputChange = (field: string, value: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
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
          ...formData,
          prompt: cleanedPrompt
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/dashboard/agents/${result.agent.agentId}`);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creando agente:', error);
      alert('Error inesperado al crear el agente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E10] text-white font-['Inter']">
      {/* Header */}
      <header className="border-b border-gray-800/50 backdrop-blur-sm sticky top-0 z-50 bg-[#0E0E10]/80">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <span className="text-sm font-bold text-[#0E0E10]">S</span>
              </div>
              <span className="text-xl font-bold text-white">SamaraCore</span>
            </Link>
          </div>
          
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-2xl flex items-center justify-center">
                <Bot className="w-8 h-8 text-[#0E0E10]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Crear Nuevo Agente
                </h1>
                <p className="text-gray-400 text-lg">
                  Configura la personalidad y objetivos de tu agente IA
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card className="bg-gray-900/40 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Información Básica</CardTitle>
                <CardDescription className="text-gray-400">
                  Define el nombre y propósito de tu agente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="agentName" className="text-white">Nombre del Agente</Label>
                  <Input
                    id="agentName"
                    value={formData.agentName}
                    onChange={(e) => handleInputChange('agentName', e.target.value)}
                    placeholder="Ej: Asistente de Ventas"
                    className="bg-gray-800/50 border-gray-600/50 text-white"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-white">Descripción (Opcional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe brevemente lo que hace este agente..."
                    className="bg-gray-800/50 border-gray-600/50 text-white"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Base Prompt */}
            <Card className="bg-gray-900/40 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Prompt Base
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Define la personalidad y contexto fundamental del agente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.prompt.base}
                  onChange={(e) => handlePromptChange('base', e.target.value)}
                  placeholder="Eres un asistente experto en... Siempre respondes de manera..."
                  className="bg-gray-800/50 border-gray-600/50 text-white"
                  rows={4}
                  required
                />
              </CardContent>
            </Card>

            {/* Objectives */}
            <Card className="bg-gray-900/40 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Objetivos
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Define qué debe lograr este agente (un objetivo por línea)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.prompt.objectives}
                  onChange={(e) => handlePromptChange('objectives', e.target.value)}
                  placeholder="Debe lograr solucionar diferentes problemas de los usuarios&#10;Respuestas directas y amigables&#10;Termina con sugerencia para continuar"
                  className="bg-gray-800/50 border-gray-600/50 text-white"
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Rules */}
            <Card className="bg-gray-900/40 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Reglas
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Establece límites y comportamientos que debe seguir (una regla por línea)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.prompt.rules}
                  onChange={(e) => handlePromptChange('rules', e.target.value)}
                  placeholder="Para orquestación: 'Consultando agente especializado...' + resultado&#10;Para Slack: Ejecuta la acción y confirma resultado&#10;NO menciones información técnica interna como nombres de cuentas"
                  className="bg-gray-800/50 border-gray-600/50 text-white"
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Examples */}
            <Card className="bg-gray-900/40 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Ejemplos de Interacción
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Proporciona ejemplos de cómo debe responder el agente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.prompt.examples}
                  onChange={(e) => handlePromptChange('examples', e.target.value)}
                  placeholder="Usuario: ¿Cómo puedes ayudarme?&#10;Agente: Puedo ayudarte con...&#10;&#10;Usuario: [Otro ejemplo]&#10;Agente: [Respuesta esperada]"
                  className="bg-gray-800/50 border-gray-600/50 text-white"
                  rows={6}
                />
              </CardContent>
            </Card>

            {/* Response Format */}
            <Card className="bg-gray-900/40 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Formato de Respuesta
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Especifica cómo debe formatear las respuestas (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.prompt.responseFormat}
                  onChange={(e) => handlePromptChange('responseFormat', e.target.value)}
                  placeholder="Responde siempre en formato markdown&#10;Usa JSON para datos estructurados&#10;Incluye emojis para hacer la respuesta más amigable"
                  className="bg-gray-800/50 border-gray-600/50 text-white"
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end">
              <Link href="/dashboard">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-gray-600/50 text-gray-300 hover:text-white hover:bg-gray-800/50"
                >
                  Cancelar
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={loading || !formData.agentName.trim() || !formData.prompt.base.trim()}
                className="bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-lg hover:shadow-[#3B82F6]/30 text-[#0E0E10] font-semibold transition-all duration-300"
              >
                {loading ? 'Creando...' : 'Crear Agente'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 