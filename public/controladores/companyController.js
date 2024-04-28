const { Usuario, Compania, Persona } = require('../../database/sequelize-config');
const { registro_usuario } = require('./userController');

async function registroEmpresa(user, pass, email) {
    try {
        // Llamar a la función de registro de usuario del controlador de usuario
        const userId = await registro_usuario(user, pass, email, 'company');

        // No necesitas insertar la empresa aquí, ya que la función de registro de usuario
        // ya se encarga de insertar los datos de la empresa en la tabla Compania

        return 'Registro de empresa exitoso';
    } catch (error) {
        throw new Error('Error en el registro de empresa: ' + error.message);
    }
}

module.exports = {
    registroEmpresa
};
