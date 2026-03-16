const { response, request }  = require('express');
const  Informe  = require('../modelos/informe');
const mongoose = require("mongoose");
const multer = require('multer');
const express = require('express');
const  cloudinary  = require('cloudinary').v2;
const Numero = require('../modelos/numero');
const Cliente = require('../modelos/cliente');
const { getNextInformeNumber } = require('../helpers/numero');
const { uploadMany } = require('../helpers/uploadCloudinary');
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const dayjs = require('dayjs');

const fs = require('fs').promises;
const fs1 = require('fs');
const nodemailer = require("nodemailer");

const PDFDoc = require('pdfkit');
const path = require('path');
const { resolve } = require('dns');
const { rejects } = require('assert');


let number = 0;

cloudinary.config({ 
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuración de Multer para almacenar las imágenes en la carpeta 'uploads'
const storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
    
});

const informesGet = async (req, res = response) =>{

    try {
      
        const informes = await Informe.find({}, {
         cliente: 1, numero: 1, fechaFin: 1, 
        });

       console.log('informes:', informes);

        return res.status(201). json({
            ok: true,
           
          informes
        });

       } catch (error) {
        console.log('error');
        return res.status(500).json({
            ok: false,
            msg: 'Error en GET informes total'
        });
    
      }
}


const informesGetDatos = async(req, res = response) =>{
      let inicio = req.params.inicio;
      let fin = req.params.fin;
      let cliente = req.params.cliente;

      let ini = new Date(inicio);
      let iniSt = ini.toString();
      let iniS = ini.toUTCString();
      let iniPartes = iniS.indexOf(3);
      iniS[18] = '0';
      console.log('new Date: ', ini, iniSt, iniS[18]);
      console.log('por partes: ', iniPartes);

     
   	if (inicio == 'undefined' && fin == 'undefined' && cliente != ''){
      
         try {
            const informes = await Informe.find({cliente: cliente});
            return res.send(200, {informes});
         
         } catch (error) {
            console.log('error');
           return res.status(500).json({
               ok: false,
               msg: 'Error en GET informes por cliente'
           });
         
         }
      }else if(cliente == 'undefined') {
      
         try {
            console.log('estoy en cliente = undefined');
            const informes = await Informe.find({fecha:{$gte:new Date(inicio), $lte:new Date(fin)}});
            return res.send(200, {informes});
         } catch (error) {
            console.log('error');
           return res.status(500).json({
               ok: false,
               msg: 'Error en GET informes por fecha'
           });
   
            
            }
         }else{
            try {
               const informes = await Informe.find({cliente: cliente, fecha:{$gte:inicio, $lte:fin}}); 
               return res.status(200).json({
                  ok: true,
                  msg:"Request GET exitoso",
                  informes
               });
              
            
            } catch (error) {
   
               console.log('error');
               return res.status(500).json({
                   ok: false,
                   msg: 'Error en GET informes por fecha'
               });
               
            }
           
   
         }
}


  
   const obtenerInformePorId = async (req, res) => {
      try {
         const { id } = req.params;

         console.log("GET INFORME POR ID:", id);

         if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
               ok: false,
               error: "ID inválido"
            });
         }

         const informe = await Informe.findById(id).lean();

         if (!informe) {
            return res.status(404).json({
               ok: false,
               error: "Informe no encontrado"
            });
         }

         console.log("Informe obtenido:", informe);

            return res.json({
               ok: true,
               informe
            });

      } catch (error) {
            console.error("Error en obtenerInformePorId:", error);
               return res.status(500).json({
                  ok: false,
                  error: error.message
               });
         }
};




const informesPut = async (req, res) => {
    
    

   const {id, at} = req.body;

   try {

      const dbInforme = await Informe.findByIdAndUpdate(id, {at: at }, {new: true});
   
  
   
      res.json({
       msg: 'informe modificado, agregado el at',
       dbInforme
       
   });
      
   } catch (error) {
      console.log('error en la modificacion');
          return res.status(500).json({
              ok: false,
              msg: 'Error en la modificacion del informe'
          });
   }
   

   
}


const informesDelete = async(req, res) => {
   const { id } = req.params;
   console.log('id del informe: ', id);
  

   try {
     
       const informe = await Informe.findByIdAndDelete( id );

      

       return res.status(201). json({
           ok: true,
         msg:'Informe eliminado' 
         
       });

   } catch (error) {
       console.log('error en la eliminacion');
       return res.status(500).json({
           ok: false,
           msg: 'Error en la eliminacion del informe'
       });
   }

  
   
}

const crearInforme = async (req, res) => {
   console.log("BODY RECIBIDO:", req.body);
   console.log("🔥🔥🔥 CREAR INFORME NUEVO V3 🔥🔥🔥");
   try {
   
   const numero = await getNextInformeNumber();
   const nuevoInforme = new Informe ({
      numero,
      cliente: req.body.cliente,
      tecnico: req.body.tecnico,
      equipo: req.body.equipo,
      marca: req.body.marca,
      modelo: req.body.modelo,
      serie: req.body.serie,
      motivo: req.body.motivo,
      tipoTrabajo: req.body.tipoTrabajo,
      diasT: req.body.diasT,
      presupuesto: req.body.presupuesto,
      oferta: req.body.oferta,
      horaInicio: req.body.horaInicio,
      horaFin: req.body.horaFin,
      fechaInicio: req.body.fechaInicio,
      fechaFin : req.body.fechaFin,
      servicio: req.body.servicio,
      obs: req.body.obs,
      recibido: req.body.recibido,
      firma: req.body.firma,
      firmaT: req.body.firmaT,
      status: req.body.status,
      repuestos: req.body.repuestos,
      links: []
    });

    await nuevoInforme.save();

    return res.status(201).json({
      ok: true,
      msg: "crearInforme V3 ejecutado",
      informeId: nuevoInforme._id,
      numero: nuevoInforme.numero,
      bodyRecibido: req.body
    });

    } catch (error) {
    console.error("Error crearInforme:", error);
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
};
   


module.exports = {
   informesGet, crearInforme,
   informesGetDatos, informesDelete,
   informesPut, obtenerInformePorId
}

