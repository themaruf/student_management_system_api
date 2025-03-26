const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Course extends Model {
    static associate(models) {
      Course.belongsToMany(models.Student, {
        through: models.Result,
        foreignKey: 'courseId',
        as: 'students'
      });
      Course.hasMany(models.Result, {
        foreignKey: 'courseId',
        as: 'results'
      });
    }
  }

  Course.init({
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Course',
  });

  return Course;
};