const bcryptjs = require('bcryptjs');
const connection = require('../../database/db');
const { sendVerificationEmail } = require('../javascript/mail');
const uuid = require('uuid');

async function registro_usuario(req, res) {
    const { user, pass, pass2, role, email, nif, contacto, nombre, apellido } = req.body;

    // Validar que las contraseñas coincidan
    if (pass !== pass2) {
        return res.status(400).send('Las contraseñas no coinciden');
    }

    // Validar que el campo "role" esté presente
    if (!role) {
        return res.status(400).send('El campo "role" es obligatorio');
    }

    // Validar que el campo "email" esté presente
    if (!email) {
        return res.status(400).send('El campo "email" es obligatorio');
    }

    try {
        // Verificar si ya existe un usuario con el mismo nombre de usuario
        const existingUser = await comprobacionUsuario(user);
        if (existingUser) {
            return res.status(400).send('El nombre de usuario ya está en uso');
        }

        // Verificar si ya existe un usuario con el mismo correo electrónico
        const existingEmail = await comprobacionEmail(email);
        if (existingEmail) {
            return res.status(400).send('El correo electrónico ya está en uso');
        }

        const passwordHash = await bcryptjs.hash(pass, 8);
        const token = generateUniqueToken();

        // Insertar el usuario en la tabla Usuario
        connection.query('INSERT INTO Usuario SET ?', { user: user, pass: passwordHash, role: role, token: token, email: email }, async (error, results) => {
            if (error) {
                console.log(error);
                return res.status(500).send('Error interno del servidor');
            }

            try {
                // Obtener el ID del usuario recién creado
                const userId = results.insertId;

                // Insertar los datos de la empresa en la tabla Compania si el rol es "company"
                if (role === 'company') {
                    await insertarEmpresa(userId, email, nif, contacto);
                } else if (role === 'user') {
                    await insertarPersona(userId, email, nombre, apellido);
                }

                // Enviar correo de verificación
                await sendVerificationEmail(email, token);
                
                res.send('Se ha enviado un correo de verificación. Por favor, revise su bandeja de entrada.');
            } catch (error) {
                console.error(error);
                res.status(500).send('Error al registrar el usuario');
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
}

// Función para verificar si ya existe un usuario con el mismo nombre de usuario
async function comprobacionUsuario(username) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM Usuario WHERE user = ?', [username], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.length > 0);
            }
        });
    });
}

// Función para verificar si ya existe un usuario con el mismo correo electrónico
async function comprobacionEmail(email) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM Usuario WHERE email = ?', [email], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.length > 0);
            }
        });
    });
}

async function insertarEmpresa(userId, email, nif, contacto) {
    return new Promise((resolve, reject) => {
        // Insertar los datos de la empresa en la tabla Compania
        connection.query('INSERT INTO Compania (email, nif, contacto) VALUES (?, ?, ?)', [email, nif, contacto], (error, results) => {
            if (error) {
                reject(error);
            } else {
                // Obtener el ID de la empresa recién creada
                const companyId = results.insertId;
                // Actualizar el campo de id_compania en la tabla Usuario con el ID de la empresa recién creada
                connection.query('UPDATE Usuario SET compania_id = ? WHERE id_usuario = ?', [companyId, userId], (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(companyId); // Resuelve la promesa con el ID de la empresa
                    }
                });
            }
        });
    });
}

async function insertarPersona(userId, email, nombre, apellido) {
    return new Promise((resolve, reject) => {
        // Insertar los datos de la persona en la tabla Persona
        connection.query('INSERT INTO Persona (nombre, apellido, email) VALUES (?, ?, ?)', [nombre, apellido, email], (error, results) => {
            if (error) {
                reject(error);
            } else {
                // Obtener el ID de la persona recién creada
                const personaId = results.insertId;
                // Actualizar el campo de id_persona en la tabla Usuario con el ID de la persona recién creada
                connection.query('UPDATE Usuario SET persona_id = ? WHERE id_usuario = ?', [personaId, userId], (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(personaId); // Resuelve la promesa con el ID de la persona
                    }
                });
            }
        });
    });
}


/*
async function insertarEmailEnTablaCorrespondiente(userId, email, role) {
    const tablaCorrespondiente = role === 'company' ? 'Compania' : 'Persona';
    const columnId = role === 'company' ? 'id_compania' : 'persona_id';

    return new Promise((resolve, reject) => {
        connection.query(`UPDATE ${tablaCorrespondiente} SET email = ? WHERE ${columnId} = ?`, [email, userId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

*/

// Verificar una cuenta de usuario
const verificacionCuenta = (req, res) => {
    const { token } = req.params;
    connection.query('UPDATE Usuario SET verified = true WHERE token = ?', [token], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error interno del servidor');
        }
        if (results.affectedRows === 0) {
            return res.status(400).send('Token de verificación inválido');
        }
        res.send('Usuario verificado correctamente');
    });
};

// Generar un token único
function generateUniqueToken() {
    return uuid.v4();
}

// Comprobar si hay usuarios con el mismo nombre de usuario
async function comprobacionUsuario(username) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM Usuario WHERE user = ?', [username], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.length > 0);
            }
        });
    });
}

module.exports = {
    registro_usuario,
    verificacionCuenta
};
