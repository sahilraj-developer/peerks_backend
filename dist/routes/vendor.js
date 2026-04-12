"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GiftCard_1 = __importDefault(require("../models/GiftCard"));
const Redemption_1 = __importDefault(require("../models/Redemption"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/analytics", auth_1.authenticate, auth_1.ensureVendorOrAdmin, async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ message: "Unauthorized" });
    const giftCards = await GiftCard_1.default.find({ vendorId: userId });
    const giftCardIds = giftCards.map((g) => g._id);
    const totalGiftCards = giftCards.length;
    const activeGiftCards = giftCards.filter((g) => g.isActive).length;
    const redemptionsAgg = await Redemption_1.default.aggregate([
        { $match: { giftCardId: { $in: giftCardIds }, status: "completed" } },
        { $group: { _id: null, total: { $sum: 1 }, coins: { $sum: "$points" } } },
    ]);
    const totals = redemptionsAgg[0] || { total: 0, coins: 0 };
    res.json({
        totalGiftCards,
        activeGiftCards,
        totalRedemptions: totals.total,
        totalCoinsRedeemed: totals.coins,
    });
});
router.get("/giftcards", auth_1.authenticate, auth_1.ensureVendorOrAdmin, async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ message: "Unauthorized" });
    const query = req.user?.role === "admin" ? {} : { vendorId: userId };
    const items = await GiftCard_1.default.find(query).sort({ createdAt: -1 });
    res.json(items);
});
router.post("/giftcards", auth_1.authenticate, auth_1.ensureVendorOrAdmin, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const payload = {
            ...req.body,
            vendorId: req.user?.role === "admin" ? req.body?.vendorId || userId : userId,
        };
        const giftcard = await GiftCard_1.default.create(payload);
        res.json(giftcard);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create gift card" });
    }
});
router.put("/giftcards/:id", auth_1.authenticate, auth_1.ensureVendorOrAdmin, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const filter = req.user?.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, vendorId: userId };
        const giftcard = await GiftCard_1.default.findOneAndUpdate(filter, req.body, { new: true });
        if (!giftcard)
            return res.status(404).json({ message: "Gift card not found" });
        res.json(giftcard);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update gift card" });
    }
});
exports.default = router;
//# sourceMappingURL=vendor.js.map