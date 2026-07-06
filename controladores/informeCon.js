const { response, request }  = require('express');
const  Informe  = require('../modelos/informe');


const mongoose = require("mongoose");
const multer = require('multer');
const express = require('express');
const  cloudinary  = require('../helpers/cloudinary');
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



const fs = require('fs');

const nodemailer = require("nodemailer");


const path = require('path');
const logoBase64 = require("../helpers/logoBase64/logoBase64");
const puppeteer  = require('puppeteer');

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
   //console.log("datos", req.body);
    console.log("🔥🔥🔥 CREAR INFORME NUEVO V3 🔥🔥🔥");
  try {
   
    const numero = await getNextInformeNumber();
    console.log("nro de informe:", numero);
    const { 
      cliente, tecnicos, equipo, marca, modelo, nroSerie, motivoVisita, tipoTrabajo, presupuesto,
      horaInicio, horaFin, fechaInicio, fechaFin, servicio, obs, recibido, firma, firmaT,
      status, repuestos, fotosAntes, fotosDespues } = req.body;
   
   //subir fotosAntes a Cloudinary
    let urlAntes = [];
      if(fotosAntes  && fotosAntes.length > 0) 
    {
      const promesasAntes = fotosAntes.slice(0,3).map(foto => subirACloudinary(foto));
      urlAntes = await Promise.all(promesasAntes);
      console.log("url Antes", urlAntes);
    } 
    //subir fotosDespues a Cloudinary
  
    let urlDespues = [];
      if(fotosDespues  && fotosDespues.length > 0) 
    {
      const promesasDespues = fotosDespues.slice(0,3).map(foto => subirACloudinary(foto));
      urlDespues = await Promise.all(promesasDespues);
      console.log("url Despues:", urlDespues);
    }  

    //Guardar Informe con el agregado de los links de las imagenes

  
    const nuevoInforme = new Informe ({
      numero: numero,
      cliente: cliente,
      tecnicos: tecnicos,
      equipo: equipo,
      marca: marca,
      modelo: modelo,
      serie: nroSerie,
      motivo: motivoVisita,
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
      repuestos: repuestos,
      fotosAntes: urlAntes,
      fotosDespues: urlDespues
      
    });

    await nuevoInforme.save();
   

    return res.status(201).json({
      ok: true,
      msg: "crearInforme V3 ejecutado",
      nuevoInforme: nuevoInforme
     
    });

  } catch (error) {
      console.error("Error crearInforme:", error);
      return res.status(500).json({
        ok: false,
        error: error.message
      });
    }
}; //fin crearInforme

