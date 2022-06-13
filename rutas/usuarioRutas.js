const { Router } = require('express');

const router = Router();

const {
    usuariosRegistro, usuariosListar, usuariosLogin,
    usuariosPut, usuariosDelete, usuariosListarCompleto
} = require('../controladores/usuariosCon');


router.post('/reg', usuariosRegistro);
router.post('/log', usuariosLogin);

router.get('/', usuariosListar);

router.put('/', usuariosPut);
router.delete('/:id', usuariosDelete);
router.get('/tabla', usuariosListarCompleto);





module.exports = router;