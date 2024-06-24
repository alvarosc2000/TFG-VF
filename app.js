const express = require('express');
const app = express();
const session = require('express-session');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

// Configuración de variables de entorno
dotenv.config({ path: './env/.env' });

// Middleware personalizado
const verificarRole = require('./public/controladores/roleMiddleware');

// Configuración de middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/resources', express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs');
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Asegúrate de que esté en false durante el desarrollo. Cámbialo a true en producción.
}));
app.use(cookieParser());
app.use('/api', require('./public/controladores/obtenerEventos'));

// Importación de modelos y controladores
const { sequelize, Evento, EventoPartido, Usuario } = require('./database/sequelize-config');
const authController = require('./public/controladores/authController');
const userController = require('./public/controladores/userController');
const companyController = require('./public/controladores/companyController');
const verificacionToken_jwt = require('./public/controladores/jwtMiddleware');
const eventoController = require('./public/controladores/eventoController');

// Configuración de almacenamiento de archivos para multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname);
    }
});

const upload = multer({ storage });

// Middleware para obtener el rol del usuario y pasarlo a las vistas
app.use(async (req, res, next) => {
    if (req.session.userId) {
        const user = await Usuario.findByPk(req.session.userId);
        res.locals.userRole = user ? user.role : null;
    } else {
        res.locals.userRole = null;
    }
    next();
});

// Ruta para comprar entradas
app.post('/api/comprar_entrada/:id', async (req, res) => {
    const eventId = req.params.id;
    const usuario = await Usuario.findByPk(req.session.user.userId); // Obtener el usuario de la sesión

    if (!usuario) {
        return res.status(401).send({ error: 'Usuario no autenticado' });
    }

    const resultado = await eventoController.comprarEntrada(eventId, usuario.email); // Pasar el email del usuario

    if (resultado.error) {
        console.log('Error:', resultado.error);  // Agregar mensaje de depuración
        return res.status(resultado.status).send({ error: resultado.error });
    }

    console.log('Message:', resultado.message);  // Agregar mensaje de depuración
    res.status(resultado.status).send({ message: resultado.message });
});


app.get('/mostrar_evento', (req, res) => {
    const userRole = req.session.user ? req.session.user.role : null; // Obtener el rol del usuario desde la sesión
    res.render('mostrar_evento', { userRole });
});




// Rutas de autenticación y registro
app.post('/registro_nuevo', userController.registro_usuario);
app.post('/registro_empresa', companyController.registroEmpresa);
app.post('/login', authController.login);
app.post('/auth', authController.login);

// Rutas para la gestión de eventos
app.post('/crear_evento', verificacionToken_jwt(['admin', 'company']), upload.array('fotos', 10), eventoController.guardarEvento);
app.post('/api/eventos/crear', verificacionToken_jwt(['admin', 'company']), upload.array('fotos', 10), eventoController.guardarEvento);
app.delete('/api/eliminar_evento/:id', verificacionToken_jwt(['admin', 'company']), eventoController.eliminarEvento);

// Rutas para las vistas
app.get('/', (req, res) => {
    res.render('main.ejs');
});



app.get('/inicio_sesion', (req, res) => {
    res.render('inicio_sesion.ejs');
});

app.get('/registro_empresa', (req, res) => {
    res.render('registro_empresa.ejs');
});

app.get('/index', (req, res) => {
    res.render('index.ejs');
});

app.get('/registros_unificados', (req, res) => {
    res.render('registros_unificados.ejs');
});

app.get('/registro_nuevo', (req, res) => {
    res.render('registro_nuevo.ejs');
});

app.get('/verificar/:token', userController.verificacionCuenta);

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Error al cerrar sesión:", err);
            return res.status(500).send('Error al cerrar sesión');
        }
        res.render('main.ejs');
    });
});

app.get('/espacioUs1', verificacionToken_jwt(['user', 'admin']), (req, res) => {
    res.render('espacioUs1.ejs');
});

app.get('/espacioEmp', verificacionToken_jwt(['admin', 'company']), (req, res) => {
    res.render('espacioEmp.ejs');
});

app.get('/espacioAdm', verificacionToken_jwt('admin'), (req, res) => {
    res.render('espacioAdm.ejs');
});

app.get('/crear_evento', verificacionToken_jwt(['admin', 'company']), (req, res) => {
    res.render('crear_evento.ejs');
});

