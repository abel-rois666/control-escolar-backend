// controllers/xmlGenerator.controller.js
const xlsx = require('xlsx');
const { create } = require('xmlbuilder');

const generarXmlDesdeExcel = (req, res) => {
    if (!req.file) {
        return res.status(400).send('No se ha subido ningún archivo Excel.');
    }

    try {
        // --- INICIO DE LA CORRECCIÓN 1: Leer fechas correctamente ---
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true });

        const formatDateToYYYYMMDD = (date) => {
            if (!date || !(date instanceof Date)) return '';
            // Usamos UTC para evitar problemas de zona horaria
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        // --- FIN DE LA CORRECCIÓN 1 ---

        // --- Leer Hoja de Datos Generales ---
        const datosSheet = workbook.Sheets['DATOS_GENERALES'];
        if (!datosSheet) throw new Error("La hoja 'DATOS_GENERALES' no fue encontrada.");
        const datosGeneralesRaw = xlsx.utils.sheet_to_json(datosSheet, { header: 1 });
        
        const datos = datosGeneralesRaw.reduce((obj, row) => {
            if (row[0]) obj[row[0]] = row[1];
            return obj;
        }, {});

        // --- Leer Hoja de Asignaturas ---
        const asignaturasSheet = workbook.Sheets['ASIGNATURAS'];
        if (!asignaturasSheet) throw new Error("La hoja 'ASIGNATURAS' no fue encontrada.");
        const asignaturas = xlsx.utils.sheet_to_json(asignaturasSheet);

        // --- Construir el XML ---
        const root = create('Dec', { encoding: 'UTF-8' })
            .att('xmlns', 'https://www.siged.sep.gob.mx/certificados/')
            .att('version', '3.0')
            .att('tipoCertificado', '5')
            .att('folioControl', datos.folioControl || '');

        root.ele('Ipes')
            .att('nombreInstitucion', 'CENTRO UNIVERSITARIO ORIENTE DE MÉXICO')
            .att('campus', datos.campus || 'ÚNICO')
            .att('entidadFederativa', datos.entidadFederativa || '');

        // --- INICIO DE LA CORRECCIÓN 2: Formatear las fechas antes de usarlas ---
        const rvoeFechaFormateada = formatDateToYYYYMMDD(datos.rvoeFechaExpedicion);
        const expedicionFechaFormateada = formatDateToYYYYMMDD(datos.fechaExpedicion);

        root.ele('Rvoe').att('numero', datos.rvoeNumero || '').att('fechaExpedicion', `${rvoeFechaFormateada}T00:00:00`);

        root.ele('Carrera')
            .att('claveCarrera', datos.claveCarrera || '')
            .att('nombreCarrera', datos.nombreCarrera || '')
            .att('clavePlan', datos.clavePlan || '')
            .att('nivelEstudios', datos.nivelEstudios || '');

        root.ele('Alumno')
            .att('numeroControl', datos.numeroControl || '')
            .att('curp', datos.curp || '')
            .att('nombre', datos.nombre || '')
            .att('primerApellido', datos.primerApellido || '')
            .att('segundoApellido', datos.segundoApellido || '');
            
        root.ele('Expedicion').att('fecha', `${expedicionFechaFormateada}T00:00:00`);
        // --- FIN DE LA CORRECCIÓN 2 ---

        const asignaturasNode = root.ele('Asignaturas')
            .att('promedio', datos.promedio || '0.00')
            .att('totalCreditos', datos.totalCreditos || '0.00');

        asignaturas.forEach(asig => {
            asignaturasNode.ele('Asignatura')
                .att('claveAsignatura', asig.claveAsignatura || '')
                .att('nombre', asig.nombre || '')
                .att('ciclo', asig.ciclo || '')
                .att('calificacion', asig.calificacion || '0.00')
                .att('idObservaciones', asig.idObservaciones || '100')
                .att('tipoAsignatura', asig.tipoAsignatura || 'Obligatoria')
                .att('creditos', asig.creditos || '0.00');
        });

        const xmlString = root.end({ pretty: true });

        const fileName = `${datos.numeroControl || 'historial'}.xml`;
        res.set({
            'Content-Type': 'application/xml',
            'Content-Disposition': `attachment; filename="${fileName}"`
        });
        res.send(xmlString);

    } catch (error) {
        console.error('Error al generar el XML:', error);
        res.status(500).send(`Error interno al procesar el archivo: ${error.message}`);
    }
};

module.exports = { generarXmlDesdeExcel };