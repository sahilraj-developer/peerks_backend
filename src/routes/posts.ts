import express from "express";
import { authenticate } from "../middleware/auth";
import * as PostController from "../controllers/PostController";

const router = express.Router();

router.get("/", PostController.getApprovedPosts);
router.post("/", authenticate, PostController.createPost);
router.put("/:id", authenticate, PostController.updatePost);
router.delete("/:id", authenticate, PostController.deletePost);

export default router;
