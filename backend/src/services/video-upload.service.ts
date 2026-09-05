import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import { VideoProbeService } from './video-probe.service.js';
import { StorageService } from './storage.service.js';
import { JobService } from './job.service.js';
import { VideoMetadata, VideoError, ErrorCodes } from '../types/index.js';
import fs from 'fs/promises';

export class VideoUploadService {
  private probeService = new VideoProbeService();
  private storage = new StorageService();
  private jobService = new JobService();

  async processUpload(file: Express.Multer.File): Promise<any> {
    try {
      // Validate file
      if (!file) {
        throw new VideoError(ErrorCodes.INVALID_VIDEO, 'No file provided');
      }

      const supportedMimes = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm'];
      if (!supportedMimes.includes(file.mimetype)) {
        throw new VideoError(ErrorCodes.UNSUPPORTED_FORMAT, `Unsupported format: ${file.mimetype}`);
      }

      const maxSize = parseInt(process.env.MAX_FILE_SIZE || '2147483648', 10);
      if (file.size > maxSize) {
        throw new VideoError(ErrorCodes.UPLOAD_TOO_LARGE, `File exceeds maximum size of ${maxSize} bytes`);
      }

      // Probe video
      const metadata = await this.probeService.probeVideo(file.path);

      // Validate metadata
      if (metadata.duration === 0 || !metadata.width || !metadata.height) {
        throw new VideoError(ErrorCodes.INVALID_VIDEO, 'Invalid video: missing required properties');
      }

      // Create job
      const jobId = uuidv4();
      await this.jobService.createJob(jobId, file.path, file.originalname, metadata);

      logger.info(`Upload successful: jobId=${jobId}, file=${file.originalname}`);

      return {
        jobId,
        filename: file.originalname,
        uploadedSize: file.size,
        metadata: {
          duration: metadata.duration,
          width: metadata.width,
          height: metadata.height,
          fps: metadata.fps,
          codec: metadata.codec,
          audioCodec: metadata.audioCodec
        }
      };
    } catch (error) {
      // Clean up uploaded file on error
      if (file && file.path) {
        try {
          await fs.unlink(file.path);
        } catch (e) {
          logger.warn('Failed to clean up file:', e);
        }
      }

      if (error instanceof VideoError) {
        throw error;
      }
      throw new VideoError(ErrorCodes.INVALID_VIDEO, error instanceof Error ? error.message : 'Upload failed');
    }
  }
}
