require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function testMongoConnection() {
  console.log('🔍 Iniciando test de conexión a MongoDB Atlas...\n');

  // Verificar variables de entorno
  console.log('📋 Verificando variables de entorno:');
  console.log('MONGODB_URI existe:', !!process.env.MONGODB_URI);
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI no está definido en .env.local');
    process.exit(1);
  }

  // Mostrar URI (ocultando credenciales)
  const uri = process.env.MONGODB_URI;
  const maskedUri = uri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://***:***@');
  console.log('URI (enmascarado):', maskedUri);
  console.log('');

  // Extraer información de la URI
  try {
    const urlPattern = /mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)/;
    const match = uri.match(urlPattern);
    
    if (match) {
      const [, username, password, cluster, database] = match;
      console.log('👤 Usuario:', username);
      console.log('🔐 Contraseña:', password.length > 0 ? `${password.charAt(0)}***${password.charAt(password.length-1)} (${password.length} caracteres)` : 'VACÍA');
      console.log('🌐 Cluster:', cluster);
      console.log('🗄️  Base de datos:', database);
      console.log('');
    }
  } catch (err) {
    console.log('⚠️  No se pudo parsear la URI');
  }

  let client;
  
  try {
    console.log('🔗 Intentando conectar a MongoDB Atlas...');
    
    // Crear cliente con opciones específicas para debugging
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // 10 segundos
      socketTimeoutMS: 45000,
      family: 4, // Forzar IPv4
      retryWrites: true,
      w: 'majority'
    });

    // Conectar
    await client.connect();
    console.log('✅ Conexión establecida correctamente');

    // Test de ping
    console.log('🏓 Haciendo ping al servidor...');
    const pingResult = await client.db().admin().ping();
    console.log('✅ Ping exitoso:', pingResult);

    // Listar bases de datos
    console.log('📚 Listando bases de datos disponibles...');
    const dbs = await client.db().admin().listDatabases();
    console.log('Bases de datos encontradas:');
    dbs.databases.forEach(db => {
      console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });

    // Test específico con la base de datos del proyecto
    console.log('\n🎯 Probando operaciones en la base de datos "samaracore"...');
    const db = client.db('samaracore');
    
    // Listar colecciones
    const collections = await db.listCollections().toArray();
    console.log('Colecciones encontradas:', collections.map(c => c.name));

    // Test de inserción en colección de prueba
    console.log('📝 Probando inserción en colección "test"...');
    const testCollection = db.collection('test');
    const insertResult = await testCollection.insertOne({
      test: true,
      timestamp: new Date(),
      message: 'Test de conexión desde script'
    });
    console.log('✅ Documento insertado con ID:', insertResult.insertedId);

    // Test de lectura
    console.log('📖 Probando lectura de documento...');
    const document = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log('✅ Documento leído:', document);

    // Limpiar documento de prueba
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('🗑️  Documento de prueba eliminado');

    // Test en colección de agentes (si existe)
    try {
      const agentsCount = await db.collection('agents').countDocuments();
      console.log(`📊 Agentes en la base de datos: ${agentsCount}`);
    } catch (err) {
      console.log('ℹ️  Colección "agents" no existe aún (normal en instalación nueva)');
    }

    console.log('\n🎉 ¡Todos los tests pasaron exitosamente!');
    console.log('✅ MongoDB Atlas está configurado correctamente');

  } catch (error) {
    console.error('\n❌ Error de conexión a MongoDB Atlas:');
    console.error('Tipo de error:', error.constructor.name);
    console.error('Mensaje:', error.message);
    
    if (error.code) {
      console.error('Código de error:', error.code);
    }

    if (error.codeName) {
      console.error('Nombre del código:', error.codeName);
    }

    // Sugerencias basadas en el tipo de error
    console.log('\n💡 Posibles soluciones:');
    
    if (error.message.includes('authentication failed')) {
      console.log('- ✏️  Verifica el usuario y contraseña en MongoDB Atlas');
      console.log('- 🔐 Asegúrate de que el usuario existe en Database Access');
      console.log('- 📝 Verifica que no haya caracteres especiales sin encodear en la contraseña');
    }
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('- 🌐 Verifica la URL del cluster');
      console.log('- 📡 Revisa tu conexión a internet');
    }
    
    if (error.message.includes('IP not in whitelist')) {
      console.log('- 🔒 Agrega tu IP actual a Network Access en MongoDB Atlas');
      console.log('- 🌍 Para desarrollo, puedes usar 0.0.0.0/0 (no recomendado para producción)');
    }

    console.log('- 📄 Revisa el formato de MONGODB_URI en .env.local');
    console.log('- 🔄 Intenta regenerar la cadena de conexión desde MongoDB Atlas');
    
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar test
testMongoConnection().catch(console.error); 