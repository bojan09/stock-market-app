import { Schema, model, models, type Document, type Model } from "mongoose";

export interface PushSubscriptionItem extends Document {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  createdAt: Date;
}

const PushSubscriptionSchema = new Schema<PushSubscriptionItem>({
  userId: { type: String, required: true, index: true },
  endpoint: { type: String, required: true },
  p256dh: { type: String, required: true },
  auth: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

PushSubscriptionSchema.index({ userId: 1, endpoint: 1 }, { unique: true });

export const PushSubscription: Model<PushSubscriptionItem> =
  (models?.PushSubscription as Model<PushSubscriptionItem>) ||
  model<PushSubscriptionItem>("PushSubscription", PushSubscriptionSchema);
