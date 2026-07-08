const puppeter = require('puppeteer');
const { generarHtmlInforme } = require('../helpers/generarHtmlInforme');

async function generarPdfBuffer(informe) {
    const html = generarHtmlInforme(informe);

    const browser = await puppeter.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
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

    await browser.close();
    
    return Buffer.from(pdfUint8Array);
}

module.exports = {generarPdfBuffer};

