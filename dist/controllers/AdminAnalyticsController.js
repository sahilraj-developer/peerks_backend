"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeseries = exports.getAnalytics = void 0;
const User_1 = __importDefault(require("../models/User"));
const Redemption_1 = __importDefault(require("../models/Redemption"));
const UserActivity_1 = __importDefault(require("../models/UserActivity"));
const Activity_1 = __importDefault(require("../models/Activity"));
const getAnalytics = async (req, res) => {
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
};
exports.getAnalytics = getAnalytics;
const getTimeseries = async (req, res) => {
    const days = Math.max(7, Math.min(365, Number(req.query.days) || 30));
    const now = new Date();
    const start = new Date();
    start.setDate(now.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);
    const dateFormat = "%Y-%m-%d";
    const [usersAgg, redemptionsAgg, pointsAgg] = await Promise.all([
        User_1.default.aggregate([
            { $match: { createdAt: { $gte: start, $lte: now } } },
            { $group: { _id: { $dateToString: { format: dateFormat, date: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]),
        Redemption_1.default.aggregate([
            { $match: { createdAt: { $gte: start, $lte: now } } },
            { $group: { _id: { $dateToString: { format: dateFormat, date: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]),
        UserActivity_1.default.aggregate([
            { $match: { createdAt: { $gte: start, $lte: now } } },
            { $group: { _id: { $dateToString: { format: dateFormat, date: "$createdAt" } }, total: { $sum: "$points" } } },
            { $sort: { _id: 1 } },
        ]),
    ]);
    const usersMap = new Map(usersAgg.map((i) => [i._id, i.count]));
    const redemptionsMap = new Map(redemptionsAgg.map((i) => [i._id, i.count]));
    const pointsMap = new Map(pointsAgg.map((i) => [i._id, i.total]));
    const series = [];
    for (let i = 0; i < days; i += 1) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        series.push({
            date: key,
            newUsers: usersMap.get(key) || 0,
            redemptions: redemptionsMap.get(key) || 0,
            pointsEarned: pointsMap.get(key) || 0,
        });
    }
    res.json({ days, series });
};
exports.getTimeseries = getTimeseries;
//# sourceMappingURL=AdminAnalyticsController.js.map