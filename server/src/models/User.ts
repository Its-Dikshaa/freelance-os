import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  role: string;
  email: string;
  password?: string;
  studio: string;
  hourlyRate: number;
  currency: string;
  gst: string;
  paymentNotes: string;
  hasCompletedOnboarding: boolean;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true, default: 'Diksha Jangra' },
  role: { type: String, required: true, default: 'UI/UX Designer' },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },
  studio: { type: String, default: 'Studio Diksha' },
  hourlyRate: { type: Number, default: 85 },
  currency: { type: String, default: '₹' },
  gst: { type: String, default: 'GSTIN07AAAAA0000A1Z5' },
  paymentNotes: { type: String, default: 'Bank Transfer / UPI accepted. Payment due within 15 days.' },
  hasCompletedOnboarding: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
