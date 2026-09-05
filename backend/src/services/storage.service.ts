import fs from 'fs/promises';
import path from 'path';
import logger from '../utils/logger.js';

export class StorageService {
  private uploadsDir = process.env.UPLOADS_DIR || './storage/uploads';
  private tempDir = process.env.TEMP_DIR || './storage/temp';
  private outputDir = process.env.OUTPUT_DIR || './storage/outputs';

  async initialize(): Promise<void> {
    const dirs = [this.uploadsDir, this.tempDir, this.outputDir];
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
        logger.info(`Storage directory ready: ${dir}`);
      } catch (error) {
        logger.error(`Failed to create directory ${dir}:`, error);
        throw error;
      }
    }
  }

  getUploadsDir(): string {
    return this.uploadsDir;
  }

  getTempDir(): string {
    return this.tempDir;
  }

  getOutputDir(): string {
    return this.outputDir;
  }

  getJobDir(jobId: string): string {
    return path.join(this.tempDir, jobId);
  }

  async createJobDir(jobId: string): Promise<string> {
    const jobDir = this.getJobDir(jobId);
    await fs.mkdir(jobDir, { recursive: true });
    return jobDir;
  }

  async saveFile(data: Buffer, destPath: string): Promise<void> {
    const dir = path.dirname(destPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(destPath, data);
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      logger.info(`Deleted file: ${filePath}`);
    } catch (error) {
      logger.warn(`Failed to delete file ${filePath}:`, error);
    }
  }

  async deleteDirectory(dirPath: string): Promise<void> {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
      logger.info(`Deleted directory: ${dirPath}`);
    } catch (error) {
      logger.warn(`Failed to delete directory ${dirPath}:`, error);
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch (error) {
      logger.error(`Failed to get file size for ${filePath}:`, error);
      throw error;
    }
  }
}

export async function initializeStorage(): Promise<void> {
  const storage = new StorageService();
  await storage.initialize();
}

export default StorageService;
