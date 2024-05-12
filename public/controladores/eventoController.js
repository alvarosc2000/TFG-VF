const { Evento } = require('../../database/sequelize-config');

async function guardarEvento(req, res) {
    const { titulo, descripcion, numero_entradas, localizacion, precio, categoria,deporte, fecha_inicio , fecha_fin} = req.body;

    try {
        await Evento.create({
            titulo: titulo,
            descripcion: descripcion,
            numero_entradas: numero_entradas,
            localizacion: localizacion,
            precio: precio,
            categoria: categoria,
            deporte: deporte,
            fecha_inicio: fecha_inicio,
            fecha_fin: fecha_fin

        });

        res.send('Evento creado exitosamente');
    } catch (error) {
        console.error('Error al guardar el evento:', error);
        res.status(500).send('Hubo un error al guardar el evento');
    }
}

async function eliminarEvento(req, res) {
    const eventId = req.query.id;

    try {
        await Evento.destroy({ where: { id: eventId } });

        res.send('Evento eliminado exitosamente');
    } catch (error) {
        console.error('Error al eliminar el evento:', error);
        res.status(500).send('Hubo un error al eliminar el evento');
    }
}

async function obtenerEventoPorId(eventId) {
    try {
        const evento = await Evento.findByPk(eventId);
        return evento;
    } catch (error) {
        console.error('Error al obtener el evento por ID:', error);
        throw new Error('Hubo un error al obtener el evento por ID');
    }
}

async function actualizarEvento(eventId, updatedEventData) {
    try {
        const eventoExistente = await Evento.findByPk(eventId);

        if (!eventoExistente) {
            console.error('El evento con el ID proporcionado no existe');
            throw new Error('El evento con el ID proporcionado no existe');
        }

        await eventoExistente.update(updatedEventData);

        return { message: 'Evento actualizado exitosamente' };
    } catch (error) {
        console.error('Error al actualizar el evento:', error);
        throw new Error('Hubo un error al actualizar el evento');
    }
}

module.exports = {
    guardarEvento,
    eliminarEvento,
    obtenerEventoPorId,
    actualizarEvento
};
