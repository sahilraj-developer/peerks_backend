import { Schema, model, Document } from "mongoose";

export interface IActivity extends Document {
  slug: string;
  title: string;
  description?: string;
  points: number;
  isActive: boolean;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  points: { type: Number, required: true },
  isActive: { type: Boolean, required: true, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Activity = model<IActivity>("Activity", activitySchema);
export default Activity;
