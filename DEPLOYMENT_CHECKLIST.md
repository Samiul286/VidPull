# Deployment Checklist

Frontend → Vercel | Backend → Render

---

## Backend (Render)

- [ ] Push code to GitHub
- [ ] Create Render account
- [ ] New Web Service → Connect repo
- [ ] Set root directory: `backend`
- [ ] Build: `npm install`
- [ ] Start: `npm start`
- [ ] Deploy and copy URL

---

## Frontend (Vercel)

- [ ] Update `frontend/.env.production` with Render URL
- [ ] Commit and push changes
- [ ] Create Vercel account
- [ ] Import project
- [ ] Set root directory: `frontend`
- [ ] Add env var: `VITE_API_URL`
- [ ] Deploy

---

## Test

- [ ] Visit Vercel URL
- [ ] Test video info fetch
- [ ] Test download
- [ ] Check console (no errors)
- [ ] Test on mobile

---

## If Issues

**Backend**
- [ ] Check Render logs
- [ ] Verify `package.json` has start script
- [ ] Wait 60s if service sleeping

**Frontend**
- [ ] Check `VITE_API_URL` is correct
- [ ] Verify env var in Vercel settings
- [ ] Check browser console

---

## Notes

⚠️ Render free tier sleeps after 15 min (first request slow)
✅ Full functionality works (downloads, storage, etc.)
💰 Free tier: $0/month for both platforms

---

Done!
