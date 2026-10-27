import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { profile } from '../content/profile'
import { scrollToBottom } from '../lib/smoothScroll'
import { RetroPhone } from '../components/RetroPhone'
import { Typewriter, type TypedLine } from '../components/Typewriter'
import { CodeName } from '../components/CodeName'
import styles from './Act8Exit.module.css'

const CALL: TypedLine[] = [
  { text: 'Hola. Soy Alberto.', pause: 500 },
  { text: 'Si has llegado hasta aquí, ya sabes cómo trabajo.', pause: 500 },
  { text: 'Ahora cuéntame qué necesitas.', pause: 300 },
]

type Props = { onClassic: () => void; onRestart: () => void }

/** Formulario sin backend: abre el cliente de correo del visitante con el mensaje redactado. */
function BriefForm() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Propuesta de ${name || 'un visitante'} desde albertosubero.dev`)
    const body = encodeURIComponent(`${message}\n\n— ${name}`)
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <h3 className={styles.formTitle}>¿Cuál es la tarea?</h3>
      <label>
        <span>Nombre</span>
        <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
      </label>
      <label>
        <span>Qué necesitas y para cuándo</span>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} />
      </label>
      <button type="submit">Enviar el brief →</button>
      <small>Se abrirá tu cliente de correo con el mensaje listo.</small>
    </form>
  )
}

export function Act8Exit({ onClassic, onRestart }: Props) {
  const callRef = useRef<HTMLDivElement>(null)
  const ringing = useInView(callRef, { amount: 0.5 })
  const [answered, setAnswered] = useState(false)
  const [callDone, setCallDone] = useState(false)

  // Al terminar la llamada aparece el contacto: bajamos hasta el final de la página
  useEffect(() => {
    if (!callDone) return
    const id = window.setTimeout(() => scrollToBottom(), 600)
    return () => window.clearTimeout(id)
  }, [callDone])

  const links = [
    { label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    { label: 'LinkedIn', value: 'in/albertosubero', href: profile.linkedin, external: true },
    { label: 'GitHub', value: '@albertosubero', href: profile.github, external: true },
    { label: 'Descargar CV', value: 'PDF', href: profile.cvUrl, external: true },
  ]

  return (
    <section className={styles.root} data-act="08" aria-labelledby="act8-title">
      <div ref={callRef} className={styles.call}>
        <div className={styles.phone}>
          <RetroPhone ringing={ringing} answered={answered} />
        </div>

        <div className={styles.side}>
          <p className={styles.kicker}>{'// acto 08 · la salida'}</p>
          <AnimatePresence mode="wait">
            {!answered ? (
              <motion.div key="ring" exit={{ opacity: 0, y: -10 }}>
                <h2 id="act8-title" className={styles.title}>
                  Hay una llamada
                  <br />
                  <span>para ti.</span>
                </h2>
                <button type="button" className={styles.answer} onClick={() => setAnswered(true)}>
                  Contestar
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="call"
                className={styles.transcript}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Typewriter lines={CALL} speed={38} onDone={() => setCallDone(true)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {callDone && (
          <motion.div
            className={styles.contact}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <ul className={styles.links}>
              {links.map((link, i) => (
                <li key={link.label}>
                  <a href={link.href} {...(link.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
                    <span className={styles.index}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={styles.linkLabel}>{link.label}</span>
                    <span className={styles.linkValue}>{link.value}</span>
                    <span aria-hidden>↗</span>
                  </a>
                </li>
              ))}
              <li>
                <button type="button" onClick={onClassic}>
                  <span className={styles.index}>{String(links.length + 1).padStart(2, '0')}</span>
                  <span className={styles.linkLabel}>CV clásico</span>
                  <span className={styles.linkValue}>la pastilla azul</span>
                  <span aria-hidden>↗</span>
                </button>
              </li>
            </ul>
            <BriefForm />
          </motion.div>
        )}
      </AnimatePresence>

      <footer className={styles.footer}>
        <div className={styles.footerRow}>
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <button type="button" onClick={onRestart}>
            Ver la historia otra vez ↺
          </button>
          <span>Hecho con React, Three.js y Framer Motion</span>
        </div>
        <CodeName text={profile.name} />
      </footer>
    </section>
  )
}
