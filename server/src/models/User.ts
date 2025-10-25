import mongoose, { Schema, Document, Model } from 'mongoose';

export interface User extends Document {
  email: string;
  passwordHash: string;
}

const UserSchema = new Schema<User>({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

export const UserModel: Model<User> = mongoose.model<User>('User', UserSchema);
