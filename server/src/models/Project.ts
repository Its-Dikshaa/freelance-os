import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  id: string;
  userId: string;
  name: string;
  client: string;
  clientEmail: string;
  budget: number;
  spent: number;
  status: 'Active' | 'In Review' | 'Pending' | 'Done';
  deadline: string;
  color: string;
  description?: string;
}

const ProjectSchema: Schema = new Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  client: { type: String, required: true },
  clientEmail: { type: String, default: '' },
  budget: { type: Number, required: true, default: 0 },
  spent: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['Active', 'In Review', 'Pending', 'Done'], default: 'Active' },
  deadline: { type: String, required: true },
  color: { type: String, default: '#4e7360' },
  description: { type: String, default: '' }
}, { timestamps: true });

ProjectSchema.index({ userId: 1, id: 1 }, { unique: true });

export default mongoose.model<IProject>('Project', ProjectSchema);
