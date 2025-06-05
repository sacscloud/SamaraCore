import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md"></div>
            <span className="text-xl font-bold">SamaraCore</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Crea y Configura Tus 
                <span className="text-primary"> Agentes IA</span> 
                <br />Personalizados
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Diseña agentes de inteligencia artificial únicos para tu negocio. 
                Configura herramientas, define comportamientos y despliega soluciones 
                inteligentes en minutos.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/auth/login">
                  <Button size="lg" className="text-lg px-8 py-3">
                    Comienza Ahora
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  Ver Demo
                </Button>
              </div>
            </div>

            {/* Hero Image Placeholder */}
            <div className="mt-16 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg h-96 flex items-center justify-center border border-border">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground">Vista previa del dashboard de agentes</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Todo lo que necesitas para crear agentes IA
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Configuración Visual</h3>
                <p className="text-muted-foreground">
                  Interfaz intuitiva para configurar comportamientos, herramientas y reglas de tus agentes.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Herramientas Integradas</h3>
                <p className="text-muted-foreground">
                  Conecta múltiples herramientas y servicios para potenciar las capacidades de tus agentes.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Despliegue Rápido</h3>
                <p className="text-muted-foreground">
                  Publica tus agentes en producción con un solo click y comienza a usar la IA inmediatamente.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 SamaraCore. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
} 