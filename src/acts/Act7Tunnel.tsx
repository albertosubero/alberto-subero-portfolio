import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { profile, type ProjectCard } from '../content/profile'
import { ModuleMock } from '../components/ModuleMock'
import styles from './Act7Tunnel.module.css'

const projects = profile.projects
const CARDS_PER_PROJECT = 20
const NEAREST = -700
const DEPTH = 7200
const TRAVEL = DEPTH + 1600
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

type CardSpec = ProjectCard & {
  angle: number
  ring: number
  z0: number
  tilt: number
}

/** Reparte las tarjetas en espiral alrededor del pasillo, cada una a una profundidad. */
function layout(cards: ProjectCard[]): CardSpec[] {
  return Array.from({ length: CARDS_PER_PROJECT }, (_, i) => {
    const card = cards[i % cards.length]
    const jitter = Math.sin(i * 12.9898) * 0.5 + 0.5
    return {
      ...card,
      angle: i * GOLDEN_ANGLE,
      ring: 0.62 + jitter * 0.38,
      z0: NEAREST - (i / CARDS_PER_PROJECT) * DEPTH,
      tilt: (jitter - 0.5) * 24,
    }
  })
}

function TunnelCard({
  spec,
  color,
  progress,
  viewport,
}: {
  spec: CardSpec
  color: string
  progress: MotionValue<number>
  viewport: { w: number; h: number }
}) {
  const x = Math.cos(spec.angle) * spec.ring * viewport.w * 0.46
  const y = Math.sin(spec.angle) * spec.ring * viewport.h * 0.4
  const z = useTransform(progress, (p) => spec.z0 + p * TRAVEL)
  const opacity = useTransform(z, [-8200, -5200, 250, 800], [0, 1, 1, 0])

  return (
    <motion.article
      className={styles.card}
      style={{ x, y, z, opacity, rotateZ: spec.tilt, rotateY: (-x / viewport.w) * 40 }}
      aria-hidden
    >
      <header>
        <span className={styles.dots}>
          <i />
          <i />
          <i />
        </span>
        {spec.name}
      </header>
      {'kind' in spec ? (
        <div className={styles.mock}>
          <ModuleMock kind={spec.kind} />
        </div>
      ) : (
        // Los logos son claros: van sobre el color del proyecto
        <div className={spec.logo ? styles.logo : styles.capture} style={spec.logo ? { background: color } : undefined}>
          <img src={spec.image} alt="" loading="lazy" decoding="async" />
        </div>
      )}
    </motion.article>
  )
}

function useViewport() {
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return size
}

/** Inclinación suave de todo el túnel siguiendo al ratón. */
function usePointerTilt() {
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      ry.set((e.clientX / window.innerWidth - 0.5) * 8)
      rx.set((e.clientY / window.innerHeight - 0.5) * -6)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [rx, ry])
  return {
    rotateX: useSpring(rx, { stiffness: 60, damping: 20 }),
    rotateY: useSpring(ry, { stiffness: 60, damping: 20 }),
  }
}

function ProjectTunnel({
  index,
  progress,
  viewport,
}: {
  index: number
  progress: MotionValue<number>
  viewport: { w: number; h: number }
}) {
  const cards = useMemo(() => layout(projects[index].cards), [index])
  // Cada proyecto ocupa su tramo del scroll
  const local = useTransform(progress, (p) => Math.min(1, Math.max(0, p * projects.length - index)))
  return (
    <>
      {cards.map((spec, i) => (
        <TunnelCard key={i} spec={spec} color={projects[index].color} progress={local} viewport={viewport} />
      ))}
    </>
  )
}

export function Act7Tunnel() {
  const ref = useRef<HTMLElement>(null)
  const viewport = useViewport()
  const tilt = usePointerTilt()
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const [current, setCurrent] = useState(0)
  useMotionValueEvent(p, 'change', (v) => {
    setCurrent(Math.min(projects.length - 1, Math.floor(v * projects.length)))
  })

  const titleScale = useTransform(p, [0, 0.12], [0.7, 1])
  const titleOpacity = useTransform(p, [0, 0.08], [0, 1])
  const hintOpacity = useTransform(p, [0.85, 0.95], [0, 1])
  const project = projects[current]

  return (
    <section
      ref={ref}
      className={styles.root}
      style={{ height: `${projects.length * 200 + 80}vh` }}
      data-act="07"
      aria-labelledby="act7-title"
    >
      <div className={styles.sticky}>
        <motion.div className={styles.scene} style={tilt}>
          {projects.map((_, i) => (
            <ProjectTunnel key={i} index={i} progress={p} viewport={viewport} />
          ))}
        </motion.div>

        <motion.div className={styles.center} style={{ scale: titleScale, opacity: titleOpacity }}>
          <p className={styles.kicker}>
            {'// acto 07 · proyectos'} — {String(current + 1).padStart(2, '0')} /{' '}
            {String(projects.length).padStart(2, '0')}
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={project.name}
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.5 }}
            >
              <h2 id="act7-title" className={styles.title}>
                {project.name}
              </h2>
              <p className={styles.summary}>{project.summary}</p>
              <ul className={styles.modules}>
                {project.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              {project.url && (
                <a className={styles.cta} href={project.url} target="_blank" rel="noreferrer">
                  Ver proyecto ↗
                </a>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.p className={styles.next} style={{ opacity: hintOpacity }} aria-hidden>
          {'// acto 08 · la salida ↓'}
        </motion.p>
      </div>
    </section>
  )
}
