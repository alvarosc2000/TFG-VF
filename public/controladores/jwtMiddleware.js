// jwtMiddleware.js
const jwt = require('jsonwebtoken');

const verificacionToken_jwt = (rolesPermitidos = []) => {
    if (typeof rolesPermitidos === 'string') {
        rolesPermitidos = [rolesPermitidos];
    }

    return (req, res, next) => {
        const token = req.session.user && req.session.user.token;

        if (!token) {
            return res.status(403).send({ message: 'Es necesario un token para la autenticación' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            if (rolesPermitidos.length === 0 || rolesPermitidos.includes(req.user.role)) {
                next();
            } else {
                return res.status(403).send({ message: 'No tiene permiso para acceder a esta página' });
            }
        } catch (error) {
            return res.status(401).send({ message: 'Token inválido o expirado' });
        }
    };
};

module.exports = verificacionToken_jwt;
