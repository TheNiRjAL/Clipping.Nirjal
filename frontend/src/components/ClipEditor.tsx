import React, { useState } from 'react';
import { Clip, ClipSettings, VideoEffects, SubtitleSettings } from '../types';
import styles from './ClipEditor.module.css';

interface ClipEditorProps {
  clip: Clip;
  onRender: (clip: Clip, start: number, end: number, settings: ClipSettings) => void;
  onClose: () => void;
}

const defaultEffects: VideoEffects = {
  sharpness: 'off',
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  temperature: 'neutral',
  vignette: 'off',
  noiseReduction: 'off',
  colorEnhancement: 'off',
  upscale: 'original',
  frameRate: 'original',
  audio: 'original',
};

const defaultSubtitles: SubtitleSettings = {
  enabled: true,
  style: 'viral',
  fontSize: 24,
  position: 'bottom',
  color: '#FFFFFF',
  outlineThickness: 2,
  shadow: true,
  backgroundColor: false,
  uppercase: false,
  highlightKeywords: true,
  animation: 'word-highlight',
};

export const ClipEditor: React.FC<ClipEditorProps> = ({
  clip,
  onRender,
  onClose,
}) => {
  const [startTime, setStartTime] = useState(clip.startTime);
  const [endTime, setEndTime] = useState(clip.endTime);
  const [effects, setEffects] = useState<VideoEffects>(defaultEffects);
  const [subtitles, setSubtitles] = useState<SubtitleSettings>(defaultSubtitles);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');

  const handleRender = () => {
    const settings: ClipSettings = {
      numberOfClips: 1,
      clipLength: 'auto',
      videoStyle: 'auto',
      aspectRatio,
      effects,
      subtitles,
    };
    onRender(clip, startTime, endTime, settings);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Edit Clip: {clip.title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h3>Timing</h3>
            <div className={styles.timingRow}>
              <div>
                <label>Start Time (s)</label>
                <input
                  type="number"
                  value={startTime}
                  onChange={(e) => setStartTime(parseFloat(e.target.value))}
                  step="0.1"
                  min="0"
                />
              </div>
              <div>
                <label>End Time (s)</label>
                <input
                  type="number"
                  value={endTime}
                  onChange={(e) => setEndTime(parseFloat(e.target.value))}
                  step="0.1"
                />
              </div>
              <div>
                <label>Duration</label>
                <input
                  type="text"
                  value={(endTime - startTime).toFixed(1)}
                  disabled
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3>Aspect Ratio</h3>
            <div className={styles.buttonGroup}>
              {[
                { value: '9:16', label: '📱 Vertical' },
                { value: '16:9', label: '📺 Landscape' },
                { value: '1:1', label: '⬜ Square' },
              ].map((option) => (
                <button
                  key={option.value}
                  className={aspectRatio === option.value ? styles.active : ''}
                  onClick={() => setAspectRatio(option.value as any)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h3>Effects</h3>
            <div className={styles.grid}>
              <div>
                <label>Brightness: {effects.brightness > 0 ? '+' : ''}{effects.brightness}</label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={effects.brightness}
                  onChange={(e) =>
                    setEffects({ ...effects, brightness: parseInt(e.target.value) })
                  }
                />
              </div>
              <div>
                <label>Contrast: {effects.contrast > 0 ? '+' : ''}{effects.contrast}</label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={effects.contrast}
                  onChange={(e) =>
                    setEffects({ ...effects, contrast: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.renderButton} onClick={handleRender}>
            🎬 Render Again
          </button>
        </div>
      </div>
    </div>
  );
};
