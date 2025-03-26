"use strict";
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { faker } = require("@faker-js/faker");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const batchSize = 1000;
    const totalBatches = 100;
    const uniqueKeys = new Set();

    for (let batch = 0; batch < totalBatches; batch++) {
      console.log(`Processing batch ${batch + 1} of ${totalBatches}`);
      const institutes = [];
      const users = [];
      const courses = [];
      const students = [];
      const results = [];

      for (let i = 0; i < batchSize; i++) {
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

      for (let i = 0; i < batchSize; i++) {
        users.push({
          id: uuidv4(),
          email:
            uuidv4().substring(0, 8) +
            "." +
            faker.internet.email({ provider: "usrmail.com" }),
          password: await bcrypt.hash("password123", 10),
          lastLogin: faker.date.recent(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      try {
        await queryInterface.bulkInsert("Users", users);
      } catch (error) {
        console.error("Error inserting users:", error);
      }

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
      for (let i = 0; i < batchSize; i++) {
        const subject = faker.helpers.arrayElement(subjects);
        courses.push({
          id: uuidv4(),
          code: `${subject.substring(0, 3)}-${uuidv4().substring(0, 6)}`,
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

      try {
        await queryInterface.bulkInsert("Courses", courses);
      } catch (error) {
        console.error("Error inserting courses:", error);
      }

      for (let i = 0; i < batchSize; i++) {
        students.push({
          id: uuidv4(),
          instituteId:
            institutes[faker.number.int({ min: 0, max: institutes.length - 1 })]
              .id,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email:
            uuidv4().substring(0, 8) +
            "." +
            faker.internet.email({ provider: "test.edu" }),
          status: faker.helpers.arrayElement([
            "active",
            "inactive",
            "graduated",
          ]),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      try {
        await queryInterface.bulkInsert("Students", students);
      } catch (error) {
        console.error("Error inserting students:", error);
      }

      for (let i = 0; i < batchSize; i++) {
        const score = faker.number.float({
          min: 80,
          max: 100,
          precision: 0.01,
        });
        const studentId =
          students[faker.number.int({ min: 0, max: students.length - 1 })].id;
        const courseId =
          courses[faker.number.int({ min: 0, max: courses.length - 1 })].id;
        const academicYear = faker.number.int({ min: 2000, max: 2030 });
        const semester = faker.helpers.arrayElement([
          "Spring",
          "Summer",
          "Fall",
        ]);

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

      try {
        await queryInterface.bulkInsert("Results", results);
        console.log(`Successfully inserted batch ${batch + 1}`);
      } catch (error) {
        console.error(`Error inserting results in batch ${batch + 1}:`, error);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Results", null, {});
    await queryInterface.bulkDelete("Students", null, {});
    await queryInterface.bulkDelete("Courses", null, {});
    await queryInterface.bulkDelete("Institutes", null, {});
    await queryInterface.bulkDelete("Users", null, {});
  },
};
