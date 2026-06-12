const { Schema, model } = require('mongoose');


const clienteSch = Schema({
   
    nombre: { type: String, required:[true, 'el nombre es obligatorio']
     },
     
     email1: { type: String, required:[true, 'por lo menos un email es requerido']
      },

      email2: { type: String },

      email3: { type: String },

      email4: { type: String },

     status: {type : String,
        default: "activo"
     }
     
});

module.exports = model('cliente', clienteSch);