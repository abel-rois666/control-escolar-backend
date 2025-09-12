// controllers/certificados.controller.js
const { Parser, processors } = require('xml2js');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const getData = (obj, path) => {
    return path.split('.').reduce((acc, key) => acc && acc[key], obj);
}

const formatDate = (dateString) => {
    if (!dateString) return '';
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
};

const generarPdfDesdeXml = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No se ha subido ningún archivo XML.');
  }

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  try {
    const xmlData = req.file.buffer.toString('utf-8');
    
    const parser = new Parser({
      tagNameProcessors: [processors.stripPrefix],
      attrNameProcessors: [processors.stripPrefix],
      explicitArray: false,
      mergeAttrs: true,
    });
    const jsonData = await parser.parseStringPromise(xmlData);

    const dec = jsonData.Dec;

    if (!dec) {
      throw new Error("No se pudo encontrar el elemento raíz 'Dec' en el XML.");
    }

    // --- EXTRACCIÓN DE DATOS PARA EL NUEVO FORMATO ---
    const alumno = getData(dec, 'Alumno');
    const nombreCompleto = `${getData(alumno, 'nombre') || ''} ${getData(alumno, 'primerApellido') || ''} ${getData(alumno, 'segundoApellido') || ''}`.trim();
    
    // --- INICIO DE LA CORRECCIÓN ---
    // Convertir el logo a Base64 desde la nueva carpeta de assets del backend
    const logoPath = path.resolve(__dirname, '../assets/06-Logo_CUOM_v3_ConFondoAmpliado.png');
    const logoBase64 = fs.readFileSync(logoPath, 'base64');
    const logoSrc = `data:image/jpeg;base64,${logoBase64}`;
    // --- FIN DE LA CORRECCIÓN ---

    const datosParaPdf = {
      logoSrc: logoSrc,
      campus: getData(dec, 'Ipes.campus'),
      nombreAlumno: nombreCompleto,
      curp: getData(alumno, 'curp'),
      matricula: getData(alumno, 'numeroControl'),
      nivelEstudios: getData(dec, 'Carrera.nivelEstudios'),
      promedio: getData(dec, 'Asignaturas.promedio'),
      nombreCarrera: getData(dec, 'Carrera.nombreCarrera'),
      claveCarrera: getData(dec, 'Carrera.claveCarrera'),
      // --- INICIO DE LA CORRECCIÓN ---
      clavePlan: getData(dec, 'Carrera.clavePlan'), // Dato añadido
      // --- FIN DE LA CORRECCIÓN ---
      rvoeNumero: getData(dec, 'Rvoe.numero'),
      rvoeFecha: formatDate(getData(dec, 'Rvoe.fechaExpedicion')),
      entidadFederativa: getData(dec, 'Ipes.entidadFederativa'),
      fechaExpedicion: formatDate(getData(dec, 'Expedicion.fecha')),
      asignaturas: []
    };

    const asignaturasData = getData(dec, 'Asignaturas.Asignatura');
    if (asignaturasData) {
      const asignaturasArray = Array.isArray(asignaturasData) ? asignaturasData : [asignaturasData];
      datosParaPdf.asignaturas = asignaturasArray.map(asig => ({
        nombre: getData(asig, 'nombre'),
        ciclo: getData(asig, 'ciclo'),
        calificacion: parseFloat(getData(asig, 'calificacion')).toFixed(2),
        tipoAsignatura: getData(asig, 'tipoAsignatura'),
        // --- INICIO DE LA CORRECCIÓN: Créditos como enteros ---
        creditos: Math.round(parseFloat(getData(asig, 'creditos'))),
        // --- FIN DE LA CORRECCIÓN ---
        observaciones: getData(asig, 'idObservaciones') === '101' ? 'E.E.' : ''
      }));
    }
    
    const templatePath = path.resolve(__dirname, '../templates/certificado-template.html');
    let templateHtml = fs.readFileSync(templatePath, 'utf-8');

    // Se elimina la lectura del CSS aquí porque se inyectará de otra forma
    
    for (const key in datosParaPdf) {
        if (key !== 'asignaturas') {
            templateHtml = templateHtml.replace(new RegExp(`{{${key}}}`, 'g'), datosParaPdf[key] || '');
        }
    }

    const filasAsignaturas = datosParaPdf.asignaturas.map(asig => `
      <tr>
        <td class="align-left">${asig.nombre || ''}</td>
        <td>${asig.ciclo || ''}</td>
        <td>${asig.calificacion || ''}</td>
        <td>${asig.tipoAsignatura || ''}</td>
        <td>${asig.creditos || ''}</td>
        <td>${asig.observaciones || ''}</td>
      </tr>
    `).join('');

    templateHtml = templateHtml.replace('{{filasAsignaturas}}', filasAsignaturas);
    
    // --- INICIO DE LA CORRECCIÓN: Encabezado repetible y estilos ---
    const stylePath = path.resolve(__dirname, '../templates/certificado-style.css');
    const cssContent = fs.readFileSync(stylePath, 'utf-8');

    // Inyectamos el CSS en el <head> de la plantilla principal
    const finalHtml = `
        <!DOCTYPE html>
        <html>
            <head>
                <style>${cssContent}</style>
            </head>
            <body>${templateHtml}</body>
        </html>
    `;

    await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

    const headerTemplate = `
        <div style="width: 100%; font-family: Arial, sans-serif; padding: 0 0.5in; box-sizing: border-box;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 5px;">
                <div style="display: flex; align-items: center;">
                    <img src="${datosParaPdf.logoSrc}" alt="Logo" style="height: 60px;">
                </div>
                <div style="font-size: 11pt; font-weight: bold;">
                    CENTRO UNIVERSITARIO ORIENTE DE MÉXICO
                </div>
            </div>
            <div style="text-align: center; font-size: 11pt; font-weight: bold; margin-top: 10px;">
                Historial Académico
            </div>
            <div style="border-bottom: 2px solid #000; margin-top: 5px;"></div>
        </div>
    `;
    
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: headerTemplate,
      footerTemplate: `<div style="font-size: 9px; text-align: right; width: 100%; padding: 0 0.5in 0.5in 0;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>`,
      // Margen ajustado para el encabezado final
      margin: { top: '1.6in', right: '0.5in', bottom: '0.8in', left: '0.5in' },
    });
    // --- FIN DE LA CORRECCIÓN ---
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': `attachment; filename="Historial_${(datosParaPdf.matricula || 'alumno')}.pdf"`
    });
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error al generar el PDF:', error);
    res.status(500).send('Error interno al procesar el archivo.');
  } finally {
    await browser.close();
  }
};

module.exports = { generarPdfDesdeXml };