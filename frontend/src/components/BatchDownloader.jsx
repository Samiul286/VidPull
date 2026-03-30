import { useState } from 'react';

const DEFAULT_QUALITY = { quality: '720p', ext: 'mp4' };

export default function BatchDownloader() {
  const [items, setItems] = useState(Array(3).fill(null).map(() => ({ url: '', quality: DEFAULT_QUALITY })));
  const [jobMap, setJobMap] = useState({});
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchJobIds, setBatchJobIds] = useState([]);

  function updateUrl(idx, val) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, url: val } : it));
  }

  function updateQuality(idx, val) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, quality: val } : it));
  }

  function addRow() {
    if (items.length < 10) setItems(prev => [...prev, { url: '', quality: DEFAULT_QUALITY }]);
  }

  function removeRow(idx) {
    if (items.length > 1) setItems(prev => prev.filter((_, i) => i !== idx));
  }

  async function startBatch() {
    const validItems = items.filter(it => it.url.trim());
    if (!validItems.length) return;
    setBatchRunning(true);
    setJobMap({});

    try {
      const payload = validItems.map(it => ({
        url: it.url,
        quality: it.quality.quality,
        ext: it.quality.ext,
      }));
      const res = await fetch('/api/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setBatchJobIds(data.jobIds);
      pollAll(data.jobIds);
    } catch (e) {
      alert('Batch failed: ' + e.message);
      setBatchRunning(false);
    }
  }

  function pollAll(jobIds) {
    const interval = setInterval(async () => {
      const results = await Promise.all(jobIds.map(id => fetch(`/api/job/${id}`).then(r => r.json())));
      const map = {};
      jobIds.forEach((id, i) => { map[id] = results[i]; });
      setJobMap(map);
      const allDone = results.every(r => r.status === 'done' || r.status === 'error');
      if (allDone) { clearInterval(interval); setBatchRunning(false); }
    }, 1500);
  }

  const validCount = items.filter(it => it.url.trim()).length;
  const qualityOptions = ['4K', '1080p', '720p', '480p', '360p', 'MP3', 'M4A'];
  const extMap = { '4K': 'mp4', '1080p': 'mp4', '720p': 'mp4', '480p': 'mp4', '360p': 'mp4', 'MP3': 'mp3', 'M4A': 'm4a' };

  function statusFor(idx) {
    const id = batchJobIds[idx];
    if (!id) return null;
    return jobMap[id];
  }

  return (
    <div>
      <div className="card">
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <div className="section-title">📋 Batch Download</div>
          <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 700 }}>{items.length}/10 URLs</span>
        </div>

        <div className="info-box">
          💡 Add up to 10 URLs. Downloads process one at a time automatically.
        </div>

        {items.map((item, idx) => {
          const st = statusFor(idx);
          return (
            <div key={idx} className="batch-item">
              <div className="batch-num">{idx + 1}</div>
              <input
                className="batch-input"
                type="text"
                placeholder={`Paste URL #${idx + 1}…`}
                value={item.url}
                onChange={e => updateUrl(idx, e.target.value)}
                disabled={batchRunning}
              />
              <select
                className="batch-select"
                value={item.quality.quality}
                onChange={e => updateQuality(idx, { quality: e.target.value, ext: extMap[e.target.value] })}
                disabled={batchRunning}
              >
                {qualityOptions.map(q => <option key={q} value={q}>{q}</option>)}
              </select>

              {st ? (
                <span className={`status-pill ${st.status}`}>
                  {st.status === 'processing' ? `${Math.round(st.progress)}%` : st.status}
                </span>
              ) : (
                <button
                  className="btn-icon"
                  onClick={() => removeRow(idx)}
                  disabled={batchRunning || items.length <= 1}
                  title="Remove"
                  style={{ opacity: items.length <= 1 ? 0.3 : 1 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}

        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.75rem' }}>
          {items.length < 10 && (
            <button className="btn-secondary" onClick={addRow} disabled={batchRunning}>
              + Add URL
            </button>
          )}
          <button
            className="btn-primary"
            style={{ flex: 1, justifyContent: 'center', padding: '0.9rem' }}
            onClick={startBatch}
            disabled={batchRunning || validCount === 0}
          >
            {batchRunning ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="spin">
                  <circle cx="12" cy="12" r="10" strokeWidth="3" strokeOpacity="0.3" />
                  <path strokeWidth="3" strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                Processing…
              </>
            ) : `⬇ Download ${validCount} Video${validCount !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>

      {/* Results */}
      {batchJobIds.length > 0 && (
        <div className="card">
          <div className="card-label">📊 Batch Results</div>
          {batchJobIds.map((id, idx) => {
            const st = jobMap[id];
            const origUrl = items.filter(it => it.url.trim())[idx]?.url || '';
            return (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: idx < batchJobIds.length - 1 ? '2px solid #fef3c7' : 'none' }}>
                <div className="batch-num">{idx + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.78rem', color: '#92400e', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {origUrl || 'URL ' + (idx + 1)}
                  </div>
                  {st?.status === 'processing' && (
                    <div className="progress-bar-track" style={{ height: 8, marginTop: '0.3rem', marginBottom: 0 }}>
                      <div className="progress-bar-fill" style={{ width: `${st.progress || 0}%` }} />
                    </div>
                  )}
                </div>
                <span className={`status-pill ${st?.status || 'pending'}`}>
                  {st?.status === 'processing' ? `${Math.round(st.progress || 0)}%` : (st?.status || 'pending')}
                </span>
                {st?.status === 'done' && st.downloadUrl && (
                  <button className="btn-save" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                    onClick={() => window.open(st.downloadUrl, '_blank')}>
                    ⬇
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
