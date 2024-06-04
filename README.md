# TFG-VF

Tecnologías Utilizadas
Node.js:
Plataforma de desarrollo para construir aplicaciones del lado del servidor con JavaScript.
Manejo de rutas y controladores, integración con bases de datos y gestión de sesiones.
Express.js:
Framework web para Node.js.
Simplificación de la creación de rutas y manejo de middlewares.
Sequelize:
ORM (Object-Relational Mapping) para Node.js.
Facilita la interacción con la base de datos MySQL.
MySQL:
Sistema de gestión de bases de datos relacional.
Almacenamiento de datos de usuarios, eventos y fotos.
Multer:
Middleware para manejar la subida de archivos en aplicaciones Express.
Gestiona el almacenamiento de fotos subidas a eventos.
EJS (Embedded JavaScript Templating):
Motor de plantillas para generar HTML en el lado del servidor.
Utilizado para renderizar vistas dinámicas basadas en datos del servidor.
Bootstrap:
Framework CSS para diseño responsive y estilización.
Creación de formularios, tablas y elementos de interfaz de usuario.
jQuery:
Biblioteca JavaScript para simplificar la manipulación del DOM y las solicitudes AJAX.
Manejo de eventos y actualización dinámica de la interfaz de usuario.
Boxicons:
Conjunto de iconos vectoriales.
Utilizados para mejorar la interfaz de usuario con iconos en botones y menús.
Dotenv:
Biblioteca para cargar variables de entorno desde un archivo .env.
Gestión de configuración sensible como credenciales de base de datos y claves secretas.
Aspectos Importantes para un TFG de Ingeniería Informática
Arquitectura del Sistema:

Descripción de la arquitectura basada en Node.js y Express.js.
Uso de MVC (Model-View-Controller) para organizar el código.
Diagramas de flujo de datos y estructuras de la aplicación.
Gestión de Bases de Datos:

Diseño del esquema de la base de datos MySQL.
Relaciones entre tablas como Usuario, Evento, FotoEvento, EventoClase, EventoPartido, EventoCampus y EventoOcasion.
Consultas SQL generadas por Sequelize y cómo se gestionan las transacciones.
Manejo de Subida de Archivos:

Uso de Multer para la gestión de archivos subidos.
Almacenamiento y acceso a fotos subidas en la carpeta uploads.
Asociación de fotos con eventos en la base de datos.
Autenticación y Autorización:

Implementación de autenticación de usuarios con sesiones y tokens JWT.
Control de acceso basado en roles (user, company).
Verificación de usuarios y manejo de restablecimiento de contraseñas.
Interfaz de Usuario y Experiencia de Usuario (UI/UX):

Uso de Bootstrap para diseño responsivo y consistente.
Implementación de filtros y ordenación de tablas dinámicas con jQuery.
Integración de iconos con Boxicons para mejorar la interfaz.
Despliegue y Configuración del Entorno:

Configuración de variables de entorno con Dotenv.
Proceso de despliegue de la aplicación en un entorno de producción.
Gestión de dependencias con package.json y package-lock.json.
Manejo de Errores y Seguridad:

Gestión de errores en el servidor con middleware de Express.
Validación y sanitización de datos de entrada.
Seguridad en el manejo de sesiones y almacenamiento de contraseñas con bcryptjs.
Datos Clave
Rutas Principales: Manejo de usuarios (registro, login, verificación), gestión de eventos (crear, actualizar, eliminar), y subida de fotos.
Modelos de Datos: Definición de esquemas para usuarios, eventos y sus respectivas categorías.
Procesos Dinámicos: Uso de AJAX para actualizar la interfaz sin recargar la página, filtrado y ordenación de datos en tiempo real.
Integración de Terceros: Envío de correos electrónicos para verificación de cuenta y restablecimiento de contraseñas.
Transacciones de Base de Datos: Uso de transacciones en Sequelize para garantizar la integridad de datos durante operaciones críticas.




CREATE TABLE `usuario` (
    `id_usuario` INT NOT NULL AUTO_INCREMENT,
    `user` VARCHAR(255) NOT NULL,
    `pass` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `verified` BOOLEAN DEFAULT FALSE,
    `role` ENUM('user', 'company') NOT NULL,
    `token` VARCHAR(255),
    `compania_id` INT,
    `persona_id` INT,
    `admin_id` INT,
    PRIMARY KEY (`id_usuario`),
    FOREIGN KEY (`compania_id`) REFERENCES `compania`(`id_compania`),
    FOREIGN KEY (`persona_id`) REFERENCES `persona`(`id_persona`),
    FOREIGN KEY (`admin_id`) REFERENCES `usuario`(`id_usuario`)
);


