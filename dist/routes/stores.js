"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Store_1 = __importDefault(require("../models/Store"));
const router = express_1.default.Router();
// Get all stores
router.get("/", async (req, res) => {
    try {
        const stores = await Store_1.default.find();
        res.json(stores);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
// Get a specific store
router.get("/:id", async (req, res) => {
    try {
        const store = await Store_1.default.findById(req.params.id);
        if (!store)
            return res.status(404).json({ message: "Store not found" });
        res.json(store);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.default = router;
//# sourceMappingURL=stores.js.map