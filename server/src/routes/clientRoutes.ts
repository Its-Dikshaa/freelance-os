import { Router, Response } from 'express';
import Client from '../models/Client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import { sanitizeUpdate } from '../utils/sanitizeUpdate';

const router = Router();

router.use(authenticateToken);

// GET /api/clients - Get current user's clients ONLY
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clients = await Client.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.json(clients);
  } catch (err) {
    console.error('[Get Clients Error]', err);
    return res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// POST /api/clients - Create client for current user ONLY
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const newClientData = {
      id: req.body.id || `c_${Date.now()}`,
      userId: req.userId,
      name: req.body.name,
      industry: req.body.industry || req.body.company || '',
      email: req.body.email || '',
      phone: req.body.phone || '',
      value: req.body.value || req.body.totalBilled || 0,
      status: req.body.status || 'Active',
      projects: req.body.projects || req.body.projectsCount || 0,
      color: req.body.color || '#4e7360',
      initials: req.body.initials || req.body.avatar || '',
      notes: req.body.notes || ''
    };

    const client = new Client(newClientData);
    await client.save();
    return res.status(201).json(client);
  } catch (err) {
    console.error('[Create Client Error]', err);
    return res.status(500).json({ error: 'Failed to create client' });
  }
});

// PUT /api/clients/:id - Update current user's client ONLY
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await Client.findOneAndUpdate(
      { id: req.params.id, userId: req.userId },
      { ...sanitizeUpdate(req.body), userId: req.userId },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Client not found or access denied' });
    }
    return res.json(updated);
  } catch (err) {
    console.error('[Update Client Error]', err);
    return res.status(500).json({ error: 'Failed to update client' });
  }
});

// DELETE /api/clients/:id - Delete current user's client ONLY
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await Client.findOneAndDelete({ id: req.params.id, userId: req.userId });
    if (!deleted) {
      return res.status(404).json({ error: 'Client not found or access denied' });
    }
    return res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    console.error('[Delete Client Error]', err);
    return res.status(500).json({ error: 'Failed to delete client' });
  }
});

export default router;
