import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import type * as THREE from 'three'
import { profile } from '../content/profile'
import { DecodeText } from '../components/DecodeText'
import { createGlyphAtlas, type GlyphAtlas } from '../three/glyphAtlas'
import { createImageMask, createTextMask } from '../three/maskTexture'
import { RainScene } from '../three/RainScene'
import styles from './Act1Rain.module.css'

type Assets = { atlas: GlyphAtlas; mask: THREE.Texture; aspect: number }

function useViewportAspect() {
  const [aspect, setAspect] = useState(() => window.innerWidth / window.innerHeight)
  useEffect(() => {
    let id = 0
    const onResize = () => {
      window.clearTimeout(id)
      id = window.setTimeout(() => setAspect(window.innerWidth / window.innerHeight), 250)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return aspect
}

function useRainAssets(aspect: number) {
  const [atlas, setAtlas] = useState<GlyphAtlas | null>(null)
  const [assets, setAssets] = useState<Assets | null>(null)

  useEffect(() => {
    let cancelled = false
    createGlyphAtlas().then((a) => !cancelled && setAtlas(a))
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!atlas) return
    let cancelled = false
    const [first, ...rest] = profile.name.toUpperCase().split(' ')
    const mask = profile.portrait
      ? createImageMask(profile.portrait, aspect)
      : createTextMask([first, rest.join(' ')], aspect, aspect < 1 ? 0.78 : 0.62)
    mask.then((m) => {
      if (cancelled) return m.dispose()
      setAssets((prev) => {
        prev?.mask.dispose()
        return { atlas, mask: m, aspect }
      })
    })
    return () => {
      cancelled = true
    }
  }, [atlas, aspect])

  return assets
}

/** Bloque de texto que aparece y desaparece en un tramo del scroll [from, to]. */
function Beat({
  progress,
  from,
  to,
  children,
}: {
  progress: MotionValue<number>
  from: number
  to: number
  children: (active: boolean) => ReactNode
}) {
  const fade = 0.04
  // Framer acelera estas transformaciones con WAAPI: los offsets deben estar en [0, 1].
  // Si el tramo llega al final del scroll, el bloque se queda visible.
  const holds = to >= 1
  const opacity = useTransform(
    progress,
    holds ? [from, from + fade] : [from, from + fade, to - fade, to],
    holds ? [0, 1] : [0, 1, 1, 0],
  )
  const y = useTransform(progress, [from, Math.min(to, 1)], [40, holds ? 0 : -40])
  const blur = useTransform(opacity, [0, 1], ['blur(10px)', 'blur(0px)'])
  const [active, setActive] = useState(false)
  useMotionValueEvent(progress, 'change', (p) => setActive(p > from && (holds || p < to)))

  return (
    <motion.div className={styles.beat} style={{ opacity, y, filter: blur }} aria-hidden={!active}>
      {children(active)}
    </motion.div>
  )
}

export function Act1Rain() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  // Fuera de pantalla el canvas deja de renderizar
  const inView = useInView(sectionRef)
  const aspect = useViewportAspect()
  const assets = useRainAssets(aspect)

  const heroOpacity = useTransform(scrollYProgress, [0, 0.07], [1, 0])

  return (
    <section ref={sectionRef} className={styles.root} data-act="01" aria-label="Acto 1: la lluvia">
      <div className={styles.sticky}>
        <motion.div
          className={styles.canvas}
          initial={{ opacity: 0 }}
          animate={{ opacity: assets ? 1 : 0 }}
          transition={{ duration: 1.6 }}
        >
          {assets && <RainScene progress={scrollYProgress} active={inView} {...assets} />}
        </motion.div>

        <motion.div className={styles.hero} style={{ opacity: heroOpacity }}>
          {/* Con retrato, la lluvia dibuja la cara: el nombre pasa a ser texto visible */}
          <h1 className={profile.portrait ? styles.name : 'sr-only'}>{profile.name}</h1>
          <p className={styles.role} aria-hidden>
            <DecodeText text={`${profile.role} · ${profile.stack}`} active duration={1800} />
          </p>
          <p className={styles.scrollHint} aria-hidden>
            Baja por la madriguera <span>↓</span>
          </p>
        </motion.div>

        <Beat progress={scrollYProgress} from={0.16} to={0.4}>
          {(active) => (
            <>
              <p className={styles.kicker}>// la verdad es que</p>
              <h2 className={styles.statement}>
                <DecodeText text="No es magia." active={active} />
                <br />
                <DecodeText text="Es código." active={active} duration={1300} className={styles.accent} />
              </h2>
            </>
          )}
        </Beat>

        <Beat progress={scrollYProgress} from={0.46} to={0.72}>
          {(active) => (
            <>
              <p className={styles.kicker}>// experiencia</p>
              <h2 className={styles.statement}>
                <DecodeText text="+10 años" active={active} className={styles.accent} />
              </h2>
              <p className={styles.body}>
                convirtiendo código legacy en producto moderno, para equipos B2B y B2C de Europa y
                Latinoamérica.
              </p>
            </>
          )}
        </Beat>

        <Beat progress={scrollYProgress} from={0.8} to={1}>
          {(active) => (
            <>
              <p className={styles.kicker}>// acto 02 · evolución</p>
              <h2 className={styles.statement}>
                <DecodeText text="El código" active={active} />
                <br />
                <DecodeText text="va a mutar." active={active} duration={1300} className={styles.accent} />
              </h2>
              <p className={styles.scrollHint}>
                Sigue bajando <span>↓</span>
              </p>
            </>
          )}
        </Beat>
      </div>
    </section>
  )
}
