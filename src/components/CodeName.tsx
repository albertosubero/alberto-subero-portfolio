import { useEffect, useRef, type PointerEvent } from 'react'
import { useReducedMotion } from 'framer-motion'
import { GLYPHS } from '../three/glyphAtlas'
import styles from './CodeName.module.css'

// Alcance del efecto alrededor del cursor, como fracción del ancho de pantalla
const REACH = 0.12
// Suavizado por frame hacia la influencia objetivo (0..1)
const EASE = 0.16
// Probabilidad por frame de que una letra muy cercana cambie de glifo
const FLICKER = 0.1

/** Nombre gigante: las letras cercanas al cursor se levantan y se convierten en código. */
export function CodeName({ text }: { text: string }) {
  const letters = useRef<(HTMLSpanElement | null)[]>([])
  const pointerX = useRef<number | null>(null)
  const influence = useRef<number[]>([])
  const frame = useRef(0)
  const reduceMotion = useReducedMotion()
  const chars = Array.from(text)

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  // Bucle que corre mientras el cursor está encima o alguna letra sigue volviendo a su sitio.
  // La letra original nunca se sustituye (su ancho no cambia y el nombre no se desplaza):
  // el glifo se pinta encima con ::after a partir de data-glyph.
  const tick = () => {
    const x = pointerX.current
    let moving = x !== null
    letters.current.forEach((el, i) => {
      if (!el || chars[i] === ' ') return
      let target = 0
      if (x !== null) {
        const rect = el.getBoundingClientRect()
        target = Math.max(0, 1 - Math.abs(x - (rect.left + rect.width / 2)) / (window.innerWidth * REACH))
      }
      const current = influence.current[i] ?? 0
      const next = current + (target - current) * EASE
      influence.current[i] = Math.abs(next) < 0.001 ? 0 : next
      if (influence.current[i] > 0) moving = true

      const k = influence.current[i]
      el.style.transform = k ? `translateY(${-k * 10}%) scaleY(${1 + k * 0.22})` : ''
      el.style.color = k > 0.02 ? `color-mix(in srgb, var(--green) ${Math.round(k * 100)}%, var(--white))` : ''

      if (k > 0.6) {
        if (!el.dataset.glyph || Math.random() < FLICKER) {
          el.dataset.glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        }
      } else if (el.dataset.glyph) {
        delete el.dataset.glyph
      }
    })
    frame.current = moving ? requestAnimationFrame(tick) : 0
  }

  const start = () => {
    if (!frame.current) frame.current = requestAnimationFrame(tick)
  }

  const onMove = (e: PointerEvent) => {
    if (reduceMotion) return
    pointerX.current = e.clientX
    start()
  }

  return (
    <p
      className={styles.root}
      aria-label={text}
      onPointerMove={onMove}
      onPointerLeave={() => {
        pointerX.current = null
        start()
      }}
    >
      {chars.map((c, i) => (
        <span
          key={i}
          ref={(el) => {
            letters.current[i] = el
          }}
          className={c === ' ' ? styles.space : styles.letter}
          aria-hidden
        >
          {c}
        </span>
      ))}
    </p>
  )
}
