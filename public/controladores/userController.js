const bcryptjs = require('bcryptjs');
const { Usuario, Compania, Persona } = require('../../database/sequelize-config');
const { sendVerificationEmail } = require('../javascript/mail');
const uuid = require('uuid');

async function registro_usuario(req, res) {
    const { user, pass, pass2, role, email, nif, contacto, nombre, apellido } = req.body;

    // Validar que las contraseñas coincidan
    if (pass !== pass2) {
        return res.status(400).send('Las contraseñas no coinciden');
    }

    // Validar que el campo "role" esté presente
    if (!role) {
        return res.status(400).send('El campo "role" es obligatorio');
    }

    // Validar que el campo "email" esté presente
    if (!email) {
        return res.status(400).send('El campo "email" es obligatorio');
    }

    try {
        // Verificar si ya existe un usuario con el mismo nombre de usuario
        const usuarioExistente = await comprobacionUsuario(user);
        if (usuarioExistente) {
            return res.status(400).send('El nombre de usuario ya está en uso');
        }

        // Verificar si ya existe un usuario con el mismo correo electrónico
        const emailExistente = await comprobacionEmail(email);
        if (emailExistente) {
            return res.status(400).send('El correo electrónico ya está en uso');
        }

        const passwordHash = await bcryptjs.hash(pass, 8);
        const token = generateUniqueToken();

        // Insertar el usuario en la tabla Usuario utilizando Sequelize
        const nuevoUsuario = await Usuario.create({
            user: user,
            pass: passwordHash,
            role: role,
            token: token,
            email: email
        });

        // Insertar los datos de la empresa o persona según el rol
        if (role === 'company') {
            await insertarEmpresa(nuevoUsuario.id_usuario, email, nif, contacto);
        } else if (role === 'user') {
            await insertarPersona(nuevoUsuario.id_usuario, email, nombre, apellido);
        }

        // Enviar correo de verificación
        await sendVerificationEmail(email, token);
        
        res.send('Se ha enviado un correo de verificación. Por favor, revise su bandeja de entrada.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
}

async function comprobacionUsuario(username) {
    const usuario = await Usuario.findOne({
        where: {
            user: username
        }
    });
    return usuario !== null;
}

// Función para verificar si ya existe un usuario con el mismo correo electrónico
async function comprobacionEmail(email) {
    const usuario = await Usuario.findOne({
        where: {
            email: email
        }
    });
    return usuario !== null;
}


async function insertarEmpresa(userId, email, nif, contacto) {
    // Crear la compañía en la base de datos
    const nuevaCompania = await Compania.create({
        email: email,
        nif: nif,
        contacto: contacto
    });
    // Actualizar el campo de id_compania en el usuario
    await Usuario.update({ compania_id: nuevaCompania.id_compania }, { where: { id_usuario: userId } });
}

async function insertarPersona(userId, email, nombre, apellido) {
    // Crear la persona en la base de datos
    const nuevaPersona = await Persona.create({
        nombre: nombre,
        apellido: apellido,
        email: email
    });
    // Actualizar el campo de persona_id en el usuario
    await Usuario.update({ persona_id: nuevaPersona.id_persona }, { where: { id_usuario: userId } });
}

// Verificar una cuenta de usuario
const verificacionCuenta = async (req, res) => {
    const { token } = req.params;
    try {
        const usuario = await Usuario.findOne({
            where: {
                token: token
            }
        });
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

// Generar un token único
function generateUniqueToken() {
    return uuid.v4();
}

module.exports = {
    registro_usuario,
    verificacionCuenta
};
