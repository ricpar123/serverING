const { Schema, model } = require('mongoose');



const numeroSch = Schema({
    clave: { type: String, required: true, unique: true },
    numero: { type: Number, required: true, default: 0 }
     

});

module.exports = model('Numero', numeroSch);