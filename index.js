const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sql = require('mssql');

const app = express();
const port = 3000;

// Configuración de la base de datos SQL Server
const dbConfig = {
  user: 'sqlserver',
  password: 'Bbenja386-',  // Cambia a tu contraseña
  server: '34.42.185.127', // Cambia a tu IP de SQL Server
  database: 'ChatBot',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  }
};

app.use(cors());
app.use(bodyParser.json());

// Conectar a SQL Server
async function connectToDatabase() {
  try {
    await sql.connect(dbConfig);
    console.log("Conectado a la base de datos SQL Server");
  } catch (err) {
    console.error("Error al conectar a la base de datos:", err);
  }
}
connectToDatabase();

// Endpoint para iniciar una conversación
app.post('/api/conversaciones', async (req, res) => {
  try {
    const result = await sql.query`
      INSERT INTO Conversaciones DEFAULT VALUES;
      SELECT SCOPE_IDENTITY() AS id;
    `;
    const idConversacion = result.recordset[0].id;
    res.status(201).json({ idConversacion });
  } catch (error) {
    console.error('Error al iniciar conversación:', error);
    res.status(500).json({ error: 'Error al iniciar conversación' });
  }
});

// Endpoint para obtener mensajes de una conversación
app.get('/api/mensajes/:idConversacion', async (req, res) => {
  const { idConversacion } = req.params;
  try {
    const result = await sql.query`
      SELECT * FROM Mensajes WHERE idConversacion = ${idConversacion} ORDER BY marcaTiempo;
    `;
    const pendiente = result.recordset.some(msg => msg.estado === 0 && msg.esRespuesta === 1);
    res.json({ mensajes: result.recordset, enProceso: pendiente });
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

// Endpoint para enviar un mensaje
app.post('/api/mensajes', async (req, res) => {
  const { idConversacion, textoMensaje, esRespuesta } = req.body;
  try {
    await sql.query`
      INSERT INTO Mensajes (idConversacion, textoMensaje, esRespuesta, estado)
      VALUES (${idConversacion}, ${textoMensaje}, ${esRespuesta}, 0);
    `;
    res.status(201).json({ mensaje: 'Mensaje enviado' });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
});

app.get('/', async (req, res) => {
  res.json({ mensaje: 'Hola Mundo!' });
});

app.listen(port, () => {
  console.log(`Servidor Node.js escuchando en http://localhost:${port}`);
});
