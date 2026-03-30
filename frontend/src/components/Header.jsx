export default function Header({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'download', emoji: '⬇', label: 'Download' },
    { id: 'batch',    emoji: '📋', label: 'Batch'    },
    { id: 'history',  emoji: '🕓', label: 'History'  },
  ];

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <div className="logo-icon">⬇</div>
          <span className="logo-text">VidPull</span>
        </div>

        <nav className="tab-nav">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="tab-emoji">{t.emoji}</span>
              <span className="tab-label">{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="status-badge">
          <span className="status-dot" />
          <span className="status-text">Free · 10/hr</span>
        </div>
      </div>
    </header>
  );
}
