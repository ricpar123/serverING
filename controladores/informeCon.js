const { response, request }  = require('express');
const  Informe  = require('../modelos/informe');


const mongoose = require("mongoose");
const multer = require('multer');
const express = require('express');
const  cloudinary  = require('../helpers/cloudinary.js');
const Numero = require('../modelos/numero');
const Cliente = require('../modelos/cliente');
const { getNextInformeNumber } = require('../helpers/numero');
const bodyParser = require('body-parser');
const app = express();

 
const { enviarMailsConAdjunto } = require("../helpers/mailer");
//const { urlInforme } = require ("../views/pdf_informe");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const API_BASE = process.env.API_BASE;

const { generarPdfBuffer } = require('../helpers/generarPdfBuffer.js');


const fs = require('fs');

const nodemailer = require("nodemailer");


const path = require('path');
const logoBase64 = require("../helpers/logoBase64/logoBase64");

const { enviarCorreo } = require('../helpers/enviarCorreo.js');

require('dotenv').config();
const {validarListaDeEmails} = require('../helpers/validator.js');
const { validarEmail } = require('../helpers/validarEmail.js');


let number = 0;

cloudinary.config({ 
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET,
});

//Configurar NodeMailer
const transporter = nodemailer.createTransport({
   host: process.env.SMTP_HOST,
   port: process.env.SMTP_PORT,
   auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,

   }
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



async function subirACloudinary(base64Data) {
   try {
      const res = await cloudinary.uploader.upload(base64Data, {
         folder: "Ingroup_fotos",
         resource_type: "image"
      });
      return res.secure_url;

   } catch (error) {
      console.error("Error subiendo imagen");
      throw error;
   }
}



const informesGet = async (req, res = response) =>{

    try {
      
        const informes = await Informe.find({}, {
         
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
  
   console.log("🔥🔥🔥 CREAR INFORME NUEVO V3 🔥🔥🔥");
  
   try {
   
         const numero = await getNextInformeNumber();
            console.log("nro de informe:", numero);
         const { 
            cliente, tecnicos, equipo, marca, modelo, serie, motivo, tipoTrabajo, presupuesto,
            horaInicio, horaFin, fechaInicio, fechaFin, servicio, obs, recibido, firma, firmaT,
            status, repuestos} = req.body;

         //obtener y sgregsr links de imagenes al payload

         let utlAntes = [];
         let urlDespues = [];

        const nuevoInforme = new Informe ({
            numero: numero,
            cliente: cliente,
            tecnicos: tecnicos,
            equipo: equipo,
            marca: marca,
            modelo: modelo,
            serie: serie,
            motivo: motivo,
            tipoTrabajo: tipoTrabajo,
            presupuesto: presupuesto,
            horaInicio: horaInicio,
            horaFin: horaFin,
            fechaInicio: fechaInicio,
            fechaFin : fechaFin,
            servicio: servicio,
            obs: obs,
            recibido: recibido,
            firma: firma,
            firmaT: firmaT,
            status: status,
            repuestos: repuestos
         });
        
         const informeGuardado = await nuevoInforme.save();
         console.log("Informe creado con éxito:", informeGuardado._id, informeGuardado.numero);
            return res.status(201).json({
               ok: true,
               resultado: {
                  informe: {
                     id: informeGuardado._id,
                     numero: informeGuardado.numero
                  }
               }
            });
            
      
   } catch (error) {
         console.log("Error en guardarInforme", error);
      } 

      
} //Fin crearInforme

//Ya tenemos el informe, ahora vamos a subir la imagen a cloudinary y guardar el link en el informe

 const enviarImgServer = async (req, res) => {
      try {
         const { id } = req.params;
         console.log("ID informe:", id);
         console.log("FILES:", req.files);

         if (!id) {
               return res.status(400).json({
                  ok: false,
                  msg: "No se recibió el ID del informe"
               });
         }
         const informe = await Informe.findById(id);

         if (!informe) {
               return res.status(404).json({
                  ok: false,
                  msg: "Informe no encontrado"
               });
         }
         
         let archivo;
         let tipo;

         if (req.files?.fotoAntes?.length) {
               archivo = req.files.fotoAntes[0];
               tipo = "fotoAntes";
         }

         if (req.files?.fotoDespues?.length) {
            archivo = req.files.fotoDespues[0];
            tipo = "fotoDespues";
         }

         if (!archivo) {
            return res.status(400).json({
                ok: false,
                msg: "No se recibió ninguna imagen"
            });
         }

            console.log("Tipo:", tipo);
            console.log("Archivo:", archivo.originalname);
            console.log("Tamaño:", archivo.size);

        // Convertimos el Buffer que recibe Multer
        // a Base64 porque subirACloudinary() trabaja con Base64.
        const base64Data =
            `data:${archivo.mimetype};base64,` +
            archivo.buffer.toString("base64");

        const link = await subirACloudinary(base64Data);

        console.log("Link Cloudinary:", link);

        if (tipo === "fotoAntes") {

            if (!Array.isArray(informe.fotosAntes)) {
                informe.fotosAntes = [];
            }

            informe.fotosAntes.push(link);
            console.log("linkFotosAntes:", link);

         } else {

            if (!Array.isArray(informe.fotosDespues)) {
                informe.fotosDespues = [];
            }

            informe.fotosDespues.push(link);
            console.log("linkFotosDespues:", link);;
         }

         await informe.save();

         console.log(
               "Links guardados:",
               informe.fotosAntes,
               informe.fotosDespues,
               link
         );
        

            return res.status(200).json({
               ok: true,
               msg: "Imagenes guardadas correctamente en Cloudinary y en el informe",
               tipo,
               link
            });
      } catch (error) {
            console.error("Error en enviarImgServer:", error);

            return res.status(500).json({
                  ok: false,
                  msg: "Error al subir la imagen",
                  error: error.message
            });
         }
   };

   const generarPdfInforme = async (req, res) => {
      try {
         const { id } = req.params;
         console.log("generarPdfInforme id:", id);

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
         
         console.log("Fotos antes para pdf:", informe.fotosAntes);
         console.log("Fotos despues para pdf:", informe.fotosDespues);

         const pdfBuffer = await generarPdfBuffer(informe);
      
         res.setHeader('Content-Type', 'application/pdf');
         res.setHeader('Content-Disposition', `inline; filename=informe_${informe.numero}.pdf`);
         
         return res.send(pdfBuffer); 

      } catch (error) {
            console.error("Error en generarPdfInforme:", error);
            return res.status(500).json({
               ok: false,
               error: error.message
            });
         }
   };

  

   const prepararEnvioDeCorreo = async (req, res) => {
      try {
         const { id } = req.params;
         console.log("prepararEnvioDeCorreo id:", id);

         // ==========================================
         // 1. VALIDAR ID
         // ==========================================

         if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
               ok: false,

                error:
                    "ID inválido de Mongoose."
            });
            
         }

         // ==========================================
         // 2. BUSCAR INFORME DEFINITIVO
         // ==========================================

         const informe = await Informe.findById(id).lean(); //ya tengo informe

         if (!informe) {
            return res.status(404).json({
                ok: false,

                resultado: {
                    OK: false,
                    error:
                    "Informe no encontrado."
                },

                
            });
         }
               console.log(
                  "Informe encontrado:",
                  informe.numero
               );
         

        // ==========================================
        // 3. OBTENER CLIENTE
        // ==========================================

        /*
         * informe.cliente contiene solamente
         * el nombre del cliente.
         *
         * Ajustá "nombre" si en tu modelo Cliente
         * el campo se llama de otra manera.
         */
                 
         const cliente = await Cliente.findOne({
            nombre : informe.cliente
         }).lean();

         if(!cliente) {
            return res.status(404).json({
                ok: false,
                
                error: "Cliente no encontrado."

            });
         }

         console.log("Cliente encontrado:", cliente.nombre);


         

            // ==========================================
            // 4. GENERAR PDF
            // ==========================================

            let pdfInforme;

            try {
               pdfInforme = await generarPdfBuffer(informe); // ya tengo pdf
            } catch (errorPDF) {
               console.error("Error generando PDF:", errorPDF);
               return res.status(500).json({
                  ok:false,
                  error:"No fue posible generar el PDF del informe",
                
               });
            } 

            // =====================================================
            // 5. VALIDAR PDF
            // =====================================================

         if (!pdfInforme  || !Buffer.isBuffer(pdfInforme) || pdfInforme.length === 0) {

            console.error("PDF invalido o vacio");

            return res.status(500).json({
               ok: false,
               resultado:"No fue posible generar el PDF drl informe."
            });

            
         }
               console.log("PDF generado corectamente");
               console.log("Tamaño del PDF:", pdfInforme.length);

        // =====================================================
        // 6. ENVIAR CORREO
        // =====================================================

        const resultadoCorreo =
            await enviarCorreo({

                informe,

                cliente,

                pdfBuffer:
                    pdfInforme,

                emailsAdicionales:
                    []
            });


        console.log(
            "Resultado del correo:",
            resultadoCorreo
        );


        // =====================================================
        // 7. RESPUESTA FINAL AL FRONTEND
        //  Se comtenplan tres tipos de resultados: Exito, Parcial y Error.    
        // =====================================================

        
        return res.status(200).json({

            ok: true,

            resultado: {

                pdf: {
                    ok: true
                },

                correo: {

                    estado:
                        resultadoCorreo.estado,

                    enviado:
                        resultadoCorreo.enviado,

                    mensaje:
                        resultadoCorreo.mensaje,

                    emailsValidos:
                        resultadoCorreo.emailsValidos || [],

                    emailsInValidos:
                        resultadoCorreo.emailsInValidos || [],

                    emailsClienteAceptados:
                        resultadoCorreo.emailsClienteAceptados || [],

                    emailsClienteRechazados:
                        resultadoCorreo.emailsRechazadosSmtpCliente || [],

                    aceptadosSmtp:
                        resultadoCorreo.aceptadosSmtp || [],

                    rechazadosSmtp:
                        resultadoCorreo.rechazadosSmtp || [],

                    copiaIngroupEnviada:
                        resultadoCorreo.copiaIngroupEnviada || false,

                    messageId:
                        resultadoCorreo.messageId || null
                },

                informe: {

                    id:
                        informe._id,

                    numero:
                        informe.numero,

                    cliente:
                        informe.cliente
                }
            }
        });


    } catch (err) {

        console.error(
            "Error en generarEnvioDeCorreo:",
            err
        );


        // =====================================================
        // 8. ERROR GENERAL DEL CONTROLLER
        // =====================================================

        return res.status(500).json({

            ok: false,

            resultado: {

                pdf: {
                    ok: false
                },

                correo:
                    null
            },

            error:
                "Error al finalizar el informe.",

            detalle:
                err.message
        });
    }
};

   
module.exports = {
   informesGet, crearInforme,
   informesGetDatos, informesDelete,
   informesPut, obtenerInformePorId,
   enviarImgServer, generarPdfInforme,
   subirACloudinary, prepararEnvioDeCorreo
   
}

