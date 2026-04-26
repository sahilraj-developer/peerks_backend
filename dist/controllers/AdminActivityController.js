"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteActivity = exports.updateActivity = exports.bulkActivities = exports.createActivity = exports.getActivities = void 0;
const Activity_1 = __importDefault(require("../models/Activity"));
const getActivities = async (req, res) => {
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
};
exports.getActivities = getActivities;
const createActivity = async (req, res) => {
    try {
        const activity = await Activity_1.default.create(req.body);
        res.json(activity);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create activity" });
    }
};
exports.createActivity = createActivity;
const bulkActivities = async (req, res) => {
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
};
exports.bulkActivities = bulkActivities;
const updateActivity = async (req, res) => {
    try {
        const activity = await Activity_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(activity);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update activity" });
    }
};
exports.updateActivity = updateActivity;
const deleteActivity = async (req, res) => {
    try {
        await Activity_1.default.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete activity" });
    }
};
exports.deleteActivity = deleteActivity;
//# sourceMappingURL=AdminActivityController.js.map