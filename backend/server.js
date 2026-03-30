import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execAsync = promisify(exec);

// Resolve yt-dlp binary — use local .exe on Windows, otherwise use downloaded/system binary
const isWindows = process.platform === 'win32';
const localYtDlpExe = path.join(__dirname, 'yt-dlp.exe');
const localYtDlp = path.join(__dirname, 'yt-dlp');

let YT_DLP_BIN;
if (isWindows && fs.existsSync(localYtDlpExe)) {
  YT_DLP_BIN = localYtDlpExe;
  console.log('✓ Found yt-dlp.exe (Windows)');
} else if (fs.existsSync(localYtDlp)) {
  YT_DLP_BIN = localYtDlp;
  console.log('✓ Found yt-dlp (Linux/Mac)');
} else {
  YT_DLP_BIN = 'yt-dlp';
  console.log('⚠ Using system yt-dlp (not found locally)');
}

const YT_DLP = isWindows && fs.existsSync(localYtDlpExe) ? `"${localYtDlpExe}"` : YT_DLP_BIN;
console.log('yt-dlp binary path:', YT_DLP_BIN);

// Resolve ffmpeg — check common Windows locations, otherwise use system binary
function findFfmpeg() {
  if (isWindows) {
    const candidates = [
      path.join(__dirname, 'ffmpeg.exe'),
      'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
      path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Links', 'ffmpeg.exe'),
    ];
    for (const p of candidates) {
      try { if (fs.existsSync(p)) return path.dirname(p); } catch {}
    }
  }
  // Try PATH (works on Linux/Mac and Windows if in PATH)
  try { execAsync('ffmpeg -version'); return null; } catch { return undefined; }
}
const FFMPEG_LOCATION = findFfmpeg();
console.log('ffmpeg location:', FFMPEG_LOCATION ?? 'using PATH / not found');

// Build base yt-dlp args array, injecting --ffmpeg-location if known
function baseArgs(extra = []) {
  const args = ['--no-playlist'];
  if (FFMPEG_LOCATION) args.push('--ffmpeg-location', FFMPEG_LOCATION);
  return [...args, ...extra];
}

// Smart format selector: prefer merged mp4, fallback to best pre-merged
function videoFormatId(quality) {
  const h = { '4K': 2160, '1080p': 1080, '720p': 720, '480p': 480, '360p': 360 }[quality] || 720;
  // With ffmpeg: merge best video+audio; without: use pre-merged best
  return `bestvideo[height<=${h}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${h}]+bestaudio/best[height<=${h}]/best`;
}

const app = express();
const PORT = 5000;

// Temp dir for downloads
const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Rate limiting — 10 downloads per IP per hour
const downloadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Rate limit exceeded. Max 10 downloads per hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// In-memory job store
const jobs = new Map();

// Purge temp files older than 1 hour
function purgeOldFiles() {
  const now = Date.now();
  fs.readdir(TEMP_DIR, (err, files) => {
    if (err) return;
    files.forEach(file => {
      const filePath = path.join(TEMP_DIR, file);
      fs.stat(filePath, (err2, stats) => {
        if (err2) return;
        if (now - stats.mtimeMs > 60 * 60 * 1000) {
          fs.unlink(filePath, () => {});
        }
      });
    });
  });
}
setInterval(purgeOldFiles, 15 * 60 * 1000);

// Platform detection
function detectPlatform(url) {
  const map = [
    { pattern: /youtube\.com|youtu\.be/, name: 'YouTube', color: '#FF0000' },
    { pattern: /tiktok\.com/, name: 'TikTok', color: '#00f2ea' },
    { pattern: /instagram\.com/, name: 'Instagram', color: '#E1306C' },
    { pattern: /facebook\.com|fb\.watch/, name: 'Facebook', color: '#1877F2' },
    { pattern: /twitter\.com|x\.com/, name: 'X/Twitter', color: '#1DA1F2' },
    { pattern: /twitch\.tv/, name: 'Twitch', color: '#9146FF' },
    { pattern: /reddit\.com/, name: 'Reddit', color: '#FF4500' },
    { pattern: /linkedin\.com/, name: 'LinkedIn', color: '#0A66C2' },
    { pattern: /pinterest\.com/, name: 'Pinterest', color: '#E60023' },
  ];
  for (const p of map) {
    if (p.pattern.test(url)) return { name: p.name, color: p.color };
  }
  return { name: 'Unknown', color: '#6b7280' };
}

