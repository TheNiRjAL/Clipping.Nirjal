import express from 'express';
import { ClipService } from '../services/clip.service.js';
import logger from '../utils/logger.js';

const router = express.Router();
const clipService = new ClipService();

router.get('/:clipId/download', async (req, res) => {
  try {
    const stream = await clipService.downloadClip(req.params.clipId);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="clip-${req.params.clipId}.mp4"`);
    stream.pipe(res);
  } catch (error) {
    logger.error('Download clip error:', error);
    res.status(500).json({ error: 'Failed to download clip' });
  }
});

router.post('/:clipId/re-render', async (req, res) => {
  try {
    const { start, end, settings } = req.body;
    const result = await clipService.reRenderClip(req.params.clipId, start, end, settings);
    res.json(result);
  } catch (error) {
    logger.error('Re-render error:', error);
    res.status(500).json({ error: 'Failed to re-render clip' });
  }
});

export default router;
