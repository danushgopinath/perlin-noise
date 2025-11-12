import { useRef, useEffect } from 'react'
import Sketch from 'react-p5'

export default function Aura({ sentimentScore = 0.5 }) {
  const zoff = useRef(0)
  const currentScore = useRef(sentimentScore)
  const targetScore = useRef(sentimentScore)

  const smooth = useRef({ hue: 200 + sentimentScore * 140, speed: 0.001 + sentimentScore * 0.01, scale: 0.002 + (1 - sentimentScore) * 0.004 })

  useEffect(() => { targetScore.current = sentimentScore }, [sentimentScore])

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef)
    p5.colorMode(p5.HSB, 360, 100, 100, 100)
    p5.noStroke()
  }

  const draw = (p5) => {
    const scoreEase = 0.06
    currentScore.current += (targetScore.current - currentScore.current) * scoreEase

    const s = currentScore.current
    const targetHue   = 200 + (s * 140)                 
    const targetSpeed = 0.001 + s * 0.01                
    const targetScale = 0.002 + (1 - s) * 0.004         

    const ease = 0.08
    smooth.current.hue   += (targetHue   - smooth.current.hue)   * ease
    smooth.current.speed += (targetSpeed - smooth.current.speed) * ease
    smooth.current.scale += (targetScale - smooth.current.scale) * ease

    const hue   = smooth.current.hue
    const speed = smooth.current.speed
    const scale = smooth.current.scale

    p5.background(0, 0, 5, 12)

    const step = 50                    
    const jitter = 0.25                 

    for (let x = 0; x < p5.width; x += step) {
      for (let y = 0; y < p5.height; y += step) {
        const n = p5.noise(x * scale, y * scale, zoff.current)
        const b = 32 + n * 68
        const a = 30 + n * 50
        const size = step * (0.85 + n * 0.9)

        const ox = (n - 0.5) * step * jitter
        const oy = (n - 0.5) * step * jitter

        p5.fill(hue, 80, b, a)
        p5.rect(x + ox, y + oy, size, size, 4) 
      }
    }
    zoff.current += speed * 0.8
  }

  const windowResized = (p5) => p5.resizeCanvas(p5.windowWidth, p5.windowHeight)

  return <Sketch setup={setup} draw={draw} windowResized={windowResized} />
}
