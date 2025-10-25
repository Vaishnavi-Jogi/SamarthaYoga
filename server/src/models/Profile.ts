import mongoose, { Schema, Document, Model } from 'mongoose';

export interface Profile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced';
  flexibility: 'low' | 'medium' | 'high';
  goal?: string;
  pcosOrPcod?: boolean; // only meaningful when gender is female
}

const ProfileSchema = new Schema<Profile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  flexibility: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  goal: { type: String },
  pcosOrPcod: { type: Boolean },
}, { timestamps: true });

export const ProfileModel: Model<Profile> = mongoose.model<Profile>('Profile', ProfileSchema);
