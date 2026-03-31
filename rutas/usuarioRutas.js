const { Router } = require('express');
const router = Router();


const {
    usuariosRegistro, usuariosListar, usuariosLogin,
    usuariosPut, usuariosDelete, usuariosListarCompleto, usuariosPutInactivar
} = require('../controladores/usuariosCon');

const { validarAuth } = require('../midlewares/validarAuth');


router.post('/reg', usuariosRegistro);
router.post('/log', usuariosLogin);

router.get('/', usuariosListar);

router.put('/:id', usuariosPut);
router.put('/:id/inactivar', usuariosPutInactivar);
router.delete('/:id', usuariosDelete);
router.get('/tabla', usuariosListarCompleto);





module.exports = router;
