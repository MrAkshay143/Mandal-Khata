import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

// New Architecture Imports
import { ENV } from './src/config/env.js';
import { initSchema } from './src/config/db.js';
import { logger } from './src/utils/logger.js';

// Route Imports
import authRoutes from './src/routes/authRoutes.js';
import customerRoutes from './src/routes/customerRoutes.js';
import transactionRoutes from './src/routes/transactionRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = ENV.PORT;

  app.use(express.json());

  // Initialize MySQL schema via our central DB config
  try {
    await initSchema();
  } catch (err) {
    logger.error('Database initialization failed. Please check config:', err);
    process.exit(1);
  }

  // ─── Serve Admin Panel ───────────────────────────────────────────────────────
  app.use('/admin', express.static(path.join(__dirname, 'admin')));
  app.get('/admin', (_req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
  });

  // ─── Apply Modular API Routes ───────────────────────────────────────────────
  app.use('/api/auth', authRoutes);
  app.use('/api/customers', customerRoutes);
  /* 
    Transaction Routes handle standard transactions '/api/transactions', 
    but summary and entries were previously mapped at root. We'll map them appropriately:
  */
  app.use('/api/transactions', transactionRoutes); 
  
  // Mapping summary and entries specifically on transaction routes to maintain parity from old server.ts
  // Old style was '/api/summary' to get overview, so we alias it onto transaction router root paths
  app.get('/api/summary', (req, res, next) => { req.url = '/summary'; transactionRoutes(req, res, next); });
  app.get('/api/dashboard', (req, res, next) => { req.url = '/dashboard'; transactionRoutes(req, res, next); });
  app.get('/api/entries', (req, res, next) => { req.url = '/entries'; transactionRoutes(req, res, next); });
  app.post('/api/restore', (req, res, next) => { req.url = '/restore'; transactionRoutes(req, res, next); });

  app.use('/api/admin', adminRoutes);

  // ─── Vite Middleware ──────────────────────────────────────────────────────────
  if (ENV.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Basic static serving for production mode if a dist exists
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Admin panel: http://localhost:${PORT}/admin`);
  });
}

startServer().catch(err => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
