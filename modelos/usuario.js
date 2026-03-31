const { Schema, model } = require('mongoose');


const usuarioSch = Schema({
    userid:  [{ type: String, required:true}],
    clave: { type: String, required:[true, 'la clave es obligatorio']},
    rol: { type: String, required: true },
    status: { type: String, required: true }

});







module.exports = model('usuario', usuarioSch);
