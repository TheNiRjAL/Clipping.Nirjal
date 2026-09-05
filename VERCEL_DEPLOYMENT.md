# Deploy ViralClip AI to Vercel + Backend on Separate Service

## 🚀 Vercel Deployment Guide

Vercel is perfect for the React frontend, but the backend requires special handling due to FFmpeg dependencies.

---

## Architecture: Vercel + External Backend

```
Vercel (Frontend Only)
    │
    │ HTTP Requests
    ↓
    |
External Backend Server
(Local Machine, AWS, DigitalOcean, etc.)
    │
    │ FFmpeg, Gemini API, File Storage
    ↓
```

---

## Part 1: Prepare Frontend for Vercel

### Step 1: Create `vercel.json`

Create `frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "@vite-api-url"
  }
}
```

### Step 2: Update Frontend Config

Create `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend-api.com
# Or use Vercel environment variable: https://your-api-domain.vercel.app
```

Update `frontend/src/config.ts`:

```typescript
const getAPIUrl = (): string => {
  // Check for environment variable first (Vercel)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Development
  if (import.meta.env.DEV) {
    return 'http://localhost:5000/api';
  }

  // Production: use same domain + port
  return `${window.location.protocol}//${window.location.hostname}:5000/api`;
};

export const API_URL = getAPIUrl();
```

Update `frontend/src/api/client.ts`:

```typescript
import axios from 'axios';
import { API_URL } from '../config';

const API = axios.create({
  baseURL: API_URL,
});

export const uploadVideo = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('video', file);
  const response = await API.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ... rest of client code
```

### Step 3: Update CORS in Backend

Edit `backend/src/index.ts`:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://your-vercel-app.vercel.app',
    'https://your-custom-domain.com',
    // Add your Vercel URL here
  ],
  credentials: true
}));
```

### Step 4: Push to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Sign Up on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

### Step 2: Import Project

1. Click **Add New Project**
2. Select your `Clipping.Nirjal` repository
3. Choose to import

### Step 3: Configure Build

**Framework:** Select "Other" or leave blank (no framework selection needed)

**Build Command:**
```bash
cd frontend && npm run build
```

**Output Directory:**
```
frontend/dist
```

**Install Command:**
```bash
npm install && cd frontend && npm install
```

### Step 4: Set Environment Variables

In Vercel Project Settings → Environment Variables:

```
VITE_API_URL = https://your-backend-domain.com
```

Options:
- **Local machine:** `http://YOUR_IP:5000` (only works on same network)
- **ngrok:** `https://abc123.ngrok.io`
- **AWS EC2:** `https://your-ec2-domain.com`
- **DigitalOcean:** `https://your-droplet-domain.com`
- **Heroku:** `https://your-app.herokuapp.com`

### Step 5: Deploy

Click **Deploy**. Vercel will:
1. Build the frontend
2. Deploy to CDN
3. Provide URL like: `https://clipping-nirjal.vercel.app`

✅ **Frontend is now live!**

---

## Part 3: Deploy Backend Separately

### Option A: Heroku (Free with limitations)

#### Step 1: Install Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
chocolatey install heroku-cli

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

#### Step 2: Create Heroku App

```bash
heroku login
heroku create clipping-nirjal-backend
```

#### Step 3: Add Buildpacks

```bash
heroku buildpacks:add heroku/nodejs -a clipping-nirjal-backend
heroku buildpacks:add https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git -a clipping-nirjal-backend
```

#### Step 4: Set Environment Variables

```bash
heroku config:set GEMINI_API_KEY=your_api_key -a clipping-nirjal-backend
heroku config:set BACKEND_PORT=5000 -a clipping-nirjal-backend
```

#### Step 5: Create `Procfile` in backend root

```
web: node dist/index.js
```

#### Step 6: Deploy

```bash
cd backend
heroku git:remote -a clipping-nirjal-backend
cd ..
git push heroku main
```

✅ Backend URL: `https://clipping-nirjal-backend.herokuapp.com`

#### Step 7: Update Vercel Environment Variable

In Vercel Dashboard:
```
VITE_API_URL = https://clipping-nirjal-backend.herokuapp.com
```

Trigger redeploy in Vercel.

---

### Option B: AWS EC2 (Better Performance)

#### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2
2. Launch instance:
   - **AMI:** Ubuntu 22.04 LTS
   - **Instance Type:** t2.micro (free tier) or t3.small
   - **Storage:** 30GB+ SSD
3. Configure security group:
   - Allow port 22 (SSH)
   - Allow port 5000 (Backend)
   - Allow port 80, 443 (HTTPS)
4. Create/download key pair
5. Launch

#### Step 2: Connect and Setup

```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install FFmpeg
sudo apt install -y ffmpeg

# Verify installations
node --version
ffmpeg -version
```

#### Step 3: Clone and Setup Backend

