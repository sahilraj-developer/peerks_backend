"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const postSchema = new mongoose_1.Schema({
    content: { type: String, required: true },
    authorId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, required: true, default: "pending", enum: ["pending", "approved", "rejected"] },
    imageUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
});
const Post = (0, mongoose_1.model)("Post", postSchema);
exports.default = Post;
//# sourceMappingURL=Post.js.map