import { Schema, model, Document } from "mongoose";

export interface IPost extends Document {
  content: string;
  authorId: Schema.Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  imageUrl?: string;
  createdAt: Date;
}

const postSchema = new Schema<IPost>({
  content: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, required: true, default: "pending", enum: ["pending", "approved", "rejected"] },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Post = model<IPost>("Post", postSchema);
export default Post;
