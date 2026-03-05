const mongoose = require('mongoose');

const PuntoSchema = new mongoose.Schema({
    nominal: Number,
    mediciones: [Number],
    
});  

const CertificadoSchema = new mongoose.Schema({
    numero: {type: String, required: true, unique: true, index:true},
    cliente: String,
    marca: String,
    codigo: String,
    rangoMin: Number,
    rangoMax: Number,
    nroSerie: String,
    tolerancia: Number,
    firmaTecnico: String,
    tecnico: String,
    fecha: Date,
    temperatura: Number,
    humedad: Number,
    errorGeneralAbsNm: Number,
    errorGeneralPct: Number,
    resultadoFinal: String,
    instrumentoPadron: String,

  puntos: [PuntoSchema],
  
  creadoEn: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model(
  
  'CertificadoCalibracion',
  CertificadoSchema,
  "certificados_calibracion"
  
);