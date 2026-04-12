import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  password: string;
  role: "user" | "admin" | "vendor";
  college?: string;
  pointBalance: number;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: "user", enum: ["user", "admin", "vendor"] },
  college: { type: String },
  pointBalance: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const User = model<IUser>("User", userSchema);
export default User;
