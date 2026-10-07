// ============================================================
// ENVIAR CORREO
// ============================================================

async function enviarCorreo({
    informe,
    cliente,
    pdfBuffer,
    emailsAdicionales = []
}) {

    const emailsValidos = [];
    const emailsInValidos = [];


    // ========================================================
    // 1. OBTENER EMAILS DEL CLIENTE
    // ========================================================

    const emailsAValidar = normalizarEmails([
        cliente?.email1,
        cliente?.email2,
        cliente?.email3,
        cliente?.email4,
        ...emailsAdicionales
    ]);

    console.log(
        "Emails del cliente a validar:",
        emailsAValidar
    );


    // ========================================================
    // 2. VALIDAR EMAILS CON HUNTER.IO
    // ========================================================

    for (const email of emailsAValidar) {

        try {

            const resultado =
                await validarEmail(email);

            console.log(
                `Validación Hunter ${email}:`,
                resultado
            );


            /*
             * Según la respuesta real que obtuvimos
             * de Hunter:
             *
             * status: "valid"
             */

            if (resultado?.status === "valid") {

                emailsValidos.push(email);

            } else {

                emailsInValidos.push({
                    email,

                    estado:
                        resultado?.status ||
                        "invalid",

                    motivo:
                        resultado?.motivo ||
                        "Correo no válido"
                });
            }


        } catch (error) {

            console.error(
                `Error validando ${email}:`,
                error
            );

            emailsInValidos.push({
                email,
                estado: "error_validacion",
                motivo: error.message
            });
        }
    }


    console.log(
        "Emails válidos:",
        emailsValidos
    );

    console.log(
        "Emails inválidos:",
        emailsInValidos
    );


    // ========================================================
    // 3. CORREO INTERNO DE INGROUP
    // ========================================================

    /*
     * INGROUP no se valida con Hunter.
     * Es una dirección conocida y controlada por nosotros.
     */

    const emailIngroup =
        normalizarEmail(
            process.env.EMAIL_INGROUP
        );


    // ========================================================
    // 4. NINGÚN EMAIL VÁLIDO DEL CLIENTE
    // ========================================================

    /*
     * Regla de negocio:
     *
     * Si ningún correo del cliente es válido:
     *
     * - NO enviamos al cliente.
     * - Enviamos solamente a INGROUP.
     * - Devolvemos estado "falla".
     */

    if (emailsValidos.length === 0) {

        // --------------------------------------------
        // Comprobar que exista el correo de INGROUP
        // --------------------------------------------

        if (!emailIngroup) {

            console.error(
                "EMAIL_INGROUP no está configurado."
            );

            return {
                estado: "falla",
                enviado: false,

                mensaje:
                    "No existen correos válidos del cliente y no está configurado el correo de INGROUP.",

                emailsValidos,
                emailsInValidos,

                copiaIngroupEnviada: false,

                messageId: null
            };
        }


        try {

            const info =
                await transporter.sendMail({

                    from:
                        `"INGROUP Servicios" <${process.env.SMTP_FROM}>`,

                    to:
                        emailIngroup,

                    subject:
                        `Informe de Servicio Nro - ${informe.numero}`,

                    html: `
                        <p>
                            Informe de Servicio
                            <strong>
                                Nro - ${informe.numero}
                            </strong>
                        </p>

                        <p>
                            No se encontraron direcciones
                            de correo válidas del cliente.
                        </p>

                        <p>
                            El informe se adjunta como
                            copia interna de INGROUP.
                        </p>

                        <p>
                            <strong>
                                Sistema desarrollado en Paraguay 🇵🇾
                                por free@Soft
                            </strong>
                        </p>
                    `,

                    attachments: [
                        {
                            filename:
                                `Informe_${informe.numero}.pdf`,

                            content:
                                pdfBuffer,

                            contentType:
                                "application/pdf"
                        }
                    ]
                });


            console.log(
                "Copia enviada a INGROUP:",
                info.messageId
            );


            return {
                estado: "falla",

                /*
                 * "enviado" significa enviado
                 * al CLIENTE.
                 */

                enviado: false,

                mensaje:
                    "No existen correos válidos del cliente. El informe fue enviado únicamente a INGROUP.",

                emailsValidos,
                emailsInValidos,

                copiaIngroupEnviada: true,

                messageId:
                    info.messageId
            };


        } catch (errorMail) {

            console.error(
                "Error enviando copia a INGROUP:",
                errorMail
            );


            return {
                estado: "falla",
                enviado: false,

                mensaje:
                    "No existen correos válidos del cliente y tampoco fue posible enviar la copia a INGROUP.",

                emailsValidos,
                emailsInValidos,

                copiaIngroupEnviada: false,

                messageId: null,

                detalleTecnico:
                    errorMail.message
            };
        }
    }


    // ========================================================
    // 5. EXISTEN EMAILS VÁLIDOS
    // ========================================================

    /*
     * A partir de acá sabemos que:
     *
     * emailsValidos.length > 0
     *
     * Agregamos también la copia para INGROUP.
     */

    const destinatariosFinales =
        normalizarEmails([
            ...emailsValidos,
            emailIngroup
        ]);


    console.log(
        "Destinatarios finales:",
        destinatariosFinales
    );


    // ========================================================
    // 6. ENVÍO REAL CON NODEMAILER
    // ========================================================

    try {

        const info =
            await transporter.sendMail({

                from:
                    `"INGROUP Servicios" <${process.env.SMTP_FROM}>`,

                to:
                    destinatariosFinales,

                subject:
                    `Informe de Servicio Nro - ${informe.numero}`,

                html: `
                    <p>
                        Estimado cliente,
                    </p>

                    <p>
                        Adjuntamos el informe de servicio
                        <strong>
                            Nro - ${informe.numero}
                        </strong>.
                    </p>

                    <p>
                        <strong>
                            Sistema desarrollado en Paraguay 🇵🇾
                            por free@Soft
                        </strong>
                    </p>
                `,

                attachments: [
                    {
                        filename:
                            `Informe_${informe.numero}.pdf`,

                        content:
                            pdfBuffer,

                        contentType:
                            "application/pdf"
                    }
                ]
            });


        // ====================================================
        // 7. RESULTADO SMTP
        // ====================================================

        const aceptadosSmtp =
            normalizarEmails(
                info.accepted || []
            );


        const rechazadosSmtp =
            normalizarEmails(
                info.rejected || []
            );


        console.log(
            "Aceptados SMTP:",
            aceptadosSmtp
        );

        console.log(
            "Rechazados SMTP:",
            rechazadosSmtp
        );


        // ====================================================
        // 8. RESULTADO ESPECÍFICO DEL CLIENTE
        // ====================================================

        const emailsClienteAceptados =
            emailsValidos.filter(
                email =>
                    aceptadosSmtp.includes(email)
            );


        const emailsClienteRechazados =
            emailsValidos.filter(
                email =>
                    rechazadosSmtp.includes(email)
            );


        const copiaIngroupEnviada =
            emailIngroup
                ? aceptadosSmtp.includes(emailIngroup)
                : false;


        console.log(
            "Emails cliente aceptados:",
            emailsClienteAceptados
        );

        console.log(
            "Emails cliente rechazados:",
            emailsClienteRechazados
        );

        console.log(
            "Copia INGROUP enviada:",
            copiaIngroupEnviada
        );


        // ====================================================
        // 9. SMTP NO ACEPTÓ NINGÚN EMAIL DEL CLIENTE
        // ====================================================

        if (
            emailsClienteAceptados.length === 0
        ) {

            return {
                estado: "falla",
                enviado: false,

                mensaje:
                    "No fue posible enviar el informe a ninguna dirección del cliente.",

                emailsValidos,
                emailsInValidos,

                emailsClienteAceptados,
                emailsClienteRechazados,

                aceptadosSmtp,
                rechazadosSmtp,

                copiaIngroupEnviada,

                messageId:
                    info.messageId
            };
        }


        // ====================================================
        // 10. ENVÍO PARCIAL
        // ====================================================

        /*
         * Consideramos PARCIAL cuando:
         *
         * - Hunter rechazó uno o más emails.
         *
         * O
         *
         * - SMTP rechazó uno o más emails que
         *   Hunter había considerado válidos.
         */

        if (
            emailsInValidos.length > 0 ||
            emailsClienteRechazados.length > 0
        ) {

            return {
                estado: "parcial",
                enviado: true,

                mensaje:
                    "El informe fue enviado solamente a las direcciones válidas.",

                emailsValidos,
                emailsInValidos,

                emailsClienteAceptados,
                emailsClienteRechazados,

                aceptadosSmtp,
                rechazadosSmtp,

                copiaIngroupEnviada,

                messageId:
                    info.messageId
            };
        }


        // ====================================================
        // 11. ÉXITO
        // ====================================================

        return {
            estado: "exito",
            enviado: true,

            mensaje:
                "Informe enviado correctamente.",

            emailsValidos,
            emailsInValidos,

            emailsClienteAceptados,
            emailsClienteRechazados,

            aceptadosSmtp,
            rechazadosSmtp,

            copiaIngroupEnviada,

            messageId:
                info.messageId
        };


    } catch (errorMail) {

        // ====================================================
        // 12. ERROR DE ENVÍO / SMTP
        // ====================================================

        console.error(
            "Error al enviar el correo:",
            errorMail
        );


        let motivo =
            "No fue posible enviar el informe por correo.";


        if (errorMail.code === "EAUTH") {

            motivo =
                "El servidor de correo rechazó la autenticación.";

        } else if (
            errorMail.code === "ECONNECTION" ||
            errorMail.code === "ESOCKET"
        ) {

            motivo =
                "No fue posible conectar con el servidor de correo.";

        } else if (
            errorMail.code === "EENVELOPE"
        ) {

            motivo =
                "El servidor rechazó uno o más destinatarios.";
        }


        return {
            estado: "falla",
            enviado: false,

            mensaje:
                motivo,

            emailsValidos,
            emailsInValidos,

            emailsClienteAceptados: [],
            emailsClienteRechazados: [],

            aceptadosSmtp: [],
            rechazadosSmtp: [],

            copiaIngroupEnviada: false,

            messageId: null,

            detalleTecnico:
                errorMail.message
        };

    }
} // FIN enviarCorreo()