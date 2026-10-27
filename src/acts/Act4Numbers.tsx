import { useLayoutEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { stats, type Stat } from '../content/stats'
import styles from './Act4Numbers.module.css'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const randomBit = () => (Math.random() < 0.5 ? '0' : '1')

type Frame = { phase: 'binary' | 'convert' | 'decimal'; main: string; sub: string }

/**
 * Estado de una cifra según su avance t (0..1):
 * 0.10–0.50 los bits se fijan de izquierda a derecha, 0.50–0.60 conversión,
 * 0.60–0.95 el decimal cuenta hasta el valor final.
 */
function frameAt(t: number, stat: Stat): Frame {
  const bin = stat.value.toString(2)
  if (t < 0.5) {
    const locked = Math.floor(clamp01((t - 0.1) / 0.4) * bin.length)
    return {
      phase: 'binary',
      main: Array.from(bin, (bit, i) => (i < locked ? bit : randomBit())).join(''),
      sub: locked ? `0b${bin.slice(0, locked)}` : '0b',
    }
  }
  if (t < 0.6) return { phase: 'convert', main: bin, sub: `0b${bin} → ?` }
  const k = clamp01((t - 0.6) / 0.35)
  const eased = 1 - Math.pow(1 - k, 3)
  return {
    phase: 'decimal',
    main: `${stat.prefix ?? ''}${Math.round(eased * stat.value)}`,
    sub: `0b${bin} → ${stat.value}`,
  }
}

function StatCard({ stat, index, x }: { stat: Stat; index: number; x: MotionValue<number> }) {
  const ref = useRef<HTMLLIElement>(null)
  const reduceMotion = useReducedMotion()
  const [frame, setFrame] = useState<Frame>(() => frameAt(reduceMotion ? 1 : 0, stat))

  // Avance de la tarjeta: 0 cuando su centro entra por la derecha, 1 al llegar al 40% del ancho
  // x puede cambiar mientras el padre renderiza (al medir la pista): el setState va al siguiente frame
  const pending = useRef(0)
  const update = (xv: number) => {
    cancelAnimationFrame(pending.current)
    pending.current = requestAnimationFrame(() => {
      const el = ref.current
      if (!el || reduceMotion) return
      const vw = window.innerWidth
      const center = el.offsetLeft + el.offsetWidth / 2 + xv
      setFrame(frameAt(clamp01((vw - center) / (vw * 0.6)), stat))
    })
  }
  useMotionValueEvent(x, 'change', update)
  // Estado inicial al montar; después solo se actualiza con el scroll
  useLayoutEffect(() => {
    update(x.get())
    return () => cancelAnimationFrame(pending.current)
  }, [])

  return (
    <li ref={ref} className={styles.card} data-phase={frame.phase}>
      <span className={styles.index}>({String(index + 1).padStart(2, '0')})</span>
      <p className={styles.number} aria-label={`${stat.prefix ?? ''}${stat.value} ${stat.label}`}>
        <span aria-hidden>{frame.main}</span>
      </p>
      <p className={styles.binary} aria-hidden>
        {frame.sub}
      </p>
      <p className={styles.label}>{stat.label}</p>
      <p className={styles.detail}>{stat.detail}</p>
    </li>
  )
}

export function Act4Numbers() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)
  const [distance, setDistance] = useState(0)
  const distanceRef = useRef(0)

  // El scroll vertical de la sección equivale exactamente al recorrido horizontal
  useLayoutEffect(() => {
    const measure = () => {
      const d = Math.max(0, trackRef.current!.scrollWidth - window.innerWidth)
      distanceRef.current = d
      setDistance(d)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const { scrollYProgress: p } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const x = useTransform(p, (v) => -v * distanceRef.current)

  return (
    <section
      ref={sectionRef}
      className={styles.root}
      style={{ height: `calc(100vh + ${distance}px)` }}
      data-act="04"
      aria-labelledby="act4-title"
    >
      <div className={styles.sticky}>
        <motion.ul ref={trackRef} className={styles.track} style={{ x }}>
          <li className={styles.intro}>
            <p className={styles.kicker}>{'// acto 04 · compilado desde el cv'}</p>
            <h2 id="act4-title" className={styles.title}>
              En
              <br />
              <span>cifras.</span>
            </h2>
            <p className={styles.hint}>
              Todo empieza en binario <span aria-hidden>→</span>
            </p>
          </li>

          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} x={x} />
          ))}

          <li className={styles.outro}>
            <p className={styles.kicker}>{'// acto 05 · el arsenal ↓'}</p>
            <p className={styles.outroText}>
              Los números cuentan una parte.
              <br />
              <span>El resto está en el código.</span>
            </p>
          </li>
        </motion.ul>

        <motion.div className={styles.progress} style={{ scaleX: p }} aria-hidden />
      </div>
    </section>
  )
}
