import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceItem {
  desc: string;
  qty: number;
  rate: number;
}

export interface IInvoice extends Document {
  id: string;
  num: string;
  client: string;
  clientEmail: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  issueDate: string;
  dueDate: string;
  items: IInvoiceItem[];
}

const InvoiceSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  num: { type: String, required: true },
  client: { type: String, required: true },
  clientEmail: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
  issueDate: { type: String, required: true },
  dueDate: { type: String, required: true },
  items: [{
    desc: { type: String, required: true },
    qty: { type: Number, required: true, default: 1 },
    rate: { type: Number, required: true, default: 0 }
  }]
}, { timestamps: true });

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
