import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const { shareId } = params;

    if (!shareId) {
      return NextResponse.json(
        { error: 'ShareId es requerido' },
        { status: 400 }
      );
    }

    // Conectar a MongoDB
    const client = await clientPromise;
    const db = client.db('samaracore');
    
    // Buscar la conversación compartida
    const conversation = await db.collection('conversations').findOne({
      shareId: shareId,
      isShared: true // Solo conversaciones que están marcadas como compartidas
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversación compartida no encontrada' },
        { status: 404 }
      );
    }

    // Devolver la conversación sin datos sensibles del usuario
    const publicConversation = {
      _id: conversation._id.toString(),
      title: conversation.title,
      messages: conversation.messages || [],
      agentId: conversation.agentId,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      shareId: conversation.shareId
    };

    return NextResponse.json({
      success: true,
      conversation: publicConversation
    });

  } catch (error) {
    console.error('Error al obtener conversación compartida:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 