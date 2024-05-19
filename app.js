const express = require('express');
const app = express();
const session = require('express-session');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser'); // Asegúrate de incluir esto

dotenv.config({ path: './env/.env' });

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); // Asegúrate de incluir esto
app.use(bodyParser.json()); // Asegúrate de incluir esto
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));
app.use(cookieParser());
app.use('/api', require('./public/controladores/obtenerEventos'));
const { sequelize, Evento, EventoClase, EventoPartido, EventoCampus, EventoOcasion } = require('./database/sequelize-config');


// Controladores
const authController = require('./public/controladores/authController');
const userController = require('./public/controladores/userController');
const companyController = require('./public/controladores/companyController');
const verificacionToken_jwt = require('./public/controladores/jwtMiddleware');
const eventoController = require('./public/controladores/eventoController');

// Rutas
app.post('/registro_nuevo', userController.registro_usuario);
app.post('/registro_nuevo', companyController.registroEmpresa);
app.post('/login', authController.login);
app.post('/auth', authController.login);
app.post('/crear_evento', eventoController.guardarEvento);
app.post('/api/eventos/crear', eventoController.guardarEvento);

app.delete('/api/eliminar_evento/:id', eventoController.eliminarEvento);

// Vistas/Páginas públicas
app.get('/', (req, res) => {
    console.log('Se recibió una solicitud INDEX');
    res.render('main.ejs');
});

app.get('/mostrar_evento', (req, res) => {
    console.log('Se recibió una solicitud MOSTRAR EVENTOS');
    res.render('mostrar_evento.ejs');
});

app.get('/inicio_sesion', (req, res) => {
    console.log('Se recibió una solicitud INICIO DE SESION');
    res.render('inicio_sesion.ejs');
});

app.get('/registro_empresa', (req, res) => {
    console.log('Se recibió una solicitud REGISTRO EMPRESA');
    res.render('registro_empresa.ejs');
});

app.get('/index', (req, res) => {
    console.log('Se recibió una solicitud INDEX');
    res.render('index.ejs');
});

app.get('/registros_unificados', (req, res) => {
    console.log('Se recibió una solicitud REGISTRO USUARIO');
    res.render('registros_unificados.ejs');
});

app.get('/registro_nuevo', (req, res) => {
    console.log('Se recibió una solicitud REGISTRO USUARIO');
    res.render('registro_nuevo.ejs');
});

app.get('/verificar/:token', userController.verificacionCuenta);

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Error al cerrar sesión:", err);
            return res.status(500).send('Error al cerrar sesión');
        }
        // Redirecciono a la pagina principal
        res.render('main.ejs');
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Hubo un error en el servidor');
});

// Rutas privadas para usuarios y empresas
app.get('/espacioUs1', verificacionToken_jwt('user'), (req, res) => {
    console.log('Accediendo un usuario');
    res.render('espacioUs1.ejs');
});

app.get('/espacioEmp', verificacionToken_jwt('company'), (req, res) => {
    console.log('Accediendo una empresa');
    res.render('espacioEmp.ejs');
});

app.get('/crear_evento', verificacionToken_jwt('company'), (req, res) => {
    console.log('Se recibió una solicitud INDEX');
    res.render('crear_evento.ejs');
});

app.get('/mostrar_evento', verificacionToken_jwt(['user', 'company']), (req, res) => {
    console.log('Accediendo una empresa y usuario');
    res.render('mostrar_evento.ejs');
});

app.get('/informacion_evento/:id', async (req, res) => {
    const eventId = req.params.id;
    const resultado = await eventoController.obtenerEventoPorId(eventId);
    if (resultado.error) {
        return res.status(resultado.status).send(resultado.error);
    }
    res.render('informacion_evento', { evento: resultado.data, categoria: resultado.categoria });
});

app.get('/editar_evento/:id', async (req, res) => {
    const eventId = req.params.id;
    const resultado = await eventoController.obtenerEventoPorId(eventId);
    if (resultado.error) {
        return res.status(resultado.status).send(resultado.error);
    }
    res.render('editar_evento', { evento: resultado.data, categoria: resultado.categoria });
});

// POST Endpoint to Update Event
app.post('/api/eventos/:id/actualizar', async (req, res) => {
    const eventId = req.params.id;
    const { titulo, descripcion, numero_entradas, localizacion, precio, deporte, fecha_inicio, fecha_fin, instructor, duracion, nivel, equipo_local, equipo_visitante, liga, programa, tipo_ocasion } = req.body;

    try {
        const evento = await Evento.findByPk(eventId);
        if (!evento) {
            return res.status(404).send('Evento no encontrado');
        }

        // Update general event details
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
        res.status(500).send('Error al actualizar el evento');
    }
});

// Configuración del servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor en funcionamiento en http://localhost:${PORT}`);
});

module.exports = app;
