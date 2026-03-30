# Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                 │
│                    (Web Browser)                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS
                     │
         ┌───────────▼──────────────┐
         │                          │
         │   VERCEL (Frontend)      │
         │   ─────────────────      │
         │   • React + Vite         │
         │   • Static Files         │
         │   • Global CDN           │
         │   • Auto SSL             │
         │                          │
         └───────────┬──────────────┘
                     │
                     │ API Calls
                     │ (VITE_API_URL)
                     │
         ┌───────────▼──────────────┐
         │                          │
         │   RENDER (Backend)       │
         │   ────────────────       │
         │   • Express.js           │
         │   • yt-dlp               │
         │   • ffmpeg               │
         │   • File Storage         │
         │   • Long Processes       │
         │                          │
         └───────────┬──────────────┘
                     │
                     │ Downloads
                     │
         ┌───────────▼──────────────┐
         │                          │
         │   VIDEO PLATFORMS        │
         │   ───────────────        │
         │   • YouTube              │
         │   • TikTok               │
         │   • Instagram            │
         │   • etc.                 │
         │                          │
         └──────────────────────────┘
```

---

## Data Flow

### 1. User Visits Site
```
User → Vercel CDN → React App Loads
```

### 2. User Enters Video URL
```
React App → Render API → /api/info
Render → yt-dlp → Video Platform
Video Platform → yt-dlp → Render
Render → React App → Display Info
```

### 3. User Downloads Video
```
React App → Render API → /api/download
Render → yt-dlp → Download Video
Video saved to Render temp storage
Render → React App → Download Link
User clicks → File downloads
```

---

## Why Split Architecture?

### Vercel (Frontend)
✅ Optimized for static sites
✅ Global CDN = fast worldwide
✅ Free SSL certificates
✅ Automatic deployments
❌ Can't run yt-dlp (serverless)
❌ 10-second timeout
❌ No persistent storage

### Render (Backend)
✅ Full Node.js environment
✅ Can install yt-dlp, ffmpeg
✅ Persistent storage
✅ No timeout limits
✅ Long-running processes
✅ Free tier available

---

## Environment Variables

### Frontend (Vercel)
```
VITE_API_URL → Points to Render backend
```

### Backend (Render)
```
NODE_ENV=production
PORT=5000 (auto-set by Render)
```

---

## Deployment Flow

```
Developer
    ↓
  git push
    ↓
  GitHub
    ↓
    ├─→ Vercel (watches repo)
    │   └─→ Builds frontend
    │       └─→ Deploys to CDN
    │
    └─→ Render (watches repo)
        └─→ Builds backend
            └─→ Starts server
```

Both platforms auto-deploy on push!

---

## Request Flow Example

```
1. User enters: https://youtube.com/watch?v=abc123

2. Frontend sends:
   POST https://your-backend.onrender.com/api/info
   Body: { url: "https://youtube.com/watch?v=abc123" }

3. Backend executes:
   yt-dlp --dump-json "https://youtube.com/watch?v=abc123"

4. Backend returns:
   {
     title: "Video Title",
     thumbnail: "https://...",
     formats: [...]
   }

5. Frontend displays video info

6. User clicks download

7. Frontend sends:
   POST https://your-backend.onrender.com/api/download
   Body: { url: "...", quality: "720p" }

8. Backend downloads video with yt-dlp

9. Backend returns download link

10. User downloads file
```

---

## Scaling

### Current Setup (Free Tier)
- **Users**: ~1,000/month
- **Bandwidth**: 100GB (Vercel)
- **Backend**: 750 hours (Render)

### Need More?
- **Vercel Pro**: $20/month → 1TB bandwidth
- **Render Starter**: $7/month → Always-on, faster
- **Render Standard**: $25/month → More resources

---

## Security

```
User → Vercel (HTTPS) → Render (HTTPS) → Video Platform
  ✓        ✓                ✓                ✓
```

- All connections encrypted
- CORS configured
- Rate limiting enabled
- No API keys exposed
