// controllers/alumnos.controller.js
const pool = require('../config/database');

// --- OBTENER TODOS LOS ALUMNOS ---
const getAllAlumnos = async (req, res) => {
  const { buscar } = req.query; // Obtenemos el parámetro 'buscar' de la URL

  try {
    let query = 'SELECT * FROM alumnos';
    const params = [];

    if (buscar) {
      // Si hay un término de búsqueda, modificamos la consulta
      query += ' WHERE nombre_completo ILIKE $1 OR matricula ILIKE $1';
      params.push(`%${buscar}%`); // ILIKE es para búsqueda insensible a mayúsculas/minúsculas
    }

    query += ' ORDER BY nombre_completo ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- OBTENER UN ALUMNO POR SU ID ---
const getAlumnoById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM alumnos WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Alumno con id ${id} no encontrado` });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- CREAR UN NUEVO ALUMNO ---
const createAlumno = async (req, res) => {
  const {
    matricula,
    nombre_completo,
    lista_de_precios_id, // Este ID es crucial
    estatus,
    carrera,
    grado,
    grupo,
    turno,
    email_contacto,
    telefono_celular,
    nombre_tutor,
    porcentaje_beca,
  } = req.body;

  if (!matricula || !nombre_completo || !lista_de_precios_id) {
    return res.status(400).json({ error: 'Matrícula, nombre_completo y lista_de_precios_id son requeridos' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO alumnos (matricula, nombre_completo, lista_de_precios_id, estatus, carrera, grado, grupo, turno, email_contacto, telefono_celular, nombre_tutor, porcentaje_beca) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
      [ matricula, nombre_completo, lista_de_precios_id, estatus, carrera, grado, grupo, turno, email_contacto, telefono_celular, nombre_tutor, porcentaje_beca ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    if (err.code === '23505') { // Error de 'unique constraint'
        return res.status(400).json({ error: 'La matrícula ya existe.' });
    }
    if (err.code === '23503') { // Error de 'foreign key constraint'
        return res.status(404).json({ error: 'La lista de precios especificada no existe.' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- ACTUALIZAR UN ALUMNO ---
const updateAlumno = async (req, res) => {
    const { id } = req.params;
    const {
        matricula, nombre_completo, lista_de_precios_id, estatus, carrera,
        grado, grupo, turno, email_contacto, telefono_celular, nombre_tutor, porcentaje_beca
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE alumnos SET matricula = $1, nombre_completo = $2, lista_de_precios_id = $3, estatus = $4, carrera = $5,
             grado = $6, grupo = $7, turno = $8, email_contacto = $9, telefono_celular = $10, nombre_tutor = $11, porcentaje_beca = $12
             WHERE id = $13 RETURNING *`,
            [ matricula, nombre_completo, lista_de_precios_id, estatus, carrera, grado, grupo, turno, email_contacto, telefono_celular, nombre_tutor, porcentaje_beca, id ]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: `Alumno con id ${id} no encontrado` });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


// --- BORRAR UN ALUMNO ---
const deleteAlumno = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM alumnos WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: `Alumno con id ${id} no encontrado` });
        }
        res.sendStatus(204);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
  getAllAlumnos,
  getAlumnoById,
  createAlumno,
  updateAlumno,
  deleteAlumno,
};