

const { Router } = require('express');

const { validarAuth } = require('../midlewares/validarAuth');




const { clientesGet,
       
        clientesPut,
        clientesPost,
        clientesDelete
        
         } = require('../controladores/clientesCon');

const rutas = Router();

rutas.get('/', validarAuth, clientesGet);




rutas.post('/', clientesPost);


 rutas.put('/', clientesPut);


 rutas.delete('/:id', clientesDelete); 

 

 









module.exports= rutas;
