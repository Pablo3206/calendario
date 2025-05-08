// 1) Carga las variables de entorno de .env
require('dotenv').config();
// ↓ desactiva validación de certificados en todo Node
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 2) Configura el pool usando tus variables .env
// 2) Configura el pool usando DATABASE_URL con SSL
// 2) Configura el pool usando DATABASE_URL y desactiva verificación de certificado
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  pool.on('connect', client => {
    client.query("SET TIME ZONE 'Europe/Madrid';");
  });

app.use(express.static('public'));
// Endpoint para verificar conexión a la base de datos
app.get('/health', async (req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'ok', db: 'connected' });
    } catch (err) {
      console.error('Error al conectar a BD:', err);
      res.status(500).json({ status: 'error', error: err.message });
    }
  });
  
//
// RUTAS PARA TIPOS
//
app.get('/api/tipos', async (req, res) => {
  const { categoria } = req.query;
  const where = categoria ? 'WHERE categoria = $1' : '';
  const params = categoria ? [categoria] : [];
  const { rows } = await pool.query(
    `SELECT * FROM tipos ${where} ORDER BY nombre`, params
  );
  res.json(rows);
});

app.post('/api/tipos', async (req, res) => {
  const { nombre, inicio, fin, categoria } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO tipos (nombre, inicio, fin, categoria)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [nombre, inicio, fin, categoria]
  );
  res.status(201).json(rows[0]);
});
// Actualizar un tipo (turno o trabajo)
app.put('/api/tipos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, inicio, fin, categoria } = req.body;
    const { rows } = await pool.query(
      `UPDATE tipos
         SET nombre=$1, inicio=$2, fin=$3, categoria=$4
       WHERE id=$5
       RETURNING *`,
      [nombre, inicio, fin, categoria, id]
    );
    res.json(rows[0]);
  });
  
  // Eliminar un tipo (turno o trabajo)
  app.delete('/api/tipos/:id', async (req, res) => {
    await pool.query(`DELETE FROM tipos WHERE id = $1`, [req.params.id]);
    res.status(204).end();
  });
  
//
// RUTAS PARA EVENTOS
//
app.get('/api/eventos', async (_, res) => {
    const { rows } = await pool.query(
      `SELECT
         id,
         titulo,
         descripcion,
         ubicacion,
        to_char(fecha_inicio, 'YYYY-MM-DD"T"HH24:MI:SS') AS fecha_inicio,
        to_char(fecha_fin,    'YYYY-MM-DD"T"HH24:MI:SS') AS fecha_fin,

         usuario,
         tipo_id
       FROM eventos
       ORDER BY fecha_inicio`
    );
    res.json(rows);
  });
  
  

  app.post('/api/eventos', async (req, res) => {
    console.log('📥 POST /api/eventos body:', req.body);
    try {
      const {
        titulo, descripcion, ubicacion,
        fecha_inicio, fecha_fin, usuario, tipo_id
      } = req.body;
      const { rows } = await pool.query(
        `INSERT INTO eventos
          (titulo, descripcion, ubicacion, fecha_inicio, fecha_fin, usuario, tipo_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [titulo, descripcion, ubicacion, fecha_inicio, fecha_fin, usuario, tipo_id]
      );
      console.log('✅ Inserted evento:', rows[0]);
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error('❌ Error inserting evento:', err);
      res.status(500).json({ error: 'Error interno al guardar evento' });
    }
  });
  
  
// Actualizar evento
app.put('/api/eventos/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, ubicacion, fecha_inicio, fecha_fin, usuario, tipo_id } = req.body;
    const { rows } = await pool.query(
      `UPDATE eventos
         SET titulo=$1, descripcion=$2, ubicacion=$3,
             fecha_inicio=$4, fecha_fin=$5, usuario=$6, tipo_id=$7
       WHERE id=$8
       RETURNING *`,
      [titulo, descripcion, ubicacion, fecha_inicio, fecha_fin, usuario, tipo_id, id]
    );
    res.json(rows[0]);
  });
  
  // Eliminar evento
  app.delete('/api/eventos/:id', async (req, res) => {
    await pool.query(`DELETE FROM eventos WHERE id = $1`, [req.params.id]);
    res.status(204).end();
  });


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor arrancado en puerto ${PORT}`);
});

