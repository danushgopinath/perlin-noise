import { useEffect, useRef } from 'react'

export default function TranscriptDisplay({ lines }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  return (
    <div className="panel transcript" ref={ref}>
      {lines.map((l, i) => (
        <div key={i} style={{opacity: l.final ? 1 : 0.6}}>
          {l.text}
        </div>
      ))}
    </div>
  )
}
