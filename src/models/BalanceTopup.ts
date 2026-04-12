import { Schema, model, Document, Types } from "mongoose";

export interface IBalanceTopup extends Document {
  userId: Types.ObjectId;
  amount: number;
  method: "upi" | "debit" | "credit";
  status: "pending" | "completed" | "failed";
  provider?: "stripe";
  currency?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  createdAt: Date;
}

const balanceTopupSchema = new Schema<IBalanceTopup>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  amount: { type: Number, required: true },
  method: { type: String, required: true, enum: ["upi", "debit", "credit"] },
  status: { type: String, required: true, default: "completed", enum: ["pending", "completed", "failed"] },
  provider: { type: String, enum: ["stripe"] },
  currency: { type: String, default: "inr" },
  stripeSessionId: { type: String },
  stripePaymentIntentId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const BalanceTopup = model<IBalanceTopup>("BalanceTopup", balanceTopupSchema);
export default BalanceTopup;
