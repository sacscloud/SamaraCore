import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Rutas de API que requieren autenticación
  const protectedApiRoutes = [
    '/api/agents',
    '/api/users',
    '/api/dashboard'
  ];
  
  // Verificar si es una ruta de API que requiere autenticación
  const isProtectedApiRoute = protectedApiRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedApiRoute) {
    // Para rutas de API, verificar solo si hay token de autorización (verificación básica)
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token de autorización requerido' },
        { status: 401 }
      )
    }
    
    const token = authHeader.replace('Bearer ', '')
    
    if (!token || token.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Token de autorización inválido' },
        { status: 401 }
      )
    }
    
    // El token será verificado completamente en cada endpoint individual
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 