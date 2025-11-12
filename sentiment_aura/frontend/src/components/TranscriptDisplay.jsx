import { useEffect, useRef } from 'react'

export default function TranscriptDisplay({ lines, isLive, onStart, onStop, sentiment }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const to = el.scrollHeight - el.clientHeight
    const nearBottom = el.scrollTop > to - 220
    if (nearBottom) el.scrollTo({ top: to, behavior: 'smooth' })
  }, [lines])

  return (
    <div className="transcript-container">
      {/* Sentiment Display */}
      <div className="sentiment-display">
        <span className="sentiment-label">Sentiment:</span>
        <span className="sentiment-value">{sentiment.label}</span>
        <span className="sentiment-score">({sentiment.score.toFixed(2)})</span>
      </div>
      
      {/* Transcript Area */}
      <div className="transcript-messages" ref={ref}>
        {lines.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎤</div>
            <p>Click start to begin transcribing...</p>
          </div>
        ) : (
          lines.map((l, i) => (
            <div key={i} className={`message ${l.final ? 'final' : 'interim'}`}>
              <div className="message-content">{l.text}</div>
            </div>
          ))
        )}
      </div>
      
      {/* Input Area with Controls */}
      <div className="input-area">
        <div className="input-wrapper">
          <div className={`mic-indicator ${isLive ? 'live' : ''}`} />
          <div className="input-placeholder">
            {isLive ? 'Listening...' : 'Click start to begin speaking'}
          </div>
          <button
            className={`control-button ${isLive ? 'stop' : 'start'}`}
            onClick={isLive ? onStop : onStart}
          >
            {isLive ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}