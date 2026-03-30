# Deployment Guide - VidPull

Deploy your video downloader with frontend on Vercel and backend on Render.

---

## Overview

- **Frontend** → Vercel (free, fast CDN)
- **Backend** → Render (supports yt-dlp, file storage, long processes)

This setup gives you full functionality with free tiers.

---

## Part 1: Deploy Backend to Render

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Create Render Account
Go to [render.com](https://render.com) and sign up (free).

### Step 3: Deploy Backend
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `vidpull-backend` (or your choice)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. Click "Create Web Service"

### Step 4: Wait for Deployment
Render will build and deploy your backend. This takes 2-5 minutes.

### Step 5: Note Your Backend URL
After deployment, copy your backend URL:
```
https://vidpull-backend.onrender.com
```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Update Frontend Environment
Edit `frontend/.env.production`:
```env
VITE_API_URL=https://vidpull-backend.onrender.com/api
```

Replace with your actual Render backend URL.

### Step 2: Commit Changes
```bash
git add frontend/.env.production
git commit -m "Update API URL for production"
git push origin main
```

### Step 3: Deploy to Vercel

**Option A: Via Website (Easiest)**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Select your repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click "Deploy"

**Option B: Via CLI**
```bash
npm install -g vercel
vercel login
cd frontend
vercel --prod
```

### Step 4: Add Environment Variable
1. Go to Vercel Dashboard → Your Project → Settings
2. Click "Environment Variables"
3. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://vidpull-backend.onrender.com/api`
4. Click "Save"
5. Redeploy (Deployments → Latest → Redeploy)

---

## Configuration Files

### For Render: `backend/package.json`
Ensure you have the start script:
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

### For Vercel: `vercel.json` (optional)
Create in project root if needed:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ]
}
```

---

## Testing Your Deployment

### Test Backend (Render)
Visit: `https://your-backend.onrender.com/api/health`

Should return:
```json
{"ok": true}
```

### Test Frontend (Vercel)
1. Visit your Vercel URL
2. Try fetching video info
3. Try downloading a video
4. Check browser console for errors

---

## Important Notes

### Render Free Tier
- ⚠️ **Spins down after 15 minutes of inactivity**
- First request after sleep takes 30-60 seconds
- Upgrade to paid plan ($7/month) for always-on

### Handling Cold Starts
Add a loading message in your frontend:
```javascript
// In your API call
if (response.status === 503) {
  showMessage("Backend is waking up, please wait 30 seconds...");
}
```

### File Storage on Render
- Free tier has ephemeral storage
- Files deleted on service restart
- For persistent storage, upgrade or use external storage (S3, R2)

---

## Troubleshooting

### Backend Issues

**Build fails on Render**
- Check `backend/package.json` has all dependencies
- Verify Node version compatibility
- Check Render build logs

**yt-dlp not found**
Add to `backend/package.json`:
```json
{
  "scripts": {
    "build": "curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o yt-dlp && chmod +x yt-dlp"
  }
}
```

**Backend returns 503**
- Service is sleeping (free tier)
- Wait 30-60 seconds and retry
- Or upgrade to paid plan

### Frontend Issues

**API calls fail**
- Check `VITE_API_URL` is correct
- Verify CORS is enabled in backend
- Check browser console for errors

**Build fails on Vercel**
```bash
# Test locally first
cd frontend
npm install
npm run build
```

**Environment variable not working**
- Ensure variable name starts with `VITE_`
- Redeploy after adding variables
- Check Vercel deployment logs

---

## Update Your Deployment

### Update Backend
```bash
git add .
git commit -m "Update backend"
git push origin main
```
Render auto-deploys on push.

### Update Frontend
```bash
git add .
git commit -m "Update frontend"
git push origin main
```
Vercel auto-deploys on push.

### Manual Deploy
- **Render**: Dashboard → Manual Deploy → Deploy latest commit
- **Vercel**: Dashboard → Deployments → Redeploy

---

## Environment Variables Reference

### Backend (Render)
Add in Render Dashboard → Environment:
```
NODE_ENV=production
PORT=5000
```

### Frontend (Vercel)
Add in Vercel Dashboard → Environment Variables:
```
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## Cost Summary

### Free Tier (Both Platforms)
- **Render**: 750 hours/month, 512MB RAM
- **Vercel**: 100GB bandwidth, unlimited deployments
- **Total Cost**: $0/month

### Recommended Upgrades
- **Render Starter ($7/month)**: Always-on, no cold starts
- **Vercel Pro ($20/month)**: More bandwidth, better analytics

---

## Useful Commands

### Render
```bash
# View logs
# Go to Dashboard → Logs

# Manual deploy
# Dashboard → Manual Deploy
```

### Vercel
```bash
# Deploy
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls
```

---

## Custom Domains (Optional)

### Add Domain to Render
1. Render Dashboard → Settings → Custom Domain
2. Add your domain
3. Update DNS records (A or CNAME)

### Add Domain to Vercel
1. Vercel Dashboard → Settings → Domains
2. Add your domain
3. Update DNS records (automatic instructions)

---

## Monitoring

### Render
- Dashboard → Metrics (CPU, Memory, Response time)
- Dashboard → Logs (Real-time logs)

### Vercel
- Dashboard → Analytics (Page views, performance)
- Dashboard → Deployments → Function Logs

---

## Need Help?

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Test locally**: 
  - Backend: `cd backend && npm start`
  - Frontend: `cd frontend && npm run dev`

---

**That's it!** Your app is now live with full functionality.
```