// Rutas para mostrar eventos por categoría
app.get('/vista_eventos_partidos', verificacionToken_jwt(['user', 'company', 'admin']), async (req, res) => {
    try {
        const partidos = await Evento.findAll({
            where: { categoria: 'partido' }
        });
        res.render('vista_eventos_partidos', { eventos: partidos });
    } catch (error) {
        console.error("Error al obtener partidos:", error);
        res.status(500).json({ error: 'Error al obtener partidos' });
    }
});

app.get('/vista_eventos_clases', verificacionToken_jwt(['user', 'company', 'admin']), async (req, res) => {
    try {
        const clases = await Evento.findAll({
            where: { categoria: 'clase' }
        });
        res.render('vista_eventos_clases', { eventos: clases });
    } catch (error) {
        console.error("Error al obtener clases:", error);
        res.status(500).json({ error: 'Error al obtener clases' });
    }
});

app.get('/vista_eventos_campus', verificacionToken_jwt(['user', 'company', 'admin']), async (req, res) => {
    try {
        const campus = await Evento.findAll({
            where: { categoria: 'campus' }
        });
        res.render('vista_eventos_campus', { eventos: campus });
    } catch (error) {
        console.error("Error al obtener campus:", error);
        res.status(500).json({ error: 'Error al obtener campus' });
    }
});

app.get('/vista_eventos_eventos', verificacionToken_jwt(['user', 'company', 'admin']), async (req, res) => {
    try {
        const eventos = await Evento.findAll({
            where: { categoria: 'ocasion' }
        });
        res.render('vista_eventos_eventos', { eventos: eventos });
    } catch (error) {
        console.error("Error al obtener eventos:", error);
        res.status(500).json({ error: 'Error al obtener eventos' });
    }
});

// Ruta para obtener todos los eventos
app.get('/api/eventos', async (req, res) => {
    try {
        const eventos = await Evento.findAll();

        // Mapear eventos al formato requerido por FullCalendar
        const eventosFormatted = eventos.map(evento => {
            let url = `/informacion_evento/${evento.id}`; // URL por defecto
            switch (evento.categoria) {
                case 'partido':
                    url = `/vista_eventos_partidos/${evento.id}`;
                    break;
                case 'clase':
                    url = `/vista_eventos_clases/${evento.id}`;
                    break;
                case 'evento':
                    url = `/vista_eventos_eventos/${evento.id}`;
                    break;
                case 'campus':
                    url = `/vista_eventos_campus/${evento.id}`;
                    break;
            }
            return {
                title: evento.titulo,
                start: evento.fecha_inicio,
                end: evento.fecha_fin,
                url: url
            };
        });

        res.json(eventosFormatted); // Devolver los eventos formateados como JSON
    } catch (error) {
        console.error("Error al obtener eventos:", error);
        res.status(500).json({ error: 'Error al obtener eventos' });
    }
});

// Ruta para obtener información de un evento por su ID
app.get('/informacion_evento/:id', async (req, res) => {
    const eventId = req.params.id;
    const resultado = await eventoController.obtenerEventoPorId(eventId);
    if (resultado.error) {
        return res.status(resultado.status).send(resultado.error);
    }
    res.render('informacion_evento', { evento: resultado.data, categoria: resultado.categoria });
});

// Ruta para editar un evento
app.get('/editar_evento/:id', async (req, res) => {
    const eventId = req.params.id;
    const resultado = await eventoController.obtenerEventoPorId(eventId);
    if (resultado.error) {
        return res.status(resultado.status).send(resultado.error);
    }
    res.render('editar_evento', { evento: resultado.data, categoria: resultado.categoria });
});

// Rutas para restablecer contraseña
app.get('/olvidarContrasena', (req, res) => {
    res.render('olvidarContrasena.ejs');
});

app.post('/auth/forgot-password', userController.forgotPassword);
app.get('/auth/reset-password/:token', userController.resetPasswordPage);
app.post('/auth/reset-password/:token', userController.resetPassword);

// Rutas para actualizar eventos y subir fotos
app.post('/api/eventos/:id/actualizar', verificacionToken_jwt(['admin', 'company']), upload.array('fotos', 10), eventoController.actualizarEvento);

app.post('/api/eventos/:id/subirFoto', verificacionToken_jwt(['admin', 'company']), upload.single('foto'), eventoController.subirFoto);

// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Hubo un error en el servidor');
});

// Inicio del servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor en funcionamiento en http://localhost:${PORT}`);
});

module.exports = app;
