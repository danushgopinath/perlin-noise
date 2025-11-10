import { useRef, useEffect } from 'react'
import Sketch from 'react-p5'

export default function Aura({ sentimentScore = 0.5 }) {
  const zoff = useRef(0)
  const currentScore = useRef(sentimentScore)
  const targetScore = useRef(sentimentScore)
  
  // Update target when prop changes
  useEffect(() => {
    targetScore.current = sentimentScore
  }, [sentimentScore])

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef)
    p5.colorMode(p5.HSB, 360, 100, 100, 100)
    p5.noStroke()
  }

  const draw = (p5) => {
    // Smooth interpolation towards target
    const lerpSpeed = 0.05 // Adjust for smoother/faster transitions
    currentScore.current += (targetScore.current - currentScore.current) * lerpSpeed
    
    const s = currentScore.current // Now smoothly animated
    const hue = 200 + (s * 140)      // blue-green to orange-red
    const speed = 0.001 + s * 0.01   // animation speed
    const scale = 0.002 + (1 - s) * 0.004 // noise scale

    p5.background(0, 0, 5, 8) // motion blur

    const step = 30
    for (let x = 0; x < p5.width; x += step) {
      for (let y = 0; y < p5.height; y += step) {
        const n = p5.noise(x * scale, y * scale, zoff.current)
        const b = 30 + n * 70
        p5.fill(hue, 80, b, 40 + n * 60)
        const size = step * (0.6 + n * 1.2)
        p5.rect(x, y, size, size)
      }
    }
    zoff.current += speed
  }

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight)
  }

  return <Sketch setup={setup} draw={draw} windowResized={windowResized} />
}