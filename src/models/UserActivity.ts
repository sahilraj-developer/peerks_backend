import { Schema, model, Document, Types } from "mongoose";

export interface IUserActivity extends Document {
  userId: Types.ObjectId;
  activityId: Types.ObjectId;
  points: number;
  createdAt: Date;
}

const userActivitySchema = new Schema<IUserActivity>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  activityId: { type: Schema.Types.ObjectId, required: true, ref: "Activity" },
  points: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const UserActivity = model<IUserActivity>("UserActivity", userActivitySchema);
export default UserActivity;
