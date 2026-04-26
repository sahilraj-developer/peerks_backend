"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoreById = exports.getStores = void 0;
const Store_1 = __importDefault(require("../models/Store"));
const getStores = async (req, res) => {
    try {
        const stores = await Store_1.default.find();
        res.json(stores);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.getStores = getStores;
const getStoreById = async (req, res) => {
    try {
        const store = await Store_1.default.findById(req.params.id);
        if (!store)
            return res.status(404).json({ message: "Store not found" });
        res.json(store);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.getStoreById = getStoreById;
//# sourceMappingURL=StoreController.js.map