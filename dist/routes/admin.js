"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const Redemption_1 = __importDefault(require("../models/Redemption"));
const UserActivity_1 = __importDefault(require("../models/UserActivity"));
const Activity_1 = __importDefault(require("../models/Activity"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/analytics", auth_1.authenticate, auth_1.ensureAdmin, async (req, res) => {
    const totalUsers = await User_1.default.countDocuments();
    const totalPointsAgg = await User_1.default.aggregate([{ $group: { _id: null, totalPoints: { $sum: "$pointBalance" } } }]);
    const totalPoints = totalPointsAgg.length ? totalPointsAgg[0].totalPoints : 0;
    const totalRedemptions = await Redemption_1.default.countDocuments();
    const topUsers = await User_1.default.find().sort({ pointBalance: -1 }).limit(5).select("name email pointBalance");
    const topActivitiesAgg = await UserActivity_1.default.aggregate([
        { $group: { _id: "$activityId", totalPoints: { $sum: "$points" }, count: { $sum: 1 } } },
        { $sort: { totalPoints: -1 } },
        { $limit: 5 },
    ]);
    const activityDetails = await Promise.all(topActivitiesAgg.map(async (item) => {
        const activity = await Activity_1.default.findById(item._id);
        return { activity, totalPoints: item.totalPoints, usageCount: item.count };
    }));
    res.json({ totalUsers, totalPoints, totalRedemptions, topUsers, activityDetails });
});
exports.default = router;
//# sourceMappingURL=admin.js.map