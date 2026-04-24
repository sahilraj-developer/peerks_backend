import { Schema, model, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  description: string;
  type: string;
  rewardCoins: number;
  isActive: boolean;
  createdAt: Date;
}

const taskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true, default: "post_creation" },
  rewardCoins: { type: Number, required: true, default: 0 },
  isActive: { type: Boolean, required: true, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Task = model<ITask>("Task", taskSchema);
export default Task;
