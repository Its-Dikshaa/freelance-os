import { Router, Response } from 'express';
import Payment from '../models/Payment';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

// GET /api/payments - Get current user's payments ONLY
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payments = await Payment.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.json(payments);
  } catch (err) {
    console.error('[Get Payments Error]', err);
    return res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// POST /api/payments - Create payment for current user ONLY
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const newPaymentData = {
      id: req.body.id || `pay_${Date.now()}`,
      userId: req.userId,
      txId: req.body.txId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      invoiceNum: req.body.invoiceNum || '',
      client: req.body.client || '',
      amount: req.body.amount || 0,
      date: req.body.date || new Date().toISOString().slice(0, 10),
      method: req.body.method || 'Direct Transfer',
      status: req.body.status || 'Completed'
    };

    const payment = new Payment(newPaymentData);
    await payment.save();
    return res.status(201).json(payment);
  } catch (err) {
    console.error('[Create Payment Error]', err);
    return res.status(500).json({ error: 'Failed to record payment' });
  }
});

export default router;
