const jwt = require('jsonwebtoken');

const verificacionToken_jwt = (rolesPermitidos = []) => {
    // Si rolesPermitidos no es un arreglo (por ejemplo, se pasa un único rol como string),
    // lo convertimos en un arreglo con ese único rol para estandarizar el manejo.
    if (typeof rolesPermitidos === 'string') {
        rolesPermitidos = [rolesPermitidos];
    }

    return (req, res, next) => {
        // Verifica si hay un token almacenado en la sesión del usuario
        const token = req.session.user && req.session.user.token;

        if (!token) {
            return res.status(403).send({ message: 'Es necesario un token para la autenticación' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            // Verifica si el rol del usuario está dentro de los roles permitidos para acceder a la ruta
            if (rolesPermitidos.length === 0 || rolesPermitidos.includes(req.user.role)) {
                // Si no se especificaron rolesPermitidos (array vacío), o el rol del usuario está incluido, permitir acceso
                next();
            } else {
                // Si el rol del usuario no está en la lista de roles permitidos, denegar acceso
                return res.status(403).send({ message: 'No tiene permiso para acceder a esta página' });
            }
        } catch (error) {
            return res.status(401).send({ message: 'Token inválido o expirado' });
        }
    };
};

module.exports = verificacionToken_jwt;
