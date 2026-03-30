export default function DownloadProgress({ job, onSave, onReset }) {
  if (!job) return null;
  const pct = Math.round(job.progress || 0);

  if (job.status === 'done') {
    return (
      <div className="download-ready-box">
        <div>
          <div className="download-ready-text">✅ Download ready!</div>
          <div className="download-ready-sub">Job: {job.jobId?.slice(0, 8)}...</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          {job.downloadUrl && (
            <button className="btn-save" onClick={onSave}>⬇ Save File</button>
          )}
          <button className="btn-secondary" onClick={onReset}>New Download</button>
        </div>
      </div>
    );
  }

  if (job.status === 'error') {
    return (
      <div className="info-box" style={{ background: '#fee2e2', borderColor: '#fca5a5', color: '#991b1b' }}>
        <span>❌</span>
        <div>
          <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>Download failed</div>
          <div style={{ fontSize: '0.78rem' }}>{job.error || 'An error occurred'}</div>
          <button
            className="btn-secondary"
            style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            onClick={onReset}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f97316', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <svg style={{ width: 16, height: 16 }} className="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          Downloading…
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#d97706' }}>{pct}%</span>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 600 }}>
        Processing your video, please wait…
      </div>
    </div>
  );
}
