import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceItem {
  desc: string;
  qty: number;
  rate: number;
}

export interface IInvoice extends Document {
  id: string;
  userId: string;
  num: string;
  client: string;
  clientEmail: string;
  amount: number;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  date: string;
  due: string;
  desc: string;
  items: IInvoiceItem[];
}

const InvoiceSchema: Schema = new Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  num: { type: String, required: true },
  client: { type: String, required: true },
  clientEmail: { type: String, default: '' },
  amount: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['Paid', 'Unpaid', 'Overdue'], default: 'Unpaid' },
  date: { type: String, required: true },
  due: { type: String, required: true },
  desc: { type: String, default: '' },
  items: [{
    desc: { type: String, required: true },
    qty: { type: Number, required: true, default: 1 },
    rate: { type: Number, required: true, default: 0 }
  }]
}, { timestamps: true });

InvoiceSchema.index({ userId: 1, id: 1 }, { unique: true });

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
