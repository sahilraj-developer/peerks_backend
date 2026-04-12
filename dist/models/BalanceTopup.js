"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const balanceTopupSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    amount: { type: Number, required: true },
    method: { type: String, required: true, enum: ["upi", "debit", "credit"] },
    status: { type: String, required: true, default: "completed", enum: ["pending", "completed", "failed"] },
    provider: { type: String, enum: ["stripe"] },
    currency: { type: String, default: "inr" },
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String },
    createdAt: { type: Date, default: Date.now },
});
const BalanceTopup = (0, mongoose_1.model)("BalanceTopup", balanceTopupSchema);
exports.default = BalanceTopup;
//# sourceMappingURL=BalanceTopup.js.map