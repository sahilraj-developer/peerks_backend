import express from "express";
import * as TaskController from "../controllers/TaskController";

const router = express.Router();

// Get active tasks
router.get("/", TaskController.getActiveTasks);

export default router;
