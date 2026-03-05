
const express = require('express');
const { response } = require('express');
const CertificadoCalibracion = require('../modelos/CertificadoCalibracion');
const mongoose = require("mongoose");





const path = require('path');
const { getNextCertificadoNumber, formatCertNumber } = require('../helpers/numero');



const crearCertificado = async (req, res = response) => {
 
console.log("Recibido en controlador crearCertificado:");
    try {
        const seq = await getNextCertificadoNumber();
        const numero = formatCertNumber(seq);
        console.log("Número de certificado asignado:", numero);
        
        const nuevoCertificado = new CertificadoCalibracion({ ...req.body, numero: numero });
        console.log('datos recibidos para nuevo certificado:', req.body);
        
        await nuevoCertificado.save();

        return res.status(201).json({
            ok: true,
            //id: nuevoCertificado._id,
            numero
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, error: err.message });
    }
}

const listarCertificados = async (req, res = response) => {
    console.log('estoy en GET listar certificados');
    try {
        const docs = await CertificadoCalibracion
            .find({}, { numero: 1, cliente: 1, fecha: 1})
            .sort({fecha: -1})
            .lean();
        const items = docs.map( d => ({
            _id: d._id,
            numero: d.numero,
            cliente: d.cliente,
            fecha: d.fecha,
        }));
        res.json({ ok:true, items});
        
    } catch (error) {
        res.status(500).json({ok:false, error:error.message});
    }
}
obtenerCertificadoPorId = async (req,res = response) => {

    try {
      const { id } = req.params;
      console.log('GET POR ID:', req.params.id);
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ ok: false, error: "ID inválido" });
            
        }
        const cert = await CertificadoCalibracion.findById(id).lean();
        if(!cert) {
            return res.status(404).json({
                ok:false,
                error: 'Certificado no encontrado',
            });
        }
        console.log('certificado obtenido:', cert);
        return res.json({ok:true, cert});
    } catch (error) {
       console.error(error);
            return res.status(500).json({ ok: false, error: error.message }); 
    }
};

module.exports = {
    crearCertificado,
    listarCertificados,
    obtenerCertificadoPorId,
}