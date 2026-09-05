import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import logger from '../utils/logger.js';
import { Job, JobStatus, VideoMetadata, ClipSettings, Clip } from '../types/index.js';
import { StorageService } from './storage.service.js';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import archiver from 'archiver';
import { createWriteStream } from 'fs';

const jobStorage: Map<string, Job> = new Map();

export class JobService {
  private storage = new StorageService();

  async createJob(
    jobId: string,
    uploadedFilePath: string,
    uploadedFileName: string,
    metadata: VideoMetadata
  ): Promise<Job> {
    const job: Job = {
      jobId,
      status: 'QUEUED',
      progress: 0,
      currentTask: 'Uploaded',
      uploadedFileName,
      uploadedFilePath,
      metadata,
      clips: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    jobStorage.set(jobId, job);
    logger.info(`Job created: ${jobId}`);
    return job;
  }

  async getJob(jobId: string): Promise<Job | null> {
    return jobStorage.get(jobId) || null;
  }

  async updateJobStatus(
    jobId: string,
    status: JobStatus,
    progress: number,
    currentTask: string
  ): Promise<void> {
    const job = jobStorage.get(jobId);
    if (job) {
      job.status = status;
      job.progress = progress;
      job.currentTask = currentTask;
      job.updatedAt = new Date();
      logger.info(`Job updated: ${jobId} - ${status} (${progress}%) - ${currentTask}`);
    }
  }

  async addClip(jobId: string, clip: Clip): Promise<void> {
    const job = jobStorage.get(jobId);
    if (job) {
      job.clips.push(clip);
      job.updatedAt = new Date();
    }
  }

  async getClips(jobId: string): Promise<Clip[]> {
    const job = jobStorage.get(jobId);
    return job?.clips || [];
  }

  async startProcessing(jobId: string, settings: ClipSettings): Promise<void> {
    const job = jobStorage.get(jobId);
    if (job) {
      job.settings = settings;
      job.status = 'PROBING';
      job.updatedAt = new Date();
      logger.info(`Processing started for job: ${jobId}`);
      // Processing will be handled asynchronously
    }
  }

  async downloadAllClips(jobId: string): Promise<any> {
    const job = jobStorage.get(jobId);
    if (!job || job.clips.length === 0) {
      throw new Error('No clips found');
    }

    return new Promise((resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } });

      archive.on('error', (err) => reject(err));
      archive.on('warning', (err) => logger.warn('Archive warning:', err));

      job.clips.forEach((clip, index) => {
        const filename = `clip-${index + 1}-${clip.title.replace(/\s+/g, '-')}.mp4`;
        archive.file(clip.filePath, { name: filename });
      });

      archive.finalize();
      resolve(archive);
    });
  }
}
