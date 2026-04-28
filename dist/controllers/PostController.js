"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.createPost = exports.getApprovedPosts = void 0;
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
const updatePost = async (req, res) => {
    try {
        const post = await Post_1.default.findOne({ _id: req.params.id, authorId: req.user?.id });
        if (!post)
            return res.status(404).json({ message: "Post not found or unauthorized" });
        if (req.body.content)
            post.content = req.body.content;
        if (req.body.imageUrl !== undefined)
            post.imageUrl = req.body.imageUrl;
        // Changing a post might require re-approval, but let's keep it simple for now
        await post.save();
        res.json(post);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.updatePost = updatePost;
const deletePost = async (req, res) => {
    try {
        const post = await Post_1.default.findOneAndDelete({ _id: req.params.id, authorId: req.user?.id });
        if (!post)
            return res.status(404).json({ message: "Post not found or unauthorized" });
        res.json({ success: true, message: "Post deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
exports.deletePost = deletePost;
//# sourceMappingURL=PostController.js.map