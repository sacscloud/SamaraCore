'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Badge component inline
const Badge = ({ children, className = "", variant = "default" }: { children: React.ReactNode, className?: string, variant?: string }) => {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
  const variantClasses = {
    default: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
    secondary: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    outline: "border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
  };
  return <span className={`${baseClasses} ${variantClasses[variant as keyof typeof variantClasses] || variantClasses.default} ${className}`}>{children}</span>;
};
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/components/ui/theme-toggle';
import { API_CONFIG } from '@/lib/config';
import { 
  ArrowLeft, 
  Bot, 
  TestTube2,
  Settings, 
  BarChart3,
  Play,
  Edit,
  Users,
  Cpu,
  Zap,
  Clock,
  Target,
  Activity,
  CheckCircle,
  AlertCircle,
  Calendar,
  TrendingUp,
  Layers,
  Code,
  Eye,
  Plus
} from 'lucide-react';

interface Agent {
  agentId: string;
  agentName: string;
  description: string;
  categoria: string;
  status: 'active' | 'inactive';
  configuracion?: {
    modelo?: string;
    temperatura?: number;
  };
  prompt?: {
    full: string;
  };
  subAgents?: SubAgent[];
  tools?: string[];
  mcps?: string[];
  createdAt: string;
  updatedAt: string;
}

interface SubAgent {
  agentId: string;
  agentName: string;
  categoria: string;
  descripcionLibre: string;
  cuandoUsar: string;
  priority: number;
}

interface AgentStats {
  totalRuns: number;
  successRate: number;
  totalTokens: number;
  avgResponseTime: number;
  lastRun: string;
}

