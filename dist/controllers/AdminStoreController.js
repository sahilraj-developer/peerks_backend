"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStore = exports.updateStore = exports.createStore = void 0;
const Store_1 = __importDefault(require("../models/Store"));
const createStore = async (req, res) => {
    try {
        const store = await Store_1.default.create(req.body);
        res.json(store);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create store" });
    }
};
exports.createStore = createStore;
const updateStore = async (req, res) => {
    try {
        const store = await Store_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(store);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update store" });
    }
};
exports.updateStore = updateStore;
const deleteStore = async (req, res) => {
    try {
        await Store_1.default.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete store" });
    }
};
exports.deleteStore = deleteStore;
//# sourceMappingURL=AdminStoreController.js.map