import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { nanoid } from 'nanoid';
import { verifyFirebaseAuth } from '@/lib/firebase-auth';

// GET - Listar conversaciones del usuario para un agente específico
export async function GET(request: NextRequest) {
  const authResult = await verifyFirebaseAuth(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const folder = searchParams.get('folder');
    const search = searchParams.get('search');

    if (!agentId) {
      return NextResponse.json({ 
        success: false, 
        error: 'agentId requerido' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('samaracore');

    // Construir query
    const query: any = {
      userId: authResult.userId,
      agentId: agentId
    };

    if (folder) {
      query.folder = folder;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'messages.content': { $regex: search, $options: 'i' } }
      ];
    }

    const conversations = await db.collection('conversations')
      .find(query)
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      conversations: conversations.map(conv => ({
        ...conv,
        _id: conv._id.toString()
      }))
    });

  } catch (error) {
    console.error('Error obteniendo conversaciones:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// POST - Crear nueva conversación
export async function POST(request: NextRequest) {
  const authResult = await verifyFirebaseAuth(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const { agentId, title, folder } = body;

    if (!agentId) {
      return NextResponse.json({ 
        success: false, 
        error: 'agentId requerido' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('samaracore');

    const conversationId = `conv_${nanoid(12)}`;
    const now = new Date();

    const newConversation = {
      conversationId,
      userId: authResult.userId,
      agentId,
      title: title || 'Nueva conversación',
      messages: [],
      folder: folder || null,
      shared: false,
      shareId: null,
      createdAt: now,
      updatedAt: now
    };

    const result = await db.collection('conversations').insertOne(newConversation);

    return NextResponse.json({
      success: true,
      conversation: {
        ...newConversation,
        _id: result.insertedId.toString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creando conversación:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// PUT - Actualizar conversación (agregar mensaje, cambiar título, etc.)
export async function PUT(request: NextRequest) {
  const authResult = await verifyFirebaseAuth(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const { conversationId, action, data } = body;

    if (!conversationId || !action) {
      return NextResponse.json({ 
        success: false, 
        error: 'conversationId y action requeridos' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('samaracore');

    const updateFields: any = {
      updatedAt: new Date()
    };

    switch (action) {
      case 'add_message':
        if (!data.message) {
          return NextResponse.json({ 
            success: false, 
            error: 'mensaje requerido' 
          }, { status: 400 });
        }
        
        const message = {
          id: `msg_${nanoid(12)}`,
          role: data.message.role,
          content: data.message.content,
          timestamp: new Date()
        };

                 await db.collection('conversations').updateOne(
           { conversationId, userId: authResult.userId },
           { 
             $push: { messages: message } as any,
             $set: updateFields
           }
         );
        break;

      case 'update_title':
        updateFields.title = data.title;
        await db.collection('conversations').updateOne(
          { conversationId, userId: authResult.userId },
          { $set: updateFields }
        );
        break;

      case 'move_to_folder':
        updateFields.folder = data.folder;
        await db.collection('conversations').updateOne(
          { conversationId, userId: authResult.userId },
          { $set: updateFields }
        );
        break;

      case 'toggle_share':
        updateFields.shared = data.shared;
        if (data.shared && !data.shareId) {
          updateFields.shareId = `share_${nanoid(16)}`;
        }
        await db.collection('conversations').updateOne(
          { conversationId, userId: authResult.userId },
          { $set: updateFields }
        );
        break;

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Acción no válida' 
        }, { status: 400 });
    }

    // Obtener conversación actualizada
    const updatedConversation = await db.collection('conversations')
      .findOne({ conversationId, userId: authResult.userId });

    return NextResponse.json({
      success: true,
      conversation: {
        ...updatedConversation,
        _id: updatedConversation?._id.toString()
      }
    });

  } catch (error) {
    console.error('Error actualizando conversación:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// DELETE - Eliminar conversación
export async function DELETE(request: NextRequest) {
  const authResult = await verifyFirebaseAuth(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ 
        success: false, 
        error: 'conversationId requerido' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('samaracore');

    const result = await db.collection('conversations').deleteOne({ 
      conversationId, 
      userId: authResult.userId 
    });

    if (result.deletedCount === 1) {
      return NextResponse.json({
        success: true,
        message: 'Conversación eliminada exitosamente'
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Conversación no encontrada' 
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Error eliminando conversación:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
} 