const { Router } = require('express');

const router = Router();

const {
    informesGet, informesPost,
    informesGetDatos, informesDelete, informesPut
} = require('../controladores/informeCon');





router.get('/', informesGet);
router.get('/inicio/:inicio/fin/:fin/cliente/:cliente', informesGetDatos);
router.delete('/:id', informesDelete);
router.put('/', informesPut);
router.post('/', informesPost)




module.exports = router;