import { Router, Request, Response } from 'express';
import Payment from '../models/Payment';
import mongoose from 'mongoose';

const router = Router();

let inMemoryPayments = [
  { id: "pay1", txId: "TXN-882910", invoiceNum: "INV-2026-001", client: "LogiTech Ltd", amount: 45000, date: "2026-02-14", method: "Direct Transfer", status: "Completed" },
  { id: "pay2", txId: "TXN-773821", invoiceNum: "INV-2026-002", client: "BrokerPad Inc", amount: 30000, date: "2026-02-24", method: "UPI", status: "Completed" },
  { id: "pay3", txId: "TXN-661922", invoiceNum: "INV-2026-000", client: "AgriTech Co", amount: 35000, date: "2026-01-20", method: "Direct Transfer", status: "Completed" }
];

router.get('/', async (req: Request, res: Response) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const payments = await Payment.find().sort({ createdAt: -1 });
      return res.json(payments);
    } catch {
      return res.json(inMemoryPayments);
    }
  }
  return res.json(inMemoryPayments);
});

router.post('/', async (req: Request, res: Response) => {
  const newPayment = { id: req.body.id || `pay_${Date.now()}`, ...req.body };
  if (mongoose.connection.readyState === 1) {
    try {
      const payment = new Payment(newPayment);
      await payment.save();
    } catch (e) {
      console.error(e);
    }
  }
  inMemoryPayments.unshift(newPayment);
  return res.status(201).json(newPayment);
});

export default router;
