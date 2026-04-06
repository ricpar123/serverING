const { Router } = require('express');

const upload = require("../midlewares/upload");
const router = Router();


const {
    informesGet, crearInforme,
    informesGetDatos, informesDelete, informesPut, obtenerInformePorId,
    subirImagenesInforme
} = require('../controladores/informeCon');

const { validarAuth } = require('../midlewares/validarAuth');



router.get('/', validarAuth, informesGet);
router.get('/:id', obtenerInformePorId);
router.get('/inicio/:inicio/fin/:fin/cliente/:cliente', informesGetDatos);
router.delete('/:id', informesDelete);
router.put('/', informesPut);



router.post('/informe', crearInforme);
router.post("/informe/:id/imagenes",
     
    upload.fields([
        { name: "fotoAntes", maxCount: 3},
        { name: "fotoDespues", maxCount: 3}
    ]),
    
    subirImagenesInforme
   
 );
 

 


module.exports = router;
