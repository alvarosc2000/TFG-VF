const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    define: {
      timestamps: false // Desactivar la generación automática de createdAt y updatedAt
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
    tableName: 'usuario' // Nombre de la tabla en la base de datos
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
    },},
    {
        tableName: 'compania' // Nombre de la tabla en la base de datos
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
    },},
    {
        tableName: 'persona' // Nombre de la tabla en la base de datos
    });



  const Evento = sequelize.define('Evento', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      titulo: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT
      },
      numero_entradas: {
        type: Sequelize.INTEGER
      },
      localizacion: {
        type: Sequelize.STRING(255)
      },
      precio: {
        type: Sequelize.DECIMAL(10, 2)
      },
      fecha_inicio: {
        type: Sequelize.DATE
      },
      fecha_fin: {
        type: Sequelize.DATE
      },
      deporte: {
        type: Sequelize.TEXT
      },
      categoria: {
        type: Sequelize.TEXT
      },},
      {
          tableName: 'evento' // Nombre de la tabla en la base de datos
      });

// Exporta los modelos junto con la instancia de Sequelize
module.exports = {
    sequelize,
    Usuario,
    Compania,
    Persona,
    Evento
};
