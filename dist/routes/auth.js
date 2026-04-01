"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "Email and password required" });
        const existing = await User_1.default.findOne({ email });
        if (existing)
            return res.status(409).json({ message: "Email already exists" });
        const hashed = await bcryptjs_1.default.hash(password, 10);
        const user = await User_1.default.create({ name, email, password: hashed });
        const token = (0, auth_1.createToken)({ id: user._id.toString(), role: user.role, email: user.email });
        res.json({
            user: { id: user._id.toString(), email: user.email, name: user.name, role: user.role, pointBalance: user.pointBalance },
            token,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Registration failed", error });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "Email and password required" });
        const user = await User_1.default.findOne({ email });
        if (!user)
            return res.status(401).json({ message: "Invalid credentials" });
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid)
            return res.status(401).json({ message: "Invalid credentials" });
        const token = (0, auth_1.createToken)({ id: user._id.toString(), role: user.role, email: user.email });
        res.json({
            user: { id: user._id.toString(), email: user.email, name: user.name, role: user.role, pointBalance: user.pointBalance },
            token,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Login failed", error });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map