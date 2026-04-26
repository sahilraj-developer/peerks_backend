"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Post_1 = __importDefault(require("../models/Post"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get approved posts (feed)
router.get("/", async (req, res) => {
    try {
        const posts = await Post_1.default.find({ status: "approved" }).populate("authorId", "name email").sort({ createdAt: -1 });
        res.json(posts);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
// Submit a new post (requires auth)
router.post("/", auth_1.authenticate, async (req, res) => {
    try {
        const { content, imageUrl } = req.body;
        if (!content)
            return res.status(400).json({ message: "Content is required" });
        const post = new Post_1.default({
            content,
            imageUrl,
            authorId: req.user?._id,
            status: "pending",
        });
        await post.save();
        res.status(201).json(post);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.default = router;
//# sourceMappingURL=posts.js.map