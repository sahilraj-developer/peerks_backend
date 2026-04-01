"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = require("mongoose");
const Activity_1 = __importDefault(require("../models/Activity"));
const User_1 = __importDefault(require("../models/User"));
const UserActivity_1 = __importDefault(require("../models/UserActivity"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticate, async (req, res) => {
    const activities = await Activity_1.default.find().sort({ createdAt: -1 });
    res.json(activities);
});
router.post("/:activityId/complete", auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { activityId } = req.params;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        if (typeof activityId !== "string")
            return res.status(400).json({ message: "Invalid activity ID" });
        if (!mongoose_1.Types.ObjectId.isValid(activityId))
            return res.status(400).json({ message: "Invalid activity ID" });
        const activity = await Activity_1.default.findById(activityId);
        if (!activity)
            return res.status(404).json({ message: "Activity not found" });
        const log = await UserActivity_1.default.create({ userId, activityId, points: activity.points });
        const user = await User_1.default.findByIdAndUpdate(userId, { $inc: { pointBalance: activity.points } }, { new: true });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json({ message: "Activity completed", activity, user, log });
    }
    catch (error) {
        res.status(500).json({ message: "Unable to complete activity", error });
    }
});
router.get("/history", auth_1.authenticate, async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ message: "Unauthorized" });
    const history = await UserActivity_1.default.find({ userId }).populate("activityId").sort({ createdAt: -1 });
    res.json(history);
});
exports.default = router;
//# sourceMappingURL=activities.js.map