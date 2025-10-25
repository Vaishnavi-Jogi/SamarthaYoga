import mongoose, { Schema, Document, Model } from 'mongoose';

export interface Activity extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'upload' | 'challenge';
  date: string; // YYYY-MM-DD
  meta?: Record<string, any>;
}

const ActivitySchema = new Schema<Activity>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  type: { type: String, enum: ['upload', 'challenge'], required: true },
  date: { type: String, required: true, index: true },
  meta: { type: Object },
}, { timestamps: true });

ActivitySchema.index({ userId: 1, date: 1, type: 1 }, { unique: true });

export const ActivityModel: Model<Activity> = mongoose.model<Activity>('Activity', ActivitySchema);