```bash
# Clone repository
git clone https://github.com/TheNiRjAL/Clipping.Nirjal.git
cd Clipping.Nirjal/backend

# Install dependencies
npm install

# Build
npm run build

# Configure environment
cp .env.example .env
# Edit .env with your Gemini API key
sudo nano .env
```

#### Step 4: Setup PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'viralclip-backend',
    script: './dist/index.js',
    env: {
      NODE_ENV: 'production',
      BACKEND_PORT: 5000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Verify it's running
pm2 status
```

#### Step 5: Setup Nginx Reverse Proxy (Optional but Recommended)

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx config
sudo tee /etc/nginx/sites-available/viralclip << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/viralclip /etc/nginx/sites-enabled/viralclip

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### Step 6: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

#### Step 7: Get Your Backend URL

- **IP-based:** `http://your-ec2-ip:5000`
- **Domain-based:** `https://your-domain.com` (if you set up domain)

#### Step 8: Update Vercel

In Vercel Dashboard, update environment variable:
```
VITE_API_URL = https://your-domain.com
# or
VITE_API_URL = http://your-ec2-ip:5000
```

Trigger redeploy.

---

### Option C: DigitalOcean (Similar to AWS)

#### Step 1: Create Droplet

1. Go to DigitalOcean.com
2. Create Droplet:
   - **OS:** Ubuntu 22.04
   - **Size:** $6/month (basic)
   - **Region:** Closest to you
3. Add SSH key
4. Create

#### Step 2: Follow AWS EC2 setup steps 2-8 above

The process is identical.

---

## Complete Setup Summary

### URLs After Deployment

```
Frontend (Vercel):  https://clipping-nirjal.vercel.app
Backend (Heroku):   https://clipping-nirjal-backend.herokuapp.com
Backend (AWS):      https://your-domain.com
```

### Environment Variables

**In Vercel:**
```
VITE_API_URL = https://clipping-nirjal-backend.herokuapp.com
```

**In Backend (Heroku/AWS):**
```
GEMINI_API_KEY = your_api_key
BACKEND_PORT = 5000
```

### Architecture Diagram

```
    User's Browser
          │
          ↓
    https://clipping-nirjal.vercel.app
    (React Frontend - Vercel CDN)
          │
          │ API Requests
          ↓
    https://clipping-nirjal-backend.herokuapp.com
    (Node.js Backend - Heroku/AWS)
          │
          │ Local Processing
          ↓
    ┌──────────────────────┐
    │ FFmpeg (video render)│
    │ Gemini AI (analysis) │
    │ File Storage         │
    └──────────────────────┘
```

---

## 📄 Summary: Vercel vs Other Options

| Platform | Cost | Setup Time | Performance | Notes |
|----------|------|-----------|-------------|-------|
| **Vercel (Frontend)** | Free | 5 min | Excellent | CDN, Global |
| **Heroku (Backend)** | Free (limited) | 10 min | Good | Easy deployment, rate limits |
| **AWS EC2** | $5-10/mo | 30 min | Excellent | Most control, scalable |
| **DigitalOcean** | $6+/mo | 30 min | Excellent | Simpler than AWS |
| **Localhost + Vercel** | Free | 2 min | Poor | Only accessible on same network |

---

## 🔌 Troubleshooting Vercel + Backend

### "Failed to fetch from API"

1. Check backend is running:
   ```bash
   curl https://your-backend-url/api/health
   ```

2. Verify CORS is configured:
   - Backend must allow Vercel domain
   - Check `backend/src/index.ts` CORS config

3. Check environment variable:
   - Vercel → Project Settings → Environment Variables
   - Verify `VITE_API_URL` is correct
   - Redeploy after changing

### "CORS error"

In `backend/src/index.ts`, update:
```typescript
app.use(cors({
  origin: '*', // Or specific domains
  credentials: true
}));
```

### "Backend not responding"

```bash
# Heroku
heroku logs --tail -a clipping-nirjal-backend

# AWS EC2
pm2 logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🎉 You're Live!

Once deployed:

1. Visit: `https://your-vercel-app.vercel.app`
2. Upload a video
3. Watch it process
4. Download your clips

All from the internet! 🚀

---

## Next Steps

1. **Custom Domain:**
   - Vercel: Settings → Domains → Add custom domain
   - Backend: Point domain to EC2/DigitalOcean IP

2. **Monitoring:**
   - Vercel Analytics
   - Heroku/AWS CloudWatch
   - PM2 monitoring

3. **Scaling:**
   - Increase EC2/DigitalOcean instance size
   - Add more concurrent renders
   - Use S3 for file storage instead of local

4. **Production Hardening:**
   - Add authentication
   - Rate limiting
   - File size limits
   - Queue system for jobs
   - Database for job tracking

---

Happy deploying! 🚀🌟
