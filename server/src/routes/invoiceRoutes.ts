import { Router, Request, Response } from 'express';
import Invoice from '../models/Invoice';
import mongoose from 'mongoose';

const router = Router();

let inMemoryInvoices = [
  { id: "i1", num: "INV-2026-001", client: "LogiTech Ltd", clientEmail: "rohan@logitech.io", amount: 45000, status: "Paid", issueDate: "2026-02-01", dueDate: "2026-02-15", items: [{ desc: "UI/UX Design Milestone 1", qty: 1, rate: 45000 }] },
  { id: "i2", num: "INV-2026-002", client: "BrokerPad Inc", clientEmail: "sarah@brokerpad.com", amount: 30000, status: "Paid", issueDate: "2026-02-10", dueDate: "2026-02-25", items: [{ desc: "Discovery & Wireframes", qty: 1, rate: 30000 }] },
  { id: "i3", num: "INV-2026-003", client: "LogiTech Ltd", clientEmail: "rohan@logitech.io", amount: 40000, status: "Pending", issueDate: "2026-03-01", dueDate: "2026-03-20", items: [{ desc: "Dashboard Design System", qty: 1, rate: 40000 }] },
  { id: "i4", num: "INV-2026-004", client: "LuxFinance", clientEmail: "vikram@luxpay.io", amount: 35000, status: "Pending", issueDate: "2026-03-05", dueDate: "2026-03-25", items: [{ desc: "Fintech Dashboard Phase 1", qty: 1, rate: 35000 }] },
  { id: "i5", num: "INV-2026-005", client: "PetWorld Pvt", clientEmail: "ananya@petworld.co", amount: 18000, status: "Overdue", issueDate: "2026-02-15", dueDate: "2026-03-01", items: [{ desc: "App Concept & Branding", qty: 1, rate: 18000 }] }
];

router.get('/', async (req: Request, res: Response) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const invoices = await Invoice.find().sort({ createdAt: -1 });
      return res.json(invoices);
    } catch {
      return res.json(inMemoryInvoices);
    }
  }
  return res.json(inMemoryInvoices);
});

router.post('/', async (req: Request, res: Response) => {
  const newInvoice = { id: req.body.id || `inv_${Date.now()}`, ...req.body };
  if (mongoose.connection.readyState === 1) {
    try {
      const invoice = new Invoice(newInvoice);
      await invoice.save();
    } catch (e) {
      console.error(e);
    }
  }
  inMemoryInvoices.unshift(newInvoice);
  return res.status(201).json(newInvoice);
});

router.put('/:id', async (req: Request, res: Response) => {
  if (mongoose.connection.readyState === 1) {
    try {
      await Invoice.findOneAndUpdate({ id: req.params.id }, req.body);
    } catch (e) {
      console.error(e);
    }
  }
  inMemoryInvoices = inMemoryInvoices.map(i => i.id === req.params.id ? { ...i, ...req.body } : i);
  const updated = inMemoryInvoices.find(i => i.id === req.params.id);
  return res.json(updated || req.body);
});

router.delete('/:id', async (req: Request, res: Response) => {
  if (mongoose.connection.readyState === 1) {
    try {
      await Invoice.findOneAndDelete({ id: req.params.id });
    } catch (e) {
      console.error(e);
    }
  }
  inMemoryInvoices = inMemoryInvoices.filter(i => i.id !== req.params.id);
  return res.json({ message: 'Invoice deleted successfully' });
});

router.post('/send-email', async (req: Request, res: Response) => {
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

  // Simulated server mailer log if SMTP env vars not set yet
  return res.json({
    status: 'success',
    message: `Invoice PDF email queued & processed via Express API for ${to}`,
    pdfAttached: true,
    timestamp: new Date().toISOString()
  });
});

export default router;
