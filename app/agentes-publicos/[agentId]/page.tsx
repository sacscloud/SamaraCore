'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ThemeToggle from '@/components/ui/theme-toggle';
import { ArrowLeft, Bot, MessageCircle, User, Calendar, Tag, Settings, Globe } from 'lucide-react';

interface AgentDetails {
  agentId: string;
  agentName: string;
  description: string;
  categoria: string;
  configuracion?: {
    modelo: string;
    temperatura: number;
  };
  createdAt: string;
  creator?: {
    email: string;
    displayName: string;
  };
  isPublic: boolean;
}

const categorias = [
  { value: 'utilidad', label: 'Utilidad', icon: '🔧' },
  { value: 'analisis', label: 'Análisis', icon: '📊' },
  { value: 'creativo', label: 'Creativo', icon: '🎨' },
  { value: 'soporte', label: 'Soporte', icon: '🎧' },
  { value: 'educacion', label: 'Educación', icon: '📚' },
  { value: 'automatizacion', label: 'Automatización', icon: '⚙️' }
];

export default function AgentPublicProfilePage({ params }: { params: { agentId: string } }) {
  const [agent, setAgent] = useState<AgentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await fetch(`/api/agents/public-list?agentId=${params.agentId}`);
        const data = await response.json();

        if (data.success && data.agent) {
          setAgent(data.agent);
        } else {
          setError('Agente no encontrado o no es público');
        }
      } catch (error) {
        console.error('Error obteniendo agente:', error);
        setError('Error cargando el agente');
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [params.agentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0E0E10] text-gray-900 dark:text-white font-['Inter']">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Cargando agente...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0E0E10] text-gray-900 dark:text-white font-['Inter']">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Bot className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Agente no encontrado</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <Link href="/agentes-publicos">
              <Button variant="outline">Volver a Agentes Públicos</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const categoria = categorias.find(c => c.value === agent.categoria);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0E0E10] text-gray-900 dark:text-white font-['Inter']">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800/50 backdrop-blur-sm sticky top-0 z-50 bg-white/80 dark:bg-[#0E0E10]/80">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <span className="text-sm font-bold text-[#0E0E10]">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">SamaraCore</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button variant="outline" className="border-gray-300 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-lg hover:shadow-[#3B82F6]/30 text-[#0E0E10] font-semibold transition-all duration-300 hover:scale-105">
                Crear Cuenta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/5 via-transparent to-[#00FFC3]/5 pointer-events-none"></div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 relative">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link 
            href="/agentes-publicos" 
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Agentes Públicos
          </Link>
        </div>

        {/* Agent Profile */}
        <div className="max-w-4xl mx-auto">
          {/* Header Card */}
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/30 border-gray-200 dark:border-gray-700/50 mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Agent Avatar */}
                <div className="w-24 h-24 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#3B82F6]/30">
                  <Bot className="w-12 h-12 text-[#0E0E10]" />
                </div>

                {/* Agent Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {agent.agentName}
                      </h1>
                      <div className="flex items-center gap-2 mb-3">
                        <Globe className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">Agente Público</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 leading-relaxed">
                    {agent.description || 'Este agente no tiene descripción disponible.'}
                  </p>

                  {/* Chat Button */}
                  <Link href={`/chat?agentId=${agent.agentId}`}>
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-lg hover:shadow-[#3B82F6]/30 text-[#0E0E10] font-semibold transition-all duration-300 hover:scale-105"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Chatear con {agent.agentName}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Agent Details */}
            <Card className="bg-white dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Settings className="w-5 h-5" />
                  Detalles del Agente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Categoría:</span>
                  <span className="bg-gray-200 dark:bg-gray-800/50 px-3 py-1 rounded-full text-sm font-medium">
                    {categoria?.icon} {categoria?.label || agent.categoria}
                  </span>
                </div>
                
                {agent.configuracion?.modelo && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Modelo IA:</span>
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                      {agent.configuracion.modelo}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Creado:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(agent.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Creator Info */}
            <Card className="bg-white dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <User className="w-5 h-5" />
                  Creador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {(agent.creator?.displayName || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {agent.creator?.displayName || 'Usuario'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Miembro de SamaraCore
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 border-blue-200 dark:border-blue-800/50 mt-8">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                ¿Listo para comenzar?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Chatea con {agent.agentName} y descubre todo lo que puede hacer por ti. 
                Es completamente gratuito.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/chat?agentId=${agent.agentId}`}>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-lg hover:shadow-[#3B82F6]/30 text-[#0E0E10] font-semibold transition-all duration-300 hover:scale-105"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Comenzar Chat
                  </Button>
                </Link>
                <Link href="/agentes-publicos">
                  <Button variant="outline" size="lg" className="border-gray-300 dark:border-gray-600/50">
                    Ver Más Agentes
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 