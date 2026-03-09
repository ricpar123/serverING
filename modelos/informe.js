const { Schema, model } = require('mongoose');



const informeSch = Schema({
    numero: {type : Number},
    cliente: {type : String },
    tecnico: {type : String},
    descripcion: {type : String},
    marca: {type : String },
    modelo: {type : String},
    serie: {type : String},
    motivo: {type : String},
    tipoTrabajo: {type : String},
    presupuesto: {type : String},
   fechaInicio: {type : String},
    horaInicio: {type : String},
    fechaFin:{type : String},
    horaFin: {type : String},
    servicio: {type : String},
    obs: {type : String},
    recibido: {type : String},
    firma: {type : String },
    firmaT: {type : String },
    fecha: {type : Date },
    status: {type : String },
    repuestos: {type : String },



     

});

module.exports = model('Informe', informeSch);
