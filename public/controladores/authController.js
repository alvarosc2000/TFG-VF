const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { Usuario, Compania } = require('../../database/sequelize-config');

async function login(req, res) {
    const { user, pass } = req.body;

    try {
        // Buscar al usuario en la base de datos
        const usuario_encontrado = await Usuario.findOne({
            where: {
                user: user,
                verified: true
            },
            include: Compania
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
            role: usuario_encontrado.role,
            compania_id: usuario_encontrado.Companium ? usuario_encontrado.Companium.id_compania : null
        }, process.env.JWT_SECRET, { expiresIn: '2h' });

        // Guardar el token y otros datos del usuario en la sesión
        req.session.user = {
            token: token,
            user: usuario_encontrado.user,
            role: usuario_encontrado.role,
            userId: usuario_encontrado.id_usuario,
            companiaId: usuario_encontrado.Companium ? usuario_encontrado.Companium.id_compania : null
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
