const { Router } = require('express');

const router = Router();

const {
    numerosRegistro, numerosActualizar
} = require('../controladores/numerosCon');


router.post('/', numerosRegistro);

router.put('/', numerosActualizar)




module.exports = router;