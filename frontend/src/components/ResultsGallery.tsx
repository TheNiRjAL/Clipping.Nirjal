import React from 'react';
import { Clip, ClipSettings } from '../types';
import { downloadClip, downloadAllClips } from '../api/client';
import styles from './ResultsGallery.module.css';

interface ResultsGalleryProps {
  jobId: string;
  clips: Clip[];
  onEditClip?: (clip: Clip) => void;
}

export const ResultsGallery: React.FC<ResultsGalleryProps> = ({
  jobId,
  clips,
  onEditClip,
}) => {
  if (clips.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>No clips generated</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>✨ Your Clips Are Ready!</h2>
        <button
          className={styles.downloadAllButton}
          onClick={() => downloadAllClips(jobId)}
        >
          📦 Download All
        </button>
      </div>

      <div className={styles.gallery}>
        {clips.map((clip, index) => (
          <div key={clip.clipId} className={styles.clipCard}>
            <div className={styles.clipHeader}>
              <span className={styles.clipNumber}>Clip {index + 1}</span>
              <span className={styles.clipScore}>Score: {clip.score}/100</span>
            </div>

            <div className={styles.clipInfo}>
              <h3>{clip.title}</h3>
              <p className={styles.hook}>"{clip.hook}"</p>
              <p className={styles.reason}>{clip.reason}</p>
              <div className={styles.metadata}>
                <span>⏱️ {clip.duration}s</span>
                <span>🏷️ {clip.topic}</span>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.previewButton}
                onClick={() => {
                  // Video preview would be implemented here
                  window.open(`/preview/${clip.clipId}`, '_blank');
                }}
              >
                ▶️ Preview
              </button>
              <button
                className={styles.downloadButton}
                onClick={() => downloadClip(clip.clipId)}
              >
                ⬇️ Download
              </button>
              {onEditClip && (
                <button
                  className={styles.editButton}
                  onClick={() => onEditClip(clip)}
                >
                  ✏️ Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
