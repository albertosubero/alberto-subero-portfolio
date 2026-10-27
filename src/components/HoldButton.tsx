import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import styles from './HoldButton.module.css'

type Props = {
  label: string
  tone?: 'green' | 'red'
  /** Milisegundos que hay que mantenerlo pulsado. */
  duration?: number
  disabled?: boolean
  onComplete: () => void
}

/** Botón de "mantén pulsado": se llena mientras se pulsa y se vacía al soltar. */
export function HoldButton({ label, tone = 'green', duration = 1400, disabled = false, onComplete }: Props) {
  const progress = useMotionValue(0)
  const percent = useTransform(progress, (p) => `${Math.round(p * 100)}%`)
  const [holding, setHolding] = useState(false)
  const holdingRef = useRef(false)
  const frameRef = useRef(0)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  const tick = (last: number) => (now: number) => {
    const dt = now - last
    const p = progress.get()
    // Se llena a ritmo normal y se vacía el doble de rápido
    const next = holdingRef.current ? p + dt / duration : p - (dt / duration) * 2
    if (next >= 1) {
      progress.set(0)
      release()
      onCompleteRef.current()
      return
    }
    progress.set(Math.max(0, next))
    if (next > 0 || holdingRef.current) frameRef.current = requestAnimationFrame(tick(now))
  }

  const press = () => {
    if (disabled || holdingRef.current) return
    holdingRef.current = true
    setHolding(true)
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(tick(performance.now()))
  }

  const release = () => {
    holdingRef.current = false
    setHolding(false)
  }

  useEffect(() => () => cancelAnimationFrame(frameRef.current), [])

  useEffect(() => {
    if (disabled) {
      release()
      progress.set(0)
    }
  }, [disabled, progress])

  return (
    <button
      type="button"
      className={styles.root}
      data-tone={tone}
      data-holding={holding}
      disabled={disabled}
      onPointerDown={(e) => {
        // Captura el puntero para que salir del botón sin soltar no corte la carga
        if (e.currentTarget.hasPointerCapture(e.pointerId) === false) {
          try {
            e.currentTarget.setPointerCapture(e.pointerId)
          } catch {
            // puntero sintético o ya liberado: seguimos sin captura
          }
        }
        press()
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onKeyDown={(e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
          e.preventDefault()
          press()
        }
      }}
      onKeyUp={(e) => {
        if (e.key === ' ' || e.key === 'Enter') release()
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <motion.span className={styles.fill} style={{ scaleX: progress }} aria-hidden />
      <span className={styles.label}>{label}</span>
      <motion.span className={styles.percent} aria-hidden>
        {percent}
      </motion.span>
    </button>
  )
}
