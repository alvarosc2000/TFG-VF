const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    define: {
        timestamps: false
    },
});

const Usuario = sequelize.define('Usuario', {
    id_usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    pass: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    role: {
        type: DataTypes.ENUM('user', 'company'),
        allowNull: false,
    },
    token: {
        type: DataTypes.STRING,
    },
    compania_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Compania',
            key: 'id_compania',
        },
    },
    persona_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Persona',
            key: 'id_persona',
        },
    },
    admin_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Usuario',
            key: 'id_usuario',
        },
    },
}, {
    tableName: 'usuario'
});

const Compania = sequelize.define('Compania', {
    id_compania: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nif: {
        type: DataTypes.STRING,
    },
    contacto: {
        type: DataTypes.STRING,
    },
}, {
    tableName: 'compania'
});

const Persona = sequelize.define('Persona', {
    id_persona: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    apellido: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'persona'
});

const Evento = sequelize.define('Evento', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titulo: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT
    },
    numero_entradas: {
        type: DataTypes.INTEGER
    },
    localizacion: {
        type: DataTypes.STRING(255)
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2)
    },
    fecha_inicio: {
        type: DataTypes.DATE
    },
    fecha_fin: {
        type: DataTypes.DATE
    },
    deporte: {
        type: DataTypes.TEXT
    },
}, {
    tableName: 'evento'
});

const EventoClase = sequelize.define('EventoClase', {
    evento_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Evento,
            key: 'id'
        }
    },
    instructor: DataTypes.STRING,
    duracion: DataTypes.STRING,
    nivel: DataTypes.STRING
}, {
    tableName: 'eventos_clases'
});

const EventoPartido = sequelize.define('EventoPartido', {
    evento_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Evento,
            key: 'id'
        }
    },
    equipo_local: DataTypes.STRING,
    equipo_visitante: DataTypes.STRING,
    liga: DataTypes.STRING
}, {
    tableName: 'eventos_partidos'
});

const EventoCampus = sequelize.define('EventoCampus', {
    evento_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Evento,
            key: 'id'
        }
    },
    programa: DataTypes.STRING
}, {
    tableName: 'eventos_campus'
});

const EventoOcasion = sequelize.define('EventoOcasion', {
    evento_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Evento,
            key: 'id'
        }
    },
    tipo_ocasion: DataTypes.STRING,
}, {
    tableName: 'eventos_ocasion'
});

const FotoEvento = sequelize.define('FotoEvento', {
    foto_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    evento_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Evento,
            key: 'id'
        }
    },
    url: DataTypes.STRING,
    descripcion: DataTypes.TEXT
}, {
    tableName: 'fotos_evento'
});

// Definir las asociaciones
Evento.hasOne(EventoClase, { foreignKey: 'evento_id' });
Evento.hasOne(EventoPartido, { foreignKey: 'evento_id' });
Evento.hasOne(EventoCampus, { foreignKey: 'evento_id' });
Evento.hasOne(EventoOcasion, { foreignKey: 'evento_id' });
Evento.hasMany(FotoEvento, { foreignKey: 'evento_id' });

EventoClase.belongsTo(Evento, { foreignKey: 'evento_id' });
EventoPartido.belongsTo(Evento, { foreignKey: 'evento_id' });
EventoCampus.belongsTo(Evento, { foreignKey: 'evento_id' });
EventoOcasion.belongsTo(Evento, { foreignKey: 'evento_id' });
FotoEvento.belongsTo(Evento, { foreignKey: 'evento_id' });

module.exports = {
    sequelize,
    Usuario,
    Compania,
    Persona,
    Evento,
    EventoClase,
    EventoPartido,
    EventoCampus,
    EventoOcasion,
    FotoEvento
};
