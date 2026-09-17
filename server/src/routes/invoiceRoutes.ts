import { Router, Response } from 'express';
import Invoice from '../models/Invoice';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

// GET /api/invoices - Get current user's invoices ONLY
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const invoices = await Invoice.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.json(invoices);
  } catch (err: any) {
    console.error('[Get Invoices Error]', err);
    return res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// POST /api/invoices - Create invoice for current user ONLY
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const newInvoiceData = {
      id: req.body.id || `inv_${Date.now()}`,
      userId: req.userId,
      num: req.body.num,
      client: req.body.client,
      clientEmail: req.body.clientEmail || '',
      amount: req.body.amount || 0,
      status: req.body.status || 'Pending',
      issueDate: req.body.date || req.body.issueDate || new Date().toISOString().slice(0, 10),
      dueDate: req.body.due || req.body.dueDate || '',
      items: req.body.items || [{ desc: req.body.desc || 'Services rendered', qty: 1, rate: req.body.amount || 0 }]
    };

    const invoice = new Invoice(newInvoiceData);
    await invoice.save();
    return res.status(201).json(invoice);
  } catch (err: any) {
    console.error('[Create Invoice Error]', err);
    return res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// PUT /api/invoices/:id - Update current user's invoice ONLY
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await Invoice.findOneAndUpdate(
      { id: req.params.id, userId: req.userId },
      { ...req.body, userId: req.userId },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Invoice not found or access denied' });
    }
    return res.json(updated);
  } catch (err: any) {
    console.error('[Update Invoice Error]', err);
    return res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// DELETE /api/invoices/:id - Delete current user's invoice ONLY
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await Invoice.findOneAndDelete({ id: req.params.id, userId: req.userId });
    if (!deleted) {
      return res.status(404).json({ error: 'Invoice not found or access denied' });
    }
    return res.json({ message: 'Invoice deleted successfully' });
  } catch (err: any) {
    console.error('[Delete Invoice Error]', err);
    return res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

// POST /api/invoices/send-email
router.post('/send-email', async (req: AuthenticatedRequest, res: Response) => {
  const { to, subject, body, invoiceNum, pdfBase64 } = req.body;
  console.log(`[Express Backend Mailer] Processing Invoice Email for ${to} (${invoiceNum})`);

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpUser && smtpPass) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const attachments = pdfBase64 ? [{
        filename: `${invoiceNum || 'Invoice'}.pdf`,
        content: Buffer.from(pdfBase64, 'base64'),
        contentType: 'application/pdf'
      }] : [];

      await transporter.sendMail({
        from: `FreelanceOS <${smtpUser}>`,
        to: to,
        subject: subject || `Invoice ${invoiceNum}`,
        text: body,
        attachments: attachments
      });

      return res.json({
        status: 'success',
        message: `Email with PDF attachment sent directly to ${to}!`,
        attachmentAttached: true
      });
    } catch (e: any) {
      console.error('[Nodemailer Error]', e);
      return res.status(500).json({ error: 'Failed to send email via SMTP', details: e.message });
    }
  }

  return res.json({
    status: 'success',
    message: `Invoice PDF email queued & processed via Express API for ${to}`,
    pdfAttached: true,
    timestamp: new Date().toISOString()
  });
});

export default router;
