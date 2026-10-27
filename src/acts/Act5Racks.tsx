import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { racks, type Rack } from '../content/stack'
import styles from './Act5Racks.module.css'

// Profundidad (px de translateZ). La cámara "avanza" moviendo todas las estanterías hacia +z.
// La primera arranca dentro de la niebla para no asomar detrás del titular.
const SPACING = 1250
const START = -4800
const TRAVEL = (racks.length - 1) * SPACING - START + 900

function useViewportWidth() {
  const [width, setWidth] = useState(() => window.innerWidth)
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return width
}

function RackShelf({
  rack,
  index,
  progress,
  vw,
}: {
  rack: Rack
  index: number
  progress: MotionValue<number>
  vw: number
}) {
  const side = index % 2 === 0 ? -1 : 1
  const z0 = START - index * SPACING
  const z = useTransform(progress, (p) => z0 + p * TRAVEL)
  // Aparece desde la niebla y se desvanece justo al pasar junto a la cámara
  const opacity = useTransform(z, [-7000, -4200, 250, 750], [0, 1, 1, 0])
  const corridor = vw < 760 ? vw * 0.2 : Math.min(vw * 0.27, 420)

  return (
    <motion.section
      className={styles.rack}
      style={{ x: side * corridor, z, rotateY: side * -38, opacity }}
      aria-label={rack.name}
    >
      <header className={styles.plate}>
        <span>rack {String(index + 1).padStart(2, '0')}</span>
        <h3>{rack.name}</h3>
      </header>
      <ul className={styles.items}>
        {rack.items.map((item) => (
          <li key={item}>
            <i aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </motion.section>
  )
}

export function Act5Racks() {
  const ref = useRef<HTMLElement>(null)
  const vw = useViewportWidth()
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const introOpacity = useTransform(p, [0, 0.07, 0.13], [1, 1, 0])
  const introScale = useTransform(p, [0, 0.13], [1, 1.25])
  const outroOpacity = useTransform(p, [0.9, 0.97], [0, 1])
  const floorShift = useTransform(p, (v) => `${v * TRAVEL}px`)

  // Estantería "actual": la más cercana que aún no ha pasado junto a la cámara
  const [current, setCurrent] = useState(0)
  useMotionValueEvent(p, 'change', (v) => {
    const i = Math.ceil((START + v * TRAVEL - 400) / SPACING)
    setCurrent(Math.min(racks.length - 1, Math.max(0, i)))
  })

  return (
    <section ref={ref} className={styles.root} data-act="05" data-hud="light" aria-labelledby="act5-title">
      <div className={styles.sticky}>
        <div className={styles.scene}>
          <motion.div className={styles.floor} style={{ backgroundPositionY: floorShift }} aria-hidden />
          {racks.map((rack, i) => (
            <RackShelf key={rack.name} rack={rack} index={i} progress={p} vw={vw} />
          ))}
        </div>

        <div className={styles.fog} aria-hidden />

        <motion.div className={styles.intro} style={{ opacity: introOpacity, scale: introScale }}>
          <p className={styles.kicker}>{'// acto 05 · el arsenal'}</p>
          <h2 id="act5-title" className={styles.title}>
            ¿Qué necesitas?
            <br />
            <span>Tecnología.</span>
            <br />
            Mucha tecnología.
          </h2>
        </motion.div>

        <div className={styles.counter} aria-hidden>
          <span>
            rack {String(current + 1).padStart(2, '0')} / {String(racks.length).padStart(2, '0')}
          </span>
          <strong>{racks[current].name}</strong>
        </div>

        <motion.div className={styles.outro} style={{ opacity: outroOpacity }}>
          <p className={styles.kicker}>{'// acto 06 · bullet time ↓'}</p>
          <p className={styles.outroText}>
            Cada herramienta,
            <br />
            <span>en su sitio.</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
