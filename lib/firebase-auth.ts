import { NextRequest, NextResponse } from 'next/server';

// Verificación completa con Firebase Admin (solo para endpoints de API)
export async function verifyFirebaseAuth(request: NextRequest) {
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
    
    if (!token) {
      return { 
        authenticated: false, 
        error: 'Token de autorización inválido',
        response: NextResponse.json(
          { success: false, error: 'Token de autorización inválido' },
          { status: 401 }
        )
      };
    }

    // Verificar que las variables de entorno estén configuradas
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      console.warn('⚠️  Firebase Admin credentials not configured. Using basic token validation for development.');
      
      // Validación básica para desarrollo
      if (token.length < 10) {
        return { 
          authenticated: false, 
          error: 'Token de autorización inválido',
          response: NextResponse.json(
            { success: false, error: 'Token de autorización inválido' },
            { status: 401 }
          )
        };
      }
      
      return { 
        authenticated: true, 
        userId: 'dev-user-id', 
        user: null 
      };
    }

    try {
      // Verificación completa con Firebase Admin
      const { adminAuth } = await import('@/lib/firebase-admin');
      const decodedToken = await adminAuth.verifyIdToken(token);
      
      return { 
        authenticated: true, 
        userId: decodedToken.uid,
        user: decodedToken 
      };
    } catch (firebaseError: any) {
      console.error('Error verificando token con Firebase Admin:', firebaseError);
      
      // Si hay error con Firebase Admin, verificar si es un error de configuración
      if (firebaseError.code === 'auth/invalid-argument' || 
          firebaseError.message?.includes('credential')) {
        console.warn('⚠️  Firebase Admin configuration error. Check your environment variables.');
        
        // Fallback a validación básica
        if (token.length >= 10) {
          return { 
            authenticated: true, 
            userId: 'fallback-user-id', 
            user: null 
          };
        }
      }
      
      return { 
        authenticated: false, 
        error: 'Token de autorización inválido',
        response: NextResponse.json(
          { success: false, error: 'Token de autorización inválido' },
          { status: 401 }
        )
      };
    }
    
  } catch (error) {
    console.error('Error general en verificación de Firebase auth:', error);
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