import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { verifyFirebaseAuth } from '@/lib/firebase-auth';

// GET - Listar agentes públicos (PÚBLICO - sin autenticación)
export async function GET(request: NextRequest) {

  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const categoria = searchParams.get('categoria');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db('samaracore');
    
    // Si se solicita un agente específico
    if (agentId) {
      const agent = await db.collection('agents').findOne({ 
        agentId,
        isPublic: true 
      });
      
      if (!agent) {
        return NextResponse.json({
          success: false,
          error: 'Agente no encontrado o no es público'
        }, { status: 404 });
      }

      // Usar información del creador ya guardada en el agente, o buscar en users si no existe
      let creatorInfo = null;
      
      if (agent.creator) {
        // Usar información del creador ya guardada
        creatorInfo = {
          email: agent.creator.email,
          displayName: agent.creator.name || agent.creator.email
        };
      } else {
        // Fallback: buscar en colección users para agentes antiguos
        try {
          const user = await db.collection('users').findOne({ uid: agent.user_id });
          if (user) {
            creatorInfo = {
              email: user.email,
              displayName: user.displayName || user.email
            };
          }
        } catch (error) {
          console.error('Error obteniendo creador desde users:', error);
        }
      }

      const agentWithCreator = {
        ...agent,
        creator: creatorInfo
      };

      return NextResponse.json({
        success: true,
        agent: agentWithCreator
      });
    }
    
    // Construir query para solo agentes públicos
    let query: any = {
      isPublic: true
    };
    
    // Filtros adicionales
    if (categoria && categoria !== 'todas') {
      query.categoria = categoria;
    }
    
    if (search) {
      query.$or = [
        { agentName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Obtener agentes con paginación
    const agents = await db.collection('agents')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Obtener total para paginación
    const total = await db.collection('agents').countDocuments(query);

    // Usar información del creador ya guardada en cada agente, o buscar en users si no existe
    const agentsWithCreator = await Promise.all(
      agents.map(async (agent) => {
        let creatorInfo = null;
        
        if (agent.creator) {
          // Usar información del creador ya guardada
          creatorInfo = {
            email: agent.creator.email,
            displayName: agent.creator.name || agent.creator.email
          };
        } else {
          // Fallback: buscar en colección users para agentes antiguos
          try {
            const user = await db.collection('users').findOne({ uid: agent.user_id });
            if (user) {
              creatorInfo = {
                email: user.email,
                displayName: user.displayName || user.email
              };
            }
          } catch (error) {
            console.error('Error obteniendo creador desde users:', error);
          }
        }

        return {
          ...agent,
          creator: creatorInfo
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      agents: agentsWithCreator,
      count: agentsWithCreator.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo agentes públicos:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
} 