const PLATFORMS = [
  { name: 'YouTube',   emoji: '▶', color: '#FF0000', bg: '#fff0f0', border: '#FF0000' },
  { name: 'TikTok',   emoji: '♪', color: '#00f2ea', bg: '#f0ffff', border: '#00f2ea' },
  { name: 'Instagram', emoji: '📷', color: '#E1306C', bg: '#fff0f5', border: '#E1306C' },
  { name: 'Facebook',  emoji: 'f',  color: '#1877F2', bg: '#f0f5ff', border: '#1877F2' },
  { name: 'X/Twitter', emoji: '✕', color: '#1DA1F2', bg: '#f0f9ff', border: '#1DA1F2' },
  { name: 'Twitch',    emoji: '🎮', color: '#9146FF', bg: '#f5f0ff', border: '#9146FF' },
  { name: 'Reddit',    emoji: '🤖', color: '#FF4500', bg: '#fff5f0', border: '#FF4500' },
  { name: 'LinkedIn',  emoji: 'in', color: '#0A66C2', bg: '#f0f5ff', border: '#0A66C2' },
  { name: 'Pinterest', emoji: '📌', color: '#E60023', bg: '#fff0f2', border: '#E60023' },
];

export default function Hero() {
  return (
    <section className="hero-features">
      <div className="platform-badges">
        {PLATFORMS.map(p => (
          <div
            key={p.name}
            className="pbadge"
            style={{ color: p.color, background: p.bg, borderColor: p.border + '55' }}
          >
            <span>{p.emoji}</span>
            {p.name}
          </div>
        ))}
      </div>

      <div className="hero-stats">
        <div className="hero-stat">
          <div className="hero-stat-val">9+</div>
          <div className="hero-stat-label">Platforms</div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-val">4K</div>
          <div className="hero-stat-label">Max Quality</div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-val">10</div>
          <div className="hero-stat-label">Batch URLs</div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-val">FREE</div>
          <div className="hero-stat-label">No Sign-up</div>
        </div>
      </div>
    </section>
  );
}