// Check if yt-dlp is available
async function checkYtDlp() {
  try {
    const result = await execAsync(`${YT_DLP_BIN} --version`);
    console.log('✓ yt-dlp version:', result.stdout.trim());
    return true;
  } catch (err) {
    console.error('✗ yt-dlp check failed:', err.message);
    return false;
  }
}

// GET /api/info?url=...
app.get('/api/info', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const ytDlpAvailable = await checkYtDlp();
  if (!ytDlpAvailable) {
    // Return mock data for demo when yt-dlp not installed
    const platform = detectPlatform(url);
    return res.json({
      title: 'Demo Video (Install yt-dlp for real downloads)',
      thumbnail: `https://picsum.photos/seed/${Math.abs(url.length * 7)}/480/270`,
      duration: 185,
      platform,
      formats: [
        { formatId: 'bestvideo[height<=2160]+bestaudio', quality: '4K', ext: 'mp4', filesize: null, vcodec: 'vp9', label: '4K Ultra HD' },
        { formatId: 'bestvideo[height<=1080]+bestaudio', quality: '1080p', ext: 'mp4', filesize: null, vcodec: 'avc1', label: '1080p Full HD' },
        { formatId: 'bestvideo[height<=720]+bestaudio', quality: '720p', ext: 'mp4', filesize: null, vcodec: 'avc1', label: '720p HD' },
        { formatId: 'bestvideo[height<=480]+bestaudio', quality: '480p', ext: 'mp4', filesize: null, vcodec: 'avc1', label: '480p' },
        { formatId: 'bestvideo[height<=360]+bestaudio', quality: '360p', ext: 'mp4', filesize: null, vcodec: 'avc1', label: '360p' },
        { formatId: 'bestaudio/best', quality: 'MP3', ext: 'mp3', filesize: null, vcodec: 'none', label: 'Audio Only (MP3)' },
        { formatId: 'bestaudio/best', quality: 'M4A', ext: 'm4a', filesize: null, vcodec: 'none', label: 'Audio Only (M4A)' },
      ],
      demo: true,
    });
  }

  try {
    let stdout = '', stderr = '';
    try {
      const result = await execAsync(
        `${YT_DLP} --dump-json --no-playlist "${url}"`,
        { timeout: 60000, maxBuffer: 10 * 1024 * 1024 }
      );
      stdout = result.stdout || '';
      stderr = result.stderr || '';
    } catch (execErr) {
      // execAsync rejects on non-zero exit; grab whatever stdout was produced
      stdout = execErr.stdout || '';
      stderr = execErr.stderr || '';
    }

    if (!stdout.trim()) {
      const msg = stderr.slice(0, 300) || 'yt-dlp returned no output. Check the URL is valid and publicly accessible.';
      return res.status(400).json({ error: msg });
    }

    let info;
    try {
      info = JSON.parse(stdout.trim());
    } catch {
      return res.status(500).json({ error: 'Could not parse video info. The URL may be invalid or geo-restricted.' });
    }

    const platform = detectPlatform(url);

    // Build format list
    const qualityMap = ['4K', '1080p', '720p', '480p', '360p'];
    const heightMap = { '4K': 2160, '1080p': 1080, '720p': 720, '480p': 480, '360p': 360 };

    const formats = qualityMap.map(q => ({
      formatId: `bestvideo[height<=${heightMap[q]}]+bestaudio/best`,
      quality: q,
      ext: 'mp4',
      filesize: null,
      label: q === '4K' ? '4K Ultra HD' : q === '1080p' ? '1080p Full HD' : q + ' HD',
    })).concat([
      { formatId: 'bestaudio/best', quality: 'MP3', ext: 'mp3', label: 'Audio Only (MP3)' },
      { formatId: 'bestaudio/best', quality: 'M4A', ext: 'm4a', label: 'Audio Only (M4A)' },
    ]);

    res.json({
      title: info.title || 'Untitled',
      thumbnail: info.thumbnail || '',
      duration: info.duration || 0,
      platform,
      formats,
      uploader: info.uploader || info.channel || '',
      viewCount: info.view_count || 0,
    });
  } catch (err) {
    console.error('[/api/info] unexpected error:', err.message);
    res.status(500).json({ error: 'Failed to fetch video info. Check that the URL is valid and publicly accessible.' });
  }
});


