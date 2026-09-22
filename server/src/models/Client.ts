import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  id: string;
  userId: string;
  name: string;
  industry: string;
  email: string;
  phone: string;
  value: number;
  status: 'Active' | 'Lead' | 'Inactive';
  projects: number;
  color: string;
  initials?: string;
  notes?: string;
}

const ClientSchema: Schema = new Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  industry: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  value: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Lead', 'Inactive'], default: 'Active' },
  projects: { type: Number, default: 0 },
  color: { type: String, default: '#4e7360' },
  initials: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true });

ClientSchema.index({ userId: 1, id: 1 }, { unique: true });

export default mongoose.model<IClient>('Client', ClientSchema);
