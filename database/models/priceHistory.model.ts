import { Schema, model, models, type Document, type Model } from "mongoose";

export interface PriceHistoryItem extends Document {
  symbol: string;
  price: number;
  timestamp: Date;
}

const PriceHistorySchema = new Schema<PriceHistoryItem>({
  symbol: { type: String, required: true, uppercase: true, trim: true },
  price: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

PriceHistorySchema.index({ symbol: 1, timestamp: 1 });

export const PriceHistory: Model<PriceHistoryItem> =
  (models?.PriceHistory as Model<PriceHistoryItem>) ||
  model<PriceHistoryItem>("PriceHistory", PriceHistorySchema);
