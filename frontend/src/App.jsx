import { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import SingleDownloader from './components/SingleDownloader'
import BatchDownloader from './components/BatchDownloader'
import DownloadHistory from './components/DownloadHistory'
import Footer from './components/Footer'
import './index.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('download')

  return (
    <>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">

        {activeTab === 'download' && (
          <>
            {/* 1. Compact page title */}
            <div className="page-hero">
              <h1 className="hero-title">
                Download Any <span>Video</span> Instantly 🎬
              </h1>
              <p className="hero-sub">Paste any link below — 9 platforms supported, no sign-up needed.</p>
            </div>

            {/* 2. URL input — the primary action, front and center */}
            <SingleDownloader />

            {/* 3. Platform badges + stats — secondary info below */}
            <Hero />
          </>
        )}

        {activeTab === 'batch' && (
          <div style={{ paddingTop: '1rem' }}>
            <BatchDownloader />
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ paddingTop: '1rem' }}>
            <DownloadHistory />
          </div>
        )}

      </main>
      <Footer />
    </>
  )
}
