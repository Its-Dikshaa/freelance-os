import { Router, Request, Response } from 'express';
import Task from '../models/Task';
import mongoose from 'mongoose';

const router = Router();

let inMemoryTasks = [
  { id: "t1", title: "Wireframes for CRM Leads", project: "FreightAxis CRM", status: "todo", dueDate: "Mar 25", priority: "High" },
  { id: "t2", title: "Prototype interactions", project: "BrokerPad Redesign", status: "in-progress", dueDate: "Mar 24", priority: "High" },
  { id: "t3", title: "Client feedback review", project: "FreightAxis CRM", status: "in-review", dueDate: "Mar 22", priority: "Medium" },
  { id: "t4", title: "Final handoff docs", project: "AgriRent Platform", status: "done", dueDate: "Mar 20", priority: "Low" },
  { id: "t5", title: "User flow diagram", project: "PawPulse App", status: "in-progress", dueDate: "Mar 30", priority: "Medium" },
  { id: "t6", title: "Color system finalization", project: "LuxPay Dashboard", status: "todo", dueDate: "Mar 28", priority: "Low" },
  { id: "t7", title: "Competitive analysis", project: "Ease Well Portal", status: "todo", dueDate: "Apr 2", priority: "Low" },
  { id: "t8", title: "Component library", project: "BrokerPad Redesign", status: "in-progress", dueDate: "Mar 26", priority: "High" }
];

router.get('/', async (req: Request, res: Response) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const tasks = await Task.find().sort({ createdAt: -1 });
      return res.json(tasks);
    } catch {
      return res.json(inMemoryTasks);
    }
  }
  return res.json(inMemoryTasks);
});

router.post('/', async (req: Request, res: Response) => {
  const newTask = { id: req.body.id || `t_${Date.now()}`, ...req.body };
  if (mongoose.connection.readyState === 1) {
    try {
      const task = new Task(newTask);
      await task.save();
    } catch (e) {
      console.error(e);
    }
  }
  inMemoryTasks.unshift(newTask);
  return res.status(201).json(newTask);
});

router.put('/:id', async (req: Request, res: Response) => {
  if (mongoose.connection.readyState === 1) {
    try {
      await Task.findOneAndUpdate({ id: req.params.id }, req.body);
    } catch (e) {
      console.error(e);
    }
  }
  inMemoryTasks = inMemoryTasks.map(t => t.id === req.params.id ? { ...t, ...req.body } : t);
  const updated = inMemoryTasks.find(t => t.id === req.params.id);
  return res.json(updated || req.body);
});

router.delete('/:id', async (req: Request, res: Response) => {
  if (mongoose.connection.readyState === 1) {
    try {
      await Task.findOneAndDelete({ id: req.params.id });
    } catch (e) {
      console.error(e);
    }
  }
  inMemoryTasks = inMemoryTasks.filter(t => t.id !== req.params.id);
  return res.json({ message: 'Task deleted successfully' });
});

export default router;
