import { Router, Response } from 'express';
import Project from '../models/Project';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// Protect all routes with JWT authentication
router.use(authenticateToken);

// GET /api/projects - Get current user's projects ONLY
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projects = await Project.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.json(projects);
  } catch (err: any) {
    console.error('[Get Projects Error]', err);
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// POST /api/projects - Create project for current user
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const newProjData = {
      id: req.body.id || `p_${Date.now()}`,
      userId: req.userId,
      name: req.body.name,
      client: req.body.client,
      clientEmail: req.body.clientEmail || '',
      budget: req.body.budget || 0,
      spent: req.body.spent || 0,
      status: req.body.status || 'Active',
      deadline: req.body.deadline || '',
      color: req.body.color || '#4e7360',
      description: req.body.description || req.body.desc || ''
    };

    const project = new Project(newProjData);
    await project.save();
    return res.status(201).json(project);
  } catch (err: any) {
    console.error('[Create Project Error]', err);
    return res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:id - Update current user's project ONLY
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await Project.findOneAndUpdate(
      { id: req.params.id, userId: req.userId },
      { ...req.body, userId: req.userId },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }
    return res.json(updated);
  } catch (err: any) {
    console.error('[Update Project Error]', err);
    return res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id - Delete current user's project ONLY
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await Project.findOneAndDelete({ id: req.params.id, userId: req.userId });
    if (!deleted) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }
    return res.json({ message: 'Project deleted successfully' });
  } catch (err: any) {
    console.error('[Delete Project Error]', err);
    return res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
