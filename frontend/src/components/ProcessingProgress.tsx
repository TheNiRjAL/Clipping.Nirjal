import React, { useEffect, useState } from 'react';
import { getJobStatus } from '../api/client';
import styles from './ProcessingProgress.module.css';

interface ProcessingProgressProps {
  jobId: string;
  onComplete: () => void;
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({
  jobId,
  onComplete,
}) => {
  const [status, setStatus] = useState('UPLOADING');
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('Starting...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const job = await getJobStatus(jobId);
        setStatus(job.status);
        setProgress(job.progress);
        setCurrentTask(job.currentTask);

        if (job.status === 'FAILED') {
          setError(job.error || 'Processing failed');
        } else if (job.status === 'COMPLETED') {
          setProgress(100);
          setTimeout(onComplete, 1000);
        }
      } catch (err) {
        console.error('Status check error:', err);
      }
    };

    const interval = setInterval(checkStatus, 1000);
    checkStatus(); // Initial check

    return () => clearInterval(interval);
  }, [jobId, onComplete]);

  const statusSteps = [
    { status: 'UPLOADING', label: 'Uploading' },
    { status: 'PROBING', label: 'Reading video info' },
    { status: 'TRANSCRIBING', label: 'Transcribing audio' },
    { status: 'ANALYZING', label: 'Analyzing with AI' },
    { status: 'SELECTING', label: 'Selecting best moments' },
    { status: 'RENDERING', label: 'Rendering clips' },
    { status: 'FINALIZING', label: 'Finalizing' },
  ];

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <div className={styles.errorIcon}>❌</div>
          <h2>Processing Failed</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Processing Your Video</h2>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>
      <p className={styles.progressText}>{Math.round(progress)}%</p>

      <div className={styles.steps}>
        {statusSteps.map((step, index) => (
          <div
            key={step.status}
            className={`${styles.step} ${
              statusSteps.findIndex((s) => s.status === status) >= index
                ? styles.completed
                : ''
            }`}
          >
            <div className={styles.stepNumber}>
              {statusSteps.findIndex((s) => s.status === status) > index ? '✓' : index + 1}
            </div>
            <div className={styles.stepLabel}>{step.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.currentTask}>
        <p>{currentTask}</p>
        <div className={styles.spinner}></div>
      </div>
    </div>
  );
};
