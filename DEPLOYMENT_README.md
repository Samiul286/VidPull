# VidPull Deployment

## Architecture

```
Frontend (Vercel)  →  Backend (Render)
   React/Vite           Express + yt-dlp
```

---

## Why This Setup?

✅ **Frontend on Vercel**
- Free hosting
- Global CDN (fast worldwide)
- Auto SSL
- Auto deployments from GitHub

✅ **Backend on Render**
- Supports yt-dlp and ffmpeg
- File storage works
- No timeout issues
- Long-running processes OK

---

## Quick Start

### 1. Deploy Backend First
```
render.com → New Web Service → Connect GitHub
Root: backend
Build: npm install
Start: npm start
```

### 2. Deploy Frontend
```
vercel.com → Import Project
Root: frontend
Add env: VITE_API_URL=https://your-backend.onrender.com/api
```

### 3. Done!
Both platforms auto-deploy on git push.

---

## Files You Need

### `frontend/.env.production`
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

### `backend/package.json`
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

### `vercel.json` (already created)
Configures Vercel to build from frontend folder.

---

## Costs

- **Render Free**: 750 hours/month (enough for 1 service)
- **Vercel Free**: 100GB bandwidth/month
- **Total**: $0/month

### Upgrades (Optional)
- **Render Starter**: $7/month (no sleep, faster)
- **Vercel Pro**: $20/month (more bandwidth)

---

## Common Issues

### Backend sleeps (Render free tier)
- Wakes up in 30-60 seconds on first request
- Upgrade to $7/month for always-on

### CORS errors
- Check backend has `cors` enabled
- Verify `VITE_API_URL` is correct

### Build fails
- Run `npm install` locally first
- Check logs in platform dashboard

---

## Monitoring

### Render
- Dashboard → Logs (real-time)
- Dashboard → Metrics (CPU, memory)

### Vercel
- Dashboard → Analytics
- Dashboard → Deployments → Logs

---

## Updates

Push to GitHub - both auto-deploy:
```bash
git add .
git commit -m "Update"
git push origin main
```

---

## Support

- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- See DEPLOYMENT_GUIDE.md for detailed instructions
