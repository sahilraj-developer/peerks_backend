"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGiftCard = exports.updateGiftCard = exports.bulkGiftCards = exports.createGiftCard = exports.getGiftCards = void 0;
const GiftCard_1 = __importDefault(require("../models/GiftCard"));
const getGiftCards = async (req, res) => {
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
};
exports.getGiftCards = getGiftCards;
const createGiftCard = async (req, res) => {
    try {
        const giftcard = await GiftCard_1.default.create(req.body);
        res.json(giftcard);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create gift card" });
    }
};
exports.createGiftCard = createGiftCard;
const bulkGiftCards = async (req, res) => {
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
};
exports.bulkGiftCards = bulkGiftCards;
const updateGiftCard = async (req, res) => {
    try {
        const giftcard = await GiftCard_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(giftcard);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update gift card" });
    }
};
exports.updateGiftCard = updateGiftCard;
const deleteGiftCard = async (req, res) => {
    try {
        await GiftCard_1.default.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete gift card" });
    }
};
exports.deleteGiftCard = deleteGiftCard;
//# sourceMappingURL=AdminGiftCardController.js.map