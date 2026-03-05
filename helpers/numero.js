const Numero = require('../modelos/numero');

async function getNextInformeNumber() {
    const doc = await Numero.findOneAndUpdate(
        { clave: 'informe' },
        { $inc: { numero: 1 } },
        { new: true, upsert: true }

      );
    return doc.numero;
}

async function getNextCertificadoNumber() {
    const doc = await Numero.findOneAndUpdate(
        { clave: 'certificado' },   // 🔥 diferente clave
        { $inc: { numero: 1 } },
        { new: true, upsert: true }
    );
    return doc.numero;
}

function formatCertNumber(seq) {
    return `CC-${String(seq).padStart(4, "0")}`;
}

function formatInformeNumber(seq) {
    return `IS-${String(seq).padStart(6, "0")}`;
}

module.exports = { getNextInformeNumber, getNextCertificadoNumber, 
                  formatCertNumber, formatInformeNumber };

        