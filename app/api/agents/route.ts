import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { nanoid } from 'nanoid';
import { verifyFirebaseAuth } from '@/lib/firebase-auth';

// GET - Listar agentes del usuario
export async function GET(request: NextRequest) {
  // Verificar autenticación
  const authResult = await verifyFirebaseAuth(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const client = await clientPromise;
    const db = client.db('samaracore');
    const agents = await db.collection('agents')
      .find({ user_id: authResult.userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      agents: agents,
      count: agents.length
    });

  } catch (error) {
    console.error('Error obteniendo agentes:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// POST - Crear nuevo agente
export async function POST(request: NextRequest) {
  // Verificar autenticación
  const authResult = await verifyFirebaseAuth(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const { 
      agentName, 
      description, 
      prompt = {}
    } = body;

    // Validaciones
    if (!agentName) {
      return NextResponse.json({ 
        success: false, 
        error: 'agentName es requerido' 
      }, { status: 400 });
    }

    if (agentName.length < 3 || agentName.length > 50) {
      return NextResponse.json({ 
        success: false, 
        error: 'El nombre del agente debe tener entre 3 y 50 caracteres' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('samaracore');
    
    // Verificar si ya existe un agente con ese nombre para el usuario
    const existingAgent = await db.collection('agents')
      .findOne({ agentName, user_id: authResult.userId });
    
    if (existingAgent) {
      return NextResponse.json({ 
        success: false, 
        error: 'Ya tienes un agente con ese nombre' 
      }, { status: 409 });
    }

    // Crear el agente
    const agentId = `agent_${nanoid(12)}`;
    const now = new Date();

    const newAgent = {
      agentId,
      agentName: agentName.trim(),
      description: description?.trim() || '',
      user_id: authResult.userId,
      status: 'active',
      prompt: {
        base: prompt.base || 'Eres un asistente útil y profesional.',
        objectives: prompt.objectives || [],
        rules: prompt.rules || [],
        examples: prompt.examples || '',
        responseFormat: prompt.responseFormat || ''
      },
      // Configuraciones futuras (para próximas fases)
      tools: [],
      subAgents: [],
      orchestration: {
        enabled: false,
        maxDepth: 3
      },
      createdAt: now,
      updatedAt: now
    };

    const result = await db.collection('agents').insertOne(newAgent);

    if (result.insertedId) {
      return NextResponse.json({
        success: true,
        agent: {
          ...newAgent,
          _id: result.insertedId
        },
        message: 'Agente creado exitosamente'
      }, { status: 201 });
    } else {
      throw new Error('No se pudo insertar el agente');
    }

  } catch (error) {
    console.error('Error creando agente:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// PUT - Actualizar agente
export async function PUT(request: NextRequest) {
  // Verificar autenticación
  const authResult = await verifyFirebaseAuth(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const { 
      agentId,
      agentName, 
      description, 
      prompt,
      status
    } = body;

    // Validaciones
    if (!agentId) {
      return NextResponse.json({ 
        success: false, 
        error: 'agentId es requerido' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('samaracore');
    
    // Verificar que el agente existe y pertenece al usuario
    const existingAgent = await db.collection('agents')
      .findOne({ agentId, user_id: authResult.userId });
    
    if (!existingAgent) {
      return NextResponse.json({ 
        success: false, 
        error: 'Agente no encontrado' 
      }, { status: 404 });
    }

    // Preparar campos para actualizar
    const updateFields: any = {
      updatedAt: new Date()
    };

    if (agentName !== undefined) {
      if (agentName.length < 3 || agentName.length > 50) {
        return NextResponse.json({ 
          success: false, 
          error: 'El nombre del agente debe tener entre 3 y 50 caracteres' 
        }, { status: 400 });
      }
      updateFields.agentName = agentName.trim();
    }

    if (description !== undefined) {
      updateFields.description = description.trim();
    }

    if (prompt !== undefined) {
      updateFields.prompt = {
        base: prompt.base || existingAgent.prompt?.base || 'Eres un asistente útil.',
        objectives: prompt.objectives || existingAgent.prompt?.objectives || [],
        rules: prompt.rules || existingAgent.prompt?.rules || [],
        examples: prompt.examples || existingAgent.prompt?.examples || '',
        responseFormat: prompt.responseFormat || existingAgent.prompt?.responseFormat || ''
      };
    }

    if (status !== undefined && ['active', 'inactive'].includes(status)) {
      updateFields.status = status;
    }

    // Actualizar agente
    const result = await db.collection('agents').updateOne(
      { agentId, user_id: authResult.userId },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Agente no encontrado' 
      }, { status: 404 });
    }

    // Obtener agente actualizado
    const updatedAgent = await db.collection('agents')
      .findOne({ agentId, user_id: authResult.userId });

    return NextResponse.json({
      success: true,
      agent: updatedAgent,
      message: 'Agente actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando agente:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// DELETE - Eliminar agente
export async function DELETE(request: NextRequest) {
  // Verificar autenticación
  const authResult = await verifyFirebaseAuth(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    
    if (!agentId) {
      return NextResponse.json({ 
        success: false, 
        error: 'agentId es requerido' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('samaracore');
    
    // Verificar que el agente existe y pertenece al usuario
    const existingAgent = await db.collection('agents')
      .findOne({ agentId, user_id: authResult.userId });
    
    if (!existingAgent) {
      return NextResponse.json({ 
        success: false, 
        error: 'Agente no encontrado' 
      }, { status: 404 });
    }

    // Eliminar agente
    const result = await db.collection('agents').deleteOne({ 
      agentId, 
      user_id: authResult.userId 
    });

    if (result.deletedCount === 1) {
      return NextResponse.json({
        success: true,
        message: 'Agente eliminado exitosamente'
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'No se pudo eliminar el agente' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error eliminando agente:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
} 