export default function AgentDashboard() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del agente
  useEffect(() => {
    if (!user || !agentId) return;
    
    const fetchAgentData = async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/agents/${agentId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await response.json();
        
        if (result.success && result.agent) {
          console.log('🔍 Agent data received:', result.agent);
          console.log('🔍 Prompt structure:', result.agent.prompt);
          console.log('🔍 Prompt.full:', result.agent.prompt?.full);
          console.log('🔍 All prompt fields:', Object.keys(result.agent.prompt || {}));
          setAgent(result.agent);
          
          // Simular estadísticas (TODO: implementar API real)
          setStats({
            totalRuns: Math.floor(Math.random() * 500) + 50,
            successRate: 95 + Math.random() * 4.9,
            totalTokens: Math.floor(Math.random() * 50000) + 10000,
            avgResponseTime: Math.random() * 2 + 0.5,
            lastRun: new Date(Date.now() - Math.random() * 86400000).toISOString()
          });
        } else {
          setError('Agente no encontrado');
        }
      } catch (error) {
        console.error('Error cargando agente:', error);
        setError('Error cargando agente');
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, [user, agentId]);

  const getModelDisplayName = (model: string) => {
    const modelMap: { [key: string]: string } = {
      'gpt-4o': 'GPT-4o',
      'gpt-4o-mini': 'GPT-4o Mini',
      'gpt-4-turbo': 'GPT-4 Turbo',
      'gpt-3.5-turbo': 'GPT-3.5 Turbo',
      'gpt-4': 'GPT-4'
    };
    return modelMap[model] || model;
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-500' : 'bg-gray-500';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Hace unos segundos';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0E0E10] text-gray-900 dark:text-white font-['Inter'] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0E0E10] text-gray-900 dark:text-white font-['Inter'] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => router.push('/dashboard/agents')}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0E0E10] text-gray-900 dark:text-white font-['Inter']">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-[#0E0E10]/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/agents" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-semibold">{agent.agentName}</h1>
                  <Badge className={`${getStatusColor(agent.status)} text-white border-0`}>
                    {agent.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{agent.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500 mt-1">
                  <span>Modelo: {getModelDisplayName(agent.configuracion?.modelo || 'gpt-4o-mini')}</span>
                  <span>•</span>
                  <span>Creado {formatDate(agent.createdAt)}</span>
                  <span>•</span>
                  <span>Categoría: {agent.categoria}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/agents/${agentId}/sandbox`)}
              className="flex items-center gap-2"
            >
              <TestTube2 className="w-4 h-4" />
              Sandbox
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Configurar
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>

             {/* Main Content - Cards Grid */}
       <div className="p-6">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* Quick Actions Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start gap-3 h-12"
                onClick={() => router.push(`/dashboard/agents/${agentId}/sandbox`)}
              >
                <TestTube2 className="w-5 h-5" />
                Probar en Sandbox
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12"
              >
                <Settings className="w-5 h-5" />
                Configuración
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12"
              >
                <BarChart3 className="w-5 h-5" />
                Analytics
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12"
              >
                <Edit className="w-5 h-5" />
                Editar Prompt
              </Button>
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-500" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatNumber(stats.totalRuns)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Ejecuciones</div>
                    </div>
                    
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {stats.successRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Éxito</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {formatNumber(stats.totalTokens)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Tokens</div>
                    </div>
                    
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {stats.avgResponseTime.toFixed(1)}s
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Tiempo</div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Última ejecución:</span>
                      <span className="font-medium">{formatDate(stats.lastRun)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <div className="text-gray-500 text-sm">No hay datos disponibles</div>
                </div>
              )}
            </CardContent>
          </Card>

                     {/* Prompt Overview Card */}
           <Card className="lg:col-span-1">
             <CardHeader>
               <div className="flex items-center justify-between">
                 <CardTitle className="flex items-center gap-2">
                   <Code className="w-5 h-5 text-purple-500" />
                   Prompt del Agente
                 </CardTitle>
                 {agent.prompt?.full && (
                   <Button variant="outline" size="sm">
                     <Edit className="w-4 h-4 mr-2" />
                     Editar Prompt
                   </Button>
                 )}
               </div>
             </CardHeader>
             <CardContent>
                                {agent.prompt?.full ? (
                 <div className="space-y-3">
                   <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                     <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                       {agent.prompt.full}
                     </div>
                   </div>
                   <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                     {agent.prompt.full.length} caracteres
                   </div>
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center h-32 text-gray-500 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                   <Code className="w-8 h-8 mb-3 text-gray-400" />
                   <p className="text-sm mb-2">No hay prompt configurado</p>
                   <Button variant="outline" size="sm">
                     <Plus className="w-4 h-4 mr-2" />
                     Crear Prompt
                   </Button>
                 </div>
               )}
             </CardContent>
           </Card>

           {/* Sub-Agents Card - Más compacto */}
           <Card className="lg:col-span-1">
             <CardHeader>
               <CardTitle className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Users className="w-5 h-5 text-indigo-500" />
                   Sub-Agentes
                 </div>
                 <Badge variant="secondary">{agent.subAgents?.length || 0}</Badge>
               </CardTitle>
             </CardHeader>
             <CardContent>
               {agent.subAgents && agent.subAgents.length > 0 ? (
                 <div className="space-y-2">
                   {agent.subAgents.slice(0, 3).map((subAgent, index) => (
                     <div key={subAgent.agentId} className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                       <div className="flex items-center gap-2">
                         <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-md flex items-center justify-center flex-shrink-0">
                           <span className="text-white text-xs font-bold">{index + 1}</span>
                         </div>
                         <div className="flex-1 min-w-0">
                           <h4 className="font-medium text-xs truncate">{subAgent.agentName}</h4>
                           <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                             {subAgent.categoria}
                           </p>
                         </div>
                       </div>
                     </div>
                   ))}
                   {agent.subAgents.length > 3 && (
                     <p className="text-xs text-gray-500 text-center py-1">+{agent.subAgents.length - 3} más</p>
                   )}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center h-20 text-gray-500">
                   <Users className="w-6 h-6 mb-2 text-gray-400" />
                   <p className="text-xs">Sin sub-agentes</p>
                 </div>
               )}
               
               <Button 
                 variant="outline" 
                 size="sm"
                 className="w-full mt-3 text-xs border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
               >
                 <Plus className="w-3 h-3 mr-1" />
                 Agregar sub-agente
               </Button>
             </CardContent>
           </Card>

                     {/* Tools Card */}
           <Card className="lg:col-span-1">
             <CardHeader>
               <CardTitle className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Layers className="w-5 h-5 text-green-500" />
                   Herramientas
                 </div>
                 <Badge variant="secondary">{agent.tools?.length || 0}</Badge>
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-3">
                 {agent.tools && agent.tools.length > 0 ? (
                   <div className="space-y-2">
                     {agent.tools.map((tool, index) => (
                       <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center gap-2">
                         <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                         <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{tool}</span>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="flex flex-col items-center justify-center h-20 text-gray-500">
                     <Layers className="w-6 h-6 mb-2 text-gray-400" />
                     <p className="text-sm">Sin herramientas configuradas</p>
                   </div>
                 )}
                 
                 <Button 
                   variant="outline" 
                   className="w-full flex items-center gap-2 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20"
                 >
                   <Plus className="w-4 h-4" />
                   Agregar herramienta
                 </Button>
               </div>
             </CardContent>
           </Card>

           {/* MCPs Card */}
           <Card className="lg:col-span-1">
             <CardHeader>
               <CardTitle className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Cpu className="w-5 h-5 text-blue-500" />
                   MCPs
                 </div>
                 <Badge variant="secondary">{agent.mcps?.length || 0}</Badge>
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-3">
                 {agent.mcps && agent.mcps.length > 0 ? (
                   <div className="space-y-2">
                     {agent.mcps.map((mcp, index) => (
                       <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center gap-2">
                         <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                         <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{mcp}</span>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="flex flex-col items-center justify-center h-20 text-gray-500">
                     <Cpu className="w-6 h-6 mb-2 text-gray-400" />
                     <p className="text-sm">Sin MCPs configurados</p>
                   </div>
                 )}
                 
                 <Button 
                   variant="outline" 
                   className="w-full flex items-center gap-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                 >
                   <Plus className="w-4 h-4" />
                   Agregar MCP
                 </Button>
               </div>
             </CardContent>
           </Card>

          {/* Recent Activity Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-500" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Simular actividad reciente */}
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm">Usuario probó el agente</p>
                    <p className="text-xs text-gray-500">Hace 5 minutos</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm">Agente ejecutado exitosamente</p>
                    <p className="text-xs text-gray-500">Hace 1 hora</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm">Configuración actualizada</p>
                    <p className="text-xs text-gray-500">Hace 3 horas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm">Sub-agente agregado</p>
                    <p className="text-xs text-gray-500">Ayer</p>
                  </div>
                </div>
                
                <Button variant="link" className="w-full text-xs p-0 h-auto">
                  Ver toda la actividad
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
} 