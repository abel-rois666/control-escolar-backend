// test-connection.js
const { Client } = require('pg');
require('dotenv').config();

// Creamos un nuevo cliente de base de datos
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function testDb() {
  console.log('Intentando conectar a la base de datos...');
  try {
    await client.connect(); // Intenta conectar
    console.log('✅ ¡Conexión exitosa!');
    const res = await client.query('SELECT NOW()'); // Pide la hora
    console.log('La hora del servidor de la base de datos es:', res.rows[0].now);
  } catch (err) {
    console.error('❌ ERROR AL CONECTAR:', err.message);
    console.error('Detalles del error:', err);
  } finally {
    await client.end(); // Cierra la conexión
    console.log('Conexión cerrada.');
  }
}

testDb();