// POST /api/download — single download
app.post('/api/download', downloadLimiter, async (req, res) => {
  const { url, formatId, quality, ext } = req.body;
  if (!url || (!formatId && !quality)) return res.status(400).json({ error: 'url and quality are required' });

  const jobId = uuidv4();
  const outputTemplate = path.join(TEMP_DIR, `${jobId}.%(ext)s`);

  jobs.set(jobId, { status: 'processing', progress: 0, url, quality, ext, jobId });

  const ytDlpAvailable = await checkYtDlp();
  if (!ytDlpAvailable) {
    // Demo mode — simulate download after 3s
    setTimeout(() => {
      jobs.set(jobId, { ...jobs.get(jobId), status: 'done', progress: 100, downloadUrl: null, demo: true });
    }, 3000);
    return res.json({ jobId });
  }

  const isAudio = ext === 'mp3' || ext === 'm4a';
  const fmtId = formatId || (isAudio ? 'bestaudio/best' : videoFormatId(quality || '720p'));
  let args = baseArgs(['-f', fmtId, '-o', outputTemplate]);
  if (isAudio) {
    args = [...args, '--extract-audio', '--audio-format', ext, '--audio-quality', '0'];
  } else {
    args = [...args, '--merge-output-format', 'mp4'];
  }
  args.push('--newline'); // one progress line per update
  args.push(url);

  const proc = spawn(YT_DLP_BIN, args);
  let outputFile = null;

  proc.stdout.on('data', (data) => {
    const text = data.toString();
    const pMatch = text.match(/(\d+\.?\d*)%/);
    if (pMatch) {
      const pct = parseFloat(pMatch[1]);
      const job = jobs.get(jobId);
      if (job) jobs.set(jobId, { ...job, progress: pct });
    }
    const destMatch = text.match(/\[download\] Destination: (.+)/);
    if (destMatch) outputFile = destMatch[1].trim();
    const mergeMatch = text.match(/\[Merger\] Merging formats into "(.+)"/);
    if (mergeMatch) outputFile = mergeMatch[1].trim();
  });

  proc.stderr.on('data', (data) => {
    const text = data.toString();
    const destMatch = text.match(/\[download\] Destination: (.+)/);
    if (destMatch) outputFile = destMatch[1].trim();
  });

  proc.on('close', (code) => {
    if (code === 0) {
      // Find the output file
      const files = fs.readdirSync(TEMP_DIR).filter(f => f.startsWith(jobId));
      const file = files[0];
      if (file) {
        jobs.set(jobId, {
          ...jobs.get(jobId),
          status: 'done',
          progress: 100,
          fileName: file,
          downloadUrl: `/api/file/${jobId}`,
        });
      } else {
        jobs.set(jobId, { ...jobs.get(jobId), status: 'error', error: 'Output file not found' });
      }
    } else {
      jobs.set(jobId, { ...jobs.get(jobId), status: 'error', error: 'Download failed' });
    }
  });

  res.json({ jobId });
});

