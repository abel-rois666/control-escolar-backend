// controllers/recibos.controller.js
const pool = require('../config/database');

// --- CREAR UN RECIBO Y APLICAR SUS PAGOS (TRANSACCIÓN) ---
const createReciboConDetalles = async (req, res) => {
  // Obtenemos los datos del cuerpo de la petición
  const { folio, alumno_id, monto_total_recibido, fecha_pago, forma_pago, banco, detalles } = req.body;

  // 'detalles' debe ser un arreglo de objetos: [{ cargo_id: 1, monto_aplicado: 500.00 }, ...]
  if (!folio || !alumno_id || !monto_total_recibido || !fecha_pago || !detalles || !Array.isArray(detalles)) {
    return res.status(400).json({ error: 'Faltan campos requeridos o el formato de detalles es incorrecto.' });
  }

  // Iniciamos un cliente de la base de datos para manejar la transacción
  const client = await pool.connect();

  try {
    // ---- INICIO DE LA TRANSACCIÓN ----
    await client.query('BEGIN');

    // 1. Crear el registro en la tabla 'recibos'
    const reciboResult = await client.query(
      'INSERT INTO recibos (folio, alumno_id, monto_total_recibido, fecha_pago, forma_pago, banco) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [folio, alumno_id, monto_total_recibido, fecha_pago, forma_pago, banco]
    );
    const nuevoRecibo = reciboResult.rows[0];

    // 2. Recorrer cada detalle del pago y aplicarlo
    for (const detalle of detalles) {
      const { cargo_id, monto_aplicado } = detalle;

      // 2a. Insertar el registro en 'detalles_del_pago'
      await client.query(
        'INSERT INTO detalles_del_pago (recibo_id, cargo_id, monto_aplicado) VALUES ($1, $2, $3)',
        [nuevoRecibo.id, cargo_id, monto_aplicado]
      );

      // 2b. Actualizar el saldo_pendiente en la tabla 'cargos'
      await client.query(
        'UPDATE cargos SET saldo_pendiente = saldo_pendiente - $1 WHERE id = $2',
        [monto_aplicado, cargo_id]
      );
    }

    // ---- FIN DE LA TRANSACCIÓN: CONFIRMAR CAMBIOS ----
    await client.query('COMMIT');

    res.status(201).json({ message: 'Recibo creado y aplicado exitosamente', recibo: nuevoRecibo });

  } catch (err) {
    // ---- SI ALGO FALLA, DESHACER TODO ----
    await client.query('ROLLBACK');
    console.error('Error en la transacción:', err.message);
    res.status(500).json({ error: 'Error interno del servidor al procesar el pago.' });
  } finally {
    // Siempre liberar el cliente al final
    client.release();
  }
};



// --- OBTENER UN RECIBO Y SUS DETALLES POR ID ---
const getReciboById = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Obtener los datos principales del recibo
    const reciboResult = await pool.query('SELECT * FROM recibos WHERE id = $1', [id]);
    if (reciboResult.rows.length === 0) {
      return res.status(404).json({ error: `Recibo con id ${id} no encontrado` });
    }
    const recibo = reciboResult.rows[0];

    // 2. Obtener los detalles de pago asociados a ese recibo (Consulta Modificada)
    const detallesResult = await pool.query(
      `SELECT 
         d.monto_aplicado, 
         c.nombre_concepto,
         cr.monto_final as monto_total_cargo
       FROM detalles_del_pago AS d
       JOIN cargos AS cr ON cr.id = d.cargo_id
       JOIN conceptos AS c ON cr.concepto_id = c.id
       WHERE d.recibo_id = $1`,
      [id]
    );

    // 3. Combinar todo en una sola respuesta
    const respuestaCompleta = {
        ...recibo,
        detalles: detallesResult.rows,
    };

    res.json(respuestaCompleta);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};



module.exports = {
  createReciboConDetalles,
  getReciboById,
};