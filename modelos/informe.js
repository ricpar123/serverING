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
    inicio: [''],
    fechaInicio: {type : String},
    horaInicio: {type : String},
    termino: [''],
    fechaFin:{type : String},
    horaFin: {type : String},
    horasNormales: {type : String},
    horasLab: {type : String},
    horasViaje: {type : String},
    horasTotales: {type : String},
    servicio: {type : String},
    obs: {type : String},
    recibido: {type : String},
    ci: {type : String},
    firma: {type : String },
    fecha: {type : Date }



     

});

module.exports = model('Informe', informeSch);
