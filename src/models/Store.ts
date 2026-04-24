import { Schema, model, Document } from "mongoose";

export interface IStore extends Document {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  imageUrl?: string;
  createdAt: Date;
}

const storeSchema = new Schema<IStore>({
  name: { type: String, required: true },
  description: { type: String },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: { type: String },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Store = model<IStore>("Store", storeSchema);
export default Store;
