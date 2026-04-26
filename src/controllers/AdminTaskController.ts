import { Request, Response } from "express";
import Task from "../models/Task";

export const getAllTasks = async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
  const q = String(req.query.q || "").trim();
  const status = String(req.query.status || "all");
  const sort = String(req.query.sort || "createdAt");
  const dir = String(req.query.dir || "desc") === "asc" ? 1 : -1;

  const query: any = {};
  if (q) {
    query.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { type: { $regex: q, $options: "i" } },
    ];
  }
  if (status === "active") query.isActive = true;
  if (status === "inactive") query.isActive = false;

  const sortMap: any = { title: "title", type: "type", rewardCoins: "rewardCoins", isActive: "isActive", createdAt: "createdAt" };
  const sortField = sortMap[sort] || "createdAt";

  try {
    const total = await Task.countDocuments(query);
    const items = await Task.find(query)
      .sort({ [sortField]: dir })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ items, total, page, limit });
  } catch (error) {
    res.status(500).json({ error: "Failed to get tasks" });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.create(req.body);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to create task" });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
};
