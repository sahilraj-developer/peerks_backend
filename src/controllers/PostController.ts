import { Request, Response } from "express";
import Post from "../models/Post";

export const getApprovedPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find({ status: "approved" }).populate("authorId", "name email").sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const createPost = async (req: any, res: Response) => {
  try {
    const { content, imageUrl } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    const post = new Post({
      content,
      imageUrl,
      authorId: req.user?.id,
      status: "pending",
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updatePost = async (req: any, res: Response) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, authorId: req.user?.id });
    if (!post) return res.status(404).json({ message: "Post not found or unauthorized" });

    if (req.body.content) post.content = req.body.content;
    if (req.body.imageUrl !== undefined) post.imageUrl = req.body.imageUrl;
    
    // Changing a post might require re-approval, but let's keep it simple for now
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deletePost = async (req: any, res: Response) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, authorId: req.user?.id });
    if (!post) return res.status(404).json({ message: "Post not found or unauthorized" });
    
    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
