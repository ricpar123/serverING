const puppeter = require('puppeteer');
const { generarHtmlInforme } = require('../helpers/generarHtmlInforme');

async function generarPdfBuffer(informe) {

    let browser;
    
    try {
        browser = await puppeter.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();

    const html = generarHtmlInforme(informe);

    await page.setContent(html, { waitUntil: 'networkidle0' });
  
  

    const pdfUint8Array = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
            top: '8mm',
            right: '10mm',
            bottom: '8mm',
            left: '10mm'
        }
    });

    if (!pdfUint8Array || pdfUint8Array.length === 0) {
            throw new Error("El PDF generado está vacío.");
        }

       
    
        return Buffer.from(pdfUint8Array);
    } catch (error) {
        throw new Error(`Error al generar el PDF: ${error.message}`);
    } finally {
        if (browser) {
         await browser.close();
        }
    }
    
}

module.exports = {generarPdfBuffer};

