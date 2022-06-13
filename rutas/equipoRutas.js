const { Router } = require('express');

const router = Router();

const { equiposGet, equiposGetCliente,
    equiposPost, equiposPut, equiposDelete } = require('../controladores/equiposCon');


router.post('/', equiposPost );
router.get('/:cliente', equiposGetCliente);
router.get('/', equiposGet);
router.put('/', equiposPut);
router.delete('/:id', equiposDelete);




module.exports = router;
