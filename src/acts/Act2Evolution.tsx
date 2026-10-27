import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CodeEditor } from '../components/CodeEditor'
import { HoldButton } from '../components/HoldButton'
import { ERAS, LOGS, type LogLine } from '../content/eras'
import styles from './Act2Evolution.module.css'

// jquery → angularjs → (intento fallido) error → done
type Step = 'jquery' | 'angularjs' | 'error' | 'done'

const LOG_INTERVAL = 320
const INITIAL_LOGS: LogLine[] = [{ text: '# legacy detectado: cv.js (jQuery)', tone: 'muted' }]

const ACTIONS: Record<Exclude<Step, 'done'>, { label: string; tone: 'green' | 'red' }> = {
  jquery: { label: 'Mantén pulsado · migrar a AngularJS', tone: 'green' },
  angularjs: { label: 'Mantén pulsado · ng update', tone: 'green' },
  error: { label: 'Mantén pulsado · refactorizar y reintentar', tone: 'red' },
}

export function Act2Evolution() {
  const [step, setStep] = useState<Step>('jquery')
  const [busy, setBusy] = useState(false)
  const [logs, setLogs] = useState<LogLine[]>(INITIAL_LOGS)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  /** Escribe las líneas en el terminal una a una y después avanza de paso. */
  const run = (lines: LogLine[], next: Step) => {
    setBusy(true)
    lines.forEach((line, i) => {
      timers.current.push(window.setTimeout(() => setLogs((prev) => [...prev, line]), i * LOG_INTERVAL))
    })
    timers.current.push(
      window.setTimeout(() => {
        setStep(next)
        setBusy(false)
      }, lines.length * LOG_INTERVAL + 250),
    )
  }

  const advance = () => {
    if (step === 'jquery') run(LOGS.toAngularJs, 'angularjs')
    else if (step === 'angularjs') run(LOGS.failedUpdate, 'error')
    else if (step === 'error') run(LOGS.toAngular, 'done')
  }

  const reset = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setLogs(INITIAL_LOGS)
    setBusy(false)
    setStep('jquery')
  }

  const eraIndex = step === 'jquery' ? 0 : step === 'done' ? 2 : 1
  const status = busy ? 'busy' : step === 'error' ? 'error' : step === 'done' ? 'done' : 'idle'

  return (
    <section className={styles.root} data-act="02" aria-labelledby="act2-title">
      <motion.div
        className={styles.intro}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className={styles.kicker}>// acto 02 · evolución</p>
        <h2 id="act2-title" className={styles.title}>
          El código
          <br />
          <span>evoluciona.</span>
        </h2>
        <p className={styles.body}>
          He visto cambiar el frontend varias veces. Actualiza este componente a través de tres
          épocas: mantén pulsado el botón.
        </p>

        <ol className={styles.timeline} aria-label="Épocas">
          {ERAS.map((era, i) => (
            <li key={era.id} data-state={i < eraIndex ? 'past' : i === eraIndex ? 'current' : 'future'}>
              <span>{era.name}</span>
              <small>{era.since}</small>
            </li>
          ))}
        </ol>

        <AnimatePresence mode="wait">
          {step === 'done' ? (
            <motion.div
              key="done"
              className={styles.done}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className={styles.doneTitle}>✔ Compilado sin errores</p>
              <p>
                Eso es lo que hago: modernizar productos legacy paso a paso, sin parar producción.
              </p>
              <button type="button" className={styles.reset} onClick={reset}>
                ↺ Volver a jQuery
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <HoldButton
                label={busy ? 'Ejecutando…' : ACTIONS[step].label}
                tone={ACTIONS[step].tone}
                duration={step === 'error' ? 1800 : 1300}
                disabled={busy}
                onComplete={advance}
              />
              {step === 'error' && !busy && (
                <p className={styles.hint}>AngularJS no se actualiza con un comando: hay que migrarlo.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        className={styles.editor}
        initial={{ opacity: 0, y: 60, rotateX: 12 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <CodeEditor era={ERAS[eraIndex]} status={status} logs={logs} />
      </motion.div>

      <p className={styles.next} aria-hidden>
        {'// acto 03 · el construct ↓'}
      </p>
    </section>
  )
}
