const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const connection = require('../../database/db');

async function login(req, res) {
    const { user, pass } = req.body;

    try {
        // Buscamos el usuario en las tablas
        let query = 'SELECT id, user, pass, email, verified, role FROM Usuario WHERE user = ? AND verified = true UNION SELECT id, user, pass, email, NULL as verified, role FROM Empresa WHERE user = ?';
        
        connection.query(query, [user, user], async (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error interno del servidor');
            }

            if (results.length === 0) {
                return res.status(401).send('Usuario y/o contraseña incorrectos');
            }

            // Primera aparicion
            const usuario_encontrado = results[0];
            const encontrado = await bcryptjs.compare(pass, usuario_encontrado.pass);

            if (!encontrado) {
                return res.status(401).send('Usuario y/o contraseña incorrectos');
            }

            // Usuario encontrado y contraseña correcta, generamos el JWT
            // Genero el token
            const token = jwt.sign({
                id: usuario_encontrado.id,
                user: usuario_encontrado.user,
                role: usuario_encontrado.role 
            }, process.env.JWT_SECRET, { expiresIn: '2h' });

            // Guardamos el token en la sesión del usuario
            req.session.user = {
                token: token,
                user: usuario_encontrado.user
            };

            // Redireccionamos al usuario según su rol
            if (usuario_encontrado.role === 'user') {
                res.render('espacioUs1', { user: usuario_encontrado.user }); // Pasamos el nombre de usuario a la vista
            } else if (usuario_encontrado.role === 'company') {
                res.render('acercaDeE');
            } else {
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
