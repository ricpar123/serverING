const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function enviarMailConAdjunto({to, subject, html, filename, pdfBase64 }) {
    const buffer = Buffer.from(pdfBase64, "base64");

    const info = await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html,
        attachments: [
            {
                filename,
                content: buffer,
                contentType: "application/pdf"
            }
        ]
    });
    return info;
}

module.exports = {
    enviarMailConAdjunto
};