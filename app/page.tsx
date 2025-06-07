import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0E0E10] text-white font-['Inter'] overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-gray-800/50 backdrop-blur-sm sticky top-0 z-50 bg-[#0E0E10]/80">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-[#0E0E10]">S</span>
            </div>
            <span className="text-xl font-bold text-white">SamaraCore</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/agentes-publicos" className="group">
              <Button 
                variant="ghost" 
                className="!text-gray-300 hover:!text-white hover:!bg-gray-800/50 !border !border-transparent hover:!border-gray-700/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#3B82F6]/20 !bg-transparent"
              >
                Agentes Públicos
              </Button>
            </Link>
            <Link href="/auth/login" className="group">
              <Button 
                variant="ghost" 
                className="!text-gray-300 hover:!text-white hover:!bg-gray-800/50 !border !border-transparent hover:!border-gray-700/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#3B82F6]/20 !bg-transparent"
              >
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 lg:py-32 px-6 relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/5 via-transparent to-[#00FFC3]/5"></div>
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-[#3B82F6]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#00FFC3]/10 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto text-center relative z-10">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight">
                Tu Inteligencia Artificial,
                <br />
                <span className="bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] bg-clip-text text-transparent">
                  a tu Medida.
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto font-light leading-relaxed">
                Crea agentes inteligentes con lógica modular, memoria y herramientas conectadas — 
                <span className="text-[#00FFC3]">sin escribir una línea de código.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link href="/auth/register" className="group">
                  <Button 
                    size="lg" 
                    className="text-lg px-10 py-4 bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-2xl hover:shadow-[#3B82F6]/30 text-[#0E0E10] font-semibold transition-all duration-300 group-hover:scale-105 border-0 !bg-gradient-to-r !from-[#3B82F6] !to-[#00FFC3] !text-[#0E0E10]"
                  >
                    Empieza Gratis
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-10 py-4 !border-gray-600 !text-gray-300 hover:!text-white hover:!bg-gray-800/50 hover:!border-[#3B82F6]/50 hover:shadow-lg hover:shadow-[#3B82F6]/20 transition-all duration-300 !bg-transparent"
                >
                  Ver Demo
                </Button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="mt-20 max-w-6xl mx-auto">
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 backdrop-blur-sm overflow-hidden shadow-2xl">
                <div className="h-96 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/10 to-[#00FFC3]/10"></div>
                  <div className="text-center z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-[#3B82F6]/30 animate-pulse">
                      <svg className="w-10 h-10 text-[#0E0E10]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-lg">Dashboard de Agentes IA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Agentes inteligentes listos para la acción */}
        <section className="py-20 bg-gray-900/20 border-y border-gray-800/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                Agentes inteligentes <span className="text-[#00FFC3]">listos para la acción</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Automatiza procesos, responde preguntas, analiza datos y conecta tus herramientas favoritas.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {[
                {
                  icon: "🤖",
                  title: "Soporte al Cliente Personalizado",
                  description: "Resuelve tickets y consultas 24/7 con contexto completo de tu empresa y productos."
                },
                {
                  icon: "📊", 
                  title: "Análisis de Bases de Datos en Tiempo Real",
                  description: "Procesa y analiza miles de registros instantáneamente con insights precisos."
                },
                {
                  icon: "💬",
                  title: "Chatbots Conectados a tu Backend", 
                  description: "Integra directamente con tus APIs y bases de datos para respuestas dinámicas."
                },
                {
                  icon: "🔧",
                  title: "Automatización con APIs Externas",
                  description: "Conecta y orquesta múltiples servicios para automatizar workflows complejos."
                }
              ].map((item, index) => (
                <div key={index} className="group p-8 bg-gray-900/30 rounded-2xl border border-gray-700/50 hover:border-[#3B82F6]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#3B82F6]/10 hover:-translate-y-1">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-[#00FFC3] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Construcción modular y flexible */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-6">
                  <span className="text-[#3B82F6]">Tan simple como configurar,</span><br />
                  tan poderoso como programar
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Diseña agentes que usan herramientas, guardan memoria y razonan por pasos.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: "⚙️",
                    title: "Configuración Visual Completa",
                    description: "Configura lógica, memoria y permisos desde una interfaz intuitiva sin tocar código."
                  },
                  {
                    icon: "🔗", 
                    title: "Herramientas Externas Integradas",
                    description: "Usa herramientas como MongoDB, OpenAI, Slack y más con simples configuraciones."
                  },
                  {
                    icon: "📋",
                    title: "Arquitectura JSON Extensible",
                    description: "Basado en JSON para máxima flexibilidad y capacidad de extensión ilimitada."
                  }
                ].map((item, index) => (
                  <div key={index} className="p-8 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 text-center group hover:border-[#3B82F6]/50 transition-all duration-300">
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="text-xl font-semibold mb-4 text-white group-hover:text-[#00FFC3] transition-colors">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Lógica visual, sin límites */}
        <section className="py-20 bg-gray-900/20 border-y border-gray-800/50">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-6">
                  <span className="text-[#00FFC3]">Conecta nodos, define lógica,</span><br />
                  lanza en minutos
                </h2>
                <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  Arrastra herramientas, define flujos, o escribe instrucciones en lenguaje natural — 
                  Samara lo interpreta y lo convierte en lógica funcional.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    color: "blue",
                    icon: "🟦",
                    title: "Construcción Visual",
                    description: "Interfaz drag-and-drop para crear workflows complejos sin código.",
                    accent: "#3B82F6"
                  },
                  {
                    color: "green", 
                    icon: "🟩",
                    title: "Edición Avanzada por JSON",
                    description: "Para desarrolladores: control total sobre la configuración del agente.",
                    accent: "#00FFC3"
                  },
                  {
                    color: "purple",
                    icon: "🟪",
                    title: "Agentes Deliberativos y Multi-paso",
                    description: "Lógica compleja con razonamiento, memoria y toma de decisiones.",
                    accent: "#8B5CF6"
                  }
                ].map((item, index) => (
                  <div key={index} className="p-8 bg-gray-900/40 rounded-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 group">
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="text-xl font-semibold mb-4 text-white group-hover:text-white transition-colors" style={{color: item.accent}}>{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Conectividad total */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-6">
                  Tu agente habla con <span className="text-[#3B82F6]">tu mundo</span>
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Integra tus herramientas, servicios y bases de datos. Samara se adapta a tu stack.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: "APIs y Protocolos",
                    items: ["REST", "Webhooks", "GraphQL"],
                    icon: "🌐"
                  },
                  {
                    title: "Bases de Datos",
                    items: ["MongoDB", "Redis", "PostgreSQL"],
                    icon: "🗄️"
                  },
                  {
                    title: "Servicios Populares",
                    items: ["Zapier", "Slack", "Gmail", "OpenAI"],
                    icon: "🔌"
                  }
                ].map((category, index) => (
                  <div key={index} className="p-8 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 hover:border-[#00FFC3]/50 transition-all duration-300 group">
                    <div className="text-center mb-6">
                      <div className="text-4xl mb-4">{category.icon}</div>
                      <h3 className="text-xl font-semibold text-white group-hover:text-[#00FFC3] transition-colors">{category.title}</h3>
                    </div>
                    <div className="space-y-3">
                      {category.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                          <div className="w-2 h-2 bg-[#00FFC3] rounded-full"></div>
                          <span className="text-gray-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Memoria personalizada por agente */}
        <section className="py-20 bg-gray-900/20 border-y border-gray-800/50">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-6">
                  Cada agente <span className="text-[#00FFC3]">recuerda</span> lo que necesita
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Define si tu agente usa memoria corta, memoria vectorial o ninguna.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: "💭",
                    title: "Memoriza Conversaciones Relevantes",
                    description: "Recuerda el contexto de interacciones pasadas para respuestas más personalizadas."
                  },
                  {
                    icon: "📚", 
                    title: "Indexa Archivos y Documentos",
                    description: "Carga y procesa documentos, PDFs y colecciones para consultas inteligentes."
                  },
                  {
                    icon: "🏪",
                    title: "Almacenamiento Propio o de Terceros",
                    description: "Usa tu infraestructura o servicios en la nube, tú decides dónde se guarda todo."
                  }
                ].map((item, index) => (
                  <div key={index} className="p-8 bg-gray-900/40 rounded-2xl border border-gray-700/50 hover:border-[#3B82F6]/50 transition-all duration-300 group text-center">
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="text-xl font-semibold mb-4 text-white group-hover:text-[#00FFC3] transition-colors">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* UI fácil para todos */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-8">
                <span className="text-[#3B82F6]">No necesitas ser técnico</span><br />
                — pero si lo eres, <span className="text-[#00FFC3]">vas a amar esto</span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 text-left mt-12">
                <div className="p-8 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 hover:border-[#3B82F6]/50 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">🧩</span>
                    <h3 className="text-xl font-semibold text-[#00FFC3]">Usuarios No Técnicos</h3>
                  </div>
                  <p className="text-gray-300 mb-4">Configura todo desde la interfaz web, sin código.</p>
                  <ul className="space-y-3 text-gray-400">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00FFC3] rounded-full"></div>
                      Interfaz visual intuitiva
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00FFC3] rounded-full"></div>
                      Configuración por arrastrar y soltar
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00FFC3] rounded-full"></div>
                      Templates predefinidos listos para usar
                    </li>
                  </ul>
                </div>
                
                <div className="p-8 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 hover:border-[#3B82F6]/50 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">💻</span>
                    <h3 className="text-xl font-semibold text-[#3B82F6]">Developers</h3>
                  </div>
                  <p className="text-gray-300 mb-4">Importa, extiende y automatiza por código.</p>
                  <ul className="space-y-3 text-gray-400">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#3B82F6] rounded-full"></div>
                      APIs personalizadas y webhooks
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#3B82F6] rounded-full"></div>
                      Control total del código fuente
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#3B82F6] rounded-full"></div>
                      Extensiones y plugins ilimitados
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Plantillas prediseñadas */}
        <section className="py-20 bg-gray-900/20 border-y border-gray-800/50">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-6">
                  ¿No sabes por dónde <span className="text-[#00FFC3]">empezar</span>?
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Usa plantillas listas para casos de uso comunes y personalízalas según tus necesidades.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: "🎧",
                    title: "Soporte Técnico Automático",
                    description: "Resuelve tickets técnicos con base de conocimientos integrada."
                  },
                  {
                    icon: "📈", 
                    title: "Análisis de Reportes Financieros",
                    description: "Procesa y analiza datos financieros con insights automáticos."
                  },
                  {
                    icon: "🛒",
                    title: "Agente para Ecommerce",
                    description: "Gestiona inventario, pedidos y atención al cliente."
                  },
                  {
                    icon: "🔧",
                    title: "Integración Google y Slack",
                    description: "Conecta Calendar, Drive, Gmail con notificaciones en Slack."
                  }
                ].map((template, index) => (
                  <div key={index} className="p-6 bg-gray-900/40 rounded-2xl border border-gray-700/50 hover:border-[#3B82F6]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#3B82F6]/10 hover:-translate-y-1 group cursor-pointer">
                    <div className="text-3xl mb-4">{template.icon}</div>
                    <h3 className="text-lg font-semibold mb-3 text-white group-hover:text-[#00FFC3] transition-colors">{template.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{template.description}</p>
                    <div className="mt-4 pt-4 border-t border-gray-700/50">
                      <span className="text-xs text-[#3B82F6] font-medium">Usar plantilla →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard y control total */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-6">
                  <span className="text-[#3B82F6]">Estadísticas, historial</span> y consumo <span className="text-[#00FFC3]">en tiempo real</span>
                </h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: "📋",
                    title: "Logs de Ejecución",
                    description: "Seguimiento detallado de cada acción y decisión de tus agentes."
                  },
                  {
                    icon: "💰", 
                    title: "Tokens y Costos por Herramienta",
                    description: "Control granular del consumo y presupuesto de cada componente."
                  },
                  {
                    icon: "👥",
                    title: "Historial de Usuarios y Errores",
                    description: "Analytics completos de interacciones y debugging avanzado."
                  }
                ].map((feature, index) => (
                  <div key={index} className="p-8 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 hover:border-[#00FFC3]/50 transition-all duration-300 group text-center">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-4 text-white group-hover:text-[#00FFC3] transition-colors">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tecnología Modular */}
        <section className="py-20 bg-gray-900/20 border-y border-gray-800/50">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-16">
                Tecnología <span className="text-[#00FFC3]">Modular</span> y Extensible
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "Arquitectura MCP",
                    description: "Sistema de herramientas modular y escalable",
                    icon: "⚙️"
                  },
                  {
                    title: "Memoria Vectorial", 
                    description: "Contexto inteligente y recuerdos persistentes",
                    icon: "🧠"
                  },
                  {
                    title: "Multi-Modelo",
                    description: "OpenAI, Claude, modelos locales y más",
                    icon: "🔀"
                  },
                  {
                    title: "Analytics Completos",
                    description: "Logs detallados y estadísticas de uso",
                    icon: "📈"
                  }
                ].map((feature, index) => (
                  <div key={index} className="text-center p-6 group">
                    <div className="text-3xl mb-4">{feature.icon}</div>
                    <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-[#3B82F6] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial/Caso de Uso */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <div className="p-12 bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
                <div className="text-6xl mb-6">🧪</div>
                <blockquote className="text-2xl font-light text-gray-200 mb-8 leading-relaxed italic">
                  &ldquo;Agente que analiza 1 año completo de datos de sucursales en segundos — 
                  algo que antes tomaba semanas.&rdquo;
                </blockquote>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-full"></div>
                  <div className="text-left">
                    <p className="font-semibold text-white">Empresa de Retail</p>
                    <p className="text-gray-400 text-sm">Análisis de datos automatizado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Privacidad y Control */}
        <section className="py-20 bg-gray-900/20 border-y border-gray-800/50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-8">
                <span className="text-4xl">🔒</span>
                <h2 className="text-4xl font-bold">
                  Privacidad y <span className="text-[#00FFC3]">Control Total</span>
                </h2>
              </div>
              <p className="text-xl text-gray-300 mb-12 leading-relaxed">
                Cada agente usa tus llaves API, tu MongoDB o tu backend. 
                Tú decides cuánto acceso le das y qué memoria usa.
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 text-left">
                {[
                  {
                    title: "Tus APIs",
                    description: "Usa tus propias claves y mantén el control total",
                    icon: "🔑"
                  },
                  {
                    title: "Tu Infraestructura", 
                    description: "Despliega en tu servidor o usa nuestra nube",
                    icon: "🏗️"
                  },
                  {
                    title: "Tu Memoria",
                    description: "Controla qué datos se almacenan y por cuánto tiempo",
                    icon: "💾"
                  }
                ].map((item, index) => (
                  <div key={index} className="text-center p-6">
                    <div className="text-3xl mb-4">{item.icon}</div>
                    <h3 className="text-lg font-semibold mb-2 text-white">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Public Agents Preview */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Prueba Agentes Públicos
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Descubre agentes creados por la comunidad. Pruébalos sin necesidad de registro.
              </p>
              <Link href="/agentes-publicos">
                <Button size="lg" variant="outline" className="border-[#00FFC3] text-[#00FFC3] hover:bg-[#00FFC3]/10 hover:shadow-lg hover:shadow-[#00FFC3]/30 transition-all duration-300">
                  Ver Todos los Agentes Públicos
                </Button>
              </Link>
            </div>
            
            {/* Sample Public Agents Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-gray-900/40 border border-gray-700/50 rounded-2xl p-6 hover:border-[#3B82F6]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#3B82F6]/10">
                <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-xl flex items-center justify-center mb-4">
                  <span className="text-lg">🤖</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Asistente de Escritura</h3>
                <p className="text-gray-400 mb-4">Ayuda con redacción, corrección y mejora de textos</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#00FFC3]">🔧 Utilidad</span>
                  <span className="text-xs text-gray-500">Público</span>
                </div>
              </div>
              
              <div className="bg-gray-900/40 border border-gray-700/50 rounded-2xl p-6 hover:border-[#3B82F6]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#3B82F6]/10">
                <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-xl flex items-center justify-center mb-4">
                  <span className="text-lg">📊</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Analista de Datos</h3>
                <p className="text-gray-400 mb-4">Interpreta y analiza información compleja</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#00FFC3]">📊 Análisis</span>
                  <span className="text-xs text-gray-500">Público</span>
                </div>
              </div>
              
              <div className="bg-gray-900/40 border border-gray-700/50 rounded-2xl p-6 hover:border-[#3B82F6]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#3B82F6]/10">
                <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-xl flex items-center justify-center mb-4">
                  <span className="text-lg">🎨</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Creativo Digital</h3>
                <p className="text-gray-400 mb-4">Genera ideas creativas y contenido original</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#00FFC3]">🎨 Creativo</span>
                  <span className="text-xs text-gray-500">Público</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/10 via-transparent to-[#00FFC3]/10"></div>
          <div className="container mx-auto text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-5xl font-bold mb-8 leading-tight">
                Crea tu primer agente en 
                <br />
                <span className="bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] bg-clip-text text-transparent">
                  menos de 5 minutos
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                No necesitas servidores, ni saber de IA. Solo imagina qué quieres automatizar y Samara lo hace real.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                <Link href="/auth/register" className="group">
                  <Button 
                    size="lg" 
                    className="text-xl px-12 py-5 bg-gradient-to-r from-[#3B82F6] to-[#00FFC3] hover:shadow-2xl hover:shadow-[#3B82F6]/40 text-[#0E0E10] font-bold transition-all duration-300 group-hover:scale-105"
                  >
                    Empezar Gratis
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-xl px-12 py-5 border-[#3B82F6]/50 text-[#3B82F6] hover:text-white hover:bg-[#3B82F6]/10 hover:border-[#3B82F6] hover:shadow-lg hover:shadow-[#3B82F6]/30 transition-all duration-300"
                >
                  Ver Ejemplo
                </Button>
                <Link href="/contact" className="group">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-xl px-12 py-5 border-[#00FFC3]/50 text-[#00FFC3] hover:text-white hover:bg-[#00FFC3]/10 hover:border-[#00FFC3] hover:shadow-lg hover:shadow-[#00FFC3]/30 transition-all duration-300"
                  >
                    Habla con un Experto
                  </Button>
                </Link>
              </div>
              
              <p className="text-gray-500 text-sm">
                ¿Necesitas integración empresarial? 
                <Link href="/contact" className="text-[#00FFC3] hover:underline ml-1">
                  Habla con nuestro equipo
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-12 bg-gray-900/30">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-[#3B82F6] to-[#00FFC3] rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-[#0E0E10]">S</span>
              </div>
              <span className="text-xl font-bold text-white">SamaraCore</span>
            </div>
            <p className="text-gray-400 text-center md:text-right">
              &copy; 2024 SamaraCore. Construyendo el futuro de la IA personalizada.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 