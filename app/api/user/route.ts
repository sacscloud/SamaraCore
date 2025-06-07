import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseAuth } from '@/lib/firebase-auth';
import clientPromise from '@/lib/mongodb';

// GET - Obtener información del usuario autenticado
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await verifyFirebaseAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({
        success: false,
        error: 'No autenticado'
      }, { status: 401 });
    }

    // Obtener información del usuario de la base de datos
    const client = await clientPromise;
    const db = client.db('samaracore');
    
    const user = await db.collection('users').findOne({ 
      uid: authResult.userId 
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado'
      }, { status: 404 });
    }

    // Devolver información básica del usuario
    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email,
        photoURL: user.photoURL || null,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Error verificando usuario:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
} 