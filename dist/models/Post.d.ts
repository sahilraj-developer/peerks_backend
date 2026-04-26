import { Schema, Document } from "mongoose";
export interface IPost extends Document {
    content: string;
    authorId: Schema.Types.ObjectId;
    status: "pending" | "approved" | "rejected";
    imageUrl?: string;
    createdAt: Date;
}
declare const Post: import("mongoose").Model<IPost, {}, {}, {}, Document<unknown, {}, IPost> & IPost & {
    _id: import("mongoose").Types.ObjectId;
}, any>;
export default Post;
//# sourceMappingURL=Post.d.ts.map