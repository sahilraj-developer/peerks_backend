"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = require("mongoose");
const GiftCard_1 = __importDefault(require("../models/GiftCard"));
const Redemption_1 = __importDefault(require("../models/Redemption"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticate, async (req, res) => {
    const userId = req.user?.id;
    const filter = req.query.all === "true" ? {} : { userId };
    const redemptions = await Redemption_1.default.find(filter)
        .populate("giftCardId")
        .populate("userId")
        .sort({ createdAt: -1 });
    res.json(redemptions);
});
router.post("/", auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { giftCardId } = req.body;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        if (!mongoose_1.Types.ObjectId.isValid(giftCardId))
            return res.status(400).json({ message: "Invalid gift card ID" });
        const giftCard = await GiftCard_1.default.findById(giftCardId);
        if (!giftCard || !giftCard.isActive)
            return res.status(404).json({ message: "Gift card unavailable" });
        const user = await User_1.default.findById(userId);
        if (!user || user.pointBalance < giftCard.pointsCost) {
            return res.status(400).json({ message: "Insufficient points" });
        }
        const redemption = await Redemption_1.default.create({
            userId,
            giftCardId,
            points: giftCard.pointsCost,
            status: "completed",
        });
        user.pointBalance -= giftCard.pointsCost;
        await user.save();
        res.json({ message: "Redeemed", redemption });
    }
    catch (error) {
        res.status(500).json({ message: "Redemption failed", error });
    }
});
exports.default = router;
//# sourceMappingURL=redemptions.js.map