"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userActivitySchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    activityId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Activity" },
    points: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});
const UserActivity = (0, mongoose_1.model)("UserActivity", userActivitySchema);
exports.default = UserActivity;
//# sourceMappingURL=UserActivity.js.map