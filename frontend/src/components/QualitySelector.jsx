const QUALITY_CONFIG = [
  { quality: '4K', ext: 'mp4', emoji: '✨', label: '4K Ultra HD' },
  { quality: '1080p', ext: 'mp4', emoji: '🔥', label: '1080p Full HD' },
  { quality: '720p', ext: 'mp4', emoji: '⭐', label: '720p HD' },
  { quality: '480p', ext: 'mp4', emoji: '▶', label: '480p' },
  { quality: '360p', ext: 'mp4', emoji: '▶', label: '360p' },
  { quality: 'MP3', ext: 'mp3', emoji: '🎵', label: 'MP3 Audio' },
  { quality: 'M4A', ext: 'm4a', emoji: '🎵', label: 'M4A Audio' },
];

export default function QualitySelector({ selected, onSelect }) {
  const videoOptions = QUALITY_CONFIG.filter(q => q.ext !== 'mp3' && q.ext !== 'm4a');
  const audioOptions = QUALITY_CONFIG.filter(q => q.ext === 'mp3' || q.ext === 'm4a');

  return (
    <div>
      <div className="quality-section-label">🎬 Video</div>
      <div className="quality-pills">
        {videoOptions.map(q => (
          <button
            key={q.quality}
            className={`quality-pill ${selected?.quality === q.quality ? 'selected' : ''}`}
            onClick={() => onSelect(q)}
          >
            {q.emoji} {q.quality} <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>MP4</span>
          </button>
        ))}
      </div>

      <div className="quality-section-label">🎵 Audio Only</div>
      <div className="quality-pills">
        {audioOptions.map(q => (
          <button
            key={q.quality}
            className={`quality-pill ${selected?.quality === q.quality ? 'selected' : ''}`}
            onClick={() => onSelect(q)}
          >
            {q.emoji} {q.quality} <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>{q.ext.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
