import { NextRequest, NextResponse } from 'next/server';

// Verificación básica para middleware (Edge Runtime compatible)
export async function verifyAuthBasic(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { 
        authenticated: false, 
        error: 'Token de autorización requerido',
        response: NextResponse.json(
          { success: false, error: 'Token de autorización requerido' },
          { status: 401 }
        )
      };
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token || token.length < 10) {
      return { 
        authenticated: false, 
        error: 'Token de autorización inválido',
        response: NextResponse.json(
          { success: false, error: 'Token de autorización inválido' },
          { status: 401 }
        )
      };
    }

    // Solo verificación básica en middleware
    return { 
      authenticated: true, 
      userId: null, // Se completará en el endpoint
      user: null 
    };
    
  } catch (error) {
    console.error('Error en verificación básica de auth:', error);
    return { 
      authenticated: false, 
      error: 'Error al verificar token',
      response: NextResponse.json(
        { success: false, error: 'Error al verificar token' },
        { status: 401 }
      )
    };
  }
}

// Función auxiliar para verificar si una ruta requiere autenticación
export function requiresAuth(pathname: string): boolean {
  const protectedApiRoutes = [
    '/api/agents',
    '/api/users',
    '/api/dashboard'
  ];
  
  return protectedApiRoutes.some(route => pathname.startsWith(route));
}