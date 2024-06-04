const bcryptjs = require('bcryptjs');
const { Usuario, Compania, Persona } = require('../../database/sequelize-config');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../javascript/mail');
const uuid = require('uuid');

async function registro_usuario(req, res) {
    const { user, pass, pass2, role, email, nif, contacto, nombre, apellido } = req.body;

    // Verificar que las contraseñas coincidan
    if (pass !== pass2) {
        return res.status(400).send('Las contraseñas no coinciden');
    }

    // Verificar que se haya proporcionado un rol y un correo electrónico
    if (!role || !email) {
        return res.status(400).send('El rol y el correo electrónico son campos obligatorios');
    }

    try {
        // Verificar si ya existe un usuario con el mismo nombre de usuario o correo electrónico
        const usuarioExistente = await Usuario.findOne({ where: { user } });
        if (usuarioExistente) {
            return res.status(400).send('El nombre de usuario ya está en uso');
        }

        const emailExistente = await Usuario.findOne({ where: { email } });
        if (emailExistente) {
            return res.status(400).send('El correo electrónico ya está en uso');
        }

        // Hash de la contraseña
        const passwordHash = await bcryptjs.hash(pass, 8);

        // Generar un token único
        const token = uuid.v4();

        // Crear un nuevo usuario en la base de datos
        const nuevoUsuario = await Usuario.create({
            user,
            pass: passwordHash,
            role,
            email,
            token,
            verified: false
        });

        // Si el rol es "company", crear una nueva entrada en la tabla Compania
        if (role === 'company') {
            const nuevaCompania = await Compania.create({
                usuario_id: nuevoUsuario.id_usuario, // Asignar el id_usuario correspondiente
                email,
                nif,
                contacto
            });
        }

        // Si el rol es "user", crear una nueva entrada en la tabla Persona
        else if (role === 'user') {
            const nuevaPersona = await Persona.create({
                usuario_id: nuevoUsuario.id_usuario, // Asignar el id_usuario correspondiente
                nombre,
                apellido,
                email
            });
        }

        // Enviar correo de verificación
        await sendVerificationEmail(email, token);
        
        res.send('Se ha enviado un correo de verificación. Por favor, revise su bandeja de entrada.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
}


async function verificacionCuenta(req, res) {
    const { token } = req.params;
    try {
        const usuario = await Usuario.findOne({ where: { token } });
        if (!usuario) {
            return res.status(400).send('Token de verificación inválido');
        }
        await Usuario.update({ verified: true, token: null }, { where: { id_usuario: usuario.id_usuario } });
        res.send('Usuario verificado correctamente');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
}

async function forgotPassword(req, res) {
    const { email } = req.body;

    try {
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            return res.status(404).send('Correo electrónico no encontrado');
        }

        const token = uuid.v4();
        await Usuario.update({ resetToken: token }, { where: { email } });

        await sendPasswordResetEmail(email, token);
        res.send('Se ha enviado un correo electrónico con instrucciones para restablecer su contraseña.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
}

async function resetPasswordPage(req, res) {
    const { token } = req.params;

    try {
        const usuario = await Usuario.findOne({ where: { resetToken: token } });
        if (!usuario) {
            return res.status(400).send('Token de restablecimiento inválido');
        }

        res.render('resetPassword.ejs', { token });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
}

async function resetPassword(req, res) {
    const { token } = req.params;
    const { pass, pass2 } = req.body;

    if (pass !== pass2) {
        return res.status(400).send('Las contraseñas no coinciden');
    }

    try {
        const usuario = await Usuario.findOne({ where: { resetToken: token } });
        if (!usuario) {
            return res.status(400).send('Token de restablecimiento inválido');
        }

        const passwordHash = await bcryptjs.hash(pass, 8);
        await Usuario.update(
            { pass: passwordHash, resetToken: null },
            { where: { id_usuario: usuario.id_usuario } }
        );

        res.send('Contraseña restablecida exitosamente');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
}

module.exports = {
    registro_usuario,
    verificacionCuenta,
    forgotPassword,
    resetPasswordPage,
    resetPassword
};
