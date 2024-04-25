const connection = require('../../database/db');
const { registroUsuario } = require('./userController');

async function registroPersona(user, pass, email) {
    try {
        await registroUsuario(user, pass, email, 'user');
        await insertarPersona(user, email);
        return 'Registro de persona exitoso';
    } catch (error) {
        throw new Error('Error en el registro de persona: ' + error.message);
    }
}

async function insertarPersona(user, email) {
    return new Promise((resolve, reject) => {
        connection.query('INSERT INTO Persona (user, email) VALUES (?, ?)', [user, email], (error) => {
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
