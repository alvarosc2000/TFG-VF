const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const connection = require('../../database/db');

async function login(req, res) {
    const { user, pass } = req.body;

    try {
        // Buscar el usuario en la tabla Usuario
        const query = 'SELECT id_usuario, user, pass, email, verified, role, persona_id, compania_id, admin_id FROM Usuario WHERE user = ? AND verified = true';
        
        connection.query(query, [user, user], async (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error interno del servidor');
            }

            if (results.length === 0) {
                return res.status(401).send('Usuario y/o contraseña incorrectos');
            }

            // Comparar la contraseña proporcionada con la almacenada en la base de datos
            const usuario_encontrado = results[0];
            const contrasena_valida = await bcryptjs.compare(pass, usuario_encontrado.pass);

            if (!contrasena_valida) {
                return res.status(401).send('Usuario y/o contraseña incorrectos');
            }

            // Generar un token JWT
            const token = jwt.sign({
                id: usuario_encontrado.id_usuario,
                user: usuario_encontrado.user,
                role: usuario_encontrado.role,
                persona_id: usuario_encontrado.persona_id,
                compania_id: usuario_encontrado.compania_id
            }, process.env.JWT_SECRET, { expiresIn: '2h' });

            // Almacenar el token en la sesión del usuario
            req.session.user = {
                token: token,
                user: usuario_encontrado.user
            };

            // Redirigir al usuario según su rol
            switch (usuario_encontrado.role) {
                case 'user':
                    res.render('espacioUs1', { user: usuario_encontrado.user });
                    break;
                case 'company':
                    res.render('acercaDeE');
                    break;
                default:
                    res.status(500).send('El rol del usuario no está definido correctamente');
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
}

module.exports = {
    login,
};
