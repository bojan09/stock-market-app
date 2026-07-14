import { Schema, model, models } from "mongoose";

const ReadNewsSchema = new Schema({
  userId: { type: String, required: true, index: true },
  articleId: { type: String, required: true },
  readAt: { type: Date, default: Date.now },
});

// Compound index to prevent duplicate read-marks for the same article
ReadNewsSchema.index({ userId: 1, articleId: 1 }, { unique: true });

export const ReadNews = models.ReadNews || model("ReadNews", ReadNewsSchema);
