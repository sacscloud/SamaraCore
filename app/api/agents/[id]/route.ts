import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { AgentSchema } from '@/lib/schemas';
import { verifyFirebaseAuth } from '@/lib/firebase-auth';

// Función auxiliar para validar temperatura
function validateTemperature(temperatura: any): { isValid: boolean; value: number; error?: string } {
  if (temperatura === null || temperatura === undefined) {
    return { isValid: true, value: 0.7 }; // valor por defecto
  }
  
  const temp = Number(temperatura);
  
  if (isNaN(temp)) {
    return { isValid: false, value: 0.7, error: 'La temperatura debe ser un número' };
  }
  
  if (temp < 0 || temp > 1) {
    return { isValid: false, value: 0.7, error: 'La temperatura debe estar entre 0 y 1' };
  }
  
  return { isValid: true, value: temp };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verificar autenticación
  const authResult = await verifyFirebaseAuth(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const client = await clientPromise;
    const db = client.db('samaracore');
    
    const agent = await db.collection('agents').findOne({ 
      agentId: params.id,
      user_id: authResult.userId
    });
    
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agente no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      agent: { ...agent, _id: agent._id.toString() }
    });
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener agente' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verificar autenticación
  const authResult = await verifyFirebaseAuth(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    
    // Validar datos con Zod
    const validatedAgent = AgentSchema.parse(body);
    
    const client = await clientPromise;
    const db = client.db('samaracore');
    
    // Actualizar agente con información del usuario que modifica
    const result = await db.collection('agents').updateOne(
      { agentId: params.id },
      { 
        $set: {
          ...validatedAgent,
          updatedBy: authResult.userId, // Agregar quién modificó el agente
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Agente no encontrado' },
        { status: 404 }
      );
    }
    
    const updatedAgent = await db.collection('agents').findOne({ agentId: params.id });
    
    return NextResponse.json({ 
      success: true, 
      agent: { ...updatedAgent, _id: updatedAgent?._id.toString() }
    });
  } catch (error: any) {
    console.error('Error updating agent:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Datos de agente inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al actualizar agente' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verificar autenticación
  const authResult = await verifyFirebaseAuth(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    
    // Lista de campos permitidos para actualización parcial
    const allowedFields = [
      'agentName',
      'description',
      'categoria',
      'configuracion',
      'prompt',
      'status',
      'subAgents',
      'orchestration'
    ];
    
    // Filtrar solo los campos permitidos del body
    const allowedUpdates: any = {};
    for (const field of allowedFields) {
      if (body.hasOwnProperty(field)) {
        allowedUpdates[field] = body[field];
      }
    }
    
    // Verificar que hay campos para actualizar
    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se enviaron campos válidos para actualizar' },
        { status: 400 }
      );
    }
    
    // Validar temperatura si se está actualizando configuracion
    if (allowedUpdates.configuracion && allowedUpdates.configuracion.temperatura !== undefined) {
      const tempValidation = validateTemperature(allowedUpdates.configuracion.temperatura);
      if (!tempValidation.isValid) {
        return NextResponse.json(
          { success: false, error: tempValidation.error },
          { status: 400 }
        );
      }
      // Usar el valor validado
      allowedUpdates.configuracion.temperatura = tempValidation.value;
    }
    
    const client = await clientPromise;
    const db = client.db('samaracore');
    
    // Actualización parcial - solo los campos permitidos
    const result = await db.collection('agents').updateOne(
      { 
        agentId: params.id,
        user_id: authResult.userId // Solo el propietario puede actualizar
      },
      { 
        $set: {
          ...allowedUpdates,
          updatedBy: authResult.userId,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Agente no encontrado o sin permisos' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Agente actualizado correctamente'
    });
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar agente' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verificar autenticación
  const authResult = await verifyFirebaseAuth(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const client = await clientPromise;
    const db = client.db('samaracore');
    
    const result = await db.collection('agents').deleteOne({ agentId: params.id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Agente no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Agente eliminado correctamente'
    });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar agente' },
      { status: 500 }
    );
  }
} 