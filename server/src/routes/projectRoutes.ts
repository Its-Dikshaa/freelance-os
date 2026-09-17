import { Router, Request, Response } from 'express';
import Project from '../models/Project';
import mongoose from 'mongoose';

const router = Router();

let inMemoryProjects = [
  { id: "p1", name: "FreightAxis CRM", client: "LogiTech Ltd", clientEmail: "contact@logitech.io", budget: 85000, spent: 42000, status: "Active", deadline: "2026-04-15", color: "#3d5a4c", description: "Logistics dashboard & dispatch UI" },
  { id: "p2", name: "BrokerPad Redesign", client: "BrokerPad Inc", clientEmail: "hello@brokerpad.com", budget: 55000, spent: 48000, status: "In Review", deadline: "2026-03-30", color: "#c4623a", description: "Real estate broker platform overhaul" },
  { id: "p3", name: "PawPulse App", client: "PetWorld Pvt", clientEmail: "info@petworld.co", budget: 40000, spent: 18000, status: "Active", deadline: "2026-05-10", color: "#4a7fa5", description: "Pet care & vet appointment mobile app" },
  { id: "p4", name: "LuxPay Dashboard", client: "LuxFinance", clientEmail: "support@luxpay.io", budget: 70000, spent: 30000, status: "Active", deadline: "2026-04-01", color: "#c9963e", description: "Fintech analytics & payout suite" },
  { id: "p5", name: "AgriRent Platform", client: "AgriTech Co", clientEmail: "sales@agrirent.org", budget: 95000, spent: 95000, status: "Done", deadline: "2026-02-28", color: "#4e7360", description: "Tractor & farm tool rental marketplace" },
  { id: "p6", name: "Ease Well Portal", client: "EaseWell Health", clientEmail: "care@easewell.in", budget: 35000, spent: 5000, status: "Pending", deadline: "2026-06-01", color: "#7aaec8", description: "Wellness clinic patient dashboard" }
];

router.get('/', async (req: Request, res: Response) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const projects = await Project.find().sort({ createdAt: -1 });
      return res.json(projects);
    } catch {
      return res.json(inMemoryProjects);
    }
  }
  return res.json(inMemoryProjects);
});

router.post('/', async (req: Request, res: Response) => {
  const newProj = { id: req.body.id || `p_${Date.now()}`, ...req.body };
  if (mongoose.connection.readyState === 1) {
    try {
      const project = new Project(newProj);
      await project.save();
    } catch (e) {
      console.error(e);
    }
  }
  inMemoryProjects.unshift(newProj);
  return res.status(201).json(newProj);
});

router.put('/:id', async (req: Request, res: Response) => {
  if (mongoose.connection.readyState === 1) {
    try {
      await Project.findOneAndUpdate({ id: req.params.id }, req.body);
    } catch (e) {
      console.error(e);
    }
  }
  inMemoryProjects = inMemoryProjects.map(p => p.id === req.params.id ? { ...p, ...req.body } : p);
  const updated = inMemoryProjects.find(p => p.id === req.params.id);
  return res.json(updated || req.body);
});

router.delete('/:id', async (req: Request, res: Response) => {
  if (mongoose.connection.readyState === 1) {
    try {
      await Project.findOneAndDelete({ id: req.params.id });
    } catch (e) {
      console.error(e);
    }
  }
  inMemoryProjects = inMemoryProjects.filter(p => p.id !== req.params.id);
  return res.json({ message: 'Project deleted successfully' });
});

export default router;
