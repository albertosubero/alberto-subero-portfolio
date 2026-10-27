import { motion } from 'framer-motion'
import styles from './Pill.module.css'

type Props = {
  color: 'red' | 'blue'
  title: string
  caption: string
  hotkey: string
  dimmed: boolean
  onHover: (hovering: boolean) => void
  onChoose: () => void
}

export function Pill({ color, title, caption, hotkey, dimmed, onHover, onChoose }: Props) {
  return (
    <motion.button
      type="button"
      className={styles.root}
      data-color={color}
      onClick={onChoose}
      onHoverStart={() => onHover(true)}
      onHoverEnd={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      animate={{ opacity: dimmed ? 0.35 : 1, filter: dimmed ? 'blur(2px)' : 'blur(0px)' }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <motion.span
        className={styles.capsule}
        aria-hidden
        initial={{ rotate: color === 'red' ? -24 : 24 }}
        whileHover={{ rotate: color === 'red' ? -12 : 12, scale: 1.08 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
      />
      <span className={styles.title}>{title}</span>
      <span className={styles.caption}>{caption}</span>
      <kbd className={styles.hotkey}>{hotkey}</kbd>
    </motion.button>
  )
}
