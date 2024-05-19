const { sequelize, Evento, EventoClase, EventoPartido, EventoCampus, EventoOcasion } = require('../../database/sequelize-config');

async function guardarEvento(req, res) {
    const { titulo, descripcion, numero_entradas, localizacion, precio, categoria, deporte, fecha_inicio, fecha_fin, ...detallesCategoria } = req.body;

    try {
        const evento = await Evento.create({
            titulo,
            descripcion,
            numero_entradas,
            localizacion,
            precio,
            deporte,
            fecha_inicio,
            fecha_fin,
            categoria
        });

        switch (categoria) {
            case 'clases':
                await EventoClase.create({
                    instructor: detallesCategoria.instructor,
                    duracion: detallesCategoria.duracion,
                    nivel: detallesCategoria.nivel,
                    evento_id: evento.id
                });
                break;
            case 'partidos':
                await EventoPartido.create({
                    equipo_local: detallesCategoria.equipo_local,
                    equipo_visitante: detallesCategoria.equipo_visitante,
                    evento_id: evento.id
                });
                break;
            case 'campus':
                await EventoCampus.create({
                    programa: detallesCategoria.programa,
                    evento_id: evento.id
                });
                break;
            case 'ocasion':
                await EventoOcasion.create({
                    tipo_ocasion: detallesCategoria.tipo_ocasion,
                    evento_id: evento.id
                });
                break;
            default:
                return res.status(400).send('Categoría no válida');
        }

        res.send('Evento creado exitosamente con todos los detalles de categoría.');
    } catch (error) {
        console.error('Error al guardar el evento:', error);
        res.status(500).send('Hubo un error al guardar el evento');
    }
}

async function obtenerEventoPorId(eventId) {
    try {
        const evento = await Evento.findByPk(eventId, {
            include: [EventoClase, EventoPartido, EventoCampus, EventoOcasion]
        });
        if (!evento) {
            return { error: 'Evento no encontrado', status: 404 };
        }

        // Identificar la categoría del evento
        let categoria = '';
        if (evento.EventoClase) categoria = 'clase';
        else if (evento.EventoPartido) categoria = 'partido';
        else if (evento.EventoCampus) categoria = 'campus';
        else if (evento.EventoOcasion) categoria = 'ocasion';

        return { data: evento, categoria: categoria, status: 200 };
    } catch (error) {
        console.error('Error al obtener el evento:', error);
        return { error: 'Hubo un error al obtener el evento', status: 500 };
    }
}

async function actualizarEvento(req, res) {
    const eventId = req.params.id;
    const { titulo, descripcion, numero_entradas, localizacion, precio, deporte, fecha_inicio, fecha_fin, instructor, duracion, nivel, equipo_local, equipo_visitante, liga, programa, tipo_ocasion } = req.body;

    try {
        const evento = await Evento.findByPk(eventId);
        if (!evento) {
            return res.status(404).send('Evento no encontrado');
        }

        await evento.update({ titulo, descripcion, numero_entradas, localizacion, precio, deporte, fecha_inicio, fecha_fin });

        // Update specific category details
        if (instructor) {
            await EventoClase.update({ instructor, duracion, nivel }, { where: { evento_id: eventId } });
        } else if (equipo_local) {
            await EventoPartido.update({ equipo_local, equipo_visitante, liga }, { where: { evento_id: eventId } });
        } else if (programa) {
            await EventoCampus.update({ programa }, { where: { evento_id: eventId } });
        } else if (tipo_ocasion) {
            await EventoOcasion.update({ tipo_ocasion }, { where: { evento_id: eventId } });
        }

        res.json({ message: 'Evento actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar el evento:', error);
        res.status(500).send('Hubo un error al actualizar el evento');
    }
}

async function eliminarEvento(req, res) {
    const eventId = req.params.id;
    const t = await sequelize.transaction();

    try {
        await Promise.all([
            EventoClase.destroy({ where: { evento_id: eventId }, transaction: t }),
            EventoPartido.destroy({ where: { evento_id: eventId }, transaction: t }),
            EventoCampus.destroy({ where: { evento_id: eventId }, transaction: t }),
            EventoOcasion.destroy({ where: { evento_id: eventId }, transaction: t })
        ]);

        await Evento.destroy({ where: { id: eventId }, transaction: t });

        await t.commit();
        res.send('Evento eliminado exitosamente');
    } catch (error) {
        console.error('Error durante la eliminación:', error);
        await t.rollback();
        res.status(500).send('Hubo un error al eliminar el evento');
    }
}

module.exports = {
    guardarEvento,
    eliminarEvento,
    obtenerEventoPorId,
    actualizarEvento
};
