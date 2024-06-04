const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { Usuario, Persona, Compania } = require('../../database/sequelize-config');

async function login(req, res) {
    const { user, pass } = req.body;

    try {
        const usuario_encontrado = await Usuario.findOne({
            where: {
                user: user,
                verified: true
            }
        });

        if (!usuario_encontrado) {
            return res.status(401).send('Usuario y/o contraseña incorrectos');
        }

        const contrasena_valida = await bcryptjs.compare(pass, usuario_encontrado.pass);

        if (!contrasena_valida) {
            return res.status(401).send('Usuario y/o contraseña incorrectos');
        }

        const token = jwt.sign({
            id: usuario_encontrado.id_usuario,
            user: usuario_encontrado.user,
            role: usuario_encontrado.role,
            persona_id: usuario_encontrado.persona_id,
            compania_id: usuario_encontrado.compania_id
        }, process.env.JWT_SECRET, { expiresIn: '2h' });

        req.session.user = {
            token: token,
            user: usuario_encontrado.user
        };

        switch (usuario_encontrado.role) {
            case 'user':
                res.redirect('/espacioUs1');
                break;
            case 'company':
                res.redirect('/espacioEmp');
                break;
            case 'admin':
                res.redirect('/adminDashboard');
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
