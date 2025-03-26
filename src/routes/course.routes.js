const express = require("express");
const { body } = require("express-validator");
const { Course } = require("../models");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

const validateCourse = [
  body("name").notEmpty().withMessage("Course name is required"),
  body("code").notEmpty().withMessage("Course code is required"),
  body("credits")
    .isInt({ min: 0 })
    .withMessage("Credits must be a non-negative integer"),
  body("startDate").isISO8601().withMessage("Start date must be a valid date"),
  body("endDate").isISO8601().withMessage("End date must be a valid date"),
];

router.get("/", [verifyToken], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit =
      parseInt(req.query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE);
    const offset = (page - 1) * limit;

    const { count, rows: courses } = await Course.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      status_code: 200,
      status: "success",
      data: {
        courses,
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
      message: "Error fetching courses",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: ["students"],
    });

    if (!course) {
      return res.status(404).json({
        status_code: 404,
        status: "error",
        message: "Course not found",
      });
    }

    res.json({
      status_code: 200,
      status: "success",
      data: { course },
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Error fetching course",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.post("/", [verifyToken, validateCourse], async (req, res) => {
  try {
    const { name, code, description, credits, startDate, endDate } = req.body;

    const existingCourse = await Course.findOne({ where: { code } });
    if (existingCourse) {
      return res.status(400).json({
        status_code: 400,
        status: "error",
        message: "Course code already exists",
      });
    }

    const course = await Course.create({
      name,
      code,
      description,
      credits,
      startDate,
      endDate,
    });

    res.status(201).json({
      status_code: 201,
      status: "success",
      data: { course },
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Error creating course",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.put("/:id", [verifyToken], async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({
        status_code: 404,
        status: "error",
        message: "Course not found",
      });
    }

    const { name, code, description, credits, startDate, endDate } = req.body;

    if (code !== course.code) {
      const existingCourse = await Course.findOne({ where: { code } });
      if (existingCourse) {
        return res.status(400).json({
          status_code: 400,
          status: "error",
          message: "Course code already exists",
        });
      }
    }

    await course.update({
      name,
      code,
      description,
      credits,
      startDate,
      endDate,
    });

    res.json({
      status_code: 200,
      status: "success",
      data: { course },
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Error updating course",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.delete("/:id", [verifyToken], async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({
        status_code: 404,
        status: "error",
        message: "Course not found",
      });
    }

    await course.destroy();

    res.json({
      status_code: 200,
      status: "success",
      message: "Course deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Error deleting course",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
