import { Router, Request, Response } from 'express';
import User from '../models/User';
import mongoose from 'mongoose';

const router = Router();

let inMemoryUser = {
  name: 'Diksha Jangra',
  role: 'UI/UX Designer',
  email: 'diksha@design.io',
  studio: 'Studio Diksha',
  hourlyRate: 85,
  currency: '₹',
  gst: 'GSTIN07AAAAA0000A1Z5',
  paymentNotes: 'Bank Transfer / UPI accepted. Payment due within 15 days.',
  hasCompletedOnboarding: true
};

router.get('/', async (req: Request, res: Response) => {
  if (mongoose.connection.readyState === 1) {
    try {
      let user = await User.findOne();
      if (!user) {
        user = await User.create(inMemoryUser);
      }
      return res.json(user);
    } catch {
      return res.json(inMemoryUser);
    }
  }
  return res.json(inMemoryUser);
});

router.put('/', async (req: Request, res: Response) => {
  inMemoryUser = { ...inMemoryUser, ...req.body };
  if (mongoose.connection.readyState === 1) {
    try {
      let user = await User.findOne();
      if (!user) {
        user = new User(inMemoryUser);
      } else {
        Object.assign(user, req.body);
      }
      await user.save();
    } catch (e) {
      console.error(e);
    }
  }
  return res.json(inMemoryUser);
});

export default router;
