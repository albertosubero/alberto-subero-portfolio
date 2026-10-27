import type { ModuleKind } from '../content/profile'
import styles from './ModuleMock.module.css'

/** Maqueta en wireframe de un módulo (solo CSS: sin capturas reales todavía). */
export function ModuleMock({ kind }: { kind: ModuleKind }) {
  switch (kind) {
    case 'invoice':
      return (
        <div className={styles.invoice}>
          <span className={styles.heading} />
          {[70, 55, 80, 45].map((w, i) => (
            <span key={i} className={styles.row}>
              <i style={{ width: `${w}%` }} />
              <b />
            </span>
          ))}
          <span className={styles.total}>
            <i />
            <b />
          </span>
        </div>
      )
    case 'quote':
      return (
        <div className={styles.quote}>
          {[true, true, false, true].map((ok, i) => (
            <span key={i} className={styles.row}>
              <em data-ok={ok} />
              <i style={{ width: `${50 + ((i * 17) % 35)}%` }} />
            </span>
          ))}
          <span className={styles.button} />
        </div>
      )
    case 'clock':
      return (
        <div className={styles.clock}>
          <strong>08:00 → 17:00</strong>
          <span className={styles.bars}>
            {[60, 85, 70, 95, 40].map((h, i) => (
              <i key={i} style={{ height: `${h}%` }} />
            ))}
          </span>
        </div>
      )
    case 'tasks':
      return (
        <div className={styles.tasks}>
          {[3, 2, 1].map((count, col) => (
            <span key={col} className={styles.column}>
              {Array.from({ length: count }, (_, i) => (
                <i key={i} data-done={col === 2} />
              ))}
            </span>
          ))}
        </div>
      )
    case 'booking':
      return (
        <div className={styles.booking}>
          {Array.from({ length: 21 }, (_, i) => (
            <i key={i} data-state={[3, 9, 10, 16].includes(i) ? 'busy' : i === 12 ? 'today' : undefined} />
          ))}
        </div>
      )
  }
}
