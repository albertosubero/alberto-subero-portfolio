import { useRef, type PointerEvent } from 'react'
import { useReducedMotion } from 'framer-motion'
import { GLYPHS } from '../three/glyphAtlas'
import styles from './CodeName.module.css'

/** Nombre gigante: las letras cercanas al cursor se levantan y se convierten en código. */
export function CodeName({ text }: { text: string }) {
  const letters = useRef<(HTMLSpanElement | null)[]>([])
  const frame = useRef(0)
  const reduceMotion = useReducedMotion()
  const chars = Array.from(text)

  const apply = (clientX: number | null) => {
    letters.current.forEach((el, i) => {
      if (!el || chars[i] === ' ') return
      let influence = 0
      if (clientX !== null) {
        const rect = el.getBoundingClientRect()
        const distance = Math.abs(clientX - (rect.left + rect.width / 2))
        influence = Math.max(0, 1 - distance / (window.innerWidth * 0.14))
      }
      el.style.transform = `translateY(${-influence * 12}%) scaleY(${1 + influence * 0.3})`
      el.style.color = influence > 0.05 ? `color-mix(in srgb, var(--green) ${Math.round(influence * 100)}%, var(--white))` : ''
      // Muy cerca del cursor, la letra parpadea a un glifo de la lluvia
      el.textContent =
        influence > 0.65 && Math.random() < 0.35 ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : chars[i]
    })
  }

  const onMove = (e: PointerEvent) => {
    if (reduceMotion) return
    const x = e.clientX
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => apply(x))
  }

  return (
    <p
      className={styles.root}
      aria-label={text}
      onPointerMove={onMove}
      onPointerLeave={() => {
        cancelAnimationFrame(frame.current)
        apply(null)
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
