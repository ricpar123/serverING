const nodemailer = require('nodemailer');
const { continueOnNewPage } = require('pdfkit');

/*
 * Conviene crear el transporter una sola vez,
 * no cada vez que se envía un informe.
 */

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
   
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
    
});

    /**
 * Elimina espacios, emails vacíos y duplicados.
 */
function normalizarEmails(emails = []) {
  return [
    ...new Set(
      emails
        .filter(Boolean)
        .map(email => String(email).trim().toLowerCase())
        .filter(Boolean)
    )
  ];
}



/**
 * Valida una dirección mediante ZeroBounce.
 *
 * Requiere Node 18 o superior para usar fetch nativo.
 */
async function validarEmailMailsSo(email) {
  const apiKey = process.env.API_KEY_MAIL_SO;

  if(!apiKey) {
    return {
      email, 
      valido: false,
      estado: "error",
      motivo:"MAILS_SO_API_KEY no esta configurada"
    };
  }
  try {
    const url = `https://api.mails.so/v1/validate?email=${encodeURIComponent(email)}`;

    const respuesta = await fetch(url, {
      method: 'GET',
      headers: {
        "x-mails-api-key": apiKey
      }
    });
    const resultado = await respuesta.json();
    if (!respuesta.ok) {
      return {
        email,
        valido: false,
        estado: "error",
        motivo:
          resultado?.error || `Error HTTP ${respuesta.status} al validar el correo`
      };
    }
    if(resultado.error || !resultado.data) {
      return {
        email,
        valido: false,
        estado: 'error',
        motivo: resultado.error || 'Respuesta inválida de mails.so'
      };
    }

    const data = resultado.data;

    return {
      email,
      valido: data.result === 'deliverable',
      estado: data.result,
      motivo: data.reason || '',
      score: data.score,
      sugerencia: data.did_you_mean || null,
      esDesechable: data.is_disposable === true,
      dominioValido: data.isv_domain === true,
      mxValido: data.isv_mx === true
    };
  } catch (error){
    console.error(`Error validando ${email} con mails.so:`, error);

        return {
            email,
            valido: false,
            estado: 'error',
            motivo: error.message
        };  
  }  
}

async function enviarCorreo({ 
  informe, 
  cliente, 
  pdfBuffer, 
  emailsAdicionales = [] 
}) {
    /*Primero obtenemos las direcciones de email a enviar*/

    const emailsAValidar = normalizarEmails([
        cliente?.email1,
        cliente?.email2,
        cliente?.email3,
        cliente?.email4,
        ...emailsAdicionales
        
    ]);

    const emailsValidos = [];
    const emailsInValidos = [];

    // 1) VALIDAR EMAILS DEL CLIENTE CON MAILS.SO
    
    for (const email of emailsAValidar){
      const resultado = await validarEmailMailsSo(email);
      console.log("Validacion mails.so:",resultado);

      if(resultado.valido) {
        emailsValidos.push(email);
      } else {
        emailsInValidos.push({
          email,
          estado: resultado.estado,
          motivo: resultado.motivo,
         
          
        });
      }
    }

    /*
   * Correo interno de INGROUP:
   * lo tratamos aparte porque no queremos confundir
   * "el correo salió" con "el cliente recibió el correo".
   */

  const emailIngroup = process.env.EMAIL_INGROUP;

  const destinatariosFinales = normalizarEmails([
    ...emailsValidos,
    emailIngroup
  ]);

  if (destinatariosFinales.length === 0) {
    return {
      estado: "sin_destinatarios_validos",
      enviado: false,
      mensaje: "No existen direcciones válidas para enviar el informe.",
      emailsValidos,
      emailsInValidos,
      aceptadosSmtp: [],
      rechazadosSmtp: []
    };
  }

    try {  
      // 2) ENVÍO REAL CON NODEMAILER     
        const info = await transporter.sendMail({
            from: `"INGROUP Servicios" <${process.env.SMTP_FROM}>`, 
            
            to: destinatariosFinales,

                subject: `Informe de Servicio Nro - ${informe.numero}`,

                html: `<p>
                Estimado cliente,</p>
                <p>
                Adjuntamos  el informe de servicio 
                <strong> Nro - ${informe.numero}</strong><br>
                <p>
                Sistema desarrollado con ♥️ por freeSoft
                </p>
                `,

                attachments: [
                    {
                        filename: `Informe_${informe.numero}.pdf`,
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    }
                ] 
                
          });

        const aceptadosSmtp = info.accepted || [];
        const rechazadosSmtp = info.rejected || [];

        /*
     * 3) DETERMINAR RESULTADO REAL PARA EL USUARIO
     */

    // Ningún email del cliente pasó mails.so.
    // Puede haberse enviado solo a INGROUP.
        if (emailsValidos.length === 0) {
         return {
                estado: "sin destinatarios validos",
                enviado: aceptadosSmtp.length > 0,
                mensaje: 
                "No fue posible enviar el informe al cliente, sus direcciones son invalidas",
                emailsValidos,
                emailsInValidos,
                aceptadosSmtp, rechazadosSmtp,
                copiaIngroupEnviada:
                  emailIngroup
                  ? aceptadosSmtp.includes(emailIngroup)
                  : false,
                messageId: info.messageId

            };
        }
    // Hay por lo menos un email válido,
    // pero también existen direcciones inválidas
    // o rechazadas por SMTP.
        
        if(
          emailsInValidos.length > 0 ||   rechazadosSmtp.length > 0
        ) {
          return {
            estado: "parcial",
            enviado: aceptadosSmtp.length > 0,
            mensaje: "Informe enviado solamente a las direcciones validas,",
            emailsValidos,
            emailsInValidos,
            aceptadosSmtp,
            rechazadosSmtp,
            copiaIngroupEnviada:
              emailIngroup
                ? aceptadosSmtp.includes(emailIngroup)
                : false,
              messageId: info.messageId
          };
        }

          // Todos los emails del cliente pasaron la validación
          // y SMTP no rechazó destinatarios.
          return {
            estado:"exito",
            enviado: true,
            mensaje:
            "Los correos fueron validados y aceptados por ek servidor para su envio.",
            emailsInValidos,
            emailsValidos,
            aceptadosSmtp,
            rechazadosSmtp,
            copiaIngroupEnviada:
              emailIngroup
                ? aceptadosSmtp.includes(emailIngroup)
                : false,
              messageId: info.messageId
          };    
      } catch (errorMail) {
        console.error("Error al enviar el correo:", errorMail);
        let motivo = "No se pudo enviar el correo";

        if (errorMail.code === "EAUTH") {
            motivo = "El servidor de correo rechazó la autenticación.";
        } else if (
            errorMail.code === "ECONNECTION" ||
            errorMail.code === "ESOCKET"
        ) {
            motivo = "No fue posible conectar con el servidor de correo.";
        } else if (errorMail.code === "EENVELOPE") {
            motivo = "El servidor rechazó uno o más destinatarios.";
    }
        return {
            estado: "error_smtp",
            enviado: false,
            mensaje: motivo,

            emailsValidos,
            emailsInValidos,

            aceptadosSmtp: [],
            rechazadosSmtp: [],
            

            detalleTecnico: errorMail.message
        };
            
    }
  }


module.exports = {
    enviarCorreo
}