# Netlify 404 Error Fix - Complete Guide

## 🔴 Problem: "Page Not Found" on Netlify

When you visit your Netlify site, you get:
```
Page not found
Looks like you've followed a broken link or entered a URL that doesn't exist on this site.
```

**Cause:** React is a Single Page Application (SPA). Netlify doesn't know to serve `index.html` for all routes.

---

## ✅ Solution: Configure Netlify for SPA Routing

### Quick Fix (If Already Deployed)

#### Step 1: Create `netlify.toml` in Root Directory

If not already there, create this file at the root of your repository:

```toml
# netlify.toml
[build]
  command = "cd frontend && npm install && npm run build"
  publish = "frontend/dist"

# Redirect all routes to index.html for React Router
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Step 2: Push to GitHub

```bash
git add netlify.toml
git commit -m "Fix Netlify SPA routing"
git push origin main
```

#### Step 3: Redeploy on Netlify

**Option A: Automatic (Recommended)**
- Netlify will auto-detect the push and redeploy
- Wait 1-2 minutes for deployment to complete
- Check Deploys tab to see status

**Option B: Manual Trigger**
1. Go to [netlify.com](https://netlify.com)
2. Login to your site
3. Go to **Deploys** tab
4. Click **Trigger deploy** → **Deploy site**
5. Wait for completion

#### Step 4: Test

Visit your Netlify URL (e.g., `https://your-site.netlify.app`)

✅ Should now work!

---

## 📋 Complete Netlify Configuration

### Root `netlify.toml`

```toml
[build]
  # Build the frontend
  command = "cd frontend && npm install && npm run build"
  # Deploy the frontend dist folder
  publish = "frontend/dist"
  # Functions (optional, for serverless backend)
  functions = "backend/dist"

[build.environment]
  NODE_VERSION = "18"
  NODE_ENV = "production"

# ⭐ CRITICAL: SPA routing - serve index.html for all routes
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# API rewrites (if backend is on same domain)
[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url/:splat"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    # Allow requests from your backend
    Access-Control-Allow-Origin = "https://your-backend-url"

# Cache static assets
[[headers]]
  for = "/dist/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Also Create `frontend/netlify.toml`

For extra reliability:

```toml
[build]
  command = "npm run build"
  publish = "dist"

# SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🔌 Connect Backend to Netlify Frontend

### Step 1: Set Environment Variable

**In Netlify Dashboard:**

1. Go to your site
2. Settings → Environment Variables
3. Add new variable:
   ```
   VITE_API_URL = https://your-backend-url.com
   ```

**Options for backend URL:**
- **Local (testing only):** `http://localhost:5000`
- **Heroku:** `https://your-app.herokuapp.com`
- **AWS EC2:** `https://your-domain.com`
- **DigitalOcean:** `https://your-droplet-domain.com`
- **ngrok (temporary):** `https://abc123.ngrok.io`

### Step 2: Update Backend CORS

Edit `backend/src/index.ts`:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://your-site.netlify.app',  // Your Netlify URL
    'https://your-custom-domain.com', // Your custom domain (if any)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### Step 3: Verify API URL in Frontend

Your `frontend/src/config.ts` should have:

```typescript
const getAPIUrl = (): string => {
  // Development
  if (import.meta.env.DEV) {
    return 'http://localhost:5000/api';
  }

  // Production - use environment variable
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }

  // Fallback
  return `${window.location.protocol}//${window.location.hostname}:5000/api`;
};

