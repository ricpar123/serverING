const { Schema, model } = require('mongoose');



const equipoSch = Schema({
    cliente: {type : String},
    descripcion: { type: String },
     marca: {type : String},
     modelo: {type : String},
     serie: {type : String}
     
     

     

});

module.exports = model('Equipo', equipoSch);