"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const redemptionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    giftCardId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "GiftCard" },
    points: { type: Number, required: true },
    status: { type: String, required: true, default: "pending", enum: ["pending", "completed", "cancelled"] },
    createdAt: { type: Date, default: Date.now },
});
const Redemption = (0, mongoose_1.model)("Redemption", redemptionSchema);
exports.default = Redemption;
//# sourceMappingURL=Redemption.js.map