const { User } = require('../../database/sequelize-config');

function verificarRole(rolesPermitidos) {
    return async (req, res, next) => {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).send('No autorizado');
        }

        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(401).send('No autorizado');
            }

            if (rolesPermitidos.includes(user.role)) {
                req.user = user;
                next();
            } else {
                return res.status(403).send('Acceso denegado');
            }
        } catch (error) {
            console.error('Error al verificar rol del usuario:', error);
            res.status(500).send('Error del servidor');
        }
    };
}

module.exports = verificarRole;
