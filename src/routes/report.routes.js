const express = require("express");
const { Student, Institute, Result, Course } = require("../models");
const { verifyToken } = require("../middleware/auth.middleware");
const { sequelize } = require("../models");

const router = express.Router();

router.get("/students/:instituteId", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit =
      parseInt(req.query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE);
    const offset = (page - 1) * limit;

    const { count, rows: students } = await Student.findAndCountAll({
      where: { instituteId: req.params.instituteId },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      status_code: 200,
      status: "success",
      data: {
        students,
        pagination: {
          total: count,
          page,
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Error fetching students by institute report",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.get("/top-courses", verifyToken, async (req, res) => {
  try {
    const query = `
      WITH CourseEnrollments AS (
        SELECT 
          r."academicYear",
          r."courseId",
          c.name as "courseName",
          c.code as "courseCode",
          COUNT(DISTINCT r."studentId") as "enrollmentCount",
          RANK() OVER (PARTITION BY r."academicYear" ORDER BY COUNT(DISTINCT r."studentId") DESC, c.code ASC) as rank
        FROM "Results" r
        JOIN "Courses" c ON r."courseId" = c.id
        GROUP BY r."academicYear", r."courseId", c.name, c.code
      )
      SELECT 
        "academicYear",
        "courseName" as "course.name",
        "courseCode" as "course.code",
        "enrollmentCount",
        rank
      FROM CourseEnrollments
      WHERE rank = 1
      ORDER BY "academicYear" DESC
    `;

    const results = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });

    const formattedResults = results.map((result) => ({
      academicYear: result.academicYear,
      enrollmentCount: parseInt(result.enrollmentCount),
      course: {
        name: result["course.name"],
        code: result["course.code"],
      },
    }));

    res.json({
      status_code: 200,
      status: "success",
      data: {
        results: formattedResults,
      },
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Error fetching course statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.get("/top-students", verifyToken, async (req, res) => {
  try {
    const academicYear = req.query.academicYear;
    const page = parseInt(req.query.page) || 1;
    const limit =
      parseInt(req.query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE);
    const offset = (page - 1) * limit;

    const rankQuery = `
      WITH RankedStudents AS (
        SELECT 
          s.id,
          s."firstName",
          s."lastName",
          i.id as "instituteId",
          i.name as "instituteName",
          MAX(r.score) as "highestScore",
          RANK() OVER (ORDER BY MAX(r.score) DESC) as rank
        FROM "Students" s
        JOIN "Institutes" i ON s."instituteId" = i.id
        JOIN "Results" r ON s.id = r."studentId"
        ${academicYear ? 'WHERE r."academicYear" = :academicYear' : ""}
        GROUP BY s.id, s."firstName", s."lastName", i.id, i.name
      )
      SELECT *
      FROM RankedStudents
      ORDER BY rank ASC
      LIMIT :limit OFFSET :offset
    `;

    const topStudents = await sequelize.query(rankQuery, {
      replacements: {
        academicYear: academicYear,
        limit: limit,
        offset: offset,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    const countQuery = `
      SELECT COUNT(*) as total
      FROM (
        SELECT DISTINCT s.id
        FROM "Students" s
        JOIN "Results" r ON s.id = r."studentId"
        ${academicYear ? 'WHERE r."academicYear" = :academicYear' : ""}
      ) as StudentCount
    `;

    const [{ total }] = await sequelize.query(countQuery, {
      replacements: { academicYear: academicYear },
      type: sequelize.QueryTypes.SELECT,
    });

    res.json({
      status_code: 200,
      status: "success",
      data: {
        students: topStudents.map((student) => ({
          ...student,
          highestScore: Number(student.highestScore).toFixed(2),
        })),
        pagination: {
          total: parseInt(total),
          page,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Error fetching top students",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
