const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Task = require("../models/Task");

const router = express.Router();


const adminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    req.adminId = decoded.id;
    next();
  } catch (err) {
    console.error("Admin auth error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

router.get("/employees", adminAuth, async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch employees" });
  }
});

  //  VIEW PENDING EMPLOYEES
router.get("/pending-employees", adminAuth, async (req, res) => {
  try {
    const employees = await User.find({
      role: "employee",
      isApproved: false,
    });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: "Failed to load pending employees" });
  }
});

  //  APPROVE EMPLOYEE
router.put("/approve/:id", adminAuth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      isApproved: true,
    });
    res.json({ message: "Employee approved" });
  } catch (err) {
    res.status(500).json({ message: "Approval failed" });
  }
});

  //  ASSIGN TASK (MULTIPLE)
router.post("/task", adminAuth, async (req, res) => {
  try {
    const { title, assignedTo } = req.body;

    if (!title || !assignedTo) {
      return res.status(400).json({
        message: "Title and assignedTo are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const employee = await User.findById(assignedTo);
    if (!employee || employee.role !== "employee") {
      return res.status(400).json({ message: "Employee not found" });
    }

    if (!employee.isApproved) {
      return res.status(400).json({ message: "Employee not approved" });
    }

    const task = new Task({
      title,
      assignedTo: employee._id,
      status: "Pending",
    });

    await task.save();
    res.json(task);
  } catch (err) {
    console.error("Task creation error:", err.message);
    res.status(500).json({ message: "Task creation failed" });
  }
});

  //  VIEW ALL TASKS (ADMIN)
router.get("/tasks", adminAuth, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

  // DELETE TASK
router.delete("/task/:id", adminAuth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete task" });
  }
});

  //  REASSIGN TASK
router.put("/task/reassign/:id", adminAuth, async (req, res) => {
  try {
    const { assignedTo } = req.body;

    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const employee = await User.findById(assignedTo);
    if (!employee || employee.role !== "employee") {
      return res.status(400).json({ message: "Employee not found" });
    }

    if (!employee.isApproved) {
      return res.status(400).json({ message: "Employee not approved" });
    }

    await Task.findByIdAndUpdate(req.params.id, {
      assignedTo: employee._id,
      status: "Pending",
    });

    res.json({ message: "Task reassigned successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to reassign task" });
  }
});


router.get("/task-history", adminAuth, async (req, res) => {
  try {
    const tasks = await Task.find({ status: "Completed" })
      .populate("assignedTo", "name email")
      .sort({ updatedAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch task history" });
  }
});

module.exports = router;
