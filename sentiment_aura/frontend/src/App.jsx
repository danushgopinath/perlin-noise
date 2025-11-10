import { useCallback, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import Aura from './components/Aura.jsx'
import Controls from './components/Controls.jsx'
import TranscriptDisplay from './components/TranscriptDisplay.jsx'
import KeywordsDisplay from './components/KeywordsDisplay.jsx'
import { connectDeepgram } from './lib/deepgram.js'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'
const DG_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY

export default function App() {
  const [isLive, setIsLive] = useState(false)
  const [lines, setLines] = useState([])          // { text, final }
  const [keywords, setKeywords] = useState([])
  const [sentiment, setSentiment] = useState({ label: 'neutral', score: 0.5 })
  const [errorMsg, setErrorMsg] = useState('')    // <-- new: show friendly errors
  const stopRef = useRef(null)
  const lastSentRef = useRef('')                  // <-- de-dupe identical finals

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

    // Only hit backend on finals, and skip duplicates
    if (is_final && clean !== lastSentRef.current) {
      lastSentRef.current = clean
      try {
        setErrorMsg('')
        const { data } = await axios.post(`${BACKEND}/process_text`, { text: clean }, { timeout: 15000 })
        setKeywords(data.keywords || [])
        setSentiment({ label: data.sentiment_label, score: data.sentiment_score ?? 0.5 })
      } catch (e) {
        const status = e?.response?.status
        const detail = e?.response?.data?.detail
        // Friendly message that matches the backend’s 502 mapping
        const msg = status === 502
          ? 'AI analysis hiccup — please try again.'
          : 'Could not analyze right now. Please retry.'
        setErrorMsg(detail ? `${msg} (${detail})` : msg)
        console.error('process_text error', e)
      }
    }
  }, [])

  const onStart = useCallback(() => {
    setLines([])
    setKeywords([])
    setSentiment({ label: 'neutral', score: 0.5 })
    setErrorMsg('')
    lastSentRef.current = ''
    stopRef.current = connectDeepgram({
      apiKey: DG_KEY,
      onTranscript: handleTranscript,
      onError: (e) => { console.error(e); setIsLive(false); setErrorMsg('Microphone or network error.'); },
      onClose: () => setIsLive(false),
    })
    setIsLive(true)
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
          {/* simple inline banner; swap for a toast if you have one */}
          {errorMsg && (
            <div className="error-banner">
              <span className="error-text">{errorMsg}</span>
              <button className="error-close" onClick={() => setErrorMsg('')}>
                ×
              </button>
            </div>
          )}
          <Controls isLive={isLive} onStart={onStart} onStop={onStop} sentiment={sentiment} />
          <KeywordsDisplay keywords={keywords} />
          <TranscriptDisplay lines={lines} />
        </div>
      </div>
    </div>
  )
}
