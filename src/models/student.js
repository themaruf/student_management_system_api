const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Student extends Model {
    static associate(models) {
      Student.belongsTo(models.Institute, {
        foreignKey: 'instituteId',
        as: 'institute'
      });
      Student.belongsToMany(models.Course, {
        through: models.Result,
        foreignKey: 'studentId',
        as: 'courses'
      });
      Student.hasMany(models.Result, {
        foreignKey: 'studentId',
        as: 'results'
      });
    }
  }

  Student.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    instituteId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Institutes',
        key: 'id'
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'graduated'),
      defaultValue: 'active'
    }
  }, {
    sequelize,
    modelName: 'Student',
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['instituteId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['firstName', 'lastName']
      }
    ]
  });

  return Student;
};