import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { connectDB } from './config/db';
import { runInitialMigration } from './config/initMigration';

const PORT = process.env.PORT || 5050;

const startServer = async () => {
  const app = createApp();
  await connectDB();
  await runInitialMigration();
  app.listen(PORT, () => {
    console.log(`[Express] FreelanceOS backend server listening on http://localhost:${PORT}`);
  });
};

startServer();
