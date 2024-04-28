const { Usuario, Compania, Persona } = require('../../database/sequelize-config');
const { registro_usuario } = require('./userController');
const uuid = require('uuid');

async function registroPersona(user, pass, email, nombre, apellido) {
    try {
        const token = generateUniqueToken();
        // Llamar a la función de registro de usuario del controlador de usuario
        await registro_usuario(user, pass, email, 'user', token);
        // Insertar los datos de la persona utilizando Sequelize
        await Persona.create({
            nombre: nombre,
            apellido: apellido,
            email: email,
            token: token
        });
        return 'Registro de persona exitoso';
    } catch (error) {
        throw new Error('Error en el registro de persona: ' + error.message);
    }
}

// Generar un token único
function generateUniqueToken() {
    return uuid.v4();
}

module.exports = {
    registroPersona
};
