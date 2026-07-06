const { Schema, model } = require('mongoose');



const informeSch = new Schema({
    numero: {type : Number},
    cliente: {type : String },
    tecnicos: [{type : [String], default: [] }],
    equipo: {type : String},
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
    status: {type : String },
    repuestos: {type : String },
    fotosAntes: {type: [String], default: []},
    fotosDespues: {type: [String], default: []},
    rutaPdf: {
        type: String,
        default: ""
    },

}, {
    timestamps: true
});

module.exports = model('Informe', informeSch);
