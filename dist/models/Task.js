"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const taskSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true, default: "post_creation" },
    rewardCoins: { type: Number, required: true, default: 0 },
    campus: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    isActive: { type: Boolean, required: true, default: true },
    createdAt: { type: Date, default: Date.now },
});
const Task = (0, mongoose_1.model)("Task", taskSchema);
exports.default = Task;
//# sourceMappingURL=Task.js.map