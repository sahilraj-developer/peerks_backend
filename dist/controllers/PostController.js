"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPost = exports.getApprovedPosts = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const getApprovedPosts = async (req, res) => {
    try {
        const posts = await Post_1.default.find({ status: "approved" }).populate("authorId", "name email").sort({ createdAt: -1 });
        res.json(posts);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.getApprovedPosts = getApprovedPosts;
const createPost = async (req, res) => {
    try {
        const { content, imageUrl } = req.body;
        if (!content)
            return res.status(400).json({ message: "Content is required" });
        const post = new Post_1.default({
            content,
            imageUrl,
            authorId: req.user?.id,
            status: "pending",
        });
        await post.save();
        res.status(201).json(post);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.createPost = createPost;
//# sourceMappingURL=PostController.js.map