CREATE TABLE `compania` (
    `id_compania` INT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `nif` VARCHAR(255),
    `contacto` VARCHAR(255),
    PRIMARY KEY (`id_compania`)
);


CREATE TABLE `persona` (
    `id_persona` INT NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(255) NOT NULL,
    `apellido` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id_persona`)
);


CREATE TABLE `evento` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(255) NOT NULL,
    `descripcion` TEXT,
    `numero_entradas` INT,
    `localizacion` VARCHAR(255),
    `precio` DECIMAL(10, 2),
    `fecha_inicio` DATE,
    `fecha_fin` DATE,
    `deporte` TEXT,
    PRIMARY KEY (`id`)
);


CREATE TABLE `eventos_clases` (
    `evento_id` INT NOT NULL,
    `instructor` VARCHAR(255),
    `duracion` VARCHAR(255),
    `nivel` VARCHAR(255),
    PRIMARY KEY (`evento_id`),
    FOREIGN KEY (`evento_id`) REFERENCES `evento`(`id`)
);


CREATE TABLE `eventos_partidos` (
    `evento_id` INT NOT NULL,
    `equipo_local` VARCHAR(255),
    `equipo_visitante` VARCHAR(255),
    `liga` VARCHAR(255),
    PRIMARY KEY (`evento_id`),
    FOREIGN KEY (`evento_id`) REFERENCES `evento`(`id`)
);


CREATE TABLE `eventos_campus` (
    `evento_id` INT NOT NULL,
    `programa` VARCHAR(255),
    PRIMARY KEY (`evento_id`),
    FOREIGN KEY (`evento_id`) REFERENCES `evento`(`id`)
);


CREATE TABLE `eventos_ocasion` (
    `evento_id` INT NOT NULL,
    `tipo_ocasion` VARCHAR(255),
    PRIMARY KEY (`evento_id`),
    FOREIGN KEY (`evento_id`) REFERENCES `evento`(`id`)
);


CREATE TABLE `fotos_evento` (
    `foto_id` INT NOT NULL AUTO_INCREMENT,
    `evento_id` INT NOT NULL,
    `url` VARCHAR(255),
    `descripcion` TEXT,
    PRIMARY KEY (`foto_id`),
    FOREIGN KEY (`evento_id`) REFERENCES `evento`(`id`)
);


CREATE TABLE `admin` (
    `id_admin` INT NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `apellido` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id_admin`)
);


-----------



-- Desactivar las verificaciones de foreign keys
SET FOREIGN_KEY_CHECKS = 0;

-- Crear la tabla `usuario`
CREATE TABLE `usuario` (
    `id_usuario` INT NOT NULL AUTO_INCREMENT,
    `user` VARCHAR(255) NOT NULL,
    `pass` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `verified` BOOLEAN DEFAULT FALSE,
    `role` ENUM('user', 'company', 'admin') NOT NULL,
    `token` VARCHAR(255),
    PRIMARY KEY (`id_usuario`)
);

-- Crear la tabla `persona`
CREATE TABLE `persona` (
    `id_persona` INT NOT NULL AUTO_INCREMENT,
    `usuario_id` INT NOT NULL,
    `nombre` VARCHAR(255) NOT NULL,
    `apellido` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id_persona`),
    FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id_usuario`)
);

-- Crear la tabla `admin`
CREATE TABLE `admin` (
    `id_admin` INT NOT NULL AUTO_INCREMENT,
    `usuario_id` INT NOT NULL,
    PRIMARY KEY (`id_admin`),
    FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id_usuario`)
);

-- Crear la tabla `compania`
CREATE TABLE `compania` (
    `id_compania` INT NOT NULL AUTO_INCREMENT,
    `usuario_id` INT NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `nif` VARCHAR(255),
    `contacto` VARCHAR(255),
    PRIMARY KEY (`id_compania`),
    FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id_usuario`)
);

-- Activar las verificaciones de foreign keys
SET FOREIGN_KEY_CHECKS = 1;




npm instal express nodemon audit