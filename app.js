const express = require('express');
const app = express();
const session = require('express-session');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config({ path: './env/.env' });

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));
app.use(cookieParser());

// Controladores
const authController = require('./public/controladores/authController');
const userController = require('./public/controladores/userController');
const companyController = require('./public/controladores/companyController');
const verificacionToken_jwt = require('./public/controladores/jwtMiddleware');

// Rutas
app.post('/registro_nuevo', userController.registro_usuario);
app.post('/registro_nuevo', companyController.registroEmpresa);
app.post('/login', authController.login);
app.post('/auth', authController.login); 

// Vistas/Páginas públicas
app.get('/', (req, res) => {
    console.log('Se recibió una solicitud INDEX');
    res.render('main.ejs');
});

app.get('/inicio_sesion', (req, res) => {
    console.log('Se recibió una solicitud INICIO DE SESION');
    res.render('inicio_sesion.ejs');
});

app.get('/registro_empresa', (req, res) => {
    console.log('Se recibió una solicitud REGISTRO EMPRESA');
    res.render('registro_empresa.ejs');
});

app.get('/registro_usuario', (req, res) => {
    console.log('Se recibió una solicitud REGISTRO USUARIO');
    res.render('registro_usuario.ejs');
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
app.get('/prueba', verificacionToken_jwt('user'), (req, res) => {
    console.log('Accediendo un usuario');
    res.render('prueba.ejs'); 
});

app.get('/acercaDeE', verificacionToken_jwt('company'), (req, res) => {
    console.log('Accediendo una empresa');
    res.render('acercaDeE.ejs'); 
});

app.get('/eventos', verificacionToken_jwt(['user', 'company']), (req, res) => {
    console.log('Accediendo una empresa y usuario');
    res.render('eventos.ejs');
});

// Configuracion del servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor en funcionamiento en http://localhost:${PORT}`);
});

module.exports = app;
