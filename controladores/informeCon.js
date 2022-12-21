const { response, request }  = require('express');
const  Informe  = require('../modelos/informe');
const Numero = require('../modelos/numero');
const Cliente = require('../modelos/cliente');



const dayjs = require('dayjs');

const fs = require('fs');
const nodemailer = require("nodemailer");

const PDFDoc = require('pdfkit');
const path = require('path');

let number = 0;








const informesGet = async (req, res = response) =>{

    try {
      
        const informes = await Informe.find({});

       

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

  
  
   const doc = new PDFDoc({size:'A4'});
   doc.pipe(fs.createWriteStream('informe.pdf'));

   const id  = '6181b7ec919d2ecc2a19f4f1';
   //console.log(id);

   const e0 = 'empresaingroup@gmail.com';//simula ingroup
   const e1 = 'carlos.andino71@hotmail.com';//simula santi
   
   try {

      const numeros =  await Numero.find({}, '-_id');
   //console.log(numeros[0].numero);

   
    number = numeros[0].numero + 1;
   // console.log(number);
      
     // console.log('id: ', id);
      await Numero.findByIdAndUpdate(id, {$set:{numero: number}}, {new:true});

      
      //numero = nuevoNum;

      
      
   } catch (error) {
      console.log('error');
        return res.status(500).json({
            ok: false,
            msg: 'Error en findAndUpdate'
        });
      }

  


      //const body = req.body

      const {tecnico, cliente,descripcion, marca, modelo , serie, motivo, 
         tipoTrabajo, presupuesto, fechaInicio, horaInicio,
         fechaFin, horaFin, horasNormales, horasLab, 
         horasViaje, horasTotales, servicio, obs, recibido,
         ci, firma, firmaT, fecha}= req.body;

      let email1 = '';
      let email2 = '';
      let email3 = '';
      let email4 = '';
       

         console.log('cliente: ', cliente);
         let datosCliente = [];

         try {
         await Cliente.find({nombre:cliente}).then(
            cli => datosCliente = cli[0]);
            
         } catch (err) {
            console.log('error: ', err);
            
         }

     // console.log('datos del cliente: ', datosCliente);
      email1 = datosCliente.email1;
      email2 = datosCliente.email2;
      email3 = datosCliente.email3;
      email4 = datosCliente.email4;
     
      
        

       
        // console.log('Inicio y Termino: ', fechaInicio, fechaFin);
        // console.log('Tecnico: ', firmaT);
         const Inifecha = dayjs(fechaInicio).format("DD MMM YYYY");
         const Finf = dayjs(fechaFin).format("DD MMM YYYY");
     
         //console.log(fecha);  
         let numero = number.toString();
         const fech = dayjs(fecha).format("DD MMM YYYY");
         //console.log(fech);
         let tec = tecnico.toString();
         //console.log("tecnicos: ", tec);
      
        
     doc.moveTo(0, 20)
       .rect(14, 6, 571, 114)//ingroup, informe y numero
       
       .rect(251, 6, 334, 114)//divisoria ing, inf y nro
       
       .rect(251, 63, 334, 57)//divisoria informe y numero
       
       .rect(14, 120, 571, 125)//rectang. tecnico hasta motivo
    
       .moveTo(14,145)// tecnico
       .lineTo(585,145)
       
       .moveTo(14,170) //cliente
       .lineTo(585, 170)
       
       .moveTo(14,195) //equipo, marca
       .lineTo(585, 195)
       
       .moveTo(14,220) //modelo, nro de serie y motivo
       .lineTo(585, 220)
      
       .moveTo(14, 26)
       .fontSize(20)
       .font('Helvetica-BoldOblique') 
       .text('I N G r o u p  S.R.L', 14, 10, {
        width: 240,
        align: 'center'
       })
       .fontSize(15)
       .font('Courier-Bold')
       .text('Ingenieria Electromecanica', 14, 37, {
          width: 240,
          align: 'center'
       })
       .fontSize(10)
       .font('Courier-Oblique')
       .text('Maria F. Gonzalez 820 c/ Dr. Molinas', 14, 54, {
          width: 240,
          align: 'center'
       })
       .fontSize(10)
       .font('Courier-Oblique')
       .text('Telefono: (0981) 401 850', 14, 69, {
          width: 240,
          align: 'center'
       })
       .fontSize(10)
       .font('Courier-Oblique')
       .text('e-mail: empresaingroup@gmail.com', 14, 84, {
          width: 240,
          align: 'center'
       })
       .fontSize(10)
       .font('Courier-Oblique')
       .text('Fdo. de la Mora - Paraguay', 14, 99, {
          width: 240,
          align: 'center'
       })
       .fontSize(15)
       .font('Times-Roman')
       .text('INFORME DE SERVICIO TECNICO', 251, 30, {
          width: 320,
          align: 'center'
       })
       .fontSize(20)
       .font('Times-Bold')
       .text(`Nº: ${numero}`, 300, 80, {
          width: 320,
          align: 'left'
       })
    
       .moveTo(16, 130)
       .fontSize(15)
       .font('Courier-Bold')
       .text('Tecnico: ', 18, 130, {
          width: 240,
          align: 'left'
       })
       .fontSize(10)
       .font('Courier')
       .text(`${tec}`, 100, 130 )
    
       .fontSize(15)
       .font('Courier-Bold')
       .text('Cliente: ', 18, 155, {
          width: 400,
          align: 'left'
       })
       .fontSize(10)
       .font('Courier')
       .text(`${cliente}`, 100, 155 )
    
       .moveTo(251, 170)
       .lineTo(251, 220)
    
       
       .fontSize(15)
       .font('Courier-Bold')
       .text('Equipo: ', 18, 180, {
          width: 240,
          align: 'left'
       })
       .fontSize(10)
       .font('Courier')
       .text(`${descripcion}`, 90, 180 )
       
       .fontSize(15)
       .font('Courier-Bold')
       .text('Marca: ', 255, 180, {
          width: 240,
          align: 'left'
       })
       .fontSize(10)
       .font('Courier')
       .text(`${marca}`, 320, 180,{
          width: 400,
          align: 'left'
       })
    
    
       .fontSize(15)
       .font('Courier-Bold')
       .text('Modelo: ', 18, 205,{
          width: 240,
          align: 'left'
       })
       .fontSize(10)
       .font('Courier')
       .text(`${modelo}`, 90, 205 )
       
    
       .fontSize(15)
       .font('Courier-Bold')
       .text('NroSerie: ', 255, 205, {
          width: 240,
          align: 'left'
       })
       .font('Courier')
       .text(`${serie}`, 380, 205,{
          width: 400,
          align: 'left'
       })
    
        
       .fontSize(15)
       .font('Courier-Bold')
       .text('Motivo de la visita: ', 18, 230, {
          width: 400,
          align: 'left'
       })
       .fontSize(10)
       .font('Courier')
       .text(`${motivo}`, 210, 230 )
    
       .rect(14, 245, 571, 25)
       .moveTo(251, 245)
       .lineTo(251, 270)
       
       .fontSize(15)
       .font('Courier-Bold')
       .text('Tipo de trabajo: ', 18, 255, {
          width: 240,
          align: 'left'
       })
       .fontSize(10)
       .font('Courier')
       .text(`${tipoTrabajo}`, 180, 255 )
    
    
       .fontSize(15)
       .font('Courier-Bold')
       .text('Necesita presupuesto: ', 255, 255, {
          width: 240,
          align: 'left'
       })
       .font('Courier')
       .text(`${presupuesto}`, 460, 255,{
          width: 400,
          align: 'left'
       })
    
       .moveTo(14, 270)
       .rect(14, 270, 571, 25) //fechas de inicio/termino
    
       .fontSize(15)
       .font('Courier-Bold')
       .text('Fechas de inicio/termino  Horas trabajadas ', 18, 280, {
          width: 580,
          align: 'center'
       })
    
       .moveTo(14, 295)
       .rect(14, 295, 571, 25) //fecha, hora inicio y termino
       .moveTo(255, 295)
       .lineTo(255, 320)
       
       
       .fontSize(15)
       .font('Courier')
       .text('Inicio: ', 18, 300 )
       
       .fontSize(10)
       .font('Courier')
       .text(`${Inifecha}`,  90, 300, {
          width: 320,
          align: 'left'
       })
    
       .fontSize(15)
       .font('Courier')
       .text('Hr: ', 160, 300 )
    
       .fontSize(10)
       .font('Courier')
       .text(`${horaInicio}`, 190, 300 )
    
    
       .fontSize(15)
       .font('Courier')
       .text('Termino: ', 300, 300 )
    
       .fontSize(10)
       .font('Courier')
       .text(`${Finf}`,  380, 300, {
          width: 320,
          align: 'left'
       })
    
       .fontSize(15)
       .font('Courier')
       .text('Hr: ', 450, 300 )
    
       .fontSize(10)
       .text(`${horaFin}`,  485, 300, {
          width: 320,
          align: 'left'
    
       })
    
       .moveTo(14, 320)
       .rect(14, 320, 571, 25) //h normal, hlab, hviaje
    
       .fontSize(15)
       .font('Courier')
       .text('Horas Normales: ', 14, 325 )
    
       .fontSize(10)
       .font('Courier')
       .text(`${horasNormales}`,  180, 325, {
          width: 320,
          align: 'left'
       })
       
       .fontSize(15)
       .font('Courier')
       .text('Horas Lab: ',220, 325 )
    
       .fontSize(10)
       .font('Courier')
       .text(`${horasLab}`,  330, 325, {
          width: 320,
          align: 'left'
       })
       
       .fontSize(15)
       .font('Courier')
       .text('Horas Viaje: ',400, 325 )
    
       .fontSize(10)
       .font('Courier')
       .text(`${horasViaje}`,  520, 325, {
          width: 600,
          align: 'left'
       })
    
       .moveTo(14, 345)
       .rect(14, 345, 571, 25) //h totales
    
       .fontSize(15)
       .font('Courier-Bold')
       .text('Horas Totales: ',200, 355 )
    
       .fontSize(10)
       .font('Courier')
       .text(`${horasTotales}`,  345, 355, {
          width: 600,
          align: 'left'
       })
   
       //Servicio Realizado
    
      .moveTo(14, 370)
      .rect(14, 370, 571, 25)
      .fontSize(15)
      .font('Courier-Bold')
      .text('Servicio Realizado ', 18, 380, {
         width: 580,
         align: 'center'
      })
    
      .moveTo(14, 395)
      .rect(14, 395, 571, 150)
     
      .fontSize(10)
      .font('Courier')
      .text(`${servicio}`,  30, 405, {
         width: 600,
         align: 'left'
      })
    
    
       
       //Observaciones
       
       .moveTo(14, 545)
       .rect(14, 545, 571, 25)
       
       .fontSize(15)
       .font('Courier-Bold')
       .text('Observaciones ', 18, 550, {
          width: 580,
          align: 'center'
       })
    
       .moveTo(14, 570)
       .rect(14, 570, 571, 90)
    
       .fontSize(10)
       .font('Courier')
       .text(`${obs}`,  30, 575, {
          width: 600,
          align: 'left'
       })
       
       //Servicio recibido por... CI nro
       
       .moveTo(14, 660)
       .rect(14, 660, 571, 25)
       .fontSize(15)
       .font('Courier-Bold')
       .text('Servicio recibido por: ', 18, 670, {
          width: 580,
          align: 'left'
       })
       .fontSize(10)
       .font('Courier')
       .text(`${recibido}`,  250, 670, {
          width: 600,
          align: 'left'
       })
    
       .fontSize(15)
       .font('Courier-Bold')
       .text('CI Nro: ', 400, 670, {
          width: 580,
          align: 'left'
       })
    
       .fontSize(10)
       .font('Courier')
       .text(`${ci}`,  480, 670, {
          width: 600,
          align: 'left'
       })
    
       //Firma..... Fecha de elaboracion
    
       .moveTo(14, 685)
       
       .rect(14, 685, 571, 130)
       
       .rect(14,685, 571, 25)

       .moveTo(300, 685)
       .lineTo(300, 815)
       .fontSize(15)
       .font('Courier-Bold')
       .text('Firma del cliente ', 18, 695, {
          width: 580,
          align: 'left'
       })
       
       .image(Buffer.from(firma.replace('data:image/png;base64,',''), 'base64'), 50, 720, {fit: [100, 100]})
    
      

       .fontSize(15)
       .font('Courier-Bold')
       .text('Fecha:', 370, 695, {
          width: 580,
          align: 'left'
       })
       .fontSize(10)
       .font('Courier')
       .text(`${fech}`,  450, 695, {
         
         width: 600,
          align: 'left'
       })

       
       .fontSize(15)
       .font('Courier-Bold')
      
       .text('Firma del Tecnico', 370,715,{
        
         width: 200,
         align: 'left'
       })
       

       .image(Buffer.from(firmaT.replace('data:image/png;base64,',''), 'base64'),370, 730, {fit: [100, 100]})
       
       .stroke();
        
        doc.end();


     
     



   //enviar mail

   async function correo(){

      var transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: 'ricpar123@gmail.com',
          pass: 'dsouucgufjfoyabv',
        }
      });

      var destino = e0;
      if(tipoTrabajo == 'aFacturar' || presupuesto == 'si'){
         destino = destino + ',' + e1;
      }


      if(email1 != ''){
      destino = destino + ','+ email1;
      }
      if(email2 != ''){
         destino = destino + ',' + email2;
      }
      if(email3 != ''){
         destino = destino + ','  + email3;
      }
      if(email4 != ''){
         destino = destino + ',' + email4;
      }
 
      var mailOptions = {
        from: 'ricpar123@gmail.com',
        to: destino,
        subject: 'Envio de Informe de Servicio',
        text:`Saludos desde INGroup SRL!, adjunto a la 
               presente, les estamos enviando el informe de servicios,
               de los trabajos realizados en la fecha, en sus instalaciones` ,
        attachments: [
           {
              filaname: 'informe.pdf',
              path: path.join(__dirname, '../informe.pdf')
              
              
           }
        ]
      };
  
      transporter.sendMail(mailOptions, function(error, info){
         if(error){
            console.log(error);
         }else{
            console.log('mail enviado' + info.response)
         }
      });
       
      }
      correo().catch(console.error);
      
      try{
           
         
           const dbInforme  = new Informe({tecnico:tec, cliente, 
            numero, descripcion, marca, modelo , serie, 
            motivo, tipoTrabajo, presupuesto, fechaInicio,
            horaInicio, fechaFin, horaFin, horasNormales,
            horasLab, horasViaje, horasTotales, servicio,
            obs, recibido, ci, firma, firmaT,  fecha });

         
         
            await dbInforme.save();  
         
  
 
               
   return res.status(201). json({
            ok: true, 
            
           
          
        });

      }catch (error) {
        console.log('error');
        return res.status(500).json({
            ok: false,
            msg: 'Error en guardar el informe'
        });
      }

}
     
       

      
   





module.exports = {
   informesGet, informesPost,
   informesGetDatos, informesDelete,
   informesPut
}

