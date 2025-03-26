const express = require("express");
const { body } = require("express-validator");
const { Student, Institute, Result, Course } = require("../models");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

const validateStudent = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("instituteId").notEmpty().withMessage("Institute ID is required"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email"),
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Invalid status"),
];

router.get("/", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit =
      parseInt(req.query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE);
    const offset = (page - 1) * limit;

    const { count, rows: students } = await Student.findAndCountAll({
      limit,
      offset,
      include: [{ model: Institute, as: "institute" }],
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
      message: "Error fetching students",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: ["institute", "courses"],
    });

    if (!student) {
      return res.status(404).json({
        status_code: 404,
        status: "error",
        message: "Student not found",
      });
    }

    res.json({
      status_code: 200,
      status: "success",
      data: { student },
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Error fetching student",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.post("/", [verifyToken, validateStudent], async (req, res) => {
  try {
    const { firstName, lastName, instituteId, email, status } = req.body;

    const institute = await Institute.findByPk(instituteId);
    if (!institute) {
      return res.status(404).json({
        status_code: 404,
        status: "error",
        message: "Institute not found",
      });
    }

    const existingStudent = await Student.findOne({ where: { email } });
    if (existingStudent) {
      return res.status(400).json({
        status_code: 400,
        status: "error",
        message: "Email already exists",
      });
    }

    const student = await Student.create({
      firstName,
      lastName,
      instituteId,
      email,
      status,
    });

    res.status(201).json({
      status_code: 201,
      status: "success",
      data: { student },
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Error creating student",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.put("/:id", [verifyToken, validateStudent], async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({
        status_code: 404,
        status: "error",
        message: "Student not found",
      });
    }

    const { firstName, lastName, instituteId, email, status } = req.body;

    const institute = await Institute.findByPk(instituteId);
    if (!institute) {
      return res.status(404).json({
        status_code: 404,
        status: "error",
        message: "Institute not found",
      });
    }

    if (email !== student.email) {
      const existingStudent = await Student.findOne({ where: { email } });
      if (existingStudent) {
        return res.status(400).json({
          status_code: 400,
          status: "error",
          message: "Email already exists",
        });
      }
    }

    await student.update({
      firstName,
      lastName,
      instituteId,
      email,
      status,
    });

    res.json({
      status_code: 200,
      status: "success",
      data: { student },
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Error updating student",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.delete("/:id", [verifyToken], async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({
        status_code: 404,
        status: "error",
        message: "Student not found",
      });
    }

    await student.destroy();

    res.json({
      status_code: 200,
      status: "success",
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Error deleting student",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
