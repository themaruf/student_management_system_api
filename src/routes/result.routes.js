const express = require("express");
const { body } = require("express-validator");
const { Result, Student, Course } = require("../models");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

const validateResult = [
  body("studentId").notEmpty().withMessage("Student ID is required"),
  body("courseId").notEmpty().withMessage("Course ID is required"),
  body("score")
    .isInt({ min: 0, max: 100 })
    .withMessage("Score must be between 0 and 100"),
  body("academicYear").isInt().withMessage("Academic year must be an integer"),
  body("semester")
    .isIn(["Spring", "Summer", "Fall"])
    .withMessage("Invalid semester"),
];

router.get("/", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit =
      parseInt(req.query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE);
    const offset = (page - 1) * limit;

    const { count, rows: results } = await Result.findAndCountAll({
      limit,
      offset,
      include: [
        { model: Student, as: "student" },
        { model: Course, as: "course" },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      status_code: 200,
      status: "success",
      data: {
        results,
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
      message: "Error fetching results",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const result = await Result.findByPk(req.params.id, {
      include: [
        { model: Student, as: "student" },
        { model: Course, as: "course" },
      ],
    });

    if (!result) {
      return res.status(404).json({
        status_code: 404,
        status: "error",
        message: "Result not found",
      });
    }

    res.json({
      status_code: 200,
      status: "success",
      data: { result },
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Error fetching result",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.post("/", verifyToken, validateResult, async (req, res) => {
  try {
    const { studentId, courseId, academicYear, semester } = req.body;

    const existingResult = await Result.findOne({
      where: {
        studentId,
        courseId,
        academicYear,
        semester,
      },
    });

    if (existingResult) {
      return res.status(400).json({
        status_code: 400,
        status: "error",
        message:
          "Course result for this student in this academic year and semester already exists.",
      });
    }

    const result = await Result.create(req.body);
    res.status(201).json({
      status_code: 201,
      status: "success",
      data: { result },
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Error creating result",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.put("/:id", [verifyToken, validateResult], async (req, res) => {
  try {
    const result = await Result.findByPk(req.params.id);
    if (!result) {
      return res.status(404).json({
        status_code: 404,
        status: "error",
        message: "Result not found",
      });
    }

    const { studentId, courseId, score, academicYear, semester } = req.body;

    await result.update({
      studentId,
      courseId,
      score,
      academicYear,
      semester,
    });

    res.json({
      status_code: 200,
      status: "success",
      data: { result },
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Error updating result",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const result = await Result.findByPk(req.params.id);
    if (!result) {
      return res.status(404).json({
        status_code: 404,
        status: "error",
        message: "Result not found",
      });
    }

    await result.destroy();

    res.json({
      status_code: 200,
      status: "success",
      message: "Result deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Error deleting result",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
