const connection = require('../../database/db');
const { registro_usuario } = require('./userController');

async function registroPersona(user, pass, email, nombre, apellido) {
    try {
        const token = generateUniqueToken();
        await registro_usuario(user, pass, email, 'user', token);
        await insertarPersona(user, email, nombre, apellido, token);
        return 'Registro de persona exitoso';
    } catch (error) {
        throw new Error('Error en el registro de persona: ' + error.message);
    }
}

async function insertarPersona(user, email, nombre, apellido, token) {
    return new Promise((resolve, reject) => {
        // Insertar los datos de la persona en la tabla Persona
        connection.query('INSERT INTO Persona (nombre, apellido, email, usuario_id, token) VALUES (?, ?, ?, ?, ?)', [nombre, apellido, email, userId, token], (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

module.exports = {
    registroPersona
};
