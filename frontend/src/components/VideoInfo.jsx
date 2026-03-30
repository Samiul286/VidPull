import { formatDuration } from '../utils';

function getPlatformColor(name) {
  const map = {
    'YouTube': '#FF0000', 'TikTok': '#00f2ea', 'Instagram': '#E1306C',
    'Facebook': '#1877F2', 'X/Twitter': '#1DA1F2', 'Twitch': '#9146FF',
    'Reddit': '#FF4500', 'LinkedIn': '#0A66C2', 'Pinterest': '#E60023',
  };
  return map[name] || '#d97706';
}

export default function VideoInfo({ info }) {
  if (!info) return null;
  const color = getPlatformColor(info.platform?.name);

  return (
    <div className="video-info-row">
      <div className="thumb-wrap">
        <img src={info.thumbnail} alt={info.title} className="video-thumb" />
        {info.duration > 0 && (
          <span className="thumb-duration">{formatDuration(info.duration)}</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="platform-chip" style={{ background: color }}>
          {info.platform?.name || 'Video'}
        </div>
        <div className="video-title">{info.title}</div>
        <div className="video-meta">
          {info.uploader && <span>by {info.uploader}</span>}
          {info.viewCount > 0 && (
            <span>· {(info.viewCount / 1e6).toFixed(1)}M views</span>
          )}
        </div>
        {info.demo && (
          <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: '#d97706', fontWeight: 600 }}>
            ⚠ Demo mode — install yt-dlp for real downloads
          </div>
        )}
      </div>
    </div>
  );
}
