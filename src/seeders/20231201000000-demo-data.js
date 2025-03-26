"use strict";
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminUser = {
      id: uuidv4(),
      email: "admin@example.com",
      password: await bcrypt.hash("admin123", 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await queryInterface.bulkInsert("Users", [adminUser]);

    const institute = {
      id: uuidv4(),
      name: "Demo Institute",
      code: "DEMO-001",
      address: "123 Education Street",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await queryInterface.bulkInsert("Institutes", [institute]);

    const courses = [
      {
        id: uuidv4(),
        code: "CS101",
        name: "Introduction to Computer Science",
        description: "Basic concepts of programming and computer science",
        credits: 3,
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-05-15"),
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        code: "MATH201",
        name: "Advanced Mathematics",
        description: "Advanced mathematical concepts and applications",
        credits: 4,
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-05-15"),
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Courses", courses);

    const students = [
      {
        id: uuidv4(),
        instituteId: institute.id,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        instituteId: institute.id,
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Students", students);

    const results = students.flatMap((student) =>
      courses.map((course) => ({
        id: uuidv4(),
        studentId: student.id,
        courseId: course.id,
        score: 85.0,
        academicYear: 2023,
        semester: "Spring",
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    await queryInterface.bulkInsert("Results", results);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Results", null, {});
    await queryInterface.bulkDelete("Students", null, {});
    await queryInterface.bulkDelete("Courses", null, {});
    await queryInterface.bulkDelete("Institutes", null, {});
    await queryInterface.bulkDelete("Users", null, {});
  },
};
