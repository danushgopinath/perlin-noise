import { useState, useEffect } from 'react'

export default function KeywordsDisplay({ keywords, height = 'auto', maxHeight = '200px' }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <div 
      className="keywords-container" 
      style={{ 
        width : '30vw', 
        height: height === 'auto' ? 'auto' : height,
        maxHeight: isExpanded ? '400px' : maxHeight 
      }}
    >
      {/* Header */}
      <div className="keywords-header">
        <div className="keywords-title">
          <span className="keywords-label">Keywords</span>
          <span className="keywords-count">{keywords.length}</span>
        </div>
        {keywords.length > 5 && (
          <button 
            className="expand-button"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
              style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            >
              <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Keywords Area */}
      <div className="keywords-content">
        {keywords.length === 0 ? (
          <div className="keywords-empty">
            <p>Keywords will appear here as you speak...</p>
          </div>
        ) : (
          <div className="keywords-grid">
            {keywords.map((k, i) => (
              <span 
                className="keyword-chip" 
                key={`${k}-${i}`} 
                style={{animationDelay: `${i*60}ms`}}
              >
                {k}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}