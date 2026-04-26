"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVendor = exports.getVendors = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const getVendors = async (req, res) => {
    const vendors = await User_1.default.find({ role: "vendor" }).select("name email college pointBalance createdAt");
    res.json(vendors);
};
exports.getVendors = getVendors;
const createVendor = async (req, res) => {
    try {
        const { name, email, password, college } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "Email and password required" });
        const existing = await User_1.default.findOne({ email });
        if (existing)
            return res.status(409).json({ message: "Email already exists" });
        const hashed = await bcryptjs_1.default.hash(password, 10);
        const vendor = await User_1.default.create({ name, email, password: hashed, college, role: "vendor" });
        res.json(vendor);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to create vendor", error });
    }
};
exports.createVendor = createVendor;
//# sourceMappingURL=AdminVendorController.js.map