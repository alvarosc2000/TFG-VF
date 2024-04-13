const bcryptjs = require('bcryptjs');
const connection = require('../../database/db');

//Renderiza la vista de registro de empresa
const renderCompanyRegistration = (req, res) => {
   res.render('company/registration');
}

// Registra una nueva empresa
const registro_empresa = async (req, res) => {
    const { user, pass, pass2, email, nif, contacto } = req.body;
    if (pass !== pass2) {
        return res.status(400).send('Las contraseñas no coinciden');
    }
    try {
        // Verificar si el usuario ya existe en la tabla de Usuarios
        const userExists = await comprobacionUsuarios(user);
        if (userExists) {
            return res.status(400).send('El nombre de usuario ya está en uso');
        }

        const passwordHash = await bcryptjs.hash(pass, 8);
        // Modificamos la consulta INSERT INTO para incluir la columna role con valor "company"
        connection.query('INSERT INTO Empresa SET ?', { user, pass: passwordHash, email, nif, contacto, role: 'company' }, (error) => {
            if (error) {
                console.log(error);
                res.status(500).send('Error interno del servidor');
            } else {
                res.send('Registro de empresa exitoso.');
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
};

// Verifica si un usuario ya existe en la tabla de Usuarios
const comprobacionUsuarios = (username) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM Usuario WHERE user = ?', [username], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.length > 0);
            }
        });
    });
};

module.exports = {
    renderCompanyRegistration,
    registro_empresa
};
