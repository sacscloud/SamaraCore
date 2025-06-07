const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'samaracore';

async function fixUserData(firebaseUserId) {
  if (!firebaseUserId) {
    console.log('❌ Por favor proporciona tu Firebase User ID');
    console.log('📋 Uso: node scripts/fix-user-data.js TU_USER_ID');
    return;
  }

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Conectado a MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Actualizar agentes
    const agentsResult = await db.collection('agents').updateMany(
      { agentId: 'agent_sn_wur019ci' },
      { $set: { user_id: firebaseUserId } }
    );
    
    console.log(`✅ Agentes actualizados: ${agentsResult.modifiedCount}`);
    
    // Actualizar conversaciones
    const conversationsResult = await db.collection('conversations').updateMany(
      { agentId: 'agent_sn_wur019ci' },
      { $set: { userId: firebaseUserId } }
    );
    
    console.log(`✅ Conversaciones actualizadas: ${conversationsResult.modifiedCount}`);
    
    console.log('\n🎉 Datos actualizados exitosamente!');
    console.log(`🔗 Ahora ve a: http://localhost:3000/chat?agentId=agent_sn_wur019ci`);
    
  } catch (error) {
    console.error('Error actualizando datos:', error);
  } finally {
    await client.close();
  }
}

// Ejecutar con user ID del argumento
const userId = process.argv[2];
fixUserData(userId);

module.exports = { fixUserData }; 