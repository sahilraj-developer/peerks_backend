"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const activitySchema = new mongoose_1.Schema({
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    points: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});
const Activity = (0, mongoose_1.model)("Activity", activitySchema);
exports.default = Activity;
//# sourceMappingURL=Activity.js.map