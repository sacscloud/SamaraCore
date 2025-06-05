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
      console.error('❌ Firebase Admin credentials not configured. Authentication cannot proceed without proper Firebase setup.');
      
      return { 
        authenticated: false, 
        error: 'Configuración de autenticación incompleta',
        response: NextResponse.json(
          { success: false, error: 'Configuración de autenticación incompleta' },
          { status: 500 }
        )
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
      
      // Manejar errores específicos de Firebase
      let errorMessage = 'Token de autorización inválido';
      
      if (firebaseError.code === 'auth/id-token-expired') {
        errorMessage = 'Token de autorización expirado';
      } else if (firebaseError.code === 'auth/invalid-argument') {
        errorMessage = 'Token de autorización malformado';
      } else if (firebaseError.code === 'auth/id-token-revoked') {
        errorMessage = 'Token de autorización revocado';
      }
      
      return { 
        authenticated: false, 
        error: errorMessage,
        response: NextResponse.json(
          { success: false, error: errorMessage },
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
        { status: 500 }
      )
    };
  }
} 