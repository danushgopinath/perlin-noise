export default function KeywordsDisplay({ keywords }) {
  return (
    <div className="panel" style={{ right: 'auto', width: 420, top: 72 }}>
      <div style={{fontSize:12, opacity:.7, marginBottom:6}}>Keywords</div>
      <div>
        {keywords.map((k, i) => (
          <span className="chip" key={`${k}-${i}`} style={{animationDelay: `${i*60}ms`}}>{k}</span>
        ))}
      </div>
    </div>
  )
}
