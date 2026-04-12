"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const Redemption_1 = __importDefault(require("../models/Redemption"));
const UserActivity_1 = __importDefault(require("../models/UserActivity"));
const Activity_1 = __importDefault(require("../models/Activity"));
const GiftCard_1 = __importDefault(require("../models/GiftCard"));
const BalanceTopup_1 = __importDefault(require("../models/BalanceTopup"));
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
router.get("/analytics/timeseries", auth_1.authenticate, auth_1.ensureAdmin, async (req, res) => {
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
});
router.get("/users", auth_1.authenticate, auth_1.ensureAdmin, async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const q = String(req.query.q || "").trim();
    const role = String(req.query.role || "all");
    const sort = String(req.query.sort || "createdAt");
    const dir = String(req.query.dir || "desc") === "asc" ? 1 : -1;
    const query = {};
    if (q) {
        query.$or = [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }];
    }
    if (role !== "all")
        query.role = role;
    const sortMap = {
        name: "name",
        email: "email",
        role: "role",
        college: "college",
        pointBalance: "pointBalance",
        createdAt: "createdAt",
    };
    const sortField = sortMap[sort] || "createdAt";
    const total = await User_1.default.countDocuments(query);
    const items = await User_1.default.find(query)
        .sort({ [sortField]: dir })
        .skip((page - 1) * limit)
        .limit(limit);
    res.json({ items, total, page, limit });
});
router.post("/users/bulk", auth_1.authenticate, auth_1.ensureAdmin, async (req, res) => {
    try {
        const items = Array.isArray(req.body?.items) ? req.body.items : req.body;
        if (!Array.isArray(items))
            return res.status(400).json({ message: "items array required" });
        const defaultPassword = process.env.ADMIN_BULK_DEFAULT_PASSWORD || "peerks123";
        const ops = [];
        const errors = [];
        for (let i = 0; i < items.length; i += 1) {
            const raw = items[i];
            const row = raw?._row ?? i + 2;
            if (!raw?.email) {
                errors.push({ row, message: "Missing required field: email" });
                continue;
            }
            const email = String(raw.email).trim().toLowerCase();
            const name = raw.name ? String(raw.name).trim() : undefined;
            const role = raw.role === "admin" ? "admin" : raw.role === "vendor" ? "vendor" : "user";
            const college = raw.college ? String(raw.college).trim() : undefined;
            const pointBalance = raw.pointBalance != null ? Number(raw.pointBalance) : undefined;
            const passwordPlain = raw.password ? String(raw.password) : defaultPassword;
            const passwordHash = await bcryptjs_1.default.hash(passwordPlain, 10);
            const setFields = { role };
            if (name != null)
                setFields.name = name;
            if (college != null)
                setFields.college = college;
            if (pointBalance != null && !Number.isNaN(pointBalance))
                setFields.pointBalance = pointBalance;
            const update = { $set: setFields };
            update.$setOnInsert = { password: passwordHash, email };
            if (raw.password) {
                update.$set.password = passwordHash;
            }
            ops.push({
                updateOne: {
                    filter: { email },
                    update,
                    upsert: true,
                },
            });
        }
        if (ops.length === 0)
            return res.json({ inserted: 0, updated: 0, errors });
        const result = await User_1.default.bulkWrite(ops);
        res.json({
            inserted: result.upsertedCount || 0,
            updated: result.modifiedCount || 0,
            errors,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Bulk user import failed", error });
    }
});
router.get("/redemptions", auth_1.authenticate, auth_1.ensureAdmin, async (req, res) => {
    const redemptions = await Redemption_1.default.find().populate("giftCardId").populate("userId").sort({ createdAt: -1 });
    res.json(redemptions);
});
router.get("/topups", auth_1.authenticate, auth_1.ensureAdmin, async (req, res) => {
    const items = await BalanceTopup_1.default.find().populate("userId").sort({ createdAt: -1 });
    res.json(items);
});
router.get("/vendors", auth_1.authenticate, auth_1.ensureAdmin, async (req, res) => {
    const vendors = await User_1.default.find({ role: "vendor" }).select("name email college pointBalance createdAt");
    res.json(vendors);
});
router.post("/vendors", auth_1.authenticate, auth_1.ensureAdmin, async (req, res) => {
    try {
        const { name, email, password, college } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "Email and password required" });
        const existing = await User_1.default.findOne({ email });
        if (existing)
            return res.status(409).json({ message: "Email already exists" });
        const hashed = await bcryptjs_1.default.hash(password, 10);
        const vendor = await User_1.default.create({ name, email, password: hashed, college, role: "vendor" });
        res.json(vendor);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to create vendor", error });
    }
});
router.get("/activities", auth_1.authenticate, auth_1.ensureAdmin, async (req, res) => {
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
            { slug: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
        ];
    }
    if (status === "active")
        query.isActive = true;
    if (status === "inactive")
        query.isActive = false;
    const sortMap = { title: "title", slug: "slug", points: "points", isActive: "isActive", createdAt: "createdAt" };
    const sortField = sortMap[sort] || "createdAt";
    const total = await Activity_1.default.countDocuments(query);
    const items = await Activity_1.default.find(query)
        .sort({ [sortField]: dir })
        .skip((page - 1) * limit)
        .limit(limit);
    res.json({ items, total, page, limit });
});
router.post("/activities", auth_1.authenticate, auth_1.ensureAdmin, async (req, res) => {
    try {
        const activity = await Activity_1.default.create(req.body);
        res.json(activity);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create activity" });
    }
});
router.post("/activities/bulk", auth_1.authenticate, auth_1.ensureAdmin, async (req, res) => {
    try {
        const items = Array.isArray(req.body?.items) ? req.body.items : req.body;
        if (!Array.isArray(items))
            return res.status(400).json({ message: "items array required" });
        const errors = [];
        const ops = [];
        items.forEach((item, idx) => {
            const row = item?._row ?? idx + 2;
            if (!item?.slug || !item?.title) {
                errors.push({ row, message: "Missing required fields: slug, title" });
                return;
            }
            ops.push({
                updateOne: {
                    filter: { slug: item.slug },
                    update: {
                        $set: {
                            title: item.title,
                            slug: item.slug,
                            description: item.description,
                            points: Number(item.points) || 0,
                            isActive: item.isActive !== false,
                        },
                    },
                    upsert: true,
                },
            });
        });
        if (ops.length === 0)
            return res.json({ inserted: 0, updated: 0, errors });
        const result = await Activity_1.default.bulkWrite(ops);
        res.json({ inserted: result.upsertedCount || 0, updated: result.modifiedCount || 0, errors });
    }
    catch (error) {
        res.status(500).json({ message: "Bulk activity import failed", error });
    }
});
router.put("/activities/:id", auth_1.authenticate, auth_1.ensureAdmin, async (req, res) => {
    try {
        const activity = await Activity_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(activity);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update activity" });
    }
});
router.delete("/activities/:id", auth_1.authenticate, auth_1.ensureAdmin, async (req, res) => {
    try {
        await Activity_1.default.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete activity" });
    }
});
router.get("/giftcards", auth_1.authenticate, auth_1.ensureAdmin, async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const q = String(req.query.q || "").trim();
    const status = String(req.query.status || "all");
    const vendorId = String(req.query.vendorId || "").trim();
    const sort = String(req.query.sort || "createdAt");
    const dir = String(req.query.dir || "desc") === "asc" ? 1 : -1;
    const query = {};
    if (q) {
        query.$or = [{ name: { $regex: q, $options: "i" } }, { provider: { $regex: q, $options: "i" } }];
    }
    if (status === "active")
        query.isActive = true;
    if (status === "inactive")
        query.isActive = false;
    if (vendorId)
        query.vendorId = vendorId;
    const sortMap = { name: "name", provider: "provider", amount: "amount", pointsCost: "pointsCost", isActive: "isActive", createdAt: "createdAt" };
    const sortField = sortMap[sort] || "createdAt";
    const total = await GiftCard_1.default.countDocuments(query);
    const items = await GiftCard_1.default.find(query)
        .populate("vendorId")
        .sort({ [sortField]: dir })
        .skip((page - 1) * limit)
        .limit(limit);
    res.json({ items, total, page, limit });
});
router.post("/giftcards", auth_1.authenticate, auth_1.ensureAdmin, async (req, res) => {
    try {
        const giftcard = await GiftCard_1.default.create(req.body);
        res.json(giftcard);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create gift card" });
    }
});
router.post("/giftcards/bulk", auth_1.authenticate, auth_1.ensureAdmin, async (req, res) => {
    try {
        const items = Array.isArray(req.body?.items) ? req.body.items : req.body;
        if (!Array.isArray(items))
            return res.status(400).json({ message: "items array required" });
        const errors = [];
        const ops = [];
        items.forEach((item, idx) => {
            const row = item?._row ?? idx + 2;
            if (!item?.name || !item?.provider) {
                errors.push({ row, message: "Missing required fields: name, provider" });
                return;
            }
            ops.push({
                updateOne: {
                    filter: { name: item.name, provider: item.provider },
                    update: {
                        $set: {
                            name: item.name,
                            provider: item.provider,
                            pointsCost: Number(item.pointsCost) || 0,
                            amount: Number(item.amount) || 0,
                            isActive: item.isActive !== false,
                        },
                    },
                    upsert: true,
                },
            });
        });
        if (ops.length === 0)
            return res.json({ inserted: 0, updated: 0, errors });
        const result = await GiftCard_1.default.bulkWrite(ops);
        res.json({ inserted: result.upsertedCount || 0, updated: result.modifiedCount || 0, errors });
    }
    catch (error) {
        res.status(500).json({ message: "Bulk gift card import failed", error });
    }
});
router.put("/giftcards/:id", auth_1.authenticate, auth_1.ensureAdmin, async (req, res) => {
    try {
        const giftcard = await GiftCard_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(giftcard);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update gift card" });
    }
});
router.delete("/giftcards/:id", auth_1.authenticate, auth_1.ensureAdmin, async (req, res) => {
    try {
        await GiftCard_1.default.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete gift card" });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map