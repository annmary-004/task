const express = require("express");
const jwt = require("jsonwebtoken");
const Task = require("../models/Task");

const router = express.Router();

  //  EMPLOYEE AUTH MIDDLEWARE
const employeeAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "employee") {
      return res.status(403).json({ message: "Employee access only" });
    }

    req.employeeId = decoded.id;
    next();
  } catch (err) {
    console.error("Employee auth error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

router.get("/tasks", employeeAuth, async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.employeeId,
    }).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to load tasks" });
  }
});


router.put("/task/:id", employeeAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, assignedTo: req.employeeId },
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Status updated", task });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
});


router.get("/task-history", employeeAuth, async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.employeeId,
      status: "Completed",
    }).sort({ updatedAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to load task history" });
  }
});

module.exports = router;
