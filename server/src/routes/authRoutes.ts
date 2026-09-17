import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticateToken, AuthenticatedRequest, JWT_SECRET } from '../middleware/authMiddleware';

const router = Router();

// POST /api/auth/signup
router.post('/signup', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, studio, profession, location, hourlyRate, currency, gst, bank, prefix } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: name || 'New User',
      role: profession || 'Freelancer',
      email: cleanEmail,
      password: hashedPassword,
      studio: studio || `${name || 'Freelancer'}'s Studio`,
      hourlyRate: hourlyRate || 1000,
      currency: currency || '₹',
      gst: gst || '',
      paymentNotes: bank || 'Bank Transfer / UPI accepted.',
      hasCompletedOnboarding: true
    });

    await user.save();

    const token = jwt.sign({ userId: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(201).json({ token, user: userResponse });
  } catch (err: any) {
    console.error('[Signup Error]', err);
    return res.status(500).json({ error: err.message || 'Failed to create user account' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.json({ token, user: userResponse });
  } catch (err: any) {
    console.error('[Login Error]', err);
    return res.status(500).json({ error: err.message || 'Authentication failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }
    return res.json(user);
  } catch (err: any) {
    console.error('[Get Me Error]', err);
    return res.status(500).json({ error: 'Failed to fetch user account' });
  }
});

export default router;
