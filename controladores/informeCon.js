const { response, request }  = require('express');
const  Informe  = require('../modelos/informe');
const { generarPdfInforme } = require("../helpers/generarPdfInforme");

const mongoose = require("mongoose");
const multer = require('multer');
const express = require('express');
const  cloudinary  = require('../helpers/cloudinary');
const Numero = require('../modelos/numero');
const Cliente = require('../modelos/cliente');
const { getNextInformeNumber } = require('../helpers/numero');
const { subirBufferACloudinary } = require('../helpers/uploadCloudinary');
const bodyParser = require('body-parser');
const app = express();
 
const { enviarMailsConAdjunto } = require("../helpers/mailer");
//const { urlInforme } = require ("../views/pdf_informe");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const API_BASE = process.env.API_BASE;



const fs = require('fs');

const nodemailer = require("nodemailer");


const path = require('path');
const logoBase64 = require("/home/ricardo/Dropbox/serverING/helpers/logoBase64/logoBase64");

require('dotenv').config();


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
      emails:req.body.emails,
      cliente:req.body.cliente,
      tecnicos: req.body.tecnicos,
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
}; //fin crearInforme

const subirImagenesInforme = async (req, res) => {
   console.log("Estoy en subirImagenes");
   try {
     const { id } = req.params;

     console.log("📸 subirImagenesInforme ID:", id);
     
     if(!mongoose.Types.ObjectId.isValid(id)){
      return res.status(400).json({
         ok: false,
         error: "ID invalido"
      });
     }
     const informe = await Informe.findById(id);
     if(!informe){
      return res.status(404).json({
         ok: false,
         error: "Informe no encontrado"
      });
     }
     const archivoAntes = req.files?.fotoAntes || [];
     const archivoDespues = req.files?.fotoDespues || [];

     const todosLosArchivos = [
      ...archivoAntes.map((file,i) => ({
         file,
         tipo: "antes",
         index: 1
      })),
      ...archivoDespues.map((file, i) => ({
         file,
         tipo: "despues",
         index: 1
      }))
     ];

     if(todosLosArchivos.length === 0 ) {
      return res.status(400).json({
         ok: false,
         error: "No se recibieron imagenes"
      });
     }

     const nuevosLinks = [];
     for( const item of todosLosArchivos) {
      const { file, tipo, index } = item;
      const publicId = `IS_${informe.numero}_${tipo}_${Date.now()}_${index + 1}`;

      const resultado = await subirBufferACloudinary(
         file.buffer,
         "informes_servicio",
         publicId
      );
      nuevosLinks.push(resultado.secure_url);
     }
     informe.links = [...(informe.links || [] ), ...nuevosLinks];
     await informe.save();

     return res.json({
      ok: true,
      msg: "Imágenes subidas correctamente",
      links: informe.links,
      nuevosLinks
    });
   } catch (error){
      console.error("Error subirImagenesInforme:", error);
      return res.status(500).json({
         ok: false,
         error: error.message
      });
   }
}; //fin subirImagensInforme

const obtenerVistaPdfInforme = async (req, res) => {
   console.log("Hola!, desde ObtenerPdfInforme");
   

   try {
      const { id } = req.params;
       if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("ID inválido");
    }

    const informe = await Informe.findById(id).lean();
      if (!informe) {
         return res.status(404).json({
            ok: false,
            error: "Informe no encontrado"
         });
      }

      return res.render("pdf_informe", {
         informe,
         logoBase64
      });
   }catch (error) {
      console.error("Error renderizando vista PDF:", error);
   }
       
} //fin obtenerVistaPdfInforme 


const enviarInformePorEmail = async (req, res) => {
   console.log('estoy en enviarInformePorEmail');
   
   
   try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("ID inválido");
    }

     const informe = await Informe.findById(id).lean();
      if (!informe) {
      return res.status(404).json({
        ok: false,
        error: "Informe no encontrado"
      });
    }
    const emailsInforme = Array.isArray(informe.emails)
      ? informe.emails.map( x => String(x).trim()).filter(Boolean) : [];

   const emailIngroup = String(process.env.EMAIL_ARCHIVO_INGROUP || "").trim();

   const destinatarios = [
      ...new Set([
         ...emailsInforme,
         emailIngroup
      ].filter(Boolean))
   ];
   if(!destinatarios.length) {
      return res.status(400).json({
         ok: false,
         error: "No hay destinatarios configurados"
      });
   }

   const API_BASE = process.env.API_BASE;
    
    const urlInforme = `${API_BASE}/informes/pdf/informe/${id}`;

    console.log("Generando PDF desde:", urlInforme);

    const pdfBuffer = await generarPdfInforme(urlInforme);
    console.log("PDF generado, bytes:", pdfBuffer.length);
    const carpetaPDF = path.join(__dirname, "..", "pdfs");
    if(!fs.existsSync(carpetaPDF)) {
      fs.mkdirSync(carpetaPDF, { recursive: true});
    }


      const numeroFormateado = String(informe.numero || 0).padStart(6, "0");
      const nombreArchivo = `Informe_${numeroFormateado}.pdf`;
      const outputPath = path.join(carpetaPDF, nombreArchivo);

      fs.writeFileSync(outputPath, pdfBuffer);
      console.log("PDF guardado en:", outputPath);

      const html =  `
       <p>Estimado cliente:</p>
         <p>Adjuntamos el <b> Informe de Servicio N° ${informe.numero}</b>.</p>
         <p><b>Cliente:</b> ${informe.cliente || ""}</p>
         <p><b>Fecha:</b> ${informe.fechaFin }</p>
            <br>
         <p>Saludos cordiales.</p>
         p><b>INGroup S.R.L.</b></p>`;

      const info = await enviarMailsConAdjunto({
         to: destinatarios.join(","),
         subject: `Informe de Servicio N° S{informe.numero} - ${informe.cliente || ""}`,
         html,
         filename: nombreArchivo,
         pdfBuffer
      
   });

      await Informe.findByIdAndUpdate (id, {
         rutaPdf: outputPath,
         enviado: true,
         fechaEnvio: new Date()
   });
   
   return res.json({
      ok: true,
      msg: "Informe enviado por email correctamente",
      destinatarios,
      archivo: nombreArchivo,
      messageId: info.messageId
    });

   } catch (error) {
      
    console.error("Error en enviarInformePorEmail:", error);
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
} //cierra enviarInformePorEmail

const generarPdfInformeDescarga = async (req, res) => {
   try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("ID inválido");
    }

     const informe = await Informe.findById(id).lean();
      if (!informe) {
         return res.status(404).json({
            ok: false,
            error: "Informe no encontrado"
         });
      }

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const urlInforme = `${baseUrl}/informes/pdf/informe/${id}`;

      console.log("Generando PDF desde:", urlInforme);

      const pdfBuffer = await generarPdfInforme(urlInforme)
   

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", pdfBuffer.length);
      res.setHeader(
      "Content-Disposition",
      `inline; filename="Informe_${informe.numero}.pdf"`
    );

      return res.end(pdfBuffer);
   } catch (error) {
      console.error("Error generando PDF:", error);
      return res.status(500).send("Error generandi PDF");
   }

};






    
module.exports = {
   informesGet, crearInforme,
   informesGetDatos, informesDelete,
   informesPut, obtenerInformePorId,
   subirImagenesInforme, 
   enviarInformePorEmail,
   obtenerVistaPdfInforme,
   generarPdfInformeDescarga
   
}

