const { Router } = require('express');

const upload = require("../midlewares/upload");
const router = Router();
const logoBase64 = require("../helpers/logoBase64/logoBase64");
const Informe = require("../modelos/informe");
const { generarPdfInformeDescarga } = require("../controladores/informeCon")


const {
    informesGet, crearInforme,
    informesGetDatos, informesDelete, informesPut, obtenerInformePorId,
    subirImagenesInforme, generarPdfInforme, enviarInformePorEmail
} = require('../controladores/informeCon');

const { validarAuth } = require('../midlewares/validarAuth');



router.get('/', informesGet);
router.get('/:id', obtenerInformePorId);

//router.get("/pdf/informe/:id/descargar", generarPdfInformeDescarga);

router.get('/inicio/:inicio/fin/:fin/cliente/:cliente', informesGetDatos);
router.delete('/:id', informesDelete);
router.put('/', informesPut);



router.post('/informe', crearInforme);
/*
 router.post("/informe/:id/enviar-email", 
   enviarInformePorEmail
);
*/

module.exports = router;
