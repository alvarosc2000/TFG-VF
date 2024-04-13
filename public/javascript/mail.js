const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'alvaroinvest77@gmail.com',
        pass: 'hhxicaovfvqgrdkh'
    }
});

const sendVerificationEmail = async (email, token) => {
    try {
        return await transporter.sendMail({
            from: 'alvaroinvest77@gmail.com',
            to: email,
            subject: "Activación de cuenta en ALLSPORT",
            html: getTemplate(token), // Usamos el token como contenido HTML del correo
        });
    } catch (error) {
        console.log('ERROR CON EMAIL:', error);
    }
}

// Función para generar el contenido HTML del correo electrónico de verificación
function getTemplate (token) {
    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Verificación de cuenta</title>
        </head>
        <body>
            <h1>Verificación de cuenta </h1>
            <p>Cuenta creada en ALLSPORT MALAGA</p>
            <p>Por favor, haga clic en el siguiente enlace para activar su cuenta:</p>
            <p><a href="http://localhost:4000/verificar/${token}">Activar cuenta</a></p>
        </body>
        </html>
    `;
}

module.exports = {
    sendVerificationEmail
}