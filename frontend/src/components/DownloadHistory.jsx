import { useState, useEffect } from 'react';
import { getHistory, clearHistory } from '../utils';

function timeSince(ts) {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return 'just now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

function getPlatformColor(name) {
  const map = {
    'YouTube': '#FF0000', 'TikTok': '#00f2ea', 'Instagram': '#E1306C',
    'Facebook': '#1877F2', 'X/Twitter': '#1DA1F2', 'Twitch': '#9146FF',
    'Reddit': '#FF4500', 'LinkedIn': '#0A66C2', 'Pinterest': '#E60023',
  };
  return map[name] || '#d97706';
}

export default function DownloadHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => { setHistory(getHistory()); }, []);

  function handleClear() {
    if (confirm('Clear all download history?')) {
      clearHistory();
      setHistory([]);
    }
  }

  return (
    <div>
      <div className="card">
        <div className="section-header">
          <div className="section-title">🕓 History</div>
          {history.length > 0 && (
            <button className="btn-danger" onClick={handleClear}>🗑 Clear All</button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No downloads yet!</div>
            <div className="empty-sub">Videos you download will appear here</div>
          </div>
        ) : (
          <div>
            {history.map((item, idx) => {
              const color = getPlatformColor(item.platform?.name);
              return (
                <div key={idx} className="history-item">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.title} className="history-thumb" />
                  ) : (
                    <div className="history-thumb" style={{ background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                      🎬
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="platform-chip" style={{ background: color, display: 'inline-flex', fontSize: '0.65rem', padding: '0.1rem 0.5rem', marginBottom: '0.2rem' }}>
                      {item.platform?.name || 'Video'}
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#78350f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 600, display: 'flex', gap: '0.5rem', marginTop: '0.1rem' }}>
                      <span>{item.quality || '—'}</span>
                      <span>·</span>
                      <span>{timeSince(item.timestamp)}</span>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#16a34a', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontWeight: 700 }}>
                      ✓ Done
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
