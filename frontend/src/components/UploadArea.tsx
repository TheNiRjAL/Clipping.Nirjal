import React, { useState } from 'react';
import { uploadVideo } from '../api/client';
import styles from './UploadArea.module.css';

interface UploadAreaProps {
  onUploadSuccess: (jobId: string, metadata: any) => void;
  onError: (error: string) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onUploadSuccess, onError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      onError('Unsupported video format. Please use MP4, MOV, MKV, or WebM');
      return;
    }

    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > maxSize) {
      onError('File is too large. Maximum size is 2GB');
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + Math.random() * 20 : prev));
      }, 500);

      const result = await uploadVideo(file);
      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
        onUploadSuccess(result.jobId, result.metadata);
      }, 500);
    } catch (error) {
      setIsUploading(false);
      onError(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  return (
    <div
      className={`${styles.uploadArea} ${isDragging ? styles.dragging : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isUploading ? (
        <div className={styles.uploadingContainer}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <p>{Math.round(progress)}% Uploading...</p>
        </div>
      ) : (
        <>
          <div className={styles.uploadIcon}>📹</div>
          <h2>Drag & Drop your video here</h2>
          <p>or</p>
          <label className={styles.fileInputLabel}>
            Choose Video
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/x-matroska,video/webm"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </label>
          <p className={styles.supportedFormats}>
            Supported: MP4, MOV, MKV, WebM
          </p>
        </>
      )}
    </div>
  );
};
