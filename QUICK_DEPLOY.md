# Quick Deploy Guide

## Frontend → Vercel | Backend → Render

---

## Step 1: Deploy Backend (Render)

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect GitHub and select your repo
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click "Create Web Service"
6. Copy your backend URL: `https://your-app.onrender.com`

---

## Step 2: Deploy Frontend (Vercel)

1. Update `frontend/.env.production`:
```env
VITE_API_URL=https://your-app.onrender.com/api
```

2. Commit and push:
```bash
git add .
git commit -m "Update API URL"
git push
```

3. Go to [vercel.com/new](https://vercel.com/new)
4. Import your repository
5. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: Vite
6. Add environment variable:
   - `VITE_API_URL` = `https://your-app.onrender.com/api`
7. Click "Deploy"

---

## Done!

Visit your Vercel URL and test the app.

---

## Important Notes

⚠️ **Render free tier sleeps after 15 minutes**
- First request takes 30-60 seconds to wake up
- Upgrade to $7/month for always-on

✅ **This setup gives you full functionality:**
- Video downloads work
- File storage works
- No timeout issues

---

## Troubleshooting

**Backend sleeping?** Wait 60 seconds and retry.

**API 404?** Check `VITE_API_URL` matches your Render URL.

**Build fails?** Run `npm install` in both folders locally first.

---

## Update Deployment

Push to GitHub - both platforms auto-deploy:
```bash
git add .
git commit -m "Update"
git push
```
