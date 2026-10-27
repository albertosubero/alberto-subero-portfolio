import { useEffect, useRef, useState } from 'react'
import styles from './Typewriter.module.css'

export type TypedLine = { text: string; pause?: number }

type Props = {
  lines: TypedLine[]
  /** Milisegundos por carácter. */
  speed?: number
  /** Muestra todo el texto de golpe (clic para saltar o movimiento reducido). */
  instant?: boolean
  onDone?: () => void
}

export function Typewriter({ lines, speed = 55, instant = false, onDone }: Props) {
  const [line, setLine] = useState(0)
  const [char, setChar] = useState(0)
  const done = instant || line >= lines.length
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  })

  useEffect(() => {
    if (done) onDoneRef.current?.()
  }, [done])

  useEffect(() => {
    if (done) return
    const current = lines[line]
    const endOfLine = char >= current.text.length
    // Pequeña irregularidad para que parezca alguien tecleando
    const delay = endOfLine ? (current.pause ?? 500) : speed * (0.6 + Math.random() * 0.8)
    const id = window.setTimeout(() => {
      if (endOfLine) {
        setLine((l) => l + 1)
        setChar(0)
      } else {
        setChar((c) => c + 1)
      }
    }, delay)
    return () => window.clearTimeout(id)
  }, [done, line, char, lines, speed])

  return (
    <div className={styles.root} aria-live="polite">
      {lines.map((l, i) => {
        if (!done && i > line) return null
        const text = done || i < line ? l.text : l.text.slice(0, char)
        const active = done ? i === lines.length - 1 : i === line
        return (
          <p key={i} className={styles.line}>
            <span className={styles.prompt} aria-hidden>
              &gt;
            </span>
            {text}
            {active && <span className={styles.caret} aria-hidden />}
          </p>
        )
      })}
    </div>
  )
}
