import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './utils/logger.js';
import { initializeStorage } from './services/storage.service.js';
import { checkHealth } from './services/health.service.js';
import uploadRoutes from './routes/upload.route.js';
import jobRoutes from './routes/job.route.js';
import clipRoutes from './routes/clip.route.js';
import healthRoutes from './routes/health.route.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.BACKEND_PORT || '5000', 10);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize storage
try {
  await initializeStorage();
  logger.info('Storage initialized successfully');
} catch (error) {
  logger.error('Failed to initialize storage:', error);
  process.exit(1);
}

// Check initial health
const health = await checkHealth();
logger.info('System health check:', health);

if (!health.ffmpeg || !health.ffprobe || !health.gemini) {
  logger.warn('Some critical services are unavailable');
  if (!health.ffmpeg) logger.error('FFmpeg not found - install it and add to PATH');
  if (!health.ffprobe) logger.error('FFprobe not found - install FFmpeg');
  if (!health.gemini) logger.error('Gemini API key not configured - set GEMINI_API_KEY');
}

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/clips', clipRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  logger.info(`Backend server running on http://localhost:${PORT}`);
});
