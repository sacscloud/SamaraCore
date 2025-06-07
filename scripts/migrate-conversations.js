const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'samaracore';

async function migrateConversations() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Conectado a MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection('conversations');
    
    // Obtener todas las conversaciones
    const conversations = await collection.find({}).toArray();
    console.log(`Encontradas ${conversations.length} conversaciones`);
    
    let migratedCount = 0;
    
    for (const conversation of conversations) {
      const updates = {};
      let needsUpdate = false;
      
      // Agregar campos faltantes
      if (!conversation.hasOwnProperty('folder')) {
        updates.folder = null;
        needsUpdate = true;
      }
      
      if (!conversation.hasOwnProperty('shared')) {
        updates.shared = false;
        needsUpdate = true;
      }
      
      if (!conversation.hasOwnProperty('shareId')) {
        updates.shareId = null;
        needsUpdate = true;
      }
      
      // Asegurar que los mensajes tengan timestamp
      if (conversation.messages && Array.isArray(conversation.messages)) {
        const updatedMessages = conversation.messages.map(msg => {
          if (!msg.timestamp) {
            return {
              ...msg,
              timestamp: conversation.createdAt || new Date()
            };
          }
          return msg;
        });
        
        if (JSON.stringify(updatedMessages) !== JSON.stringify(conversation.messages)) {
          updates.messages = updatedMessages;
          needsUpdate = true;
        }
      }
      
      // Aplicar actualizaciones si es necesario
      if (needsUpdate) {
        await collection.updateOne(
          { _id: conversation._id },
          { $set: updates }
        );
        migratedCount++;
        console.log(`Migrada conversación: ${conversation.title || conversation._id}`);
      }
    }
    
    console.log(`\n✅ Migración completada: ${migratedCount} conversaciones actualizadas`);
    
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    await client.close();
  }
}

// Ejecutar migración
if (require.main === module) {
  migrateConversations();
}

module.exports = { migrateConversations }; 