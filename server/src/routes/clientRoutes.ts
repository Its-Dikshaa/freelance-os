import { Router, Request, Response } from 'express';
import Client from '../models/Client';
import mongoose from 'mongoose';

const router = Router();

let inMemoryClients = [
  { id: "c1", name: "Rohan Sharma", company: "LogiTech Ltd", email: "rohan@logitech.io", phone: "+91 98765 43210", totalBilled: 125000, status: "Active", projectsCount: 2, avatar: "RS" },
  { id: "c2", name: "Sarah Jenkins", company: "BrokerPad Inc", email: "sarah@brokerpad.com", phone: "+1 415 555 0192", totalBilled: 55000, status: "Active", projectsCount: 1, avatar: "SJ" },
  { id: "c3", name: "Ananya Roy", company: "PetWorld Pvt", email: "ananya@petworld.co", phone: "+91 91234 56789", totalBilled: 40000, status: "Active", projectsCount: 1, avatar: "AR" },
  { id: "c4", name: "Vikram Malhotra", company: "LuxFinance", email: "vikram@luxpay.io", phone: "+91 99887 76655", totalBilled: 70000, status: "Active", projectsCount: 1, avatar: "VM" },
  { id: "c5", name: "David Miller", company: "AgriTech Co", email: "david@agrirent.org", phone: "+1 212 555 0143", totalBilled: 95000, status: "Active", projectsCount: 1, avatar: "DM" },
  { id: "c6", name: "Pooja Verma", company: "EaseWell Health", email: "pooja@easewell.in", phone: "+91 98111 22334", totalBilled: 35000, status: "Lead", projectsCount: 1, avatar: "PV" }
];

router.get('/', async (req: Request, res: Response) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const clients = await Client.find().sort({ createdAt: -1 });
      return res.json(clients);
    } catch {
      return res.json(inMemoryClients);
    }
  }
  return res.json(inMemoryClients);
});

router.post('/', async (req: Request, res: Response) => {
  const newClient = { id: req.body.id || `c_${Date.now()}`, ...req.body };
  if (mongoose.connection.readyState === 1) {
    try {
      const client = new Client(newClient);
      await client.save();
    } catch (e) {
      console.error(e);
    }
  }
  inMemoryClients.unshift(newClient);
  return res.status(201).json(newClient);
});

router.put('/:id', async (req: Request, res: Response) => {
  if (mongoose.connection.readyState === 1) {
    try {
      await Client.findOneAndUpdate({ id: req.params.id }, req.body);
    } catch (e) {
      console.error(e);
    }
  }
  inMemoryClients = inMemoryClients.map(c => c.id === req.params.id ? { ...c, ...req.body } : c);
  const updated = inMemoryClients.find(c => c.id === req.params.id);
  return res.json(updated || req.body);
});

router.delete('/:id', async (req: Request, res: Response) => {
  if (mongoose.connection.readyState === 1) {
    try {
      await Client.findOneAndDelete({ id: req.params.id });
    } catch (e) {
      console.error(e);
    }
  }
  inMemoryClients = inMemoryClients.filter(c => c.id !== req.params.id);
  return res.json({ message: 'Client deleted successfully' });
});

export default router;
