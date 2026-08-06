const nodemailer = require('nodemailer');

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

async function enviarCorreo({ informe, cliente, pdfBuffer, emailsAdicionales = [] }) {
    /*Primero obtenemos las direcciones de email a enviar*/

    const emailsAValidar = normalizarEmails([
        cliente?.email1,
        cliente?.email2,
        cliente?.email3,
        cliente?.email4,
        ...emailsAdicionales
        
    ]);
   console.log('Cliente recibido en enviarCorreo: ', cliente);
   console.log('Emails a validar: ', emailsAValidar);

    /*
   * Correos internos ya conocidos.
   */
    const emailsValidos = [];
    const emailsInValidos = [];
    
    for (const email of emailsAValidar){
      const resultado = await validarEmailMailsSo(email);
      console.log("Validacion mails.so:",resultado);

      if(resultado.valido) {
        emailsValidos.push(email);
      } else {
        emailsInValidos.push({
          email,
          estado: resultado.estado,
          motivo: resultado.motivo
          
        });
      }
    }

   
  /*
   * Las direcciones válidas más las internas confiables.
   */

    const destinatarios = normalizarEmails([
        ...emailsValidos,
        process.env.EMAIL_INGROUP
    ]);

    if (destinatarios.length === 0) {
        return {
            estado: "sin destinatarios",
            enviado: false,
            mensaje: "No hay direcciones de correo válidas para enviar el informe.",
            
            
        };
    }   

    try {       
        const info = await transporter.sendMail({
            from: `"INGROUP Servicios" <${process.env.SMTP_FROM}>`, 
            /*
                * Nodemailer acepta directamente un array.
            */
            to: destinatarios.join(","),

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

         return {
                estado: "exito",
                emailsValidos,
                emailsInValidos,
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

            destinatarios,
            emailsValidos,
            emailsInValidos,
            

            detalleTecnico: errorMail.message
        };
            
    }
  }


module.exports = {
    enviarCorreo
}