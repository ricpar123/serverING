const { Schema, model } = require('mongoose');


const clienteSch = Schema({
    nombre: { type: String, required:[true, 'el nombre es obligatorio']
     },
     
     emails: {
        type: [String],
        default: []
     },

     status: {type : String,
        default: "activo"
     }
     
});

module.exports = model('cliente', clienteSch);