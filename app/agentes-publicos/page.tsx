'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ThemeToggle from '@/components/ui/theme-toggle';
import { Search, Filter, Star, Users, Bot, Lock } from 'lucide-react';
import { useLoginRequiredModal } from '@/components/ui/login-required-modal';

interface PublicAgent {
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
}

const categorias = [
  { value: 'todas', label: 'Todas las categorías', icon: '🎯' },
  { value: 'utilidad', label: 'Utilidad', icon: '🔧' },
  { value: 'analisis', label: 'Análisis', icon: '📊' },
  { value: 'creativo', label: 'Creativo', icon: '🎨' },
  { value: 'soporte', label: 'Soporte', icon: '🎧' },
  { value: 'educacion', label: 'Educación', icon: '📚' },
  { value: 'automatizacion', label: 'Automatización', icon: '⚙️' }
];

export default function AgentesPublicosPage() {
  const [agents, setAgents] = useState<PublicAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const { showLoginRequired, LoginRequiredModal } = useLoginRequiredModal();
  const router = useRouter();

  // Verificar autenticación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
      }
    };
    checkAuth();
  }, []);

  const fetchPublicAgents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });
      
      if (selectedCategory !== 'todas') {
        params.append('categoria', selectedCategory);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/agents/public-list?${params}`);
      const data = await response.json();

      if (data.success) {
        setAgents(data.agents || []);
        setPagination(data.pagination || { pages: 1, total: 0 });
      }
    } catch (error) {
      console.error('Error obteniendo agentes públicos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicAgents();
  }, [selectedCategory, searchTerm, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPublicAgents();
  };

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
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/agentes-publicos" className="text-sm font-medium text-[#00FFC3] px-3 py-2 rounded-lg bg-[#00FFC3]/10 border border-[#00FFC3]/20">
                Agentes Públicos
              </Link>
            </nav>
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
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-2xl flex items-center justify-center shadow-lg shadow-[#3B82F6]/30">
              <Users className="w-8 h-8 text-[#0E0E10]" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Agentes Públicos
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
            Descubre y prueba agentes de inteligencia artificial creados por la comunidad. 
            Completamente gratis para todos.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar agentes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-900/40 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]/50"
                />
              </div>
            </form>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-3 border border-gray-200 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-900/40 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]/50"
              >
                {categorias.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {loading ? 'Cargando...' : `${pagination.total} agentes disponibles`}
          </p>
        </div>



        {/* Agents Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-xl mb-4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : agents.length === 0 ? (
          <Card className="bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800/50 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Bot className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                No se encontraron agentes
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                {searchTerm || selectedCategory !== 'todas' 
                  ? 'Intenta con otros términos de búsqueda o filtros.'
                  : 'Aún no hay agentes públicos disponibles. ¡Sé el primero en crear uno!'}
              </p>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-lg hover:shadow-[#3B82F6]/30 text-[#0E0E10] font-semibold transition-all duration-300 hover:scale-105">
                  Crear Mi Primer Agente
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {agents.map((agent) => (
              <div key={agent.agentId} className="group">
                <Card 
                  onClick={() => {
                    router.push(`/agentes-publicos/${agent.agentId}`);
                  }}
                  className="bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700/50 hover:border-[#3B82F6]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#3B82F6]/10 hover:-translate-y-1 cursor-pointer h-full"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Bot className="w-6 h-6 text-[#0E0E10]" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Star className="w-3 h-3" />
                        <span>Público</span>
                      </div>
                    </div>
                    <CardTitle className="text-gray-900 dark:text-white group-hover:text-[#00FFC3] transition-colors line-clamp-2">
                      {agent.agentName}
                    </CardTitle>
                    <CardDescription className="text-gray-400 mb-3 line-clamp-3">
                      {agent.description || 'Sin descripción'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Category and Model */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="bg-gray-200 dark:bg-gray-800/50 px-2 py-1 rounded-full text-gray-600 dark:text-gray-400 text-xs">
                          {categorias.find(c => c.value === agent.categoria)?.icon} {categorias.find(c => c.value === agent.categoria)?.label || agent.categoria || 'General'}
                        </span>
                        {agent.configuracion?.modelo && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 px-2 py-1 rounded">
                            {agent.configuracion.modelo}
                          </span>
                        )}
                      </div>
                      
                      {/* Creator */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700/50">
                        <div className="w-5 h-5 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-medium">
                            {(agent.creator?.displayName || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span>por {agent.creator?.displayName || 'Usuario'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-gray-300 dark:border-gray-600/50"
              >
                Anterior
              </Button>
              <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                Página {page} de {pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="border-gray-300 dark:border-gray-600/50"
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/30 rounded-2xl p-12 border border-gray-200 dark:border-gray-700/50">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              ¿Tienes una idea para un agente?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Crea tu propio agente de IA y compártelo con la comunidad. 
              Es gratis y no necesitas conocimientos técnicos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-lg hover:shadow-[#3B82F6]/30 text-[#0E0E10] font-semibold transition-all duration-300 hover:scale-105">
                  Crear Mi Agente
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="lg" className="border-gray-300 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50">
                  Más Información
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      {/* Modal de Login Requerido */}
      <LoginRequiredModal />
    </div>
  );
} 