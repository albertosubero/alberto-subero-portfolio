import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Typewriter, type TypedLine } from '../components/Typewriter'
import { Pill } from '../components/Pill'
import styles from './Act0Choice.module.css'

export type Choice = 'red' | 'blue'

const LINES: TypedLine[] = [
  { text: 'Despierta…', pause: 1100 },
  { text: 'Llevas toda la vida mirando interfaces.', pause: 700 },
  { text: '¿Nunca has querido ver el código que hay detrás?', pause: 1000 },
  { text: 'Sigue al conejo blanco.', pause: 500 },
]

type Phase = 'typing' | 'choice' | 'exit'

type Props = {
  onChoose: (choice: Choice) => void
  /** Se llama al montar: permite precargar el Acto 1 mientras se lee la intro. */
  onReady?: () => void
}

export function Act0Choice({ onChoose, onReady }: Props) {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    onReady?.()
  }, [onReady])
  const [phase, setPhase] = useState<Phase>('typing')
  const [skipped, setSkipped] = useState(false)
  const [hovered, setHovered] = useState<Choice | null>(null)
  const [chosen, setChosen] = useState<Choice | null>(null)

  const choose = (choice: Choice) => {
    if (phase === 'exit') return
    setChosen(choice)
    setPhase('exit')
  }

  // Clic o tecla durante el tecleo: mostrar todo. En la elección: R / A.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === 'typing') return setSkipped(true)
      if (phase !== 'choice') return
      const key = e.key.toLowerCase()
      if (key === 'r') choose('red')
      if (key === 'a' || key === 'b') choose('blue')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const exitAnimation =
    chosen === 'red'
      ? { scale: 1.6, opacity: 0, filter: 'blur(12px) brightness(2)' }
      : { opacity: 0, filter: 'brightness(4) saturate(0)' }

  return (
    <motion.section
      className={styles.root}
      aria-label="Introducción"
      onClick={() => phase === 'typing' && setSkipped(true)}
      animate={phase === 'exit' ? exitAnimation : { opacity: 1 }}
      transition={{ duration: reduceMotion ? 0.2 : 1.1, ease: [0.7, 0, 0.84, 0] }}
      onAnimationComplete={() => phase === 'exit' && chosen && onChoose(chosen)}
    >
      <header className={styles.hud}>
        <span>albertosubero.dev</span>
        <span className={styles.signal}>
          <i /> conexión segura
        </span>
      </header>

      <div className={styles.terminal}>
        <Typewriter
          lines={LINES}
          instant={skipped || !!reduceMotion}
          onDone={() => setPhase((p) => (p === 'typing' ? 'choice' : p))}
        />
      </div>

      <AnimatePresence>
        {phase !== 'typing' && (
          <motion.div
            className={styles.pills}
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.18, delayChildren: 0.3 } } }}
          >
            {(['red', 'blue'] as const).map((color) => (
              <motion.div
                key={color}
                variants={{
                  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
                  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
                }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <Pill
                  color={color}
                  title={color === 'red' ? 'Pastilla roja' : 'Pastilla azul'}
                  caption={color === 'red' ? 'Entra en la experiencia.\nTe enseño hasta dónde llega.' : 'CV clásico, rápido y sin efectos.'}
                  hotkey={color === 'red' ? 'R' : 'A'}
                  dimmed={hovered !== null && hovered !== color}
                  onHover={(h) => setHovered(h ? color : null)}
                  onChoose={() => choose(color)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <footer className={styles.footer}>
        {phase === 'typing' ? '[ clic o cualquier tecla para saltar ]' : '[ elige con cuidado ]'}
      </footer>

      <div className="crt-overlay" aria-hidden />
    </motion.section>
  )
}
