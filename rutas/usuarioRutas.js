const { Router } = require('express');
const router = Router();

const {
    usuariosRegistro, usuariosListar, usuariosLogin,
    usuariosPut, usuariosDelete, usuariosListarCompleto
} = require('../controladores/usuariosCon');

const { validarAuth } = require('../midlewares/validarAuth');


router.post('/reg', validarAuth, usuariosRegistro);
router.post('/log', usuariosLogin);

router.get('/', validarAuth ,usuariosListar);

router.put('/', usuariosPut);
router.delete('/:id', usuariosDelete);
router.get('/tabla', validarAuth, usuariosListarCompleto);





module.exports = router;