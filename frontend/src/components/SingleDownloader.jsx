import { useState, useRef } from 'react';
import VideoInfo from './VideoInfo';
import QualitySelector from './QualitySelector';
import DownloadProgress from './DownloadProgress';
import { saveToHistory } from '../utils';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function SingleDownloader() {
  const [url, setUrl] = useState('');
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [job, setJob] = useState(null);
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  async function fetchInfo() {
    if (!url.trim()) return;
    setLoading(true); setError(''); setInfo(null); setJob(null);
    try {
      const res = await fetch(`${API_URL}/info?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setInfo(data);
      const def = data.formats?.find(f => f.quality === '720p') || data.formats?.[2] || data.formats?.[0];
      if (def) setSelectedQuality({ quality: def.quality, ext: def.ext });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function startDownload() {
    if (!info || !selectedQuality) return;
    setJob({ status: 'processing', progress: 0 });
    try {
      const res = await fetch(`${API_URL}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, quality: selectedQuality.quality, ext: selectedQuality.ext }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      pollJob(data.jobId);
    } catch (e) {
      setJob({ status: 'error', error: e.message });
    }
  }

  function pollJob(jobId) {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/job/${jobId}`);
        const data = await res.json();
        setJob({ ...data, jobId });
        if (data.status === 'done' || data.status === 'error') {
          clearInterval(pollRef.current);
          if (data.status === 'done' && info) {
            saveToHistory({ title: info.title, thumbnail: info.thumbnail, platform: info.platform, quality: selectedQuality?.quality, ext: selectedQuality?.ext, downloadUrl: data.downloadUrl });
          }
        }
      } catch {}
    }, 1500);
  }

  function handleSave() {
    if (job?.downloadUrl) window.open(`${API_URL.replace('/api', '')}${job.downloadUrl}`, '_blank');
  }

  function handleReset() {
    setJob(null); setInfo(null); setUrl(''); setSelectedQuality(null); setError('');
  }

  return (
    <div>
      {/* URL Input */}
      <div className="card">
        <div className="card-label">🔗 Video URL</div>
        <div className="url-row">
          {/* Input wrapper with inline Paste/Clear button */}
          <div className="url-input-wrap">
            <input
              id="url-input"
              className="url-input"
              type="text"
              placeholder="Paste a YouTube, TikTok, Instagram link…"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchInfo()}
            />
            <button
              className={`inline-paste-btn ${url ? 'is-clear' : ''}`}
              title={url ? 'Clear' : 'Paste from clipboard'}
              onClick={async () => {
                if (url) {
                  setUrl('');
                  setInfo(null);
                  setJob(null);
                  setError('');
                } else {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text.trim()) setUrl(text.trim());
                  } catch {
                    // Clipboard permission denied — silent fail
                  }
                }
              }}
            >
              {url ? '✕' : '📋 Paste'}
            </button>
          </div>

          <button id="fetch-btn" className="btn-primary" onClick={fetchInfo} disabled={loading || !url.trim()}>
            {loading ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="spin">
                <circle cx="12" cy="12" r="10" strokeWidth="3" strokeOpacity="0.3" />
                <path strokeWidth="3" strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            ) : '⬇ Download'}
          </button>
        </div>
        {error && (
          <div className="info-box" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
            ⚠ {error}
          </div>
        )}
      </div>

      {/* Video Info */}
      {info && (
        <div className="card">
          <div className="card-label">📹 Video Info</div>
          <VideoInfo info={info} />
        </div>
      )}

      {/* Quality Selector */}
      {info && !job && (
        <div className="card">
          <div className="card-label">🎚 Select Quality / Format</div>
          <QualitySelector
            selected={selectedQuality}
            onSelect={q => setSelectedQuality(q)}
          />
          <button
            id="download-btn"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '1rem', fontSize: '1rem' }}
            onClick={startDownload}
            disabled={!selectedQuality}
          >
            ⬇ Download {selectedQuality?.quality || ''}
          </button>
        </div>
      )}

      {/* Progress */}
      {job && (
        <div className="card">
          <div className="card-label">⚡ Download Progress</div>
          <DownloadProgress job={job} onSave={handleSave} onReset={handleReset} />
        </div>
      )}
    </div>
  );
}
