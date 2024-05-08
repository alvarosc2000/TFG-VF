const { Evento } = require('../../database/sequelize-config');

async function guardarEvento(req, res) {
    const { titulo, descripcion, numero_entradas, localizacion, precio } = req.body;

    try {
        // Crear un nuevo evento en la base de datos
        await Evento.create({
            titulo: titulo,
            descripcion: descripcion,
            numero_entradas: numero_entradas,
            localizacion: localizacion,
            precio: precio
        });

        // Enviar una respuesta de éxito después de crear el evento
        res.send('Evento creado exitosamente');
    } catch (error) {
        console.error('Error al guardar el evento:', error);
        res.status(500).send('Hubo un error al guardar el evento');
    }
}

module.exports = {
    guardarEvento,
};
