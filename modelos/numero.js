const { Schema, model } = require('mongoose');



const numeroSch = Schema({
    numero: { type: Number, required:[true, 'el numero es obligatorio']
     }

});

module.exports = model('Numeros', numeroSch);