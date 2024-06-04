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
    resetToken: {
        type: DataTypes.STRING,
        allowNull: true
      },
    role: {
        type: DataTypes.ENUM('user', 'company', 'admin'),
        allowNull: false,
    },
    token: {
        type: DataTypes.STRING,
    },
}, {
    tableName: 'usuario'
});

const Persona = sequelize.define('Persona', {
    id_persona: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Usuario',
            key: 'id_usuario',
        }
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

const Admin = sequelize.define('Admin', {
    id_admin: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Usuario',
            key: 'id_usuario',
        }
    },
}, {
    tableName: 'admin'
});

const Compania = sequelize.define('Compania', {
    id_compania: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Usuario',
            key: 'id_usuario',
        }
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
Usuario.hasOne(Persona, { foreignKey: 'usuario_id' });
Usuario.hasOne(Admin, { foreignKey: 'usuario_id' });
Usuario.hasOne(Compania, { foreignKey: 'usuario_id' });

Persona.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Admin.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Compania.belongsTo(Usuario, { foreignKey: 'usuario_id' });

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
    Persona,
    Admin,
    Compania,
    Evento,
    EventoClase,
    EventoPartido,
    EventoCampus,
    EventoOcasion,
    FotoEvento
};
