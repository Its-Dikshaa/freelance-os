import { Router, Response } from 'express';
import User from '../models/User';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

// GET /api/user - Get current logged-in user profile
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }
    return res.json(user);
  } catch (err) {
    console.error('[Get User Error]', err);
    return res.status(500).json({ error: 'Failed to fetch user settings' });
  }
});

// PUT /api/user - Update current logged-in user profile
router.put('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // `password` must only ever be written as a bcrypt hash by the auth routes;
    // letting it through here would overwrite the hash with a raw string.
    const updates = { ...req.body };
    delete updates.password;
    delete updates._id;
    delete updates.id;
    delete updates.userId;
    delete updates.__v;
    delete updates.createdAt;
    delete updates.updatedAt;

    if (updates.hourlyRate !== undefined && updates.rate === undefined) {
      updates.rate = updates.hourlyRate;
      delete updates.hourlyRate;
    }

    if (updates.role !== undefined && updates.profession === undefined) {
      updates.profession = updates.role;
      delete updates.role;
    }

    if (updates.paymentNotes !== undefined && updates.bank === undefined) {
      updates.bank = updates.paymentNotes;
      delete updates.paymentNotes;
    }

    if (updates.email) {
      const cleanEmail = String(updates.email).trim().toLowerCase();
      updates.email = cleanEmail;
      const existing = await User.findOne({ email: cleanEmail, _id: { $ne: req.userId } });
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists' });
      }
    }

    if (updates.profession !== undefined && typeof updates.profession === 'string') {
      updates.profession = updates.profession.trim();
    }

    if (updates.bank !== undefined && typeof updates.bank === 'string') {
      updates.bank = updates.bank.trim();
    }

    const updated = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updated) {
      return res.status(404).json({ error: 'User account not found' });
    }
    return res.json(updated);
  } catch (err) {
    console.error('[Update User Error]', err);
    const message = err instanceof Error ? err.message : 'Failed to update user settings';
    return res.status(500).json({ error: message });
  }
});

export default router;
