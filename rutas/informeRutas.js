const { Router } = require('express');
const multer = require('multer');
const router = Router();

const {
    informesGet, informesPost,
    informesGetDatos, informesDelete, informesPut, obtenerInformePorId
} = require('../controladores/informeCon');

const { validarAuth } = require('../midlewares/validarAuth');

const  upload = multer({ storage: multer.memoryStorage() });

router.get('/', validarAuth, informesGet);
router.get('/:id', obtenerInformePorId);
router.get('/inicio/:inicio/fin/:fin/cliente/:cliente', informesGetDatos);
router.delete('/:id', informesDelete);
router.put('/', informesPut);



router.post('/',
    upload.fields ([
        { name: 'fotosAntes', maxCount: 3 },
        { name: 'fotosDespues', maxCount: 3 },        
    ]),
    informesPost
 );

 


module.exports = router;
