import express from 'express';
import { JobService } from '../services/job.service.js';
import logger from '../utils/logger.js';

const router = express.Router();
const jobService = new JobService();

router.get('/:jobId', async (req, res) => {
  try {
    const job = await jobService.getJob(req.params.jobId);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    res.json(job);
  } catch (error) {
    logger.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to get job' });
  }
});

router.get('/:jobId/clips', async (req, res) => {
  try {
    const clips = await jobService.getClips(req.params.jobId);
    res.json(clips);
  } catch (error) {
    logger.error('Get clips error:', error);
    res.status(500).json({ error: 'Failed to get clips' });
  }
});

router.post('/:jobId/process', async (req, res) => {
  try {
    const settings = req.body;
    await jobService.startProcessing(req.params.jobId, settings);
    res.json({ message: 'Processing started' });
  } catch (error) {
    logger.error('Process job error:', error);
    res.status(500).json({ error: 'Failed to start processing' });
  }
});

router.get('/:jobId/download-all', async (req, res) => {
  try {
    const stream = await jobService.downloadAllClips(req.params.jobId);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="clips.zip"');
    stream.pipe(res);
  } catch (error) {
    logger.error('Download all error:', error);
    res.status(500).json({ error: 'Failed to download clips' });
  }
});

export default router;
