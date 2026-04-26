"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGiftCards = void 0;
const GiftCard_1 = __importDefault(require("../models/GiftCard"));
const getGiftCards = async (_req, res) => {
    const giftCards = await GiftCard_1.default.find({ isActive: true }).sort({ pointsCost: 1 });
    res.json(giftCards);
};
exports.getGiftCards = getGiftCards;
//# sourceMappingURL=GiftCardController.js.map