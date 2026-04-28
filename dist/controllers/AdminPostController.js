"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.updatePostStatus = exports.getPosts = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const getPosts = async (req, res) => {
    try {
        const posts = await Post_1.default.find().populate("authorId", "name email").sort({ createdAt: -1 });
        res.json(posts);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to get posts" });
    }
};
exports.getPosts = getPosts;
const updatePostStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["approved", "rejected", "pending"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }
        const post = await Post_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(post);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update post status" });
    }
};
exports.updatePostStatus = updatePostStatus;
const updatePost = async (req, res) => {
    try {
        const post = await Post_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!post)
            return res.status(404).json({ error: "Post not found" });
        res.json(post);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update post" });
    }
};
exports.updatePost = updatePost;
const deletePost = async (req, res) => {
    try {
        const post = await Post_1.default.findByIdAndDelete(req.params.id);
        if (!post)
            return res.status(404).json({ error: "Post not found" });
        res.json({ success: true, message: "Post deleted" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete post" });
    }
};
exports.deletePost = deletePost;
//# sourceMappingURL=AdminPostController.js.map