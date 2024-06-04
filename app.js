const express = require('express');
const app = express();
const session = require('express-session');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

dotenv.config({ path: './env/.env' });

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/resources', express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs');
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));
app.use(cookieParser());
app.use('/api', require('./public/controladores/obtenerEventos'));


const { sequelize, Evento, EventoClase, EventoPartido, EventoCampus, EventoOcasion, FotoEvento } = require('./database/sequelize-config');

// Controladores
const authController = require('./public/controladores/authController');
const userController = require('./public/controladores/userController');
const companyController = require('./public/controladores/companyController');
const verificacionToken_jwt = require('./public/controladores/jwtMiddleware');
const eventoController = require('./public/controladores/eventoController');

// Configuración de Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname);
    }
});

const upload = multer({ storage });

// Rutas
app.post('/registro_nuevo', userController.registro_usuario);
app.post('/registro_nuevo', companyController.registroEmpresa);
app.post('/login', authController.login);
app.post('/auth', authController.login);
app.post('/crear_evento', upload.array('fotos', 10), eventoController.guardarEvento);
app.post('/api/eventos/crear', upload.array('fotos', 10), eventoController.guardarEvento);

app.delete('/api/eliminar_evento/:id', eventoController.eliminarEvento);

// Vistas/Páginas públicas
app.get('/', (req, res) => {
    res.render('main.ejs');
});

app.get('/mostrar_evento', (req, res) => {
    res.render('mostrar_evento.ejs');
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

// Rutas privadas para usuarios y empresas
app.get('/espacioUs1', verificacionToken_jwt('user'), (req, res) => {
    res.render('espacioUs1.ejs');
});

app.get('/espacioEmp', verificacionToken_jwt('company'), (req, res) => {
    res.render('espacioEmp.ejs');
});

app.get('/crear_evento', verificacionToken_jwt('company'), (req, res) => {
    res.render('crear_evento.ejs');
});

app.get('/mostrar_evento', verificacionToken_jwt(['user', 'company']), (req, res) => {
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

app.get('/olvidarContrasena', (req, res) => {
    res.render('olvidarContrasena.ejs');
});

app.post('/auth/forgot-password', userController.forgotPassword);
app.get('/auth/reset-password/:token', userController.resetPasswordPage);
app.post('/auth/reset-password/:token', userController.resetPassword);

// POST Endpoint to Update Event
app.post('/api/eventos/:id/actualizar', upload.array('fotos', 10), eventoController.actualizarEvento);

// POST Endpoint to Upload Photo
app.post('/api/eventos/:id/subirFoto', upload.single('foto'), eventoController.subirFoto);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Hubo un error en el servidor');
});

// Configuración del servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor en funcionamiento en http://localhost:${PORT}`);
});

module.exports = app;
