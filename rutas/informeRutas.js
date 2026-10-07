const { Router } = require('express');

const upload = require("../midlewares/upload");
const router = Router();
const {
    informesGet, crearInforme,
    informesGetDatos, informesDelete, informesPut, obtenerInformePorId,
    generarPdfInforme, enviarImgServer, 
    prepararEnvioDeCorreo
} = require('../controladores/informeCon');





router.get('/', informesGet);
router.get('/:id', obtenerInformePorId);
router.get('/pdf/informe/:id', generarPdfInforme);




router.get('/inicio/:inicio/fin/:fin/cliente/:cliente', informesGetDatos);
router.delete('/:id', informesDelete);
router.put('/', informesPut);



router.post('/informe', crearInforme);

router.post(
    "/informe/:id/imagenes",
    upload.fields([
        { name: "fotoAntes", maxCount: 3 },
        { name: "fotoDespues", maxCount: 3 }
    ]),
    enviarImgServer
);

router.post('/informe/:id/finalizar', prepararEnvioDeCorreo);


module.exports = router;
