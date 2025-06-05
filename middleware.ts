import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Por ahora, solo redirigir rutas protegidas al login si no hay autenticación
  // En una implementación completa, verificarías el token de Firebase aquí
  
  const { pathname } = request.nextUrl
  
  // Rutas que requieren autenticación
  const protectedRoutes = ['/dashboard']
  
  // Verificar si la ruta actual está protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  if (isProtectedRoute) {
    // En una implementación real, verificarías el token de autenticación aquí
    // Por ahora, permitimos el acceso y dejamos que el cliente maneje la redirección
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 