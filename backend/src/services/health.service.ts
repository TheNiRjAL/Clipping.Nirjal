import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import logger from '../utils/logger.js';

export async function checkHealth(): Promise<Record<string, boolean>> {
  const health: Record<string, boolean> = {};

  // Check FFmpeg
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
    health.ffmpeg = true;
  } catch (e) {
    health.ffmpeg = false;
    logger.warn('FFmpeg not found');
  }

  // Check FFprobe
  try {
    execSync('ffprobe -version', { stdio: 'pipe' });
    health.ffprobe = true;
  } catch (e) {
    health.ffprobe = false;
    logger.warn('FFprobe not found');
  }

  // Check Gemini API Key
  health.gemini = !!process.env.GEMINI_API_KEY;
  if (!health.gemini) {
    logger.warn('Gemini API key not configured');
  }

  // Check storage directories
  try {
    const dirs = [
      process.env.UPLOADS_DIR || './storage/uploads',
      process.env.TEMP_DIR || './storage/temp',
      process.env.OUTPUT_DIR || './storage/outputs'
    ];

    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch (e) {
        await fs.mkdir(dir, { recursive: true });
      }
    }
    health.storage = true;
  } catch (e) {
    health.storage = false;
    logger.warn('Storage initialization failed');
  }

  // Check disk space
  try {
    const outputDir = process.env.OUTPUT_DIR || './storage/outputs';
    await fs.access(outputDir);
    health.diskSpace = true;
  } catch (e) {
    health.diskSpace = false;
    logger.warn('Disk space check failed');
  }

  return health;
}
