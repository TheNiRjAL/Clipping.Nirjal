import React, { useState } from 'react';
import { UploadArea } from './components/UploadArea';
import { VideoSettings } from './components/VideoSettings';
import { ProcessingProgress } from './components/ProcessingProgress';
import { ResultsGallery } from './components/ResultsGallery';
import { ClipEditor } from './components/ClipEditor';
import { startProcessing, getClips } from './api/client';
import { useAppStore } from './store';
import { Clip, ClipSettings } from './types';
import './App.css';

type AppState = 'idle' | 'uploaded' | 'settings' | 'processing' | 'results' | 'editing';

function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [jobId, setJobId] = useState<string | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<any>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [editingClip, setEditingClip] = useState<Clip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentJob, setSettings } = useAppStore();

  const handleUploadSuccess = (newJobId: string, metadata: any) => {
    setJobId(newJobId);
    setVideoMetadata(metadata);
    setAppState('settings');
    setError(null);
  };

  const handleUploadError = (err: string) => {
    setError(err);
  };

  const handleSettingsChange = (settings: ClipSettings) => {
    setSettings(settings);
  };

  const handleStartProcessing = async (settings: ClipSettings) => {
    if (!jobId) return;

    try {
      setError(null);
      setAppState('processing');
      await startProcessing(jobId, settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start processing');
      setAppState('settings');
    }
  };

  const handleProcessingComplete = async () => {
    if (!jobId) return;

    try {
      const generatedClips = await getClips(jobId);
      setClips(generatedClips);
      setAppState('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clips');
      setAppState('settings');
    }
  };

  const handleEditClip = (clip: Clip) => {
    setEditingClip(clip);
    setAppState('editing');
  };

  const handleReRender = async (
    clip: Clip,
    start: number,
    end: number,
    settings: ClipSettings
  ) => {
    // Re-render logic would be implemented here
    setEditingClip(null);
    setAppState('results');
  };

  const handleReset = () => {
    setAppState('idle');
    setJobId(null);
    setVideoMetadata(null);
    setClips([]);
    setEditingClip(null);
    setError(null);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <div className="logo">
            <span className="logoIcon">✨</span>
            <h1>ViralClip AI</h1>
          </div>
          <p className="tagline">Turn long videos into short-form viral content</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {error && (
            <div className="errorBanner">
              <span>⚠️ {error}</span>
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}

          {appState === 'idle' && (
            <section>
              <UploadArea
                onUploadSuccess={handleUploadSuccess}
                onError={handleUploadError}
              />
            </section>
          )}

          {appState === 'settings' && videoMetadata && (
            <section>
              <div className="stepsContainer">
                <div className="stepIndicator">
                  <div className="step active">
                    <span>1</span> Upload
                  </div>
                  <div className="step active">
                    <span>2</span> Settings
                  </div>
                  <div className="step">
                    <span>3</span> Generate
                  </div>
                  <div className="step">
                    <span>4</span> Results
                  </div>
                </div>

                <div className="videoInfo">
                  <h3>📹 Video Uploaded</h3>
                  <div className="metadataGrid">
                    <div>
                      <span className="label">Duration</span>
                      <span className="value">{videoMetadata.duration.toFixed(1)}s</span>
                    </div>
                    <div>
                      <span className="label">Resolution</span>
                      <span className="value">{videoMetadata.width}×{videoMetadata.height}</span>
                    </div>
                    <div>
                      <span className="label">FPS</span>
                      <span className="value">{videoMetadata.fps.toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="label">Codec</span>
                      <span className="value">{videoMetadata.codec}</span>
                    </div>
                  </div>
                </div>

                <VideoSettings
                  onSettingsChange={handleSettingsChange}
                  videoMetadata={videoMetadata}
                />

                <div className="actionButtons">
                  <button className="secondaryButton" onClick={handleReset}>
                    ← Upload Different Video
                  </button>
                  <button
                    className="primaryButton"
                    onClick={() => handleStartProcessing({ numberOfClips: 5, clipLength: 'auto', videoStyle: 'auto', aspectRatio: '9:16', effects: {} as any, subtitles: {} as any })}
                  >
                    🚀 Generate Clips
                  </button>
                </div>
              </div>
            </section>
          )}

          {appState === 'processing' && jobId && (
            <section>
              <ProcessingProgress jobId={jobId} onComplete={handleProcessingComplete} />
            </section>
          )}

          {appState === 'results' && jobId && (
            <section>
              <div className="resultsContainer">
                <ResultsGallery
                  jobId={jobId}
                  clips={clips}
                  onEditClip={handleEditClip}
                />

                <div className="actionButtons">
                  <button className="secondaryButton" onClick={handleReset}>
                    ↻ Process Another Video
                  </button>
                </div>
              </div>
            </section>
          )}

          {appState === 'editing' && editingClip && (
            <ClipEditor
              clip={editingClip}
              onRender={handleReRender}
              onClose={() => setAppState('results')}
            />
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>Built with ❤️ using React, FFmpeg, and Gemini AI</p>
          <p className="footerLinks">
            <a href="https://github.com/TheNiRjAL/Clipping.Nirjal" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            |
            <a href="#support">Support</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
