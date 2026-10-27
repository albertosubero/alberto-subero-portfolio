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
const CARDS_DESKTOP = 20
const CARDS_MOBILE = 8
const MOBILE_BREAKPOINT = 760
// Debe coincidir con `perspective` en .sticky (Act7Tunnel.module.css)
const PERSPECTIVE = 900
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

/**
 * Reparte las tarjetas alrededor del pasillo, cada una a una profundidad.
 * En escritorio, en espiral por un anillo exterior; en móvil, solo en las bandas
 * de arriba y abajo para no cruzar nunca el texto.
 */
function layout(cards: ProjectCard[], mobile: boolean): CardSpec[] {
  const count = mobile ? CARDS_MOBILE : CARDS_DESKTOP
  return Array.from({ length: count }, (_, i) => {
    const card = cards[i % cards.length]
    const jitter = Math.sin(i * 12.9898) * 0.5 + 0.5
    const angle = mobile ? (i % 2 ? 1 : -1) * (Math.PI / 2) + (jitter - 0.5) * 0.9 : i * GOLDEN_ANGLE
    return {
      ...card,
      angle,
      ring: mobile ? 0.95 + jitter * 0.2 : 0.8 + jitter * 0.3,
      z0: NEAREST - (i / count) * DEPTH,
      tilt: (jitter - 0.5) * 24,
    }
  })
}

const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function TunnelCard({
  spec,
  progress,
  presence,
  viewport,
  mobile,
}: {
  spec: CardSpec
  progress: MotionValue<number>
  presence: MotionValue<number>
  viewport: { w: number; h: number }
  mobile: boolean
}) {
  const x = Math.cos(spec.angle) * spec.ring * viewport.w * 0.46
  const y = Math.sin(spec.angle) * spec.ring * viewport.h * 0.4
  const z = useTransform(progress, (p) => spec.z0 + p * TRAVEL)

  // Zona despejada: elipse alrededor del bloque de texto central
  const clearX = Math.min(viewport.w * 0.45, 340)
  const clearY = viewport.h * (mobile ? 0.3 : 0.26)

  const opacity = useTransform([z, presence], ([zv, pv]: number[]) => {
    const depth = smoothstep(-8200, -5200, zv) * (1 - smoothstep(250, 800, zv))
    // Proyección en pantalla: de lejos la tarjeta se acerca al centro, justo detrás del texto
    const scale = PERSPECTIVE / (PERSPECTIVE - zv)
    const d = ((x * scale) / clearX) ** 2 + ((y * scale) / clearY) ** 2
    const clear = 0.06 + 0.94 * smoothstep(0.75, 1.3, d)
    // Las lejanas, atenuadas para separar planos
    const near = 0.35 + 0.65 * smoothstep(-5000, -1500, zv)
    return depth * clear * near * pv
  })
  // Desenfoque de profundidad (en móvil no: coste y pocas tarjetas)
  const filter = useTransform(z, (zv) =>
    mobile ? 'none' : `blur(${(6 * (1 - smoothstep(-4500, -1200, zv))).toFixed(1)}px)`,
  )

  return (
    <motion.article
      className={styles.card}
      data-vertical={'vertical' in spec && spec.vertical ? true : undefined}
      style={{ x, y, z, opacity, filter, rotateZ: spec.tilt, rotateY: (-x / viewport.w) * 40 }}
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
        <div className={styles.capture}>
          {/* Sin loading="lazy": dentro de transformaciones 3D el navegador calcula mal la visibilidad */}
          <img src={spec.image} alt="" decoding="async" />
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
  const mobile = viewport.w < MOBILE_BREAKPOINT
  const cards = useMemo(() => layout(projects[index].cards, mobile), [index, mobile])
  // Cada proyecto ocupa su tramo del scroll
  const local = useTransform(progress, (p) => Math.min(1, Math.max(0, p * projects.length - index)))
  // Solo se ven las tarjetas del proyecto actual: las de los siguientes esperan ocultas
  const presence = useTransform(progress, (p) => smoothstep(-0.06, 0.02, p * projects.length - index))
  return (
    <>
      {cards.map((spec, i) => (
        <TunnelCard
          key={i}
          spec={spec}
          progress={local}
          presence={presence}
          viewport={viewport}
          mobile={mobile}
        />
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
