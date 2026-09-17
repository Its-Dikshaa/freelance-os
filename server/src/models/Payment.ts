import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  id: string;
  txId: string;
  invoiceNum: string;
  client: string;
  amount: number;
  date: string;
  method: string;
  status: 'Completed' | 'Processing' | 'Failed';
}

const PaymentSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  txId: { type: String, required: true },
  invoiceNum: { type: String, required: true },
  client: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  method: { type: String, default: 'Direct Transfer' },
  status: { type: String, enum: ['Completed', 'Processing', 'Failed'], default: 'Completed' }
}, { timestamps: true });

export default mongoose.model<IPayment>('Payment', PaymentSchema);
