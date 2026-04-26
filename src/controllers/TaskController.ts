import { Request, Response } from "express";
import Task from "../models/Task";

export const getActiveTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
