const { Router } = require('express');

const router = Router();

const {
    informesGet, informesPost,
    informesGetDatos, informesDelete, informesPut
} = require('../controladores/informeCon');
const { validarAuth } = require('../midlewares/validarAuth');





router.get('/', validarAuth, informesGet);
router.get('/inicio/:inicio/fin/:fin/cliente/:cliente', informesGetDatos);
router.delete('/:id', informesDelete);
router.put('/', informesPut);
router.post('/', informesPost)




module.exports = router;