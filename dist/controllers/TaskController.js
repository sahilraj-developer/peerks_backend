"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveTasks = void 0;
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
//# sourceMappingURL=TaskController.js.map