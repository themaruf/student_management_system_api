const express = require("express");
const { body } = require("express-validator");
const { User } = require("../models");
const { verifyToken } = require("../middleware/auth.middleware");
const bcrypt = require("bcryptjs");

const router = express.Router();

const validateRegistration = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

router.post("/register", validateRegistration, async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status_code: 400,
        status: "error",
        message: "User already exists",
      });
    }

    const user = await User.create({
      email,
      password,
    });

    const token = user.generateToken();

    res.status(201).json({
      status_code: 201,
      status: "success",
      data: {
        user: {
          id: user.id,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Error creating user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        status_code: 401,
        status: "error",
        message: "Invalid credentials",
      });
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        status_code: 401,
        status: "error",
        message: "Invalid credentials",
      });
    }

    await user.update({ lastLogin: new Date() });

    const token = user.generateToken();

    res.json({
      status_code: 200,
      status: "success",
      data: {
        user: {
          id: user.id,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Error logging in",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        status_code: 404,
        status: "error",
        message: "User not found",
      });
    }

    res.json({
      status_code: 200,
      status: "success",
      data: {
        user: {
          id: user.id,
          email: user.email,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Error fetching user data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