function generarHtmlInforme(informe) { 
  const logoBase64 = require("../helpers/logoBase64/logoBase64");
  
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />

    <style>
      body {
        font-family: Arial, sans-serif;
        font-size: 11px;
        color: #222;
        margin: 0;
      }

      .header {
        display: grid;
        grid-template-columns: 1.35fr 1fr;
        align-items: center;
        border-bottom: 2px solid #0d6efd;
        padding-bottom: 10px;
        margin-bottom: 14px;
      }

      .logo-box {
        display: flex;
        align-items: center;
        gap: 18px;
      }

      .logo-box img {
        width: 125px;
        height: auto;
      }

      .empresa-info {
        font-size: 10.5px;
        line-height: 1.25;
        color: #444;
      }

      .informe-box {
        text-align: right;
      }

      .informe-titulo {
        font-size: 20px;
        font-weight: bold;
        color: #0d6efd;
        margin-bottom: 4px;
      }

      .informe-numero {
        font-size: 14px;
        font-weight: bold;
        color: #222;
      }

      
      .seccion {
        margin-top: 10px;
        border-top: 1px solid #ccc;
        padding-top: 6px;
        page-break-inside: avoid;
      }

      .seccion h3 {
        font-size: 15px;
        color: #0d6efd;
        margin: 0 0 6px 0;
      }

      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px 14px;
      }

      .campo {
        margin-bottom: 3px;
      }

      .label {
        font-weight: bold;
      }

      .texto-largo {
        border: 1px solid #ddd;
        padding: 6px;
        min-height: 35px;
        max-height: 85px:
        overflow: hidden;
        white-space: pre-wrap;
      }

      .fotos {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .fotos img {
        width: 31%;
        height: 120px;
        object-fit: cover;
        border: 1px solid #ccc;
      }

      .firmas {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 25px;
        margin-top: 8px;
        page-break-inside: avoid;
      }

      .firma-box {
        max-width: 100%;
        height: 70px;
        object-fit: contain;
        border-bottom: 1px solid #000;
      }

      .firma-box img {
        max-width: 100%;
        height: 100px;
        object-fit: contain;
        border-bottom: 1px solid #000;
      }

      .footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid #cfcfcf;
        padding-top: 6px;
        width: 100%;
        text-align: center;
        font-size: 9px;
        color: #777;
      }

      .footer strong {
        color: #0d6efd;
      }
      
      .footer-left strong {
        color: #0d6efd;
      }

      .heart {
        color: red;
      }

    </style>
  </head>

  <body>

    <div class="header">
      <div class="logo-box">
        <img  class="logo" src="${logoBase64}" alt="Logo" />

        <div class="empresa-info">
          <strong>Ingroup S.R.L.</strong><br>
          María F. González 820 c/ Dr. Molinas<br>
          Teléfonos: (0981) 401 850 / (0981) 542 729<br>
          e-mail: empresaingroup@gmail.com<br>
          Fdo. de la Mora - Paraguay
        </div>
      </div>

      <div class="informe-box">
        <div class="informe-titulo">INFORME DE SERVICIO</div>
        <div class="informe-numero">N° ${informe.numero || ""}</div>
      </div>
    </div>

      

    <div class="seccion">
      <h3>Datos Generales</h3>
      <div class="grid">
        <div class="campo"><span class="label">Cliente:</span> ${informe.cliente || ""}</div>
        <div class="campo"><span class="label">Técnicos:</span> ${(informe.tecnicos || []).join(", ")}</div>
        <div class="campo"><span class="label">Tipo de trabajo:</span> ${informe.tipoTrabajo || ""}</div>
        <div class="campo"><span class="label">Motivo visita:</span> ${informe.motivo || ""}</div>
      </div>
    </div>

    <div class="seccion">
      <h3>Equipo Intervenido</h3>
      <div class="grid">
        <div class="campo"><span class="label">Equipo:</span> ${informe.equipo || ""}</div>
        <div class="campo"><span class="label">Marca:</span> ${informe.marca || ""}</div>
        <div class="campo"><span class="label">Modelo:</span> ${informe.modelo || ""}</div>
        <div class="campo"><span class="label">Nro. Serie:</span> ${informe.serie || ""}</div>
      </div>
    </div>

    <div class="seccion">
      <h3>Fechas y Horarios</h3>
      <div class="grid">
        <div class="campo"><span class="label">Fecha inicio:</span> ${informe.fechaInicio || ""}</div>
        <div class="campo"><span class="label">Fecha fin:</span> ${informe.fechaFin || ""}</div>
        <div class="campo"><span class="label">Hora inicio:</span> ${informe.horaInicio || ""}</div>
        <div class="campo"><span class="label">Hora fin:</span> ${informe.horaFin || ""}</div>
      </div>
    </div>

    <div class="seccion">
      <h3>Trabajo Realizado</h3>
      <div class="texto-largo">${informe.servicio || ""}</div>
    </div>

    <div class="seccion">
      <h3>Observaciones</h3>
      <div class="texto-largo">${informe.obs || ""}</div>
    </div>

    <div class="seccion">
      <h3>Estado Final</h3>
      <div class="grid">
        <div class="campo"><span class="label">Status:</span> ${informe.status || ""}</div>
        <div class="campo"><span class="label">Necesita repuestos:</span> ${informe.repuestos || ""}</div>
        <div class="campo"><span class="label">Presupuesto:</span> ${informe.presupuesto || ""}</div>
        <div class="campo"><span class="label">Recibido por:</span> ${informe.recibido || ""}</div>
      </div>
    </div>

    <div class="seccion">
      <h3>Fotos Antes</h3>
      <div class="fotos">
        ${(informe.fotosAntes || []).map(url => `
          "${url}">`).join("")}
      </div>
    </div>

    <div class="seccion">
      <h3>Fotos Después</h3>
      <div class="fotos">
        ${(informe.fotosDespues || []).map(url => `"${url}">`).join("")}
      </div>
    </div>

    <div class="seccion">
      <h3>Firmas</h3>

      <div class="firmas">
        <div class="firma-box">
          ${informe.firma ? `<img src="${informe.firma}">` : ""}
          <div>Firma Cliente</div>
        </div>

        <div class="firma-box">
          ${informe.firmaT ? `<img src="${informe.firmaT}">` : ""}
          <div>Firma Técnico</div>
        </div>
      </div>
    </div>

    <div class="footer">
          <div class="footer-left">
            Sistema desarrollado con ❤️ por <strong>freeSoft</strong>
            @2026
          </div>

        <div class="footer-right">
            Pagina <span class="pageNumber"></span>
        </div>
      </div>
    </div>

  </body>
  </html>
  `;
}







const generarPdfInforme = async (req, res) => {
   console.log("Hola!, desde generarPdfInforme");
   console.log("tipo generarHtmlInforme:", typeof generarHtmlInforme);


  

    try {
    const { id } = req.params;

    const informe = await Informe.findById(id);

    if (!informe) {
      return res.status(404).json({
        ok: false,
        msg: "Informe no encontrado"
      });
    }

      console.log("informe pdf:", informe);
      console.log("nor. de Serie", informe.serie);
      console.log("recibido por:", informe.recibido);
      const html = generarHtmlInforme(informe);

      const browser = await puppeteer.launch({
         headless: true,
         args: ["--no-sandbox", "--disable-setuid-sandbox"]
      });

      const page = await browser.newPage();

      await page.setContent(html, {
         waitUntil: "networkidle0"
      });

      const pdfUint8Array = await page.pdf({
         format: "A4",
         printBackground: true,
         margin: {
            top: "8mm",
            right: "10mm",
            bottom: "8mm",
            left: "10mm"
         }
      });
      const pdfBuffer = Buffer.from(pdfUint8Array);
      console.log("PDF generado");
      console.log("tamaño:", pdfBuffer.length);
      console.log(Buffer.isBuffer(pdfBuffer));
      await browser.close();

      res.status(200);
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=informe-${informe.numeroInforme}.pdf`,
        "Content-Length": pdfBuffer.length
      });
      return res.end(pdfBuffer);
   } catch (error) {
      console.error("Error generando PDF:", error);

      res.status(500).json({
         ok: false,
         msg: "Error generando PDF",
         error: error.message
      });
   }
   
} 

 
    
module.exports = {
   informesGet, crearInforme,
   informesGetDatos, informesDelete,
   informesPut, obtenerInformePorId,
   generarPdfInforme,
   subirACloudinary
   
}

