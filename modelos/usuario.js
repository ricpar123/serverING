const { Schema, model } = require('mongoose');



const usuarioSch = Schema({
    userid: { type: String, required:[true, 'el nombre es obligatorio']
     },
    clave: { type: String, required:[true, 'la clave es obligatorio']
},
    rol: { type: String }

});

module.exports = model('Usuarios', usuarioSch);