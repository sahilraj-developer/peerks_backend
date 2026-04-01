import { Schema, model, Document, Types } from "mongoose";

export interface IRedemption extends Document {
  userId: Types.ObjectId;
  giftCardId: Types.ObjectId;
  points: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: Date;
}

const redemptionSchema = new Schema<IRedemption>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  giftCardId: { type: Schema.Types.ObjectId, required: true, ref: "GiftCard" },
  points: { type: Number, required: true },
  status: { type: String, required: true, default: "pending", enum: ["pending", "completed", "cancelled"] },
  createdAt: { type: Date, default: Date.now },
});

const Redemption = model<IRedemption>("Redemption", redemptionSchema);
export default Redemption;
