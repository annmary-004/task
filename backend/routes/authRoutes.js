const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

  //  CREATE ADMIN (ONE TIME)
router.post("/create-admin", async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await User.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin",
      isApproved: true,
    });

    res.json({
      message: "Admin created successfully",
    });
  } catch (err) {
    console.error("Create admin error:", err.message);
    res.status(500).json({
      message: "Admin creation failed",
    });
  }
});

  //  EMPLOYEE REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create employee
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "employee",
      isApproved: false,
    });

    res.status(201).json({
      message: "Registration successful. Wait for admin approval.",
    });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({
      message: "Registration failed",
    });
  }
});

  //  LOGIN (ADMIN / EMPLOYEE)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // password field is select:false in model
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // block unapproved employees
    if (user.role === "employee" && !user.isApproved) {
      return res.status(403).json({
        message: "Wait for admin approval",
      });
    }

    // generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({
      message: "Login failed",
    });
  }
});

module.exports = router;
