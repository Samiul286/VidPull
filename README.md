# VidPull - Video Downloader

Download videos from YouTube, TikTok, Instagram, and more with a beautiful React interface.

## Features

- 🎥 Multi-platform support (YouTube, TikTok, Instagram, Facebook, Twitter, etc.)
- 📊 Multiple quality options (4K, 1080p, 720p, 480p, 360p)
- 🎵 Audio-only downloads (MP3, M4A)
- 📦 Batch downloads
- 📜 Download history
- 🎨 Modern, responsive UI
- ⚡ Fast and efficient

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express.js + yt-dlp + ffmpeg

## Quick Start

### Prerequisites

- Node.js 16+
- yt-dlp
- ffmpeg

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Samiul286/VidPull.git
cd VidPull
```

2. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Download required binaries:
- [yt-dlp](https://github.com/yt-dlp/yt-dlp/releases) - Place in `backend/` folder
- [ffmpeg](https://ffmpeg.org/download.html) - Place in `backend/` folder

4. Start the application:
```bash
# Backend (from backend folder)
npm start

# Frontend (from frontend folder)
npm run dev
```

5. Open http://localhost:5173

## Deployment

See deployment guides:
- [Quick Deploy Guide](QUICK_DEPLOY.md) - 3-step deployment
- [Full Deployment Guide](DEPLOYMENT_GUIDE.md) - Complete instructions
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Step-by-step checklist


### Recommended: Frontend on Vercel + Backend on Render

This gives you full functionality with free tiers.

**Frontend → Vercel** (free, fast CDN)
**Backend → Render** (supports yt-dlp, file storage)

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## Project Structure

```
VidPull/
├── backend/          # Express.js API
│   ├── server.js     # Main server file
│   ├── temp/         # Temporary download storage
│   └── package.json
├── frontend/         # React application
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── utils.js
│   └── package.json
└── deployment guides
```

## Environment Variables

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
```

### Production (.env.production)
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/info?url=<video_url>` - Get video information
- `POST /api/download` - Download single video
- `POST /api/batch` - Batch download
- `GET /api/job/:id` - Check download status
- `GET /api/file/:id` - Download file

## Troubleshooting

### Instagram Downloads Not Working

Instagram frequently changes their API to block scrapers. If you see warnings about metadata extraction:

1. **Update yt-dlp** (without shell access):
   ```bash
   curl -X POST https://vidpull-q657.onrender.com/api/update-ytdlp
   ```
   Or visit in browser: `https://vidpull-q657.onrender.com/api/update-ytdlp`

2. **Known limitations**:
   - Private accounts require authentication
   - Stories may not be downloadable
   - Some content may be geo-restricted

3. **Alternative**: Try using the direct video URL instead of the post URL

### Other Platform Issues

If downloads fail for other platforms:
- Check if the content is public
- Verify the URL is correct
- Try updating yt-dlp (see above)
- Check [yt-dlp supported sites](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Video download engine
- [ffmpeg](https://ffmpeg.org/) - Media processing
- [React](https://react.dev/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
