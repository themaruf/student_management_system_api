const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Result extends Model {
    static associate(models) {
      Result.belongsTo(models.Student, {
        foreignKey: "studentId",
        as: "student",
      });
      Result.belongsTo(models.Course, {
        foreignKey: "courseId",
        as: "course",
      });
    }
  }

  Result.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      studentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Students",
          key: "id",
        },
      },
      courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      academicYear: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      semester: {
        type: DataTypes.ENUM('Spring', 'Summer', 'Fall'),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Result",
    }
  );

  return Result;
};
