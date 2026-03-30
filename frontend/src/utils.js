// Utility: format duration
export function formatDuration(seconds) {
  if (!seconds) return '--:--'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  return `${m}:${String(s).padStart(2,'0')}`
}

// Utility: format file size
export function formatSize(bytes) {
  if (!bytes) return null
  const mb = bytes / 1024 / 1024
  if (mb >= 1024) return `${(mb/1024).toFixed(1)} GB`
  return `${mb.toFixed(0)} MB`
}

// Utility: format view count
export function formatViews(n) {
  if (!n) return null
  if (n >= 1e9) return `${(n/1e9).toFixed(1)}B views`
  if (n >= 1e6) return `${(n/1e6).toFixed(1)}M views`
  if (n >= 1e3) return `${(n/1e3).toFixed(0)}K views`
  return `${n} views`
}

// Save to localStorage history
export function saveToHistory(entry) {
  const key = 'vidpull_history'
  const existing = JSON.parse(localStorage.getItem(key) || '[]')
  const updated = [{ ...entry, date: new Date().toISOString() }, ...existing].slice(0, 20)
  localStorage.setItem(key, JSON.stringify(updated))
}

export function getHistory() {
  return JSON.parse(localStorage.getItem('vidpull_history') || '[]')
}

export function clearHistory() {
  localStorage.removeItem('vidpull_history')
}

// Platform colors
const platformColors = {
  'YouTube':   { bg: '#FF000014', border: '#FF000030', text: '#FF0000', emoji: '▶️' },
  'TikTok':    { bg: '#00f2ea14', border: '#00f2ea30', text: '#00f2ea', emoji: '🎵' },
  'Instagram': { bg: '#E1306C14', border: '#E1306C30', text: '#E1306C', emoji: '📸' },
  'Facebook':  { bg: '#1877F214', border: '#1877F230', text: '#1877F2', emoji: '📘' },
  'X/Twitter': { bg: '#1DA1F214', border: '#1DA1F230', text: '#1DA1F2', emoji: '🐦' },
  'Twitch':    { bg: '#9146FF14', border: '#9146FF30', text: '#9146FF', emoji: '🎮' },
  'Reddit':    { bg: '#FF450014', border: '#FF450030', text: '#FF4500', emoji: '🤖' },
  'LinkedIn':  { bg: '#0A66C214', border: '#0A66C230', text: '#0A66C2', emoji: '💼' },
  'Pinterest': { bg: '#E6002314', border: '#E6002330', text: '#E60023', emoji: '📌' },
  'Unknown':   { bg: '#6b728014', border: '#6b728030', text: '#9ca3af', emoji: '🌐' },
}

export function getPlatformStyle(name) {
  return platformColors[name] || platformColors['Unknown']
}
