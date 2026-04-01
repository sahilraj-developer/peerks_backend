import { Schema, model, Document } from "mongoose";

export interface IActivity extends Document {
  slug: string;
  title: string;
  description?: string;
  points: number;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  points: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Activity = model<IActivity>("Activity", activitySchema);
export default Activity;
