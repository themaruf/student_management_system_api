"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Users", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastLogin: {
        type: Sequelize.DATE,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable("Institutes", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      address: {
        type: Sequelize.TEXT,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive"),
        defaultValue: "active",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable("Students", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      instituteId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Institutes",
          key: "id",
        },
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive", "graduated"),
        defaultValue: "active",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable("Courses", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      credits: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive"),
        defaultValue: "active",
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable("Results", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      studentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Students",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      courseId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      academicYear: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      semester: {
        type: Sequelize.ENUM("Spring", "Summer", "Fall"),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addConstraint("Results", {
      fields: ["studentId", "courseId", "academicYear", "semester"],
      type: "unique",
      name: "unique_student_course_academic_semester",
    });

    await queryInterface.addIndex("Users", ["email"], {
      name: "users_email_idx",
    });
    await queryInterface.addIndex("Institutes", ["code"], {
      name: "institutes_code_idx",
    });
    await queryInterface.addIndex("Institutes", ["status"], {
      name: "institutes_status_idx",
    });
    await queryInterface.addIndex("Students", ["instituteId"], {
      name: "students_institute_idx",
    });
    await queryInterface.addIndex("Students", ["email"], {
      name: "students_email_idx",
    });
    await queryInterface.addIndex("Students", ["status"], {
      name: "students_status_idx",
    });
    await queryInterface.addIndex("Courses", ["code"], {
      name: "courses_code_idx",
    });
    await queryInterface.addIndex("Courses", ["status"], {
      name: "courses_status_idx",
    });
    await queryInterface.addIndex("Results", ["studentId"], {
      name: "results_student_idx",
    });
    await queryInterface.addIndex("Results", ["courseId"], {
      name: "results_course_idx",
    });
    await queryInterface.addIndex("Results", ["academicYear", "semester"], {
      name: "results_academic_semester_idx",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Results");
    await queryInterface.dropTable("Courses");
    await queryInterface.dropTable("Students");
    await queryInterface.dropTable("Institutes");
    await queryInterface.dropTable("Users");
  },
};
