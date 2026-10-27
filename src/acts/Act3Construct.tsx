import { useRef, type ReactNode } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { profile } from '../content/profile'
import { BinaryPortrait } from '../components/BinaryPortrait'
import styles from './Act3Construct.module.css'

/** Línea de titular que sube desde una máscara y deriva en horizontal con el scroll. */
function Line({
  progress,
  reveal,
  drift,
  className,
  children,
}: {
  progress: MotionValue<number>
  reveal: [number, number]
  drift: number
  className?: string
  children: ReactNode
}) {
  const y = useTransform(progress, reveal, ['110%', '0%'])
  const x = useTransform(progress, [reveal[0], 1], ['0vw', `${drift}vw`])
  return (
    <span className={`${styles.mask} ${className ?? ''}`}>
      <motion.span className={styles.line} style={{ y, x }}>
        {children}
      </motion.span>
    </span>
  )
}

/** Entrada: una línea blanca se abre hasta llenar la pantalla y aparece el saludo. */
function ConstructIntro({ onWhite }: { onWhite: (white: boolean) => void }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const bootOpacity = useTransform(p, [0, 0.04, 0.1], [1, 1, 0])
  const inset = useTransform(p, [0.04, 0.3], [49.8, 0])
  useMotionValueEvent(inset, 'change', (v) => onWhite(v < 20))
  const clipPath = useTransform(inset, (v) => `inset(${v}% 0 ${v}% 0)`)
  const labelsOpacity = useTransform(p, [0.62, 0.72], [0, 1])

  return (
    <section ref={ref} className={styles.intro} data-act="03" aria-label="Acto 3: el Construct">
      <div className={styles.sticky}>
        <motion.p className={styles.boot} style={{ opacity: bootOpacity }} aria-hidden>
          &gt; cargando el construct…
        </motion.p>

        <motion.div className={styles.white} style={{ clipPath }}>
          <div className={styles.columns} aria-hidden />
          <h2 className={styles.headline}>
            <Line progress={p} reveal={[0.24, 0.38]} drift={4}>
              Hola,
            </Line>
            <Line progress={p} reveal={[0.34, 0.48]} drift={-3} className={styles.indent}>
              soy Alberto —
            </Line>
            <Line progress={p} reveal={[0.44, 0.58]} drift={5}>
              Frontend
            </Line>
            <Line progress={p} reveal={[0.52, 0.66]} drift={-2} className={styles.indentSmall}>
              <span className={styles.outline}>Developer</span>
            </Line>
          </h2>

          <motion.ul className={styles.labels} style={{ opacity: labelsOpacity }} aria-hidden>
            <li>(03) sobre mí</li>
            <li>senior · {profile.stack.toLowerCase()} · +10 años</li>
            <li>europa &amp; latam · remoto</li>
          </motion.ul>
        </motion.div>
      </div>
    </section>
  )
}

/** Frase final que cruza la pantalla en direcciones opuestas. */
function Statement() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const left = useTransform(p, [0, 1], ['12%', '-18%'])
  const right = useTransform(p, [0, 1], ['-20%', '8%'])

  return (
    <div ref={ref} className={styles.statement} aria-label="Del wireframe al producto final.">
      <motion.p style={{ x: left }} aria-hidden>
        Del wireframe <span className={styles.arrow}>→</span>
      </motion.p>
      <motion.p style={{ x: right }} aria-hidden>
        <span className={styles.highlight}>al producto</span> final.
      </motion.p>
    </div>
  )
}

const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
}

export function Act3Construct({ onWhite }: { onWhite: (white: boolean) => void }) {
  return (
    <>
      <ConstructIntro onWhite={onWhite} />

      <section className={styles.about} data-act="03" data-hud="light" aria-labelledby="about-title">
        <div className={styles.columns} aria-hidden />

        <div className={styles.grid}>
          <motion.figure className={styles.portrait} {...reveal}>
            <BinaryPortrait portrait={profile.portrait} alt={`Retrato de ${profile.name} formado por ceros y unos`} />
            <figcaption>// pasa el cursor (o toca) para ver el código</figcaption>
          </motion.figure>

          <div className={styles.text}>
            <motion.p className={styles.label} {...reveal}>
              (03) sobre mí
            </motion.p>
            <motion.h3 id="about-title" className={styles.lead} {...reveal}>
              Más de <mark>10 años</mark> como Senior Frontend Developer, especializado en{' '}
              <mark>Angular</mark> y su ecosistema: arquitecturas escalables, liderazgo técnico y
              modernización de productos <mark>legacy</mark>.
            </motion.h3>
            <motion.p className={styles.body} {...reveal}>
              Para empresas B2B y B2C en Europa y Latinoamérica. Disfruto todo el proceso de creación
              de UIs, desde la primera lluvia de ideas, wireframes y maquetas hasta el producto final.
              Complemento mi stack con NestJS, SQL y desarrollo asistido por IA con Claude Code y
              GitHub Copilot.
            </motion.p>
            <motion.div className={styles.meta} {...reveal}>
              {profile.available && <span className={styles.available}>Disponible para trabajar</span>}
              <a href={profile.cvUrl} target="_blank" rel="noreferrer">
                Descargar CV ↗
              </a>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </motion.div>
          </div>
        </div>

        <Statement />

        <p className={styles.next} aria-hidden>
          {'// acto 04 · en cifras ↓'}
        </p>
      </section>
    </>
  )
}
