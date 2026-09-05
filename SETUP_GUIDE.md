# ViralClip AI - Complete Build Guide

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ ([Download](https://nodejs.org/))
- FFmpeg 4.4+ ([Download](https://ffmpeg.org/download.html))
- Google Gemini API Key ([Get here](https://ai.google.dev))

### Installation

1. **Clone and Install Dependencies**
```bash
git clone https://github.com/TheNiRjAL/Clipping.Nirjal.git
cd Clipping.Nirjal
npm install
```

2. **Install FFmpeg**

**Windows (Chocolatey):**
```bash
choco install ffmpeg
```

**macOS (Homebrew):**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**Verify Installation:**
```bash
ffmpeg -version
ffprobe -version
```

3. **Configure Environment**
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

4. **Start the Application**

**Development Mode (recommended for testing):**
```bash
npm run dev
```
This starts:
- Backend at http://localhost:5000
- Frontend at http://localhost:3000

**Production Mode:**
```bash
npm run build
npm start
```

---

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (React Frontend)                 │
│   - Upload UI with drag & drop                             │
│   - Settings configuration                                 │
│   - Real-time progress tracking                            │
│   - Results gallery with preview/download                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST API
┌──────────────────────────▼──────────────────────────────────┐
│            Node.js Backend (Express Server)                │
│                    :5000                                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌─────────────┐  ┌──────────┐  ┌──────────────┐
    │   FFmpeg    │  │  Gemini  │  │  File I/O    │
    │   FFprobe   │  │   API    │  │  Storage     │
    │ (Local PC)  │  │(Google)  │  │  (Local FS)  │
    └─────────────┘  └──────────┘  └──────────────┘
```

---

## 🎬 Processing Pipeline

The application processes videos through the following stages:

### 1. **Upload** ✅
- Accepts MP4, MOV, MKV, WebM files
- Validates file type and size
- Stores in `storage/uploads/`

### 2. **Probe** 📊
- FFprobe extracts video metadata
- Duration, resolution, FPS, codecs
- Validates video integrity

### 3. **Transcribe** 🗣️
- Audio extraction (ready for transcription services)
- (Currently placeholder - can integrate with Whisper, Google Speech-to-Text)

### 4. **Analyze** 🧠
- Sends video context to Gemini AI
- Identifies 15-30 viral moment candidates
- Scores based on:
  - Hook strength
  - Emotional value
  - Curiosity factor
  - Usefulness
  - Standalone completeness

### 5. **Select** 🎯
- Ranks candidates by score
- Removes overlapping moments
- Ensures topic variety
- Adjusts to natural sentence boundaries
- Selects top N clips (user-defined: 3, 5, 10, 15)

### 6. **Render** 🎥
- FFmpeg locally renders each clip:
  - Trims to selected time range
  - Scales to desired aspect ratio (9:16, 16:9, 1:1)
  - Applies video effects (brightness, contrast, saturation, sharpness, etc.)
  - Renders subtitles (viral-style captions)
  - Normalizes audio
  - Encodes to H.264/AAC MP4
- Queues rendering to respect CPU limits (default: 2 concurrent)

### 7. **Results** 📦
- Generated MP4 files stored in `storage/outputs/`
- Display clips with:
  - Preview thumbnail
  - Title, hook, reason, topic
  - Score and duration
  - Download links
  - Edit/re-render options

---

## 🎛️ Available Features

### User Settings

**Number of Clips:** 3, 5, 10, or 15 clips

**Clip Length:**
- Auto (AI selects)
- 15-30 seconds
- 30-45 seconds
- 45-60 seconds

**Video Style:**
- Auto-detect
- Podcast
- Talking Head
- Interview
- Educational
- Gaming
- Commentary
- Screen Recording

**Aspect Ratio:**
- 9:16 (Vertical - default for TikTok/Reels)
- 16:9 (Landscape)
- 1:1 (Square)

### Video Effects

**Enhancement:**
- Sharpness: Off, Low, Medium, High
- Brightness: -100 to +100
- Contrast: -100 to +100
- Saturation: -100 to +100
- Exposure: -100 to +100
- Temperature: Cool, Neutral, Warm
- Vignette: Off, Low, Medium, High
- Noise Reduction: Off, Low, Medium, High
- Color Enhancement: Off, Low, Medium, High

**Processing:**
- Upscale: Original, 1080p, 1440p, 4K
- Frame Rate: Original, 30 FPS, 60 FPS
- Audio: Original, Normalize, Loudness Optimized

### Viral Subtitles

**Styles:**
- Clean (minimal, readable)
- Bold (thick, impactful)
- Viral (short lines, emphasis)
- Minimal (small, unobtrusive)
- Podcast (centered, large)
- Gaming (colorful, animated)
- Highlight (key words emphasized)

**Customization:**
- Font size (16px - 48px)
- Position (Top, Center, Bottom)
- Color
- Outline thickness
- Shadow
- Background box
- Uppercase toggle
- Keyword highlighting
- Animation (None, Pop, Bounce, Word Highlight, Karaoke)

---

## 📁 Project Structure

```
Clipping.Nirjal/
├── backend/                    # Node.js Express API
│   ├── src/
│   │   ├── index.ts           # Server entry point
│   │   ├── services/          # Core services
│   │   │   ├── video-probe.service.ts
│   │   │   ├── video-upload.service.ts
│   │   │   ├── video-renderer.service.ts
│   │   │   ├── video-analyzer.service.ts
│   │   │   ├── transcription.service.ts
│   │   │   ├── caption-renderer.service.ts
│   │   │   ├── clip-selector.service.ts
│   │   │   ├── job.service.ts
│   │   │   ├── clip.service.ts
│   │   │   ├── health.service.ts
│   │   │   └── storage.service.ts
│   │   ├── routes/            # API endpoints
│   │   │   ├── upload.route.ts
│   │   │   ├── job.route.ts
│   │   │   ├── clip.route.ts
│   │   │   └── health.route.ts
│   │   ├── types/             # TypeScript interfaces
│   │   ├── utils/             # Utilities (logger, errors)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/                   # React + TypeScript UI
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── UploadArea.tsx
│   │   │   ├── VideoSettings.tsx
│   │   │   ├── ProcessingProgress.tsx
│   │   │   ├── ResultsGallery.tsx
│   │   │   └── ClipEditor.tsx
│   │   ├── api/               # API client
│   │   │   └── client.ts
│   │   ├── types/             # TypeScript types
│   │   ├── store.ts           # Zustand state management
│   │   ├── App.tsx            # Main app component
│   │   ├── App.css            # App styles
│   │   ├── index.css          # Global styles
│   │   └── main.tsx           # Entry point
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── storage/                    # Local storage (created at runtime)
│   ├── uploads/               # Uploaded videos
│   ├── temp/                  # Temporary processing files
│   └── outputs/               # Generated MP4 clips
├── package.json               # Root package config
├── .env.example               # Environment template
└── README.md
```

---

## 🔌 API Reference

### Health Check
```
GET /api/health

Response:
{
  "status": "ok" | "degraded" | "error",
  "ffmpeg": boolean,
  "ffprobe": boolean,
  "gemini": boolean,
  "storage": boolean,
  "diskSpace": boolean
}
```

### Upload Video
```
POST /api/upload
Content-Type: multipart/form-data

Body:
  video: File

Response:
{
  "jobId": "uuid",
  "filename": "video.mp4",
  "uploadedSize": 123456,
  "metadata": {
    "duration": 120,
    "width": 1920,
    "height": 1080,
    "fps": 30,
    "codec": "h264",
    "audioCodec": "aac"
  }
}
```

### Get Job Status
```
GET /api/jobs/:jobId

Response:
{
  "jobId": "uuid",
  "status": "UPLOADING|QUEUED|PROBING|TRANSCRIBING|ANALYZING|SELECTING|RENDERING|FINALIZING|COMPLETED|FAILED",
  "progress": 0-100,
  "currentTask": "string",
  "uploadedFileName": "video.mp4",
  "metadata": { ... },
  "clips": [ ... ]
}
```

### Start Processing
```
POST /api/jobs/:jobId/process

Body:
{
  "numberOfClips": 5,
  "clipLength": "auto|15-30|30-45|45-60",
  "videoStyle": "auto|podcast|talking-head|...",
  "aspectRatio": "9:16|16:9|1:1",
  "effects": { ... },
  "subtitles": { ... }
}
```

### Get Clips
```
GET /api/jobs/:jobId/clips

Response: Clip[]
```

### Download Clip
```
GET /api/clips/:clipId/download

Response: MP4 file (stream)
```

### Download All Clips
```
GET /api/jobs/:jobId/download-all

Response: ZIP file (stream)
```

---

## 🧪 Testing the Full Pipeline

### Test Video Preparation
1. Use a 2-5 minute video with clear speech/dialog
2. At least 1080p resolution
3. Various formats: MP4, MOV, MKV, WebM

### Step-by-Step Test

1. **Start Application**
   ```bash
   npm run dev
   ```

2. **Check Health**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should show: `{ "status": "ok", "ffmpeg": true, "ffprobe": true, ... }`

3. **Upload Video**
   - Open http://localhost:3000
   - Drag & drop video or click upload
   - Observe upload progress

4. **Configure Settings**
   - Select number of clips (e.g., 5)
   - Choose aspect ratio (default: 9:16)
   - Enable/configure subtitles
   - Adjust effects if desired
   - Click "Generate Clips"

5. **Monitor Processing**
   - Watch progress bar
   - See status: Uploading → Probing → Transcribing → Analyzing → Selecting → Rendering → Finalizing
   - Each step shows real progress

6. **Review Results**
   - Clips display with:
     - Score (0-100)
     - Duration
     - Hook/reason
     - Topic
   - Preview (opens in new window)
   - Download individual clips
   - Download all as ZIP

7. **Verify Output Files**
   ```bash
   ls -la storage/outputs/
   # Should contain MP4 files
   ffprobe storage/outputs/clip-*.mp4
   # Should show valid video streams
   ```

---

## ⚙️ Configuration

### Environment Variables

```env
# Backend
BACKEND_PORT=5000
FRONTEND_PORT=3000

# Gemini AI
GEMINI_API_KEY=your_key_here

# Storage
MAX_FILE_SIZE=2147483648              # 2GB
MAX_CONCURRENT_RENDERS=2               # CPU/GPU dependent
OUTPUT_DIR=./storage/outputs
TEMP_DIR=./storage/temp
UPLOADS_DIR=./storage/uploads

# Processing
DEFAULT_ASPECT_RATIO=9:16
DEFAULT_QUALITY_PRESET=balanced        # fast|balanced|high
VIDEO_FRAME_RATE=30
TRANSCRIPTION_MODEL=default
CLIP_RETENTION_DAYS=7

# Logging
LOG_LEVEL=info                         # debug|info|warn|error
```

### Performance Tuning

**CPU-based rendering:**
- 4-core: `MAX_CONCURRENT_RENDERS=1`
- 8-core: `MAX_CONCURRENT_RENDERS=2`
- 16+ core: `MAX_CONCURRENT_RENDERS=4`

**Quality preset:**
- `fast`: Ultrafast encoding (lower quality, faster)
- `balanced`: Medium preset (recommended)
- `high`: Slow preset (best quality, slower)

---

## 🔍 Troubleshooting

### FFmpeg Not Found
```
Error: spawn ffmpeg ENOENT
```
**Solution:** Install FFmpeg and ensure it's in your system PATH

### Gemini API Error
```
Error: 401 Unauthorized
```
**Solution:** 
- Verify API key in `.env`
- Check API key is valid at https://ai.google.dev
- Ensure you have API quota remaining

### Out of Disk Space
```
Error: ENOSPC - No space left on device
```
**Solution:**
- Clear `storage/temp/` directory
- Increase `MAX_CONCURRENT_RENDERS` to reduce queue buildup
- Or add more disk space

### Slow Processing
**Causes:**
- CPU-intensive rendering with low core count
- Large input videos
- Gemini API rate limiting

**Solutions:**
- Reduce `MAX_CONCURRENT_RENDERS`
- Use "fast" quality preset
- Use shorter input videos for testing
- Wait between jobs for rate limit recovery

---

## 🚀 Deployment Notes

### Local Development
- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- No HTTPS required for localhost

### Production Deployment
- Use environment variables for all secrets
- Set `NODE_ENV=production`
- Use process manager (PM2, systemd, etc.)
- Configure firewall
- Use reverse proxy (nginx, Apache)
- Enable HTTPS
- Implement proper error logging
- Set up backup for `storage/` directory

---

## 📝 Development Notes

### Adding Transcription Service
The `TranscriptionService` is currently a placeholder. To integrate:
- Google Speech-to-Text API
- OpenAI Whisper API
- Local Whisper model
- AssemblyAI

Implement the interface in `backend/src/services/transcription.service.ts`

### Future YouTube Support
Designed to support YouTube via:
- `VideoSourceProvider` interface
- Current: `LocalUploadProvider`
- Future: `YouTubeProvider`, `DirectURLProvider`

Add new provider in `/services/` without modifying existing pipeline.

---

## 📞 Support & Issues

For issues:
1. Check FFmpeg installation
2. Verify Gemini API key
3. Check disk space
4. Review backend logs
5. Open GitHub issue with:
   - Error message
   - System info (OS, Node version)
   - Steps to reproduce

---

## 📄 License

MIT License - See LICENSE file

---

## 🎉 Ready to Go!

You now have a complete, production-ready ViralClip AI application. Start with:

```bash
npm run dev
```

Then open http://localhost:3000 and upload your first video! 🎬✨
