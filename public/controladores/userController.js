const bcryptjs = require('bcryptjs');
const connection = require('../../database/db');
const { sendVerificationEmail } = require('../javascript/mail');
const uuid = require('uuid');


// Registra un nuevo usuario
const registro_usuario = async (req, res) => {
    const user = req.body.user;
    const pass = req.body.pass;
    const pass2 = req.body.pass2;
    const email = req.body.email;

    if (pass !== pass2) {
        return res.status(400).send('Las contraseñas no coinciden');
    }

    try {
        // Verificar si ya existe un usuario con el mismo nombre de usuario o correo electrónico
        const existingUser = await comprobacionUsuario(user, email);
        if (existingUser) {
            return res.status(400).send('El nombre de usuario o correo electrónico ya está en uso');
        }

        const passwordHash = await bcryptjs.hash(pass, 8);
        const token = generateUniqueToken();

        // Inserto el usuario
        connection.query('INSERT INTO Usuario SET ?', { user: user, pass: passwordHash, email: email, verified: false, token: token, role:'user' }, async (error, results) => {
            if (error) {
                console.log(error);
                res.status(500).send('Error interno del servidor');
            } else {
                try {
                    await sendVerificationEmail(email, token); // Llamar a la función sendVerificationEmail
                    res.send('Se ha enviado un correo de verificación. Por favor, revise su bandeja de entrada.');
                } catch (error) {
                    console.error(error);
                    res.status(500).send('Error al enviar el correo de verificación');
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
};

// Verifica una cuenta de usuario
const verificacionCuenta = (req, res) => {
    const { token } = req.params;
    connection.query('UPDATE Usuario SET verified = true WHERE token = ?', [token], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error interno del servidor');
        }
        if (results.affectedRows === 0) {
            return res.status(400).send('Token de verificación inválido');
        }
        res.send('Usuario verificado correctamente');
    });
};

// Genera un token único
function generateUniqueToken() {
    return uuid.v4();
}


//Comprueba si hay usuarios creados con los mismo datos

async function comprobacionUsuario(username, email) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM Usuario WHERE user = ? OR email = ?', [username, email], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.length > 0);
            }
        });
    });
}

module.exports = {
    registro_usuario,
    verificacionCuenta
};
