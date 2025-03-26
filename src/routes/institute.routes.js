const express = require("express");
const { body } = require("express-validator");
const { Institute } = require("../models");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

const validateInstitute = [
  body("name").notEmpty().withMessage("Institute name is required"),
  body("code").notEmpty().withMessage("Institute code is required"),
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

    const { count, rows: institutes } = await Institute.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      status_code: 200,
      status: "success",
      data: {
        institutes,
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
      message: "Error fetching institutes",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const institute = await Institute.findByPk(req.params.id, {
      include: ["students"],
    });

    if (!institute) {
      return res.status(404).json({
        status_code: 404,
        status: "error",
        message: "Institute not found",
      });
    }

    res.json({
      status_code: 200,
      status: "success",
      data: { institute },
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Error fetching institute",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.post("/", [verifyToken, validateInstitute], async (req, res) => {
  try {
    const { name, code, address, phone, email, status } = req.body;

    const existingInstitute = await Institute.findOne({ where: { code } });
    if (existingInstitute) {
      return res.status(400).json({
        status_code: 400,
        status: "error",
        message: "Institute code already exists",
      });
    }

    const institute = await Institute.create({
      name,
      code,
      address,
      phone,
      email,
      status,
    });

    res.status(201).json({
      status_code: 201,
      status: "success",
      data: { institute },
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Error creating institute",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.put("/:id", [verifyToken, validateInstitute], async (req, res) => {
  try {
    const institute = await Institute.findByPk(req.params.id);
    if (!institute) {
      return res.status(404).json({
        status_code: 404,
        status: "error",
        message: "Institute not found",
      });
    }

    const { name, code, address, phone, email, status } = req.body;

    if (code !== institute.code) {
      const existingInstitute = await Institute.findOne({ where: { code } });
      if (existingInstitute) {
        return res.status(400).json({
          status_code: 400,
          status: "error",
          message: "Institute code already exists",
        });
      }
    }

    await institute.update({
      name,
      code,
      address,
      phone,
      email,
      status,
    });

    res.json({
      status_code: 200,
      status: "success",
      data: { institute },
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Error updating institute",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.delete("/:id", [verifyToken], async (req, res) => {
  try {
    const institute = await Institute.findByPk(req.params.id);
    if (!institute) {
      return res.status(404).json({
        status_code: 404,
        status: "error",
        message: "Institute not found",
      });
    }

    await institute.destroy();

    res.json({
      status_code: 200,
      status: "success",
      message: "Institute deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Error deleting institute",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
