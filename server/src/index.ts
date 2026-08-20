import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const startServer = async () => {
  await connectDB();

  const app = createApp();
  const PORT = parseInt(env.PORT, 10);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] AdSpace REST API running on http://localhost:${PORT}/api/v1`);
    console.log(`[Server] Health Check: http://localhost:${PORT}/api/v1/health`);
  });
};

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
