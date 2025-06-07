import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Iniciando test de MongoDB desde API...');
    
    const client = await clientPromise;
    console.log('✅ Cliente MongoDB conectado');
    
    // Test de ping
    const pingResult = await client.db().admin().ping();
    console.log('✅ Ping exitoso:', pingResult);
    
    // Test en base de datos samaracore
    const db = client.db('samaracore');
    
    // Listar colecciones
    const collections = await db.listCollections().toArray();
    console.log('📚 Colecciones encontradas:', collections.map(c => c.name));
    
    // Test de operación básica
    const testCollection = db.collection('test');
    const testDoc = {
      test: true,
      timestamp: new Date(),
      message: 'Test desde API endpoint',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };
    
    // Insertar documento de prueba
    const insertResult = await testCollection.insertOne(testDoc);
    console.log('✅ Documento insertado:', insertResult.insertedId);
    
    // Leer documento
    const readDoc = await testCollection.findOne({ _id: insertResult.insertedId });
    
    // Eliminar documento de prueba
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('🗑️  Documento de prueba eliminado');
    
    // Contar agentes si existen
    let agentsCount = 0;
    try {
      agentsCount = await db.collection('agents').countDocuments();
    } catch (err) {
      console.log('ℹ️  Colección agents no existe aún');
    }
    
    // Obtener agentes que no tienen responseFormat
    const agentsWithoutResponseFormat = await db.collection('agents')
      .find({ 'prompt.responseFormat': { $exists: false } })
      .toArray();
    
    console.log(`Encontrados ${agentsWithoutResponseFormat.length} agentes sin responseFormat`);
    
    // Actualizar agentes para agregar responseFormat
    if (agentsWithoutResponseFormat.length > 0) {
      const updateResult = await db.collection('agents').updateMany(
        { 'prompt.responseFormat': { $exists: false } },
        { $set: { 'prompt.responseFormat': '' } }
      );
      
      console.log(`Actualizados ${updateResult.modifiedCount} agentes`);
    }
    
    // Verificar algunos agentes
    const sampleAgents = await db.collection('agents')
      .find({})
      .limit(3)
      .toArray();
    
    const result = {
      success: true,
      message: 'MongoDB Atlas funciona correctamente',
      details: {
        ping: pingResult,
        collections: collections.map(c => c.name),
        agentsCount,
        testDocument: {
          inserted: !!insertResult.insertedId,
          read: !!readDoc,
          deleted: true
        },
        agentsWithoutResponseFormat: agentsWithoutResponseFormat.length,
        sampleAgents: sampleAgents.map(agent => ({
          agentId: agent.agentId,
          agentName: agent.agentName,
          prompt: agent.prompt
        })),
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('🎉 Test de MongoDB completado exitosamente');
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('❌ Error en test de MongoDB:', error);
    
    let errorDetails = {
      type: error.constructor.name,
      message: error.message,
      code: error.code,
      codeName: error.codeName
    };
    
    // Sugerencias específicas
    let suggestions = [];
    
    if (error.message?.includes('authentication failed')) {
      suggestions.push('Verificar usuario y contraseña en MongoDB Atlas');
      suggestions.push('Asegurarse de que el usuario existe en Database Access');
      suggestions.push('Verificar que no hay caracteres especiales sin encodear');
    }
    
    if (error.message?.includes('ENOTFOUND')) {
      suggestions.push('Verificar la URL del cluster');
      suggestions.push('Revisar conexión a internet');
    }
    
    if (error.message?.includes('IP not in whitelist')) {
      suggestions.push('Agregar IP actual a Network Access en MongoDB Atlas');
      suggestions.push('Para desarrollo: usar 0.0.0.0/0 en Network Access');
    }
    
    const result = {
      success: false,
      error: 'Error de conexión a MongoDB Atlas',
      details: errorDetails,
      suggestions,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(result, { status: 500 });
  }
} 