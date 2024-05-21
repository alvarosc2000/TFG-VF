const bcryptjs = require('bcryptjs');
const { Usuario, Compania, Persona } = require('../../database/sequelize-config');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../javascript/mail');
const uuid = require('uuid');

async function registro_usuario(req, res) {
    const { user, pass, pass2, role, email, nif, contacto, nombre, apellido } = req.body;

    if (pass !== pass2) {
        return res.status(400).send('Las contraseñas no coinciden');
    }

    if (!role) {
        return res.status(400).send('El campo "role" es obligatorio');
    }

    if (!email) {
        return res.status(400).send('El campo "email" es obligatorio');
    }

    try {
        const usuarioExistente = await comprobacionUsuario(user);
        if (usuarioExistente) {
            return res.status(400).send('El nombre de usuario ya está en uso');
        }

        const emailExistente = await comprobacionEmail(email);
        if (emailExistente) {
            return res.status(400).send('El correo electrónico ya está en uso');
        }

        const passwordHash = await bcryptjs.hash(pass, 8);
        const token = generateUniqueToken();

        const nuevoUsuario = await Usuario.create({
            user: user,
            pass: passwordHash,
            role: role,
            token: token,
            email: email
        });

        if (role === 'company') {
            await insertarEmpresa(nuevoUsuario.id_usuario, email, nif, contacto);
        } else if (role === 'user') {
            await insertarPersona(nuevoUsuario.id_usuario, email, nombre, apellido);
        }

        await sendVerificationEmail(email, token);
        
        res.send('Se ha enviado un correo de verificación. Por favor, revise su bandeja de entrada.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
}

async function comprobacionUsuario(username) {
    const usuario = await Usuario.findOne({ where: { user: username } });
    return usuario !== null;
}

async function comprobacionEmail(email) {
    const usuario = await Usuario.findOne({ where: { email: email } });
    return usuario !== null;
}

async function insertarEmpresa(userId, email, nif, contacto) {
    const nuevaCompania = await Compania.create({
        email: email,
        nif: nif,
        contacto: contacto
    });
    await Usuario.update({ compania_id: nuevaCompania.id_compania }, { where: { id_usuario: userId } });
}

async function insertarPersona(userId, email, nombre, apellido) {
    const nuevaPersona = await Persona.create({
        nombre: nombre,
        apellido: apellido,
        email: email
    });
    await Usuario.update({ persona_id: nuevaPersona.id_persona }, { where: { id_usuario: userId } });
}

const verificacionCuenta = async (req, res) => {
    const { token } = req.params;
    try {
        const usuario = await Usuario.findOne({ where: { token: token } });
        if (!usuario) {
            return res.status(400).send('Token de verificación inválido');
        }
        await Usuario.update({ verified: true }, { where: { token: token } });
        res.send('Usuario verificado correctamente');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
};

function generateUniqueToken() {
    return uuid.v4();
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
