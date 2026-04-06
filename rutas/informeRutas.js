const { Router } = require('express');
const multer = require('multer');
const router = Router();

const {
    informesGet, crearInforme,
    informesGetDatos, informesDelete, informesPut, obtenerInformePorId,
    subirImagenesInforme
} = require('../controladores/informeCon');

const { validarAuth } = require('../midlewares/validarAuth');

const  upload = multer({ storage: multer.memoryStorage() });

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
