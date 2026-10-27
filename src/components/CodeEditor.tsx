import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Era, LogLine } from '../content/eras'
import styles from './CodeEditor.module.css'

// comentario | cadena | decorador | palabra clave | función / $jQuery | número | {{ interpolación }}
const TOKEN =
  /(\/\/.*$|<!--.*?-->)|('[^']*'|"[^"]*")|(@\w+)|\b(function|var|const|let|return|for|export|class|private|new|this|track|of|in|if)\b|(\$[\w.]*|\b[A-Za-z_]\w*(?=\s*\())|(\b\d+\b)|(\{\{.*?\}\})/g
const CLASSES = ['comment', 'string', 'deco', 'kw', 'fn', 'num', 'interp']

function highlight(line: string) {
  const parts: ReactNode[] = []
  let last = 0
  for (const match of line.matchAll(TOKEN)) {
    const index = match.index ?? 0
    if (index > last) parts.push(line.slice(last, index))
    const group = match.slice(1).findIndex((g) => g !== undefined)
    parts.push(
      <span key={index} className={styles[CLASSES[group]]}>
        {match[0]}
      </span>,
    )
    last = index + match[0].length
  }
  parts.push(line.slice(last))
  return parts
}

type Props = {
  era: Era
  status: 'idle' | 'busy' | 'error' | 'done'
  logs: LogLine[]
}

export function CodeEditor({ era, status, logs }: Props) {
  const lines = era.code.split('\n')

  return (
    <motion.div
      className={styles.window}
      data-era={era.id}
      data-status={status}
      animate={status === 'error' ? { x: [0, -10, 9, -6, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className={styles.titlebar}>
        <span className={styles.dots} aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className={styles.title}>{era.file}</span>
        <span className={styles.era}>{era.name}</span>
      </div>

      <div className={styles.body}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.pre
            key={era.id}
            className={styles.code}
            initial="hidden"
            animate="visible"
            exit="glitch"
            variants={{
              visible: { transition: { staggerChildren: 0.035 } },
              glitch: {
                x: [0, -14, 10, -4, 0],
                skewX: [0, 8, -6, 0],
                opacity: [1, 0.7, 1, 0],
                filter: ['hue-rotate(0deg)', 'hue-rotate(90deg)', 'hue-rotate(-60deg)', 'hue-rotate(0deg)'],
                transition: { duration: 0.45 },
              },
            }}
          >
            <code>
              {lines.map((line, i) => (
                <motion.span
                  key={i}
                  className={styles.line}
                  variants={{
                    hidden: { opacity: 0, x: -12 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <span className={styles.gutter} aria-hidden>
                    {i + 1}
                  </span>
                  {highlight(line)}
                  {'\n'}
                </motion.span>
              ))}
            </code>
          </motion.pre>
        </AnimatePresence>

        {/* Fogonazo al cambiar de época */}
        <motion.div
          key={`flash-${era.id}`}
          className={styles.flash}
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          aria-hidden
        />
      </div>

      <div className={styles.terminal} role="log" aria-live="polite">
        <AnimatePresence initial={false}>
          {logs.slice(-6).map((log, i) => (
            <motion.p
              key={`${logs.length - Math.min(logs.length, 6) + i}`}
              className={styles[log.tone ?? 'cmd']}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {log.text}
            </motion.p>
          ))}
        </AnimatePresence>
        {status !== 'busy' && <p className={styles.prompt}>$ ▍</p>}
      </div>

      <div className={styles.statusbar}>
        <span>{era.name}</span>
        <span>
          {status === 'error' ? '✖ 1 error' : status === 'done' ? '✔ 0 errores' : status === 'busy' ? 'compilando…' : 'listo'}
        </span>
      </div>
    </motion.div>
  )
}