export const API_URL = getAPIUrl();
console.log(`[Config] API URL: ${API_URL}`);
```

### Step 4: Rebuild and Redeploy

```bash
git add .
git commit -m "Configure backend URL for Netlify"
git push origin main
```

Netlify will auto-redeploy.

---

## 🧪 Troubleshooting

### Still Getting 404?

#### Check 1: Verify netlify.toml is in root

```bash
# Should show netlify.toml
ls -la | grep netlify.toml
```

If missing:
```bash
git add netlify.toml
git commit -m "Add netlify.toml"
git push
```

#### Check 2: Verify Build Settings in Netlify Dashboard

1. Site settings → Build & Deploy → Build settings
2. **Base directory:** (leave empty or use `/`)
3. **Build command:** `cd frontend && npm install && npm run build`
4. **Publish directory:** `frontend/dist`
5. Click **Save**
6. Trigger redeploy

#### Check 3: Check Build Logs

1. Netlify Dashboard → Deploys
2. Click most recent deploy
3. Scroll down to see build log
4. Look for errors like:
   - "netlify.toml not found"
   - "frontend/dist not found"
   - Build script errors

Common errors:
```
Error: Cannot find module 'react'
→ Solution: npm install in build command

Error: frontend/dist not found
→ Solution: Verify npm run build works locally

Error: Invalid redirect rule
→ Solution: Check netlify.toml syntax
```

#### Check 4: Test Redirect Rules

In browser console, visit different routes:
```
https://your-site.netlify.app/
https://your-site.netlify.app/upload
https://your-site.netlify.app/results
https://your-site.netlify.app/any-route
```

All should load the app (not 404).

---

## 🚀 Verification Checklist

- [ ] `netlify.toml` exists in repository root
- [ ] Contains redirect rule: `from = "/*"` to `to = "/index.html"`
- [ ] Build command points to frontend
- [ ] Publish directory is `frontend/dist`
- [ ] `npm run build` works locally
- [ ] Backend CORS includes your Netlify URL
- [ ] Environment variable `VITE_API_URL` is set
- [ ] Netlify shows "Deploy successful"
- [ ] All routes load (no 404 errors)
- [ ] API calls work (check Network tab in DevTools)

---

## 📝 Example netlify.toml (Complete)

```toml
# ViralClip AI - Netlify Configuration

[build]
  # Build the React frontend
  command = "cd frontend && npm install && npm run build"
  # Publish the frontend build output
  publish = "frontend/dist"
  # Node version
  environment.NODE_VERSION = "18"
  environment.NODE_ENV = "production"

# ⭐ CRITICAL: Handle SPA routing
# All routes should serve index.html
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Optional: Proxy API calls to backend
[[redirects]]
  from = "/api/*"
  to = "https://your-backend-domain.com/:splat"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    # Prevent MIME type sniffing
    X-Content-Type-Options = "nosniff"
    # Prevent clickjacking
    X-Frame-Options = "DENY"
    # Enable XSS protection
    X-XSS-Protection = "1; mode=block"
    # Referrer policy
    Referrer-Policy = "strict-origin-when-cross-origin"

# Cache control for static assets
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Longer cache for index.html but validate
[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "public, max-age=3600, must-revalidate"
```

---

## 🎯 After Fixing 404

Once routing works:

1. **Test Upload:**
   - Upload a test video
   - Check it processes

2. **Debug API Issues:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Check API requests
   - Look for CORS errors

3. **Check Logs:**
   - Netlify: Deploy logs in dashboard
   - Backend: Check your backend logs
   - Browser: Check console (F12)

---

## 💡 Pro Tips

**Automatic Deployments:**
- Every push to `main` auto-deploys
- No manual redeploy needed
- Check Deploys tab to monitor

**Preview Deployments:**
- Create a pull request
- Netlify creates preview URL
- Test before merging to main

**Rollback to Previous Version:**
- Netlify → Deploys → Pick previous
- Click "Restore"
- Instant rollback

**Environment Variables:**
- Store secrets in Netlify, not git
- Use in build: `process.env.VITE_API_URL`
- Different values per deploy context

---

## ✨ Success!

Once you see your app load without 404 errors:

```
✅ SPA routing working
✅ Page loads properly
✅ React Router handling routes
✅ Ready for production
```

Now focus on backend integration!

---

**Questions?**

1. Check Netlify docs: https://docs.netlify.com/
2. Check React Router docs: https://reactrouter.com/
3. Search GitHub issues for similar problems
4. Review build logs in Netlify dashboard
