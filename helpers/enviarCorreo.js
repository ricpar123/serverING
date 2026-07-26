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
 * Traduce el estado técnico de ZeroBounce
 * a un mensaje entendible para el usuario.
 */
function obtenerMotivoValidacion(resultado) {
  switch (resultado.status) {
    case "invalid":
      return "La dirección no existe o no puede recibir correos.";

    case "catch-all":
      return "El servidor del destinatario no permite confirmar si esa casilla existe.";

    case "unknown":
      return "ZeroBounce no pudo confirmar temporalmente esta dirección.";

    case "spamtrap":
      return "La dirección fue identificada como una posible trampa de spam.";

    case "abuse":
      return "La dirección está asociada a reportes frecuentes de correo no deseado.";

    case "do_not_mail":
      return "ZeroBounce recomienda no enviar correos a esta dirección.";

    default:
      return "La dirección no pudo validarse.";
  }
}

/**
 * Valida una dirección mediante ZeroBounce.
 *
 * Requiere Node 18 o superior para usar fetch nativo.
 */
async function validarEmailZeroBounce(email) {
  if (!process.env.ZEROBOUNCE_API_KEY) {
    throw new Error("No está configurada la API Key de ZeroBounce.");
  }

  const parametros = new URLSearchParams({
    api_key: process.env.ZEROBOUNCE_API_KEY,
    email,
    ip_address: ""
  });

  const controlador = new AbortController();

  const temporizador = setTimeout(() => {
    controlador.abort();
  }, 30000);

  try {
    const respuesta = await fetch(
      `https://api.zerobounce.net/v2/validate?${parametros.toString()}`,
      {
        method: "GET",
        signal: controlador.signal
      }
    );

    if (!respuesta.ok) {
      throw new Error(
        `ZeroBounce respondió con HTTP ${respuesta.status}`
      );
    }

    const resultado = await respuesta.json();

    return {
      email,
      status: String(resultado.status || "").toLowerCase(),
      subStatus: resultado.sub_status || ""
    };

  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        `ZeroBounce tardó demasiado en validar ${email}.`
      );
    }

    throw error;

  } finally {
    clearTimeout(temporizador);
  }
}


/**
 * Envía el PDF del informe.
 */


      

async function enviarCorreo({ informe, cliente, pdfBuffer, emailsAdicionales = [] }) {
    /*
   * Direcciones variables que sí queremos verificar.
   */

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
   *
   * No hace falta gastar un crédito de ZeroBounce
   * verificándolos en cada informe.
   */
        const emailsConfiables = [];

    const validos = [];
    const noValidos = [];
    const erroresValidacion = [];

    /*
   * Validamos en paralelo para no esperar una dirección
   * después de la otra.
   */

    const resultados = await Promise.allSettled(
        emailsAValidar.map(validarEmailZeroBounce)
    );

    resultados.forEach((resultado, indice) => {
    const email = emailsAValidar[indice];

        if (resultado.status === "rejected") {
            erroresValidacion.push({
                email,
                motivo:
                resultado.reason?.message ||
                    "No se pudo consultar el servicio de validación."
            });

            return;
        }
    const validacion = resultado.value;

    if (validacion.status === "valid") {
      validos.push(email);
      return;
    }

    noValidos.push({
      email,
      status: validacion.status,
      subStatus: validacion.subStatus,
      motivo: obtenerMotivoValidacion(validacion)
    });
  });

  /*
   * Las direcciones válidas más las internas confiables.
   */

    const destinatarios = normalizarEmails([
        ...validos,
        ...emailsConfiables
    ]);

    if (destinatarios.length === 0) {
        return {
            estado: "sin destinatarios",
            enviado: false,
            mensaje: "No hay direcciones de correo válidas para enviar el informe.",
            validos,
            noValidos,
            erroresValidacion
        };
    }   

    try {       
        const info = await transporter.sendMail({
            from: `"INGROUP Servicios" <${process.env.SMTP_FROM}>`, 
            /*
                * Nodemailer acepta directamente un array.
            */
            to: destinatarios,

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

        const rechazadosSmtp = info.rejected || [];
        const aceptadosSmtp = info.accepted || [];

        const huboAdvertencias =
            noValidos.length > 0 ||
            erroresValidacion.length > 0 ||
            rechazadosSmtp.length > 0;

            return {
                estado: huboAdvertencias ? "parcial" : "exito",
                enviado: aceptadosSmtp.length > 0,

                mensaje: huboAdvertencias
                ? "El correo fue enviado únicamente a las direcciones aprobadas."
                : "El servidor de correo aceptó todos los destinatarios para su envío.",

                destinatarios,
                aceptadosSmtp,
                rechazadosSmtp,

                validos,
                noValidos,
                erroresValidacion,

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
            validos,
            noValidos,
            erroresValidacion,

            detalleTecnico: errorMail.message
        };
            
    }
}


module.exports = {
    enviarCorreo
}