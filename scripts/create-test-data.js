const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'samaracore';

// Datos de prueba
const testAgent = {
  agentId: 'agent_sn_wur019ci',
  agentName: 'Asistente de Prueba',
  description: 'Un asistente virtual para ayudarte con tareas generales',
  user_id: 'test_user_id', // Cambiar por tu ID real de Firebase
  status: 'active',
  prompt: {
    base: 'Eres un asistente virtual amigable y útil.',
    objectives: [
      'Ayudar a los usuarios con sus consultas',
      'Proporcionar información precisa y útil',
      'Mantener una conversación natural y fluida'
    ],
    rules: [
      'Sé siempre respetuoso y amable',
      'Proporciona respuestas claras y concisas',
      'Si no sabes algo, admítelo honestamente'
    ],
    examples: 'Usuario: Hola\nAsistente: ¡Hola! ¿En qué puedo ayudarte hoy?',
    responseFormat: 'Responde de manera conversacional y natural'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

async function createTestData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Conectado a MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Crear agente de prueba
    const agentsCollection = db.collection('agents');
    const existingAgent = await agentsCollection.findOne({ agentId: testAgent.agentId });
    
    if (!existingAgent) {
      await agentsCollection.insertOne(testAgent);
      console.log('✅ Agente de prueba creado:', testAgent.agentName);
    } else {
      console.log('ℹ️ El agente de prueba ya existe');
    }
    
    // Crear conversación de prueba
    const conversationsCollection = db.collection('conversations');
    const testConversation = {
      conversationId: `conv_test_${Date.now()}`,
      userId: testAgent.user_id,
      agentId: testAgent.agentId,
      title: 'Conversación de prueba',
      messages: [
        {
          id: `msg_${Date.now()}_1`,
          role: 'user',
          content: 'Hola, ¿cómo estás?',
          timestamp: new Date()
        },
        {
          id: `msg_${Date.now()}_2`,
          role: 'assistant',
          content: '¡Hola! Estoy muy bien, gracias por preguntar. ¿En qué puedo ayudarte hoy?',
          timestamp: new Date()
        }
      ],
      folder: null,
      shared: false,
      shareId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await conversationsCollection.insertOne(testConversation);
    console.log('✅ Conversación de prueba creada');
    
    console.log('\n🎉 Datos de prueba creados exitosamente!');
    console.log('\n📝 Para probar:');
    console.log(`   1. Ve a: http://localhost:3000/chat?agentId=${testAgent.agentId}`);
    console.log(`   2. O ve al dashboard y busca: "${testAgent.agentName}"`);
    
  } catch (error) {
    console.error('Error creando datos de prueba:', error);
  } finally {
    await client.close();
  }
}

// Ejecutar
if (require.main === module) {
  createTestData();
}

module.exports = { createTestData }; 