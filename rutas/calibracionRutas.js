const express = require("express");
const router = express.Router();

const { crearCertificado } = require('../controladores/calibracionesCon');
const { listarCertificados } = require('../controladores/calibracionesCon');
const { obtenerCertificadoPorId } = require('../controladores/calibracionesCon');


  
  router.post("/calibracion",crearCertificado);

  router.get("/calibracion", listarCertificados);

  router.get("/calibracion/:id", obtenerCertificadoPorId);


module.exports = router;