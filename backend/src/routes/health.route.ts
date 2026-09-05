import express from 'express';
import { checkHealth } from '../services/health.service.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const health = await checkHealth();
    const allHealthy = Object.values(health).every(v => v === true);
    
    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ok' : 'degraded',
      ...health
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
