import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { AgentSchema } from '@/lib/schemas';
import { verifyAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db('samaracore');
    
    // TODO: Una vez implementada la autenticación completa, filtrar por userId
    // const agents = await db.collection('agents').find({ userId: authResult.userId }).toArray();
    const agents = await db.collection('agents').find({}).toArray();
    
    return NextResponse.json({ 
      success: true, 
      agents: agents.map(agent => ({ ...agent, _id: agent._id.toString() }))
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener agentes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validar datos con Zod
    const validatedAgent = AgentSchema.parse(body);
    
    const client = await clientPromise;
    const db = client.db('samaracore');
    
    // Verificar si ya existe un agente con el mismo ID
    const existingAgent = await db.collection('agents').findOne({ 
      agentId: validatedAgent.agentId 
    });
    
    if (existingAgent) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un agente con ese ID' },
        { status: 400 }
      );
    }
    
    // Crear nuevo agente
    const result = await db.collection('agents').insertOne({
      ...validatedAgent,
      createdAt: new Date(),
      updatedAt: new Date()
      // TODO: Agregar userId: authResult.userId cuando la autenticación esté implementada
    });
    
    const newAgent = await db.collection('agents').findOne({ _id: result.insertedId });
    
    return NextResponse.json({ 
      success: true, 
      agent: { ...newAgent, _id: newAgent?._id.toString() }
    });
  } catch (error: any) {
    console.error('Error creating agent:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Datos de agente inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al crear agente' },
      { status: 500 }
    );
  }
} 