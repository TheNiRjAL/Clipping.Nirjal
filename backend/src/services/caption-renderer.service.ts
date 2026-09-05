import path from 'path';
import { spawn } from 'child_process';
import logger from '../utils/logger.js';
import { SubtitleSettings, TranscriptSegment } from '../types/index.js';
import fs from 'fs/promises';

export class CaptionRendererService {
  /**
   * Render captions onto video
   */
  async renderCaptions(
    inputPath: string,
    outputPath: string,
    transcript: TranscriptSegment[],
    settings: SubtitleSettings
  ): Promise<void> {
    if (!settings.enabled || transcript.length === 0) {
      // Just copy the video without captions
      return this.copyVideo(inputPath, outputPath);
    }

    try {
      // Create SRT file from transcript
      const srtPath = outputPath.replace(/\.mp4$/, '.srt');
      await this.createSrtFile(transcript, srtPath, settings);

      // Render captions using FFmpeg
      await this.applyCaptionsWithFFmpeg(inputPath, outputPath, srtPath, settings);

      // Clean up SRT file
      try {
        await fs.unlink(srtPath);
      } catch (e) {
        logger.warn('Failed to clean up SRT file:', e);
      }

      logger.info(`Captions rendered: ${outputPath}`);
    } catch (error) {
      logger.error('Caption rendering failed:', error);
      throw error;
    }
  }

  private async createSrtFile(
    transcript: TranscriptSegment[],
    srtPath: string,
    settings: SubtitleSettings
  ): Promise<void> {
    let srtContent = '';
    let index = 1;

    for (const segment of transcript) {
      const startTime = this.formatSrtTime(segment.start);
      const endTime = this.formatSrtTime(segment.end);
      let text = segment.text;

      // Apply text transformations
      if (settings.uppercase) {
        text = text.toUpperCase();
      }

      // Highlight keywords
      if (settings.highlightKeywords) {
        text = this.highlightKeywords(text);
      }

      // Break into 2 lines max
      text = this.breakIntoLines(text, 2);

      srtContent += `${index}\n${startTime} --> ${endTime}\n${text}\n\n`;
      index++;
    }

    await fs.writeFile(srtPath, srtContent, 'utf-8');
    logger.info(`SRT file created: ${srtPath}`);
  }

  private async applyCaptionsWithFFmpeg(
    inputPath: string,
    outputPath: string,
    srtPath: string,
    settings: SubtitleSettings
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Build subtitle style
      const subtitleFilter = this.buildSubtitleFilter(srtPath, settings);

      const args = [
        '-i', inputPath,
        '-vf', subtitleFilter,
        '-c:a', 'aac',
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-y',
        outputPath
      ];

      logger.info(`Applying captions to: ${outputPath}`);
      const ffmpeg = spawn('ffmpeg', args);

      let error = '';
      ffmpeg.stderr.on('data', (data) => {
        error += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code !== 0) {
          logger.error('FFmpeg caption error:', error);
          reject(new Error('Failed to apply captions'));
        } else {
          resolve();
        }
      });
    });
  }

  private buildSubtitleFilter(srtPath: string, settings: SubtitleSettings): string {
    const fontFile = this.getFont(settings.style);
    const fontSize = settings.fontSize || 24;
    const color = this.hexToFFmpegColor(settings.color || '0xFFFFFF');
    const borderw = settings.outlineThickness || 0;
    const shadowx = settings.shadow ? 2 : 0;
    const shadowy = settings.shadow ? 2 : 0;

    let filter = `subtitles='${srtPath}':force_style='`;
    filter += `FontFile=${fontFile},`;
    filter += `FontSize=${fontSize},`;
    filter += `PrimaryColour=${color},`;
    filter += `OutlineColour=&H000000,`;
    filter += `BorderStyle=1,`;
    filter += `Outline=${borderw},`;
    filter += `Shadow=${shadowx}'`;

    return filter;
  }

  private getFont(style: string): string {
    // Return path to font based on style
    const fonts: Record<string, string> = {
      clean: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
      bold: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
      viral: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
      minimal: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
      podcast: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
      gaming: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
      highlight: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
    };

    return fonts[style] || fonts.clean;
  }

  private hexToFFmpegColor(hex: string): string {
    // Convert #RRGGBB or 0xRRGGBB to FFmpeg BGR format
    const cleanHex = hex.replace(/^[#0x]/, '');
    const r = cleanHex.substring(0, 2);
    const g = cleanHex.substring(2, 4);
    const b = cleanHex.substring(4, 6);
    return `&H${b}${g}${r}`;
  }

  private formatSrtTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  }

  private highlightKeywords(text: string): string {
    // Simple keyword highlighting
    const keywords = ['important', 'key', 'must', 'critical', 'essential', 'amazing', 'incredible', 'shocking'];
    let result = text;

    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      result = result.replace(regex, `*${keyword}*`);
    }

    return result;
  }

  private breakIntoLines(text: string, maxLines: number): string {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + ' ' + word).length > 40) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      }
    }

    if (currentLine) lines.push(currentLine);

    return lines.slice(0, maxLines).join('\n');
  }

  private async copyVideo(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', inputPath,
        '-c', 'copy',
        '-y',
        outputPath
      ]);

      let error = '';
      ffmpeg.stderr.on('data', (data) => {
        error += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code !== 0) {
          logger.error('Video copy error:', error);
          reject(new Error('Failed to copy video'));
        } else {
          resolve();
        }
      });
    });
  }
}
