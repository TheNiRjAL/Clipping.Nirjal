import path from 'path';
import { spawn } from 'child_process';
import logger from '../utils/logger.js';
import { VideoMetadata, VideoError, ErrorCodes } from '../types/index.js';
import { StorageService } from './storage.service.js';

export class VideoProbeService {
  private storage = new StorageService();

  async probeVideo(filePath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn('ffprobe', [
        '-v', 'error',
        '-show_format',
        '-show_streams',
        '-of', 'json',
        filePath
      ]);

      let output = '';
      let error = '';

      ffprobe.stdout.on('data', (data) => {
        output += data.toString();
      });

      ffprobe.stderr.on('data', (data) => {
        error += data.toString();
      });

      ffprobe.on('close', async (code) => {
        if (code !== 0) {
          logger.error('FFprobe error:', error);
          return reject(new VideoError(ErrorCodes.FFPROBE_NOT_FOUND, 'Failed to probe video'));
        }

        try {
          const data = JSON.parse(output);
          const format = data.format || {};
          const videoStream = data.streams?.find((s: any) => s.codec_type === 'video');
          const audioStream = data.streams?.find((s: any) => s.codec_type === 'audio');

          if (!videoStream) {
            return reject(new VideoError(ErrorCodes.INVALID_VIDEO, 'No video stream found'));
          }

          const duration = parseFloat(format.duration || '0');
          const width = videoStream.width || 0;
          const height = videoStream.height || 0;
          const fps = this.calculateFps(videoStream);
          const codec = videoStream.codec_name || 'unknown';
          const audioCodec = audioStream?.codec_name || 'none';
          const bitrate = parseInt(format.bit_rate || '0', 10);
          const size = parseInt(format.size || '0', 10);

          const metadata: VideoMetadata = {
            filename: path.basename(filePath),
            duration,
            width,
            height,
            fps,
            codec,
            audioCodec,
            bitrate,
            size
          };

          logger.info('Video probed:', metadata);
          resolve(metadata);
        } catch (err) {
          logger.error('Failed to parse FFprobe output:', err);
          reject(new VideoError(ErrorCodes.INVALID_VIDEO, 'Invalid video file'));
        }
      });
    });
  }

  private calculateFps(stream: any): number {
    if (stream.r_frame_rate) {
      const [num, den] = stream.r_frame_rate.split('/').map(Number);
      return den ? num / den : num;
    }
    return 30;
  }
}
