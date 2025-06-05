import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { requiresAuth } from '@/lib/auth-middleware'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Rutas del dashboard que requieren autenticación
  const protectedDashboardRoutes = ['/dashboard']
  
  // Verificar si la ruta actual del dashboard está protegida
  const isDashboardProtectedRoute = protectedDashboardRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Verificar si es una ruta de API que requiere autenticación
  const isProtectedApiRoute = requiresAuth(pathname)

  if (isDashboardProtectedRoute) {
    // Para rutas del dashboard, permitir el acceso y dejar que el cliente maneje la redirección
    // En una implementación real, verificarías el token de autenticación aquí
    return NextResponse.next()
  }

  if (isProtectedApiRoute) {
    // Para rutas de API, verificar si hay token de autorización
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token de autorización requerido' },
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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 