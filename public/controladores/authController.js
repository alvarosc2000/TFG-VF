const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { Usuario } = require('../../database/sequelize-config');

async function login(req, res) {
    const { user, pass } = req.body; // Notamos que el rol no se toma del body, ya que debe venir del usuario encontrado

    try {
        // Buscar al usuario en la base de datos
        const usuario_encontrado = await Usuario.findOne({
            where: {
                user: user,
                verified: true // Asegúrate de tener un campo 'verified' en tu modelo Usuario
            }
        });

        // Si el usuario no existe o no está verificado, responder con un error 401
        if (!usuario_encontrado) {
            return res.status(401).send('Usuario y/o contraseña incorrectos');
        }

        // Comparar la contraseña ingresada con la contraseña almacenada en hash
        const contrasena_valida = await bcryptjs.compare(pass, usuario_encontrado.pass);

        // Si la contraseña no es válida, responder con un error 401
        if (!contrasena_valida) {
            return res.status(401).send('Usuario y/o contraseña incorrectos');
        }

        // Generar un token JWT con los datos del usuario
        const token = jwt.sign({
            id: usuario_encontrado.id_usuario,
            user: usuario_encontrado.user,
            role: usuario_encontrado.role, // Asegúrate de que el rol se obtiene del usuario encontrado
            persona_id: usuario_encontrado.persona_id,
            compania_id: usuario_encontrado.compania_id
        }, process.env.JWT_SECRET, { expiresIn: '2h' });

        // Guardar el token y otros datos del usuario en la sesión
        req.session.user = {
            token: token,
            user: usuario_encontrado.user,
            role: usuario_encontrado.role, // Guardar el rol del usuario en la sesión
            userId: usuario_encontrado.id_usuario // Guardar userId en la sesión
        };

        // Redirigir al usuario según su rol
        switch (usuario_encontrado.role) {
            case 'user':
                res.redirect('/espacioUs1');
                break;
            case 'company':
                res.redirect('/espacioEmp');
                break;
            case 'admin':
                res.redirect('/espacioAdm');
                break;
            default:
                res.status(500).send('El rol del usuario no está definido correctamente');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
}

module.exports = {
    login,
};
