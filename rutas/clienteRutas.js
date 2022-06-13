

const { Router } = require('express');




const { clientesGet,
       
        clientesPut,
        clientesPost,
        clientesDelete
        
         } = require('../controladores/clientesCon');

const rutas = Router();

rutas.get('/', clientesGet);




rutas.post('/', clientesPost);


 rutas.put('/', clientesPut);


 rutas.delete('/', clientesDelete); 

 

 









module.exports= rutas;
