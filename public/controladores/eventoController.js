const { sequelize, Usuario, Evento, EventoClase, EventoPartido, EventoCampus, EventoOcasion, FotoEvento } = require('../../database/sequelize-config');
const path = require('path');
const { sendEntradas } = require('../javascript/mail');

async function guardarEvento(req, res) {
    const { titulo, descripcion, numero_entradas, localizacion, precio, categoria, deporte, fecha_inicio, fecha_fin, ...detallesCategoria } = req.body;
    const id_compania = req.session.user.companiaId;

    console.log('Datos recibidos:', req.body);

    if (!id_compania) {
        return res.status(400).send('El id de la compañía es obligatorio');
    }

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
            id_compania
        });

        console.log('Evento creado:', evento);

        switch (categoria) {
            case 'clase':
                await EventoClase.create({
                    instructor: detallesCategoria.instructor,
                    duracion: detallesCategoria.duracion,
                    nivel: detallesCategoria.nivel,
                    evento_id: evento.id
                });
                break;
            case 'partido':
                await EventoPartido.create({
                    equipo_local: detallesCategoria.equipo_local,
                    equipo_visitante: detallesCategoria.equipo_visitante,
                    liga: detallesCategoria.liga,
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

        if (req.files) {
            const fotoPromises = req.files.map(file => {
                return FotoEvento.create({
                    evento_id: evento.id,
                    url: path.join('/uploads', file.filename),
                    descripcion: file.originalname
                });
            });
            await Promise.all(fotoPromises);
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
            include: [EventoClase, EventoPartido, EventoCampus, EventoOcasion, FotoEvento]
        });
        if (!evento) {
            return { error: 'Evento no encontrado', status: 404 };
        }

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
    const id_compania = req.session.user.companiaId;

    try {
        const evento = await Evento.findByPk(eventId);
        if (!evento) {
            return res.status(404).send('Evento no encontrado');
        }

        // Verificar que la compañía es propietaria del evento
        if (req.session.user.role === 'company' && evento.id_compania !== id_compania) {
            return res.status(403).send('No tienes permiso para actualizar este evento');
        }

        await evento.update({ titulo, descripcion, numero_entradas, localizacion, precio, deporte, fecha_inicio, fecha_fin });

        if (instructor) {
            await EventoClase.update({ instructor, duracion, nivel }, { where: { evento_id: eventId } });
        } else if (equipo_local) {
            await EventoPartido.update({ equipo_local, equipo_visitante, liga }, { where: { evento_id: eventId } });
        } else if (programa) {
            await EventoCampus.update({ programa }, { where: { evento_id: eventId } });
        } else if (tipo_ocasion) {
            await EventoOcasion.update({ tipo_ocasion }, { where: { evento_id: eventId } });
        }

        if (req.files) {
            const fotoPromises = req.files.map(file => {
                return FotoEvento.create({
                    evento_id: eventId,
                    url: path.join('/uploads', file.filename),
                    descripcion: file.originalname
                });
            });
            await Promise.all(fotoPromises);
        }

        res.json({ message: 'Evento actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar el evento:', error);
        res.status(500).send('Error al actualizar el evento');
    }
}

async function eliminarEvento(req, res) {
    const eventId = req.params.id;
    const id_compania = req.session.user.companiaId;
    const t = await sequelize.transaction();

    try {
        const evento = await Evento.findByPk(eventId);
        if (!evento) {
            return res.status(404).send('Evento no encontrado');
        }

        // Verificar que la compañía es propietaria del evento
        if (req.session.user.role === 'company' && evento.id_compania !== id_compania) {
            return res.status(403).send('No tienes permiso para eliminar este evento');
        }

        await FotoEvento.destroy({ where: { evento_id: eventId }, transaction: t });

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

async function subirFoto(req, res) {
    const eventId = req.params.id;
    const file = req.file;

    if (!file) {
        return res.status(400).send('No se subió ninguna foto');
    }

    try {
        await FotoEvento.create({
            evento_id: eventId,
            url: path.join('/uploads', file.filename),
            descripcion: file.originalname
        });
        res.json({ message: 'Foto subida exitosamente' });
    } catch (error) {
        console.error('Error al subir la foto:', error);
        res.status(500).send('Error al subir la foto');
    }
}

async function comprarEntrada(eventId, email) {
    try {
        const evento = await Evento.findByPk(eventId);
        if (!evento) {
            console.log('Evento no encontrado');
            return { error: 'Evento no encontrado', status: 404 };
        }
        if (evento.numero_entradas > 0) {
            evento.numero_entradas -= 1;
            await evento.save();
            console.log('Compra realizada con éxito');
            await sendEntradas(email);
            return { message: 'Compra realizada con éxito', status: 200 };
        } else {
            console.log('No hay entradas disponibles');
            return { error: 'No hay entradas disponibles', status: 400 };
        }
    } catch (error) {
        console.error('Error al comprar entrada:', error);
        return { error: 'Error al comprar entrada', status: 500 };
    }
}

async function obtenerEventos(req, res) {
    const userRole = req.session.user.role;
    const companiaId = req.session.user.companiaId;

    try {
        let eventos;

        if (userRole === 'admin') {
            eventos = await Evento.findAll({
                include: [EventoClase, EventoPartido, EventoCampus, EventoOcasion, FotoEvento]
            });
        } else if (userRole === 'company') {
            eventos = await Evento.findAll({
                where: { id_compania: companiaId },
                include: [EventoClase, EventoPartido, EventoCampus, EventoOcasion, FotoEvento]
            });
        } else if (userRole === 'user') {
            eventos = await Evento.findAll({
                include: [EventoClase, EventoPartido, EventoCampus, EventoOcasion, FotoEvento]
            });
        } else {
            return res.status(403).send('Acceso denegado');
        }

        res.json(eventos);
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        res.status(500).send('Error interno del servidor');
    }
}

module.exports = {
    guardarEvento,
    eliminarEvento,
    obtenerEventoPorId,
    actualizarEvento,
    subirFoto,
    comprarEntrada,
    obtenerEventos
};
