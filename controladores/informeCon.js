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
         cliente: 1, numeroInforme: 1, fecha: 1, 
        });

       

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


const informesPost = async (req, res)=> {

  let fotosAntes = [];
  let fotosDespues = [];
  var numeroInforme = 0;
  
   const doc = new PDFDoc({size:'A4'});
   doc.pipe(fs1.createWriteStream('informe.pdf'));

  
   const e0 = 'empresaingroup@gmail.com';//simula ingroup
   const e1 = 'carlos.andino71@hotmail.com';//simula santi
   
   try {

      numeroInforme =  await getNextInformeNumber();
      console.log('nro del informe: ', numeroInforme);

   } catch (error) {
      console.log('error', error);
        
      }

      //Obtener datos y fotos
      //1) Datos: vienen en el req.body.data (string jason)
      try {
         const datos = req.body.data ? JSON.parse(req.body.data) : req.body;
      //2) fotos: vienen en req.files
          fotosAntes = req.files['fotosAntes'] || [];
          fotosDespues = req.files['fotosDespues'] || [];

         console.log('datos: ', datos);
         console.log('fotos antes: ', fotosAntes.length);
         console.log('fotos despues: ', fotosDespues.length);
         console.log('ANTES', fotosAntes);
         console.log('DESPUES', fotosDespues);
         
      
      } catch (error) {
         console.log('error', error);
      } 

      //Subir fotos a Cloudinary
      console.log('Subiendo fotos a Cloudinary...');

      try {
           
      const uploadPromisesAntes = fotosAntes.map((file, index) => {
         return new Promise((resolve, reject) => {
        // Crear nombre personalizado: tipo_numero_originalName_index
        const customName = `ANTES_${numeroInforme}_${file.originalname.split('.')[0]}_${index}`;
        console.log('CustomName:', customName);
        const stream = cloudinary.uploader.upload_stream(
          { 
            folder: 'Ingroup/informes', 
            public_id: customName, // AQUÍ SE RENAMEA
            resource_type: 'auto' 
          },
          (error, result) => {
            if (error) reject(error);
            resolve(result.secure_url);
          }
        ).end(file.buffer);
        
     
        
      });
    });

    const results = await Promise.all(uploadPromisesAntes);
    res.json({
      ok: true,
      msg: 'Fotos ANTES subidas correctamente',
      urls: results
    });
    
   }  catch (error) {
         res.status(500).json({
           ok: false,
           msg: 'Error al subir las fotos a Cloudinary',
           error: error.message
         });
      }
}
      
      
      
      
      
     /* 
      const urlAntes = await uploadMany(fotosAntes, {numeroInforme, tipo:'ANTES'});
         const urlDespues = await uploadMany(fotosDespues,  {numeroInforme, tipo: 'DESPUES'});

         console.log('urlAntes', urlAntes);
         console.log('urlDespues', urlDespues);
      
         //Guardar en Mongodb datos y urls de las fotos
         //Elaborar PDF del informe


         //enviar email al Cliente e Ingroup
   


      }; 

    */     
        

         


      


      


     
       

      
   





module.exports = {
   informesGet, informesPost,
   informesGetDatos, informesDelete,
   informesPut, obtenerInformePorId
}

