"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const storeSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String },
    imageUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
});
const Store = (0, mongoose_1.model)("Store", storeSchema);
exports.default = Store;
//# sourceMappingURL=Store.js.map