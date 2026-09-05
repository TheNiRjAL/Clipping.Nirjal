import path from 'path';
import { spawn } from 'child_process';
import logger from '../utils/logger.js';
import { StorageService } from './storage.service.js';
import { VideoEffects, SubtitleSettings } from '../types/index.js';

export class VideoRendererService {
  private storage = new StorageService();
  private concurrentRenders = 0;
  private maxConcurrentRenders = parseInt(process.env.MAX_CONCURRENT_RENDERS || '2', 10);
  private renderQueue: Array<() => Promise<void>> = [];

  async renderClip(
    inputPath: string,
    outputPath: string,
    startTime: number,
    endTime: number,
    aspectRatio: '9:16' | '16:9' | '1:1',
    effects: VideoEffects,
    quality: 'fast' | 'balanced' | 'high'
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.addToQueue(async () => {
        try {
          this.concurrentRenders++;
          await this.executeRender(inputPath, outputPath, startTime, endTime, aspectRatio, effects, quality);
          this.concurrentRenders--;
          resolve();
        } catch (error) {
          this.concurrentRenders--;
          reject(error);
        }
      });
    });
  }

  private async executeRender(
    inputPath: string,
    outputPath: string,
    startTime: number,
    endTime: number,
    aspectRatio: '9:16' | '16:9' | '1:1',
    effects: VideoEffects,
    quality: 'fast' | 'balanced' | 'high'
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const args: string[] = [
        '-i', inputPath,
        '-ss', startTime.toString(),
        '-to', endTime.toString(),
        '-c:v', 'libx264'
      ];

      // Quality preset
      const presets = { fast: 'ultrafast', balanced: 'medium', high: 'slow' };
      args.push('-preset', presets[quality]);

      // Video filters
      const filters = this.buildVideoFilters(aspectRatio, effects);
      if (filters) {
        args.push('-vf', filters);
      }

      // Audio
      if (effects.audio === 'normalize') {
        args.push('-af', 'loudnorm');
      } else if (effects.audio === 'loudness-optimized') {
        args.push('-af', 'loudnorm=I=-16:TP=-1.5:LRA=11');
      } else {
        args.push('-c:a', 'aac');
      }

      args.push('-y', outputPath);

      logger.info(`Starting render: ${outputPath}`);
      const ffmpeg = spawn('ffmpeg', args);

      let error = '';
      ffmpeg.stderr.on('data', (data) => {
        error += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code !== 0) {
          logger.error('FFmpeg render error:', error);
          reject(new Error('FFmpeg render failed'));
        } else {
          logger.info(`Render completed: ${outputPath}`);
          resolve();
        }
      });
    });
  }

  private buildVideoFilters(
    aspectRatio: '9:16' | '16:9' | '1:1',
    effects: VideoEffects
  ): string {
    const filters: string[] = [];

    // Scale and crop for aspect ratio
    const scaleFilter = this.getScaleFilter(aspectRatio);
    if (scaleFilter) filters.push(scaleFilter);

    // Brightness/Contrast/Saturation
    const colorFilter = this.getColorFilter(effects);
    if (colorFilter) filters.push(colorFilter);

    // Sharpness
    if (effects.sharpness !== 'off') {
      const sharpnessValue = this.getSharpnessValue(effects.sharpness);
      filters.push(`unsharp=m=5:r=1:a=${sharpnessValue}`);
    }

    // Noise reduction
    if (effects.noiseReduction !== 'off') {
      filters.push('nlmeans=s=1');
    }

    // Vignette
    if (effects.vignette !== 'off') {
      const vignetteValue = this.getVignetteValue(effects.vignette);
      filters.push(`vignette=angle=PI/4:x0=w/2:y0=h/2:s=${vignetteValue}`);
    }

    return filters.join(',');
  }

  private getScaleFilter(aspectRatio: '9:16' | '16:9' | '1:1'): string {
    switch (aspectRatio) {
      case '9:16':
        return 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2';
      case '16:9':
        return 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2';
      case '1:1':
        return 'scale=1080:1080:force_original_aspect_ratio=decrease,pad=1080:1080:(ow-iw)/2:(oh-ih)/2';
    }
  }

  private getColorFilter(effects: VideoEffects): string {
    let filter = 'eq=';
    const params: string[] = [];

    if (effects.brightness !== 0) {
      params.push(`brightness=${1 + effects.brightness / 100}`);
    }
    if (effects.contrast !== 0) {
      params.push(`contrast=${1 + effects.contrast / 100}`);
    }
    if (effects.saturation !== 0) {
      params.push(`saturation=${1 + effects.saturation / 100}`);
    }

    return params.length > 0 ? filter + params.join(':') : '';
  }

  private getSharpnessValue(level: 'off' | 'low' | 'medium' | 'high'): number {
    const values = { off: 0, low: 0.5, medium: 1.0, high: 1.5 };
    return values[level];
  }

  private getVignetteValue(level: 'off' | 'low' | 'medium' | 'high'): number {
    const values = { off: 0, low: 0.2, medium: 0.5, high: 0.8 };
    return values[level];
  }

  private async addToQueue(task: () => Promise<void>): Promise<void> {
    return new Promise((resolve) => {
      this.renderQueue.push(async () => {
        await task();
        resolve();
        this.processQueue();
      });
      this.processQueue();
    });
  }

  private processQueue(): void {
    while (this.concurrentRenders < this.maxConcurrentRenders && this.renderQueue.length > 0) {
      const task = this.renderQueue.shift();
      if (task) {
        task().catch((err) => logger.error('Queue task error:', err));
      }
    }
  }
}
