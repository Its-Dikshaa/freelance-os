import { Router, Response } from 'express';
import Task from '../models/Task';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import { sanitizeUpdate } from '../utils/sanitizeUpdate';

const router = Router();

router.use(authenticateToken);

// GET /api/tasks - Get current user's tasks ONLY
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (err) {
    console.error('[Get Tasks Error]', err);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks - Create task for current user ONLY
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const newTaskData = {
      id: req.body.id || `t_${Date.now()}`,
      userId: req.userId,
      title: req.body.title,
      project: req.body.project || 'General',
      status: req.body.status || 'Todo',
      due: req.body.due || req.body.dueDate || '',
      priority: req.body.priority || 'Medium'
    };

    const task = new Task(newTaskData);
    await task.save();
    return res.status(201).json(task);
  } catch (err) {
    console.error('[Create Task Error]', err);
    return res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id - Update current user's task ONLY
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await Task.findOneAndUpdate(
      { id: req.params.id, userId: req.userId },
      { ...sanitizeUpdate(req.body), userId: req.userId },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }
    return res.json(updated);
  } catch (err) {
    console.error('[Update Task Error]', err);
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id - Delete current user's task ONLY
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await Task.findOneAndDelete({ id: req.params.id, userId: req.userId });
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }
    return res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('[Delete Task Error]', err);
    return res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
