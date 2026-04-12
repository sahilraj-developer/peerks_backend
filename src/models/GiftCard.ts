import { Schema, model, Document } from "mongoose";

export interface IGiftCard extends Document {
  name: string;
  provider: string;
  pointsCost: number;
  amount: number;
  isActive: boolean;
  vendorId?: Schema.Types.ObjectId;
  createdAt: Date;
}

const giftCardSchema = new Schema<IGiftCard>({
  name: { type: String, required: true },
  provider: { type: String, required: true },
  pointsCost: { type: Number, required: true },
  amount: { type: Number, required: true },
  isActive: { type: Boolean, required: true, default: true },
  vendorId: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

const GiftCard = model<IGiftCard>("GiftCard", giftCardSchema);
export default GiftCard;
