const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Institute extends Model {
    static associate(models) {
      Institute.hasMany(models.Student, {
        foreignKey: 'instituteId',
        as: 'students'
      });
    }
  }

  Institute.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    address: {
      type: DataTypes.TEXT
    },

    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    sequelize,
    modelName: 'Institute',
    indexes: [
      {
        unique: true,
        fields: ['code']
      },
      {
        fields: ['status']
      },
      {
        fields: ['name']
      }
    ]
  });

  return Institute;
};