import { Schema, model, models, type Document, type Model } from "mongoose";

export interface PositionItem extends Document {
  userId: string;
  symbol: string;
  company: string;
  shares: number;
  costBasis: number;
  purchaseDate: Date;
  createdAt: Date;
}

const PositionSchema = new Schema<PositionItem>({
  userId: { type: String, required: true, index: true },
  symbol: { type: String, required: true, uppercase: true, trim: true },
  company: { type: String, required: true, trim: true },
  shares: { type: Number, required: true, min: 0.000001 },
  costBasis: { type: Number, required: true, min: 0 },
  purchaseDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

PositionSchema.index({ userId: 1, symbol: 1 });

export const Position: Model<PositionItem> =
  (models?.Position as Model<PositionItem>) ||
  model<PositionItem>("Position", PositionSchema);
