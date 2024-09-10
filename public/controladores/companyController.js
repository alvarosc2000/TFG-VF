const { Usuario, Compania, Persona } = require('../../database/sequelize-config');
const { registro_usuario } = require('./userController');

async function registroEmpresa(user, pass, email) {
    try {
        // Llamar a la función de registro de usuario del controlador de usuario
        const userId = await registro_usuario(user, pass, email, 'company');



        return 'Registro de empresa exitoso';
    } catch (error) {
        throw new Error('Error en el registro de empresa: ' + error.message);
    }
}

module.exports = {
    registroEmpresa
};
