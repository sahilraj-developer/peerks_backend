import express from "express";
import Post from "../models/Post";
import { authenticate } from "../middleware/auth";
import { AuthRequest } from "../types/express";

const router = express.Router();

// Get approved posts (feed)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find({ status: "approved" }).populate("authorId", "name email").sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Submit a new post (requires auth)
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { content, imageUrl } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    const post = new Post({
      content,
      imageUrl,
      authorId: req.user?._id,
      status: "pending",
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
