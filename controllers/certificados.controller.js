// controllers/certificados.controller.js
const { Parser, processors } = require('xml2js');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const getData = (obj, path) => {
    return path.split('.').reduce((acc, key) => acc && acc[key], obj);
}

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
    
    const datosParaPdf = {
      folio: getData(dec, 'folioControl'),
      matricula: getData(dec, 'folioControl'),
      nombreAlumno: getData(dec, 'Responsable.nombreCompleto'),
      curp: getData(dec, 'Responsable.curp'),
      nombreCarrera: getData(dec, 'Carrera.nombreCarrera'),
      promedio: getData(dec, 'Asignaturas.promedio'),
      creditos: getData(dec, 'Asignaturas.totalCreditos'),
      asignaturas: []
    };
    
    const asignaturasData = getData(dec, 'Asignaturas.Asignatura');
    if (asignaturasData) {
      const asignaturasArray = Array.isArray(asignaturasData) ? asignaturasData : [asignaturasData];
      datosParaPdf.asignaturas = asignaturasArray.map(asig => ({
        ciclo: getData(asig, 'ciclo'),
        clave: getData(asig, 'clave'),
        nombre: getData(asig, 'nombre'),
        calificacion: getData(asig, 'calificacion'),
        letra: getData(asig, 'calificacionLetra'),
        observaciones: getData(asig, 'observaciones') === 'E.E.' ? 'EXTRAORDINARIO' : ''
      }));
    }
    
    // --- **INICIO DE LA CORRECCIÓN** ---
    const templatePath = path.resolve(__dirname, '../templates/certificado-template.html');
    const stylePath = path.resolve(__dirname, '../templates/certificado-style.css');

    let templateHtml = fs.readFileSync(templatePath, 'utf-8');
    const cssContent = fs.readFileSync(stylePath, 'utf-8');
    // --- **FIN DE LA CORRECCIÓN** ---

    for (const key in datosParaPdf) {
        if (key !== 'asignaturas') {
            templateHtml = templateHtml.replace(new RegExp(`{{${key}}}`, 'g'), datosParaPdf[key] || '');
        }
    }

    const filasAsignaturas = datosParaPdf.asignaturas.map(asig => `
      <tr>
        <td>${asig.ciclo || ''}</td>
        <td>${asig.clave || ''}</td>
        <td class="align-left">${asig.nombre || ''}</td>
        <td>${asig.calificacion || ''}</td>
        <td>${asig.letra || ''}</td>
        <td>${asig.observaciones || ''}</td>
      </tr>
    `).join('');

    templateHtml = templateHtml.replace('{{filasAsignaturas}}', filasAsignaturas);
    
    await page.setContent(templateHtml, { waitUntil: 'domcontentloaded' });
    
    // --- **CAMBIO CLAVE**: Inyectamos el CSS directamente en la página
    await page.addStyleTag({ content: cssContent });
    
    // Esperamos un instante para asegurar que los estilos se apliquen
    await new Promise(resolve => setTimeout(resolve, 100));
    // --- **FIN DEL CAMBIO CLAVE** ---

    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.7in', right: '0.7in', bottom: '0.7in', left: '0.7in' }
    });
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': `attachment; filename="${(datosParaPdf.folio || 'historial')}.pdf"`
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