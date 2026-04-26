import { Request, Response } from "express";
import Post from "../models/Post";

export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find().populate("authorId", "name email").sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to get posts" });
  }
};

export const updatePostStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const post = await Post.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to update post status" });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to update post" });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json({ success: true, message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete post" });
  }
};
