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
app.use('/api', require('./public/controladores/obtenerEventos'));


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
app.post('/crear_evento',eventoController.guardarEvento);


app.post('/api/eventos/:id/actualizar', async (req, res) => {
    console.log('Solicitud de actualización recibida');
    const eventId = req.params.id;
    const updatedEventData = req.body;

    try {
        const result = await eventoController.actualizarEvento(eventId, updatedEventData);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error al actualizar el evento:', error);
        res.status(500).json({ error: 'Hubo un error al actualizar el evento' });
    }
});




app.get('/api/eliminar_evento', eventoController.eliminarEvento);
app.get('/api/editar_evento',eventoController.actualizarEvento);


app.get('/api/eventos/:id/actualizar', async (req, res) => {
    try {
        const eventId = req.params.id; // Obtener el ID del evento desde los parámetros de la URL
        const updatedEventData = req.body; // Pasar los datos del evento actualizados
        await eventoController.actualizarEvento(eventId, updatedEventData);
        res.status(200).json({ message: 'Evento actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el evento:', error);
        res.status(500).json({ error: 'Hubo un error al actualizar el evento' });
    }
});




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


app.get('/crear_evento',verificacionToken_jwt('company'), (req, res) => {
    console.log('Se recibió una solicitud INDEX');
    res.render('crear_evento.ejs');
});

app.get('/mostrar_evento', verificacionToken_jwt(['user', 'company']), (req, res) => {
    console.log('Accediendo una empresa y usuario');
    res.render('mostrar_evento.ejs');
});

// Ruta para editar evento
app.get('/editar_evento', verificacionToken_jwt('company'), async (req, res) => {
    try {
        const eventId = req.query.id;
        // Obtener los datos del evento por su ID
        const eventoData = await eventoController.obtenerEventoPorId(eventId);
        res.render('editar_evento.ejs', { eventId: eventId, evento: eventoData });
    } catch (error) {
        console.error('Error al obtener los datos del evento:', error);
        res.status(500).send('Hubo un error al obtener los datos del evento');
    }
});

app.get('/informacion_evento', async (req, res) => {
    const eventId = req.query.id;  // Asegúrate de que este parámetro corresponde al que estás usando en la URL
    try {
        const evento = await eventoController.obtenerEventoPorId(eventId);
        res.render('informacion_evento.ejs', { evento: evento });
    } catch (error) {
        console.error('Error al obtener el evento:', error);
        res.status(500).send('Hubo un error al obtener los datos del evento');
    }
});





// Configuracion del servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor en funcionamiento en http://localhost:${PORT}`);
});

module.exports = app;
