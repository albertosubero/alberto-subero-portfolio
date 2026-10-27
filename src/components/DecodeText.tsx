import { useEffect, useState } from 'react'

const NOISE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+=<>/\\|'

type Props = {
  text: string
  /** Cada vez que pasa a true, el texto se "descifra" de nuevo. */
  active: boolean
  duration?: number
  className?: string
}

/** Texto que se resuelve desde caracteres aleatorios, de izquierda a derecha. */
export function DecodeText({ text, active, duration = 1000, className }: Props) {
  const [output, setOutput] = useState(text)

  useEffect(() => {
    if (!active) return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const resolved = Math.floor(p * text.length)
      setOutput(
        Array.from(text, (c, i) =>
          c === ' ' || i < resolved ? c : NOISE[Math.floor(Math.random() * NOISE.length)],
        ).join(''),
      )
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, text, duration])

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{output}</span>
    </span>
  )
}
