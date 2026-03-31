

const { Router } = require('express');

const { validarAuth } = require('../midlewares/validarAuth');




const { clientesGet,
       
        clientesPut,
        clientesPost,
        clientesDelete,
        clientesPutInactivar
        
         } = require('../controladores/clientesCon');

const rutas = Router();

rutas.get('/', validarAuth, clientesGet);




rutas.post('/', clientesPost);


 rutas.put('/:id', clientesPut);

 rutas.put('/:id/inactivar', clientesPutInactivar);


 rutas.delete('/:id', clientesDelete); 

 

module.exports= rutas;
