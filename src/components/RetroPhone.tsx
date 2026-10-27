import { motion, useReducedMotion } from 'framer-motion'
import styles from './RetroPhone.module.css'

/** Teléfono de sobremesa en SVG. Tiembla mientras suena y levanta el auricular al contestar. */
export function RetroPhone({ ringing, answered }: { ringing: boolean; answered: boolean }) {
  const reduceMotion = useReducedMotion()
  const shaking = ringing && !answered && !reduceMotion

  return (
    <div className={styles.root} data-ringing={ringing && !answered}>
      {/* Ondas del timbre */}
      {ringing && !answered && (
        <span className={styles.waves} aria-hidden>
          <i />
          <i />
          <i />
        </span>
      )}

      <motion.svg
        viewBox="0 0 240 200"
        className={styles.svg}
        role="img"
        aria-label={answered ? 'Teléfono descolgado' : 'Teléfono sonando'}
        animate={shaking ? { rotate: [0, -4, 4, -3, 3, 0] } : { rotate: 0 }}
        transition={shaking ? { duration: 0.5, repeat: Infinity, repeatDelay: 0.6 } : { duration: 0.3 }}
      >
        {/* Cable rizado */}
        <path
          className={styles.cord}
          d="M40 150 q-18 6 -10 18 q8 12 -6 18 q-14 6 -4 16"
          fill="none"
        />
        {/* Base */}
        <path className={styles.body} d="M48 92 L192 92 L216 176 Q218 186 208 186 L32 186 Q22 186 24 176 Z" />
        {/* Dial giratorio */}
        <circle className={styles.dial} cx="120" cy="140" r="30" />
        {Array.from({ length: 10 }, (_, i) => {
          const a = ((i * 28 - 60) * Math.PI) / 180
          return <circle key={i} className={styles.hole} cx={120 + Math.cos(a) * 21} cy={140 + Math.sin(a) * 21} r="4.2" />
        })}
        <circle className={styles.hub} cx="120" cy="140" r="9" />

        {/* Auricular */}
        <motion.g
          animate={answered ? { y: -46, x: -18, rotate: -16 } : { y: 0, x: 0, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 140, damping: 14 }}
          style={{ originX: '50%', originY: '50%' }}
        >
          <path className={styles.handset} d="M44 66 Q120 20 196 66" fill="none" />
          <rect className={styles.body} x="22" y="58" width="52" height="30" rx="12" />
          <rect className={styles.body} x="166" y="58" width="52" height="30" rx="12" />
        </motion.g>
      </motion.svg>
    </div>
  )
}
