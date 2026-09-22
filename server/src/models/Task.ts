import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  id: string;
  userId: string;
  title: string;
  project: string;
  status: 'Todo' | 'InProgress' | 'Review' | 'Done';
  due: string;
  priority: 'High' | 'Medium' | 'Low';
}

const TaskSchema: Schema = new Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  project: { type: String, required: true },
  status: { type: String, enum: ['Todo', 'InProgress', 'Review', 'Done'], default: 'Todo' },
  due: { type: String, required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' }
}, { timestamps: true });

TaskSchema.index({ userId: 1, id: 1 }, { unique: true });

export default mongoose.model<ITask>('Task', TaskSchema);
