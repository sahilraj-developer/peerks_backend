"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.createTask = exports.getAllTasks = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const getAllTasks = async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const q = String(req.query.q || "").trim();
    const status = String(req.query.status || "all");
    const sort = String(req.query.sort || "createdAt");
    const dir = String(req.query.dir || "desc") === "asc" ? 1 : -1;
    const query = {};
    if (q) {
        query.$or = [
            { title: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
            { type: { $regex: q, $options: "i" } },
        ];
    }
    if (status === "active")
        query.isActive = true;
    if (status === "inactive")
        query.isActive = false;
    const sortMap = { title: "title", type: "type", rewardCoins: "rewardCoins", isActive: "isActive", createdAt: "createdAt" };
    const sortField = sortMap[sort] || "createdAt";
    try {
        const total = await Task_1.default.countDocuments(query);
        const items = await Task_1.default.find(query)
            .sort({ [sortField]: dir })
            .skip((page - 1) * limit)
            .limit(limit);
        res.json({ items, total, page, limit });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to get tasks" });
    }
};
exports.getAllTasks = getAllTasks;
const createTask = async (req, res) => {
    try {
        const task = await Task_1.default.create(req.body);
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create task" });
    }
};
exports.createTask = createTask;
const updateTask = async (req, res) => {
    try {
        const task = await Task_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update task" });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        await Task_1.default.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete task" });
    }
};
exports.deleteTask = deleteTask;
//# sourceMappingURL=AdminTaskController.js.map