"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const giftCardSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    provider: { type: String, required: true },
    pointsCost: { type: Number, required: true },
    amount: { type: Number, required: true },
    isActive: { type: Boolean, required: true, default: true },
    vendorId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
});
const GiftCard = (0, mongoose_1.model)("GiftCard", giftCardSchema);
exports.default = GiftCard;
//# sourceMappingURL=GiftCard.js.map