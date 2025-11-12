export default function ErrorDisplay({ error, onDismiss }) {
  if (!error) return null

  return (
    <div className="error-toast">
      <div className="error-content">
        <span className="error-icon">⚠</span>
        <div className="error-text">
          <div className="error-main">{error.message}</div>
          {error.detail && (
            <div className="error-detail">{error.detail}</div>
          )}
        </div>
      </div>
      <button className="error-close" onClick={onDismiss}>×</button>
    </div>
  )
}