const { Schema, model } = require('mongoose');


const clienteSch = Schema({
    nombre: { type: String, required:[true, 'el nombre es obligatorio']
     },
     email1: {type : String},
     email2: {type : String},
     email3: {type : String},
     email4: {type : String}
     

     

});

module.exports = model('Cliente', clienteSch);