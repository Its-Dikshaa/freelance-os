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
  } catch (err: any) {
    console.error('[Get User Error]', err);
    return res.status(500).json({ error: 'Failed to fetch user settings' });
  }
});

// PUT /api/user - Update current logged-in user profile
router.put('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.userId,
      { $set: req.body },
      { new: true }
    ).select('-password');
    
    if (!updated) {
      return res.status(404).json({ error: 'User account not found' });
    }
    return res.json(updated);
  } catch (err: any) {
    console.error('[Update User Error]', err);
    return res.status(500).json({ error: 'Failed to update user settings' });
  }
});

export default router;
