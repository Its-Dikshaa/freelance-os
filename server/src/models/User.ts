import mongoose, { Schema, Document } from 'mongoose';

export interface IQuickPaymentMethod {
  id: string;
  name: string;
  accountDetails: string;
  qrCode?: string;
  isDefault?: boolean;
  notes?: string;
}

export interface IUser extends Document {
  name: string;
  profession: string;
  email: string;
  password?: string;
  biz: string;
  location: string;
  rate: number;
  currency: string;
  gst: string;
  bank: string;
  prefix: string;
  hasCompletedOnboarding: boolean;
  paymentMethods?: IQuickPaymentMethod[];
}

const QuickPaymentMethodSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  accountDetails: { type: String, required: true },
  qrCode: { type: String, default: '' },
  isDefault: { type: Boolean, default: false },
  notes: { type: String, default: '' }
}, { _id: false });

// Field names here must match `UserSettings` in src/types/index.ts exactly —
// the frontend reads these responses as-is, with no translation layer.
const UserSchema: Schema = new Schema({
  name: { type: String, required: true, default: 'Diksha Jangra' },
  profession: { type: String, required: true, default: 'UI/UX Designer' },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },
  biz: { type: String, default: 'Studio Diksha' },
  location: { type: String, default: '' },
  rate: { type: Number, default: 85 },
  currency: { type: String, default: '₹' },
  gst: { type: String, default: 'GSTIN07AAAAA0000A1Z5' },
  bank: { type: String, default: 'Bank Transfer / UPI accepted. Payment due within 15 days.' },
  prefix: { type: String, default: 'INV' },
  hasCompletedOnboarding: { type: Boolean, default: true },
  paymentMethods: {
    type: [QuickPaymentMethodSchema],
    default: () => ([
      {
        id: 'pm-1',
        name: 'Google Pay (UPI)',
        accountDetails: 'diksha@upi',
        qrCode: '',
        isDefault: true,
        notes: 'Instant settlement via UPI / QR'
      }
    ])
  }
}, { timestamps: true });


export default mongoose.model<IUser>('User', UserSchema);
