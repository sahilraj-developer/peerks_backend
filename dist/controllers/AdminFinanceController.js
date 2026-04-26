"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopups = exports.getRedemptions = void 0;
const Redemption_1 = __importDefault(require("../models/Redemption"));
const BalanceTopup_1 = __importDefault(require("../models/BalanceTopup"));
const getRedemptions = async (req, res) => {
    const redemptions = await Redemption_1.default.find().populate("giftCardId").populate("userId").sort({ createdAt: -1 });
    res.json(redemptions);
};
exports.getRedemptions = getRedemptions;
const getTopups = async (req, res) => {
    const items = await BalanceTopup_1.default.find().populate("userId").sort({ createdAt: -1 });
    res.json(items);
};
exports.getTopups = getTopups;
//# sourceMappingURL=AdminFinanceController.js.map