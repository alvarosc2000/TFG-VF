const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendVerificationEmail = async (email, token) => {
    try {
        return await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Activación de cuenta en ALLSPORT",
            html: getTemplate(token),
        });
    } catch (error) {
        console.log('ERROR CON EMAIL:', error);
    }
};

const sendPasswordResetEmail = async (email, token) => {
    try {
        return await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Restablecimiento de contraseña en ALLSPORT",
            html: getPasswordResetTemplate(token),
        });
    } catch (error) {
        console.log('ERROR CON EMAIL:', error);
    }
};

const sendEntradas = async (email) => {
    try {
        return await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Entradas ALLSPORT",
            html: getEntradas(),
        });
    } catch (error) {
        console.log('ERROR CON EMAIL:', error);
    }
};

function getTemplate(token) {
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

function getPasswordResetTemplate(token) {
    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Restablecimiento de contraseña</title>
        </head>
        <body>
            <h1>Restablecimiento de contraseña</h1>
            <p>Haga clic en el siguiente enlace para restablecer su contraseña:</p>
            <p><a href="http://localhost:4000/auth/reset-password/${token}">Restablecer contraseña</a></p>
        </body>
        </html>
    `;
}

function getEntradas() {
    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Entradas ALLSPORT</title>
        </head>
        <body>
            <h1>Gracias por su compra</h1>
        </body>
        </html>
    `;
}

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendEntradas
};
