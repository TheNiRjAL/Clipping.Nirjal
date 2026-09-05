import React, { useState } from 'react';
import { ClipSettings, VideoEffects, SubtitleSettings } from '../types';
import styles from './VideoSettings.module.css';

interface VideoSettingsProps {
  onSettingsChange: (settings: ClipSettings) => void;
  videoMetadata: any;
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

export const VideoSettings: React.FC<VideoSettingsProps> = ({
  onSettingsChange,
  videoMetadata,
}) => {
  const [numberOfClips, setNumberOfClips] = useState(5);
  const [clipLength, setClipLength] = useState<'auto' | '15-30' | '30-45' | '45-60'>('auto');
  const [videoStyle, setVideoStyle] = useState<'auto' | 'podcast' | 'talking-head' | 'interview' | 'educational' | 'gaming' | 'commentary' | 'screen-recording'>('auto');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [effects, setEffects] = useState<VideoEffects>(defaultEffects);
  const [subtitles, setSubtitles] = useState<SubtitleSettings>(defaultSubtitles);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateSettings = () => {
    const settings: ClipSettings = {
      numberOfClips,
      clipLength,
      videoStyle,
      aspectRatio,
      effects,
      subtitles,
    };
    onSettingsChange(settings);
  };

  React.useEffect(() => {
    updateSettings();
  }, [numberOfClips, clipLength, videoStyle, aspectRatio, effects, subtitles]);

  return (
    <div className={styles.container}>
      <h2>Clip Settings</h2>

      <div className={styles.section}>
        <label>Number of Clips</label>
        <div className={styles.buttonGroup}>
          {[3, 5, 10, 15].map((num) => (
            <button
              key={num}
              className={numberOfClips === num ? styles.active : ''}
              onClick={() => setNumberOfClips(num)}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <label>Clip Length</label>
        <div className={styles.buttonGroup}>
          {[
            { value: 'auto', label: 'Auto' },
            { value: '15-30', label: '15-30s' },
            { value: '30-45', label: '30-45s' },
            { value: '45-60', label: '45-60s' },
          ].map((option) => (
            <button
              key={option.value}
              className={clipLength === option.value ? styles.active : ''}
              onClick={() => setClipLength(option.value as any)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <label>Video Style</label>
        <select value={videoStyle} onChange={(e) => setVideoStyle(e.target.value as any)}>
          <option value="auto">Auto-detect</option>
          <option value="podcast">Podcast</option>
          <option value="talking-head">Talking Head</option>
          <option value="interview">Interview</option>
          <option value="educational">Educational</option>
          <option value="gaming">Gaming</option>
          <option value="commentary">Commentary</option>
          <option value="screen-recording">Screen Recording</option>
        </select>
      </div>

      <div className={styles.section}>
        <label>Aspect Ratio</label>
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

      {/* Viral Subtitles */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <label>
            <input
              type="checkbox"
              checked={subtitles.enabled}
              onChange={(e) => setSubtitles({ ...subtitles, enabled: e.target.checked })}
            />
            Viral Subtitles
          </label>
        </div>
        {subtitles.enabled && (
          <div className={styles.subsection}>
            <div>
              <label>Style</label>
              <select
                value={subtitles.style}
                onChange={(e) => setSubtitles({ ...subtitles, style: e.target.value as any })}
              >
                <option value="clean">Clean</option>
                <option value="bold">Bold</option>
                <option value="viral">Viral</option>
                <option value="minimal">Minimal</option>
                <option value="podcast">Podcast</option>
                <option value="gaming">Gaming</option>
                <option value="highlight">Highlight</option>
              </select>
            </div>
            <div>
              <label>Font Size: {subtitles.fontSize}px</label>
              <input
                type="range"
                min="16"
                max="48"
                value={subtitles.fontSize}
                onChange={(e) => setSubtitles({ ...subtitles, fontSize: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label>Animation</label>
              <select
                value={subtitles.animation}
                onChange={(e) => setSubtitles({ ...subtitles, animation: e.target.value as any })}
              >
                <option value="none">None</option>
                <option value="pop">Pop</option>
                <option value="bounce">Bounce</option>
                <option value="word-highlight">Word Highlight</option>
                <option value="karaoke">Karaoke</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Settings */}
      <div className={styles.section}>
        <button
          className={styles.advancedToggle}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? '▼' : '▶'} Advanced Video Effects & Quality
        </button>

        {showAdvanced && (
          <div className={styles.advancedSection}>
            <div className={styles.gridRow}>
              <div>
                <label>Sharpness</label>
                <select
                  value={effects.sharpness}
                  onChange={(e) => setEffects({ ...effects, sharpness: e.target.value as any })}
                >
                  <option value="off">Off</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label>Brightness: {effects.brightness > 0 ? '+' : ''}{effects.brightness}</label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={effects.brightness}
                  onChange={(e) => setEffects({ ...effects, brightness: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className={styles.gridRow}>
              <div>
                <label>Contrast: {effects.contrast > 0 ? '+' : ''}{effects.contrast}</label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={effects.contrast}
                  onChange={(e) => setEffects({ ...effects, contrast: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label>Saturation: {effects.saturation > 0 ? '+' : ''}{effects.saturation}</label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={effects.saturation}
                  onChange={(e) => setEffects({ ...effects, saturation: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className={styles.gridRow}>
              <div>
                <label>Vignette</label>
                <select
                  value={effects.vignette}
                  onChange={(e) => setEffects({ ...effects, vignette: e.target.value as any })}
                >
                  <option value="off">Off</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label>Noise Reduction</label>
                <select
                  value={effects.noiseReduction}
                  onChange={(e) => setEffects({ ...effects, noiseReduction: e.target.value as any })}
                >
                  <option value="off">Off</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className={styles.gridRow}>
              <div>
                <label>Audio</label>
                <select
                  value={effects.audio}
                  onChange={(e) => setEffects({ ...effects, audio: e.target.value as any })}
                >
                  <option value="original">Original</option>
                  <option value="normalize">Normalize</option>
                  <option value="loudness-optimized">Loudness Optimized</option>
                </select>
              </div>
              <div>
                <label>Frame Rate</label>
                <select
                  value={effects.frameRate}
                  onChange={(e) => setEffects({ ...effects, frameRate: e.target.value as any })}
                >
                  <option value="original">Original</option>
                  <option value="30">30 FPS</option>
                  <option value="60">60 FPS</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
