"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.createTask = exports.getActiveTasks = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const getActiveTasks = async (req, res) => {
    try {
        const tasks = await Task_1.default.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.getActiveTasks = getActiveTasks;
const createTask = async (req, res) => {
    try {
        const task = await Task_1.default.create(req.body);
        res.status(201).json(task);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to create task", error });
    }
};
exports.createTask = createTask;
const updateTask = async (req, res) => {
    try {
        const task = await Task_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!task)
            return res.status(404).json({ message: "Task not found" });
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update task", error });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        const task = await Task_1.default.findByIdAndDelete(req.params.id);
        if (!task)
            return res.status(404).json({ message: "Task not found" });
        res.json({ success: true, message: "Task deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete task", error });
    }
};
exports.deleteTask = deleteTask;
//# sourceMappingURL=TaskController.js.map