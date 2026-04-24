import express from "express";
import Task from "../models/Task";

const router = express.Router();

// Get active tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
