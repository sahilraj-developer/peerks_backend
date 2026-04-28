import express from "express";
import * as TaskController from "../controllers/TaskController";

const router = express.Router();

router.use((req, res, next) => {
  console.log(`[Tasks API] ${req.method} ${req.url}`);
  next();
});

// Get active tasks
router.get("/", TaskController.getActiveTasks);

// Create, Update, Delete tasks
router.post("/", TaskController.createTask);
router.put("/:id", TaskController.updateTask);
router.delete("/:id", TaskController.deleteTask);

export default router;
