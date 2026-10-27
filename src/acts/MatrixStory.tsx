import { useEffect, useState } from 'react'
import { motion, useScroll } from 'framer-motion'
import Lenis from 'lenis'
import { Act1Rain } from './Act1Rain'
import { Act2Evolution } from './Act2Evolution'
import { Act3Construct } from './Act3Construct'
import { Act4Numbers } from './Act4Numbers'
import { Act5Racks } from './Act5Racks'
import { Act6BulletTime } from './Act6BulletTime'
import { Act7Tunnel } from './Act7Tunnel'
import { Act8Exit } from './Act8Exit'
import styles from './MatrixStory.module.css'

/**
 * Qué sección ocupa el centro de la pantalla. Cada sección lleva `data-act`
 * y, si su fondo es claro, `data-hud="light"`.
 */
function useCurrentSection() {
  const [section, setSection] = useState({ act: '01', light: false })
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const { act = '01', hud } = (entry.target as HTMLElement).dataset
          setSection({ act, light: hud === 'light' })
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    document.querySelectorAll<HTMLElement>('[data-act]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return section
}

/** La pastilla roja: todos los actos encadenados con scroll suave y un HUD común. */
export function MatrixStory({ onClassic, onRestart }: { onClassic: () => void; onRestart: () => void }) {
  const { scrollYProgress } = useScroll()
  const { act, light } = useCurrentSection()
  // La entrada del Construct empieza en negro: avisa cuando el blanco ya cubre la pantalla
  const [constructWhite, setConstructWhite] = useState(false)
  const theme = light || (act === '03' && constructWhite) ? 'light' : 'dark'

  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true, lerp: 0.08 })
    lenis.scrollTo(0, { immediate: true, force: true })
    return () => lenis.destroy()
  }, [])

  return (
    <>
      <header className={styles.hud} data-theme={theme}>
        <span className={styles.logo}>AS_</span>
        <button type="button" className={styles.skip} onClick={onClassic}>
          Saltar a CV clásico →
        </button>
      </header>

      <div className={styles.rail} data-theme={theme} aria-hidden>
        <motion.span style={{ scaleY: scrollYProgress }} />
        <small>{act}</small>
      </div>

      <main>
        <Act1Rain />
        <Act2Evolution />
        <Act3Construct onWhite={setConstructWhite} />
        <Act4Numbers />
        <Act5Racks />
        <Act6BulletTime />
        <Act7Tunnel />
        <Act8Exit onClassic={onClassic} onRestart={onRestart} />
      </main>

      <div className="crt-overlay" data-theme={theme} aria-hidden />
    </>
  )
}
