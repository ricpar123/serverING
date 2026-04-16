

const { Router } = require('express');

const { validarAuth } = require('../midlewares/validarAuth');




const { clientesGet,
        clienteGetporNombre,
        clientesPut,
        clientesPost,
        clientesPutInactivar
        
         } = require('../controladores/clientesCon');

const rutas = Router();

rutas.get('/', clientesGet);
rutas.get('/:nombre', clienteGetporNombre );



rutas.post('/', clientesPost);


 rutas.put('/:id', clientesPut);

 rutas.put('/:id/inactivar', clientesPutInactivar);




 

module.exports= rutas;
