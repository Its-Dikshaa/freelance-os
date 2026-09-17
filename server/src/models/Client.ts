import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  id: string;
  userId: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  totalBilled: number;
  status: 'Active' | 'Lead' | 'Inactive';
  projectsCount: number;
  avatar?: string;
}

const ClientSchema: Schema = new Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  company: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  totalBilled: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Lead', 'Inactive'], default: 'Active' },
  projectsCount: { type: Number, default: 0 },
  avatar: { type: String, default: '' }
}, { timestamps: true });

ClientSchema.index({ userId: 1, id: 1 }, { unique: true });

export default mongoose.model<IClient>('Client', ClientSchema);
