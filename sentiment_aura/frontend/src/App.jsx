import { useCallback, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import Aura from './components/Aura.jsx'
import TranscriptDisplay from './components/TranscriptDisplay.jsx'
import KeywordsDisplay from './components/KeywordsDisplay.jsx'
import ErrorDisplay from './components/ErrorDisplay.jsx'
import { connectDeepgram } from './lib/deepgram.js'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'
const DG_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY

export default function App() {
  const [isLive, setIsLive] = useState(false)
  const [lines, setLines] = useState([])          
  const [keywords, setKeywords] = useState([])
  const [sentiment, setSentiment] = useState({ label: 'neutral', score: 0.5 })
  const [error, setError] = useState(null)    
  const stopRef = useRef(null)
  const lastSentRef = useRef('')

  const handleTranscript = useCallback(async ({ text, is_final }) => {
    const clean = (text || '').trim()
    if (!clean) return

    setLines(prev => {
      if (!prev.length || prev[prev.length - 1].final) {
        return [...prev, { text: clean, final: is_final }]
      } else {
        const copy = [...prev]
        copy[copy.length - 1] = { text: clean, final: is_final }
        return copy
      }
    })

    if (is_final && clean !== lastSentRef.current) {
      lastSentRef.current = clean
      try {
        const { data } = await axios.post(`${BACKEND}/process_text`, { text: clean }, { timeout: 15000 })
        setKeywords(data.keywords || [])
        setSentiment({ label: data.sentiment_label, score: data.sentiment_score ?? 0.5 })
        setError(null) // Clear any previous errors on success
      } catch (e) {
        const status = e?.response?.status
        const detail = e?.response?.data?.detail
        
        setError({
          message: status === 502 
            ? 'AI service temporarily unavailable' 
            : 'Could not analyze text',
          detail: detail || (status === 502 ? 'Please try again' : 'Check your connection')
        })
        
        console.error('process_text error', e)
      }
    }
  }, [])

  const onStart = useCallback(() => {
    setLines([])
    setKeywords([])
    setSentiment({ label: 'neutral', score: 0.5 })
    setError(null)
    lastSentRef.current = ''
    
    try {
      stopRef.current = connectDeepgram({
        apiKey: DG_KEY,
        onTranscript: handleTranscript,
        onError: (e) => { 
          console.error(e)
          setIsLive(false)
          setError({
            message: 'Microphone error',
            detail: 'Check permissions and try again'
          })
        },
        onClose: () => setIsLive(false),
      })
      setIsLive(true)
    } catch (e) {
      setError({
        message: 'Failed to start recording',
        detail: 'Please allow microphone access'
      })
    }
  }, [handleTranscript])

  const onStop = useCallback(() => {
    stopRef.current?.()
    stopRef.current = null
    setIsLive(false)
  }, [])

  const auraScore = useMemo(
    () => Math.min(1, Math.max(0, sentiment.score ?? 0.5)),
    [sentiment]
  )

  return (
    <div className="app">
      <Aura sentimentScore={auraScore} />
      <div className="overlay">
        <div className="shell">
          {/* Simple Error Toast */}
          <ErrorDisplay error={error} onDismiss={() => setError(null)} />
          
          {/* Keywords Display */}
          <KeywordsDisplay 
            keywords={keywords} 
            width="480px"
            height="auto"
            maxHeight="250px"
          />
          
          {/* Integrated Transcript Display with Controls */}
          <TranscriptDisplay 
            lines={lines} 
            isLive={isLive} 
            onStart={onStart} 
            onStop={onStop} 
            sentiment={sentiment} 
          />
        </div>
      </div>
    </div>
  )
}