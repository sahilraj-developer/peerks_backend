"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GiftCard_1 = __importDefault(require("../models/GiftCard"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticate, async (_req, res) => {
    const giftCards = await GiftCard_1.default.find({ isActive: true }).sort({ pointsCost: 1 });
    res.json(giftCards);
});
exports.default = router;
//# sourceMappingURL=giftcards.js.map