const PLATFORMS = ['YouTube', 'TikTok', 'Instagram', 'Facebook', 'X/Twitter', 'Twitch', 'Reddit', 'LinkedIn', 'Pinterest'];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">⬇ VidPull</div>
      <div className="footer-platforms" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.3rem', marginBottom: '0.75rem' }}>
        {PLATFORMS.map(p => (
          <span key={p} style={{
            fontSize: '0.7rem', fontWeight: 700,
            background: '#fef3c7', color: '#92400e',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px', border: '2px solid #fde68a',
          }}>
            {p}
          </span>
        ))}
      </div>
      <div className="footer-legal">
        For personal use only. Respect copyright laws and platform terms of service.
      </div>
      <div style={{ marginTop: '0.4rem', fontSize: '0.72rem', color: '#fbbf24', fontWeight: 600 }}>
        Made with 🧡 · ©2026 VidPull
      </div>
    </footer>
  );
}
