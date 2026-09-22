import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import clientRoutes from './routes/clientRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import paymentRoutes from './routes/paymentRoutes';
import seedRoutes from './routes/seedRoutes';

// Builds the Express app without connecting to a database or starting a
// listener, so it can be booted for real (see index.ts) or imported directly
// by tests (via supertest) against whatever MongoDB connection is active.
export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/clients', clientRoutes);
  app.use('/api/invoices', invoiceRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/seed', seedRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'FreelanceOS Express REST API is running' });
  });

  return app;
}
