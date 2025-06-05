import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { AgentSchema } from '@/lib/schemas';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db('samaracore');
    
    const agent = await db.collection('agents').findOne({ agentId: params.id });
    
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
  try {
    const body = await request.json();
    
    // Validar datos con Zod
    const validatedAgent = AgentSchema.parse(body);
    
    const client = await clientPromise;
    const db = client.db('samaracore');
    
    // Actualizar agente
    const result = await db.collection('agents').updateOne(
      { agentId: params.id },
      { 
        $set: {
          ...validatedAgent,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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