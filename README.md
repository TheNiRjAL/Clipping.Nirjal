# ViralClip AI

Turn long-form videos into viral short-form content with AI analysis and local video processing.

**Key Features:**
- 🎥 Upload local video files (MP4, MOV, MKV, WebM)
- 🤖 AI-powered viral moment detection using Google Gemini
- ✂️ Automatic clip generation and ranking
- 🎬 Local FFmpeg rendering (CPU/GPU accelerated)
- 📝 Automatic transcription and viral subtitle generation
- ⚙️ Advanced video effects (sharpness, brightness, contrast, saturation, etc.)
- 📊 Real-time processing progress tracking
- 💾 Local file storage and download

---

## Requirements

### System Requirements
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **FFmpeg** 4.4+ ([Download](https://ffmpeg.org/download.html))
- **Disk Space** 50GB+ recommended
- **RAM** 8GB minimum

### Gemini API
- Google Gemini API Key ([Get here](https://ai.google.dev))

---

## Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/TheNiRjAL/Clipping.Nirjal.git
cd Clipping.Nirjal
```

### Step 2: Install FFmpeg

#### Windows (Chocolatey)
```bash
choco install ffmpeg
```

#### macOS (Homebrew)
```bash
brew install ffmpeg
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

#### Verify Installation
```bash
ffmpeg -version
ffprobe -version
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Configure Environment
```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

---

## Running the Application

### Development Mode
```bash
npm run dev
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Production Mode
```bash
npm run build
npm start
```

---

## API Endpoints

### Health Check
```
GET /api/health
```

### Upload Video
```
POST /api/upload
Content-Type: multipart/form-data
Body: { video: File }
```

### Get Job Status
```
GET /api/jobs/:jobId
```

### Download Clip
```
GET /api/clips/:clipId/download
```

---

## Architecture

```
Browser (React)
    ↓
Node.js Backend (Express)
    ↓
FFmpeg/FFprobe (Local Video Processing)
    ↓
Google Gemini API (AI Analysis)
    ↓
Local Storage (MP4 files)
    ↓
Browser Download
```

---

## License

MIT License
