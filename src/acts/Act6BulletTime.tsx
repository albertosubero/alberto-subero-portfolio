import { useEffect, useRef, useState, type RefObject } from 'react'
import { AnimatePresence, motion, useInView, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import type * as THREE from 'three'
import { profile } from '../content/profile'
import { createGlyphAtlas, type GlyphAtlas } from '../three/glyphAtlas'
import { createJobPanelTexture } from '../three/jobPanel'
import { BulletTimeScene, type TimeState } from '../three/BulletTimeScene'
import styles from './Act6BulletTime.module.css'

const jobs = profile.experience

function useSceneAssets() {
  const [assets, setAssets] = useState<{ atlas: GlyphAtlas; panels: THREE.Texture[] } | null>(null)
  useEffect(() => {
    let cancelled = false
    Promise.all([createGlyphAtlas(), Promise.all(jobs.map((job, i) => createJobPanelTexture(job, i)))]).then(
      ([atlas, panels]) => {
        if (cancelled) return panels.forEach((t) => t.dispose())
        setAssets({ atlas, panels })
      },
    )
    return () => {
      cancelled = true
    }
  }, [])
  return assets
}

/** Indicador de "velocidad del tiempo": lee el estado de la escena en cada frame. */
function TimeMeter({ state }: { state: RefObject<TimeState> }) {
  const barRef = useRef<HTMLSpanElement>(null)
  const valueRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    let frame = 0
    const tick = () => {
      const flow = state.current.flow
      barRef.current!.style.transform = `scaleX(${Math.min(1, flow / 3.5)})`
      valueRef.current!.textContent = `×${flow.toFixed(2)}`
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [state])

  return (
    <div className={styles.meter} aria-hidden>
      <span className={styles.meterLabel}>
        velocidad del tiempo <span ref={valueRef}>×0.03</span>
      </span>
      <span className={styles.meterTrack}>
        <span ref={barRef} />
      </span>
    </div>
  )
}

export function Act6BulletTime() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref)
  const assets = useSceneAssets()
  const state = useRef<TimeState>({ time: 0, flow: 0.03 })
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const introOpacity = useTransform(p, [0, 0.04, 0.09], [1, 1, 0])
  const [job, setJob] = useState(-1)
  useMotionValueEvent(p, 'change', (v) => {
    const s = v * jobs.length
    // El texto cambia a mitad del vuelo entre dos trabajos
    const j = s < 0.12 ? -1 : Math.min(jobs.length - 1, Math.floor(s + 0.1))
    setJob(j)
  })

  return (
    <section
      ref={ref}
      className={styles.root}
      style={{ height: `${jobs.length * 115 + 100}vh` }}
      data-act="06"
      aria-labelledby="act6-title"
    >
      <div className={styles.sticky}>
        <motion.div
          className={styles.canvas}
          initial={{ opacity: 0 }}
          animate={{ opacity: assets ? 1 : 0 }}
          transition={{ duration: 1.2 }}
        >
          {assets && <BulletTimeScene progress={p} state={state} active={inView} {...assets} />}
        </motion.div>

        <motion.div className={styles.intro} style={{ opacity: introOpacity }}>
          <p className={styles.kicker}>{'// acto 06 · bullet time'}</p>
          <h2 id="act6-title" className={styles.title}>
            Experiencia
            <br />
            <span>a cámara lenta.</span>
          </h2>
          <p className={styles.hint}>Cuanto más rápido haces scroll, más rápido corre el tiempo.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {job >= 0 && (
            <motion.article
              key={job}
              className={styles.job}
              initial={{ opacity: 0, x: -40, filter: 'blur(12px)', scaleX: 1.15 }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)', scaleX: 1 }}
              exit={{ opacity: 0, x: 40, filter: 'blur(12px)', scaleX: 0.9 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className={styles.index}>
                momento {String(job + 1).padStart(2, '0')} / {String(jobs.length).padStart(2, '0')}
              </p>
              <h3 className={styles.role}>{jobs[job].role}</h3>
              <p className={styles.meta}>
                {jobs[job].company} · {jobs[job].place} · {jobs[job].period}
              </p>
              <p className={styles.summary}>{jobs[job].summary}</p>
            </motion.article>
          )}
        </AnimatePresence>

        <TimeMeter state={state} />
      </div>
    </section>
  )
}
