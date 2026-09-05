export interface VideoMetadata {
  filename: string;
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  audioCodec: string;
  bitrate: number;
  size: number;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  words?: { start: number; end: number; text: string }[];
}

export interface ClipCandidate {
  start: number;
  end: number;
  duration: number;
  score: number;
  hook: string;
  title: string;
  reason: string;
  topic: string;
  emotionalValue: number;
  curiosity: number;
  usefulness: number;
  standaloneCompleteness: number;
}

export interface VideoEffects {
  sharpness: 'off' | 'low' | 'medium' | 'high';
  brightness: number;
  contrast: number;
  saturation: number;
  exposure: number;
  temperature: 'cool' | 'neutral' | 'warm';
  vignette: 'off' | 'low' | 'medium' | 'high';
  noiseReduction: 'off' | 'low' | 'medium' | 'high';
  colorEnhancement: 'off' | 'low' | 'medium' | 'high';
  upscale: 'original' | '1080p' | '1440p' | '4k';
  frameRate: 'original' | '30' | '60';
  audio: 'original' | 'normalize' | 'loudness-optimized';
}

export interface SubtitleSettings {
  enabled: boolean;
  style: 'clean' | 'bold' | 'viral' | 'minimal' | 'podcast' | 'gaming' | 'highlight';
  fontSize: number;
  position: 'top' | 'center' | 'bottom';
  color: string;
  outlineThickness: number;
  shadow: boolean;
  backgroundColor: boolean;
  uppercase: boolean;
  highlightKeywords: boolean;
  animation: 'none' | 'pop' | 'bounce' | 'word-highlight' | 'karaoke';
}

export interface ClipSettings {
  numberOfClips: number;
  clipLength: 'auto' | '15-30' | '30-45' | '45-60';
  videoStyle: 'auto' | 'podcast' | 'talking-head' | 'interview' | 'educational' | 'gaming' | 'commentary' | 'screen-recording';
  aspectRatio: '9:16' | '16:9' | '1:1';
  effects: VideoEffects;
  subtitles: SubtitleSettings;
}

export interface Clip {
  clipId: string;
  jobId: string;
  startTime: number;
  endTime: number;
  duration: number;
  score: number;
  title: string;
  hook: string;
  reason: string;
  topic: string;
  filePath: string;
  thumbnail?: string;
  createdAt: Date;
  status: 'completed' | 'failed';
}

export type JobStatus =
  | 'UPLOADING'
  | 'QUEUED'
  | 'PROBING'
  | 'TRANSCRIBING'
  | 'ANALYZING'
  | 'SELECTING'
  | 'RENDERING'
  | 'FINALIZING'
  | 'COMPLETED'
  | 'FAILED';

export interface Job {
  jobId: string;
  status: JobStatus;
  progress: number;
  currentTask: string;
  uploadedFileName: string;
  uploadedFilePath: string;
  metadata?: VideoMetadata;
  transcript?: TranscriptSegment[];
  candidates?: ClipCandidate[];
  settings?: ClipSettings;
  clips: Clip[];
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}