// GET /api/job/:id — poll job status
app.get('/api/job/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

// GET /api/file/:id — serve the file
app.get('/api/file/:id', (req, res) => {
  const jobId = req.params.id;
  const files = fs.readdirSync(TEMP_DIR).filter(f => f.startsWith(jobId));
  if (!files.length) return res.status(404).json({ error: 'File not found' });

  const filePath = path.join(TEMP_DIR, files[0]);
  res.download(filePath, files[0], (err) => {
    if (!err) {
      // Delete after download
      setTimeout(() => fs.unlink(filePath, () => {}), 5000);
    }
  });
});

// POST /api/batch — queue multiple URLs
app.post('/api/batch', downloadLimiter, async (req, res) => {
  const { items } = req.body; // [{url, formatId, quality, ext}]
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items array is required' });
  }
  if (items.length > 10) {
    return res.status(400).json({ error: 'Maximum 10 URLs per batch' });
  }

  const batchId = uuidv4();
  const jobIds = items.map(() => uuidv4());

  items.forEach((item, i) => {
    jobs.set(jobIds[i], {
      status: 'pending',
      progress: 0,
      url: item.url,
      quality: item.quality,
      ext: item.ext || 'mp4',
      jobId: jobIds[i],
      batchId,
    });
  });

  // Process sequentially
  (async () => {
    for (let i = 0; i < items.length; i++) {
      const jobId = jobIds[i];
      const item = items[i];
      jobs.set(jobId, { ...jobs.get(jobId), status: 'processing' });

      const ytDlpAvailable = await checkYtDlp();
      if (!ytDlpAvailable) {
        await new Promise(r => setTimeout(r, 2000));
        jobs.set(jobId, { ...jobs.get(jobId), status: 'done', progress: 100, demo: true });
        continue;
      }

      await new Promise((resolve) => {
        const outputTemplate = path.join(TEMP_DIR, `${jobId}.%(ext)s`);
        const isAudio = item.ext === 'mp3' || item.ext === 'm4a';
        const fmtId = isAudio ? 'bestaudio/best' : videoFormatId(item.quality || '720p');
        let args = baseArgs(['-f', fmtId, '-o', outputTemplate]);
        if (isAudio) args = [...args, '--extract-audio', '--audio-format', item.ext, '--audio-quality', '0'];
        else args = [...args, '--merge-output-format', 'mp4'];
        args.push('--newline');
        args.push(item.url);

        const proc = spawn(YT_DLP_BIN, args);
        proc.stdout.on('data', (data) => {
          const pMatch = data.toString().match(/(\d+\.?\d*)%/);
          if (pMatch) jobs.set(jobId, { ...jobs.get(jobId), progress: parseFloat(pMatch[1]) });
        });
        proc.on('close', (code) => {
          if (code === 0) {
            const files = fs.readdirSync(TEMP_DIR).filter(f => f.startsWith(jobId));
            jobs.set(jobId, {
              ...jobs.get(jobId),
              status: 'done',
              progress: 100,
              fileName: files[0],
              downloadUrl: files[0] ? `/api/file/${jobId}` : null,
            });
          } else {
            jobs.set(jobId, { ...jobs.get(jobId), status: 'error', error: 'Download failed' });
          }
          resolve();
        });
      });
    }
  })();

  res.json({ batchId, jobIds });
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Update yt-dlp endpoint (for free tier without shell access)
app.post('/api/update-ytdlp', async (req, res) => {
  try {
    console.log('Updating yt-dlp...');
    const ytdlpPath = path.join(__dirname, 'yt-dlp');
    
    // Remove old binary
    if (fs.existsSync(ytdlpPath)) {
      fs.unlinkSync(ytdlpPath);
    }
    
    // Download latest
    await execAsync('curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o yt-dlp && chmod +x yt-dlp', {
      cwd: __dirname
    });
    
    // Verify it works
    const result = await execAsync(`${ytdlpPath} --version`);
    const version = result.stdout.trim();
    
    console.log(`✓ yt-dlp updated to version: ${version}`);
    res.json({ success: true, version, message: 'yt-dlp updated successfully' });
  } catch (err) {
    console.error('Failed to update yt-dlp:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Global error handler — ensures JSON is always returned
app.use((err, req, res, _next) => {
  console.error('[global error]', err.message);
  if (!res.headersSent) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.listen(PORT, async () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log('Checking yt-dlp availability...');
  const available = await checkYtDlp();
  if (available) {
    console.log('✓ yt-dlp is ready for downloads');
  } else {
    console.log('⚠ WARNING: yt-dlp not found - running in demo mode');
    console.log('  To fix: Run "npm run build" or install yt-dlp manually');
  }
});

// Prevent uncaught rejections from killing the process silently
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});
