"use strict";
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { faker } = require("@faker-js/faker");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const totalRecords = 100000;
    const institutes = [];
    const users = [];
    const courses = [];
    const students = [];
    const results = [];
    const uniqueKeys = new Set();

    for (let i = 0; i < totalRecords; i++) {
      const code = `INST-${faker.string.alphanumeric(6).toUpperCase()}`;
      // Check if code already exists in the array
      if (!institutes.some((inst) => inst.code === code)) {
        institutes.push({
          id: uuidv4(),
          name: faker.company.name() + " Institute",
          code,
          address: faker.location.streetAddress(),
          status: faker.helpers.arrayElement(["active", "inactive"]),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    try {
      await queryInterface.bulkInsert("Institutes", institutes);
    } catch (error) {
      console.error("Error inserting institutes:", error);
    }

    for (let i = 0; i < totalRecords; i++) {
      users.push({
        id: uuidv4(),
        email: faker.internet.email(),
        password: await bcrypt.hash("password123", 10),
        lastLogin: faker.date.recent(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await queryInterface.bulkInsert("Users", users);

    const subjects = [
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "Computer Science",
      "History",
      "Literature",
      "Economics",
    ];
    for (let i = 0; i < totalRecords; i++) {
      const subject = faker.helpers.arrayElement(subjects);
      courses.push({
        id: uuidv4(),
        code: `${subject.substring(0, 3).toUpperCase()}${faker.number.int({
          min: 100,
          max: 999,
        })}`,
        name: `${faker.helpers.arrayElement([
          "Advanced",
          "Introduction to",
          "Fundamentals of",
          "Applied",
        ])} ${subject}`,
        description: faker.lorem.paragraph(),
        credits: faker.number.int({ min: 1, max: 6 }),
        status: faker.helpers.arrayElement(["active", "inactive"]),
        startDate: faker.date.future(),
        endDate: faker.date.future(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await queryInterface.bulkInsert("Courses", courses);

    for (let i = 0; i < totalRecords; i++) {
      students.push({
        id: uuidv4(),
        instituteId:
          institutes[faker.number.int({ min: 0, max: institutes.length - 1 })]
            .id,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        status: faker.helpers.arrayElement(["active", "inactive", "graduated"]),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await queryInterface.bulkInsert("Students", students);

    for (let i = 0; i < totalRecords; i++) {
      const score = faker.number.float({ min: 80, max: 100, precision: 0.01 });
      const studentId =
        students[faker.number.int({ min: 0, max: students.length - 1 })].id;
      const courseId =
        courses[faker.number.int({ min: 0, max: courses.length - 1 })].id;
      const academicYear = faker.number.int({ min: 2000, max: 2030 });
      const semester = faker.helpers.arrayElement(["Spring", "Summer", "Fall"]);

      const uniqueKey = `${studentId}-${courseId}-${academicYear}-${semester}`;

      // Skip if the key already exists
      if (!uniqueKeys.has(uniqueKey)) {
        uniqueKeys.add(uniqueKey);
        results.push({
          id: uuidv4(),
          studentId,
          courseId,
          score,
          academicYear,
          semester,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

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
