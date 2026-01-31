import { Schema, model, models } from "mongoose";

const SavedNewsSchema = new Schema({
  userId: { type: String, required: true, index: true },
  articleId: { type: String, required: true },
  headline: { type: String, required: true },
  summary: { type: String },
  url: { type: String, required: true },
  image: { type: String },
  source: { type: String },
  datetime: { type: Number },
  category: { type: String },
  savedAt: { type: Date, default: Date.now },
});

// Compound index to prevent a user from saving the same article twice
SavedNewsSchema.index({ userId: 1, articleId: 1 }, { unique: true });

export const SavedNews =
  models.SavedNews || model("SavedNews", SavedNewsSchema);
