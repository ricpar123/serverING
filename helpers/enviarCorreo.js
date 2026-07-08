async function enviarCorreo({ informe, cliente, pdfBuffer }) {
    const destinatarios = [
        cliente.email1,
        cliente.email2,
        cliente.email3,
        cliente.email4,
        "ricpar123@gmail.com",
        "rcaballerobenitez458@gmail.com"
    ]
        .filter(Boolean)
        .join(', ');

        if (!destinatarios) {
            console.log("Cliente sin emails registrados: No se enviar cooreo.");
            return {
                enviado: false,
                mensaje: "Cliente sin emails"
            };
        }
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }   
        });

        const info = await transporter.sendMail({
            from: `"INGROUP Servicios" <${process.env.SMTP_FROM}>`, 
            
            to: destinatarios,

            subject: `Informe de Servicio Nro - ${informe.numero}`,

            html: `<p>
            Estimado cliente,</p>
            <p>
            Adjuntamoa  el informe de servicio 
            <strong> Nro - ${informe.numero}</strong><br>
            <p>
            Sistema desarrollado con ♥️ por freeSoft
            </p>`,

            attachments: [
                {
                    filename: `Informe_${informe.numero}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]   
        });
        return {
            enviado: true,
            mensaje: info.messageId
        };
}

module.exports = {
    enviarCorreo
};