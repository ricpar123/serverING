const { Router } = require('express');

const router = Router();

const { equiposGet, equiposGetCliente,
    equiposPost, equiposPut, equiposDelete } = require('../controladores/equiposCon');
const { validarAuth } = require('../midlewares/validarAuth');


router.post('/', equiposPost );
router.get('/:cliente', equiposGetCliente);
router.get('/', validarAuth, equiposGet);
router.put('/', equiposPut);
router.delete('/:id', equiposDelete);




module.exports = router;
