export default function Controls({ isLive, onStart, onStop, sentiment }) {
  return (
    <div className="panel controls">
      <div className={`mic-indicator ${isLive ? 'live' : ''}`} />
      <button
        onClick={isLive ? onStop : onStart}
        style={{
          pointerEvents: 'auto', padding: '10px 14px', borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.14)', background: isLive ? '#222' : '#2d6cdf',
          color: 'white', cursor: 'pointer'
        }}
      >
        {isLive ? 'Stop' : 'Start'}
      </button>
      <div style={{opacity:.85}}>Sentiment: <b>{sentiment.label}</b> ({sentiment.score.toFixed(2)})</div>
    </div>
  )
}
