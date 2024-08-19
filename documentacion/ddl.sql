CREATE TABLE `usuario` (
    `id_usuario` INT AUTO_INCREMENT PRIMARY KEY,
    `user` VARCHAR(255) NOT NULL,
    `pass` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `verified` BOOLEAN DEFAULT FALSE,
    `resetToken` VARCHAR(255),
    `role` ENUM('user', 'company', 'admin') NOT NULL,
    `token` VARCHAR(255)
);

CREATE TABLE `persona` (
    `id_persona` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT NOT NULL,
    `nombre` VARCHAR(255) NOT NULL,
    `apellido` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id_usuario`)
);

CREATE TABLE `admin` (
    `id_admin` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT NOT NULL,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id_usuario`)
);

CREATE TABLE `compania` (
    `id_compania` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `nif` VARCHAR(255),
    `contacto` VARCHAR(255),
    FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id_usuario`)
);

CREATE TABLE `evento` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `titulo` VARCHAR(255) NOT NULL,
    `descripcion` TEXT,
    `numero_entradas` INT,
    `localizacion` VARCHAR(255),
    `precio` DECIMAL(10, 2),
    `fecha_inicio` DATE,
    `fecha_fin` DATE,
    `deporte` TEXT,
    `id_compania` INT NOT NULL,
    `evento_del_mes` BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (`id_compania`) REFERENCES `compania`(`id_compania`)
);

CREATE TABLE `eventos_clases` (
    `evento_id` INT PRIMARY KEY,
    `instructor` VARCHAR(255),
    `duracion` VARCHAR(255),
    `nivel` VARCHAR(255),
    FOREIGN KEY (`evento_id`) REFERENCES `evento`(`id`)
);

CREATE TABLE `eventos_partidos` (
    `evento_id` INT PRIMARY KEY,
    `equipo_local` VARCHAR(255),
    `equipo_visitante` VARCHAR(255),
    `liga` VARCHAR(255),
    FOREIGN KEY (`evento_id`) REFERENCES `evento`(`id`)
);

CREATE TABLE `eventos_campus` (
    `evento_id` INT PRIMARY KEY,
    `programa` VARCHAR(255),
    FOREIGN KEY (`evento_id`) REFERENCES `evento`(`id`)
);

CREATE TABLE `eventos_ocasion` (
    `evento_id` INT PRIMARY KEY,
    `tipo_ocasion` VARCHAR(255),
    FOREIGN KEY (`evento_id`) REFERENCES `evento`(`id`)
);

CREATE TABLE `fotos_evento` (
    `foto_id` INT AUTO_INCREMENT PRIMARY KEY,
    `evento_id` INT,
    `url` VARCHAR(255),
    `descripcion` TEXT,
    FOREIGN KEY (`evento_id`) REFERENCES `evento`(`id`)
);
