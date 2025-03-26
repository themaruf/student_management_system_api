const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {}

    async validatePassword(password) {
      return bcrypt.compare(password, this.password);
    }

    generateToken() {
      return jwt.sign(
        { id: this.id, email: this.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastLogin: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "User",
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
      indexes: [
        {
          unique: true,
          fields: ["email"],
        },
      ],
    }
  );

  return User;
};
