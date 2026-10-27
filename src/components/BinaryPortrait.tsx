import { useEffect, useRef, type PointerEvent } from 'react'
import { useReducedMotion } from 'framer-motion'
import { FULL_IMAGE, loadPortrait, type Portrait } from '../lib/portrait'
import styles from './BinaryPortrait.module.css'

const INK = '#0d0208'
const SCAN = '#00b833'
const FRAME_MS = 1000 / 30
// Tras aparecer: un momento en binario y luego el barrido hasta la foto
const REVEAL_DELAY = 1200
const REVEAL_MS = 2200

type Props = {
  /** Retrato recortado. Sin él se dibuja una silueta provisional. */
  portrait: Portrait | null
  alt: string
  columns?: number
}

/** Silueta de busto provisional mientras no haya foto. */
function drawPlaceholder(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, width, height)
  // Luz lateral: más oscuro a la derecha
  const shade = ctx.createLinearGradient(0, 0, width, 0)
  shade.addColorStop(0, '#6a6a6a')
  shade.addColorStop(1, '#101010')
  ctx.fillStyle = shade
  ctx.beginPath()
  ctx.ellipse(width * 0.5, height * 1.02, width * 0.46, height * 0.33, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(width * 0.42, height * 0.5, width * 0.16, height * 0.25)
  ctx.beginPath()
  ctx.ellipse(width * 0.5, height * 0.38, width * 0.19, height * 0.2, 0, 0, Math.PI * 2)
  ctx.fill()
  return canvas
}

/**
 * Autoniveles: estira la oscuridad de la zona visible (percentiles 10–95) a 0..1
 * y aplica una curva, para que los medios tonos de la cara se separen del pelo y la ropa.
 */
function stretchLevels(darkness: Float32Array) {
  const visible = Array.from(darkness).filter((d) => d > 0.04).sort((a, b) => a - b)
  if (visible.length < 10) return
  const lo = visible[Math.floor(visible.length * 0.1)]
  const hi = visible[Math.floor(visible.length * 0.95)]
  for (let i = 0; i < darkness.length; i++) {
    if (darkness[i] <= 0.04) continue
    const v = Math.min(1, Math.max(0, (darkness[i] - lo) / (hi - lo || 1)))
    darkness[i] = v * v * (3 - 2 * v)
  }
}

/** Dibuja `source` cubriendo el rectángulo (como object-fit: cover) y devuelve dónde quedó. */
function drawCover(ctx: CanvasRenderingContext2D, source: HTMLCanvasElement, width: number, height: number) {
  const scale = Math.max(width / source.width, height / source.height)
  const rect = {
    x: (width - source.width * scale) / 2,
    y: (height - source.height * scale) / 2,
    w: source.width * scale,
    h: source.height * scale,
  }
  ctx.drawImage(source, rect.x, rect.y, rect.w, rect.h)
  return rect
}

/**
 * Retrato hecho de ceros y unos que, al aparecer, se descifra solo hasta la foto real.
 * Después, una "lente" bajo el cursor vuelve a mostrar el código que hay debajo.
 */
export function BinaryPortrait({ portrait, alt, columns = 84 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointer = useRef({ x: 0, y: 0, active: false })
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let frame = 0
    let visible = false
    let cancelled = false
    let lens = 0
    let revealStart: number | null = null

    const dpr = Math.min(window.devicePixelRatio, 2)

    // Con foto se usa la imagen completa, sin recorte
    const fullPhoto = portrait ? loadPortrait({ ...portrait, crop: FULL_IMAGE }) : Promise.resolve(null)

    fullPhoto.then((full) => {
      if (cancelled) return

      // El lienzo toma las proporciones de la foto para que se vea entera
      if (full) canvas.style.aspectRatio = `${full.width} / ${full.height}`
      const width = canvas.clientWidth * dpr
      const height = canvas.clientHeight * dpr
      canvas.width = width
      canvas.height = height
      const cell = width / columns
      const rows = Math.ceil(height / cell)
      const source = full ?? drawPlaceholder(Math.round(width), Math.round(height))

      // Muestreo de luminancia a resolución de celda: la imagen completa, sin fundidos
      const sample = document.createElement('canvas')
      sample.width = columns
      sample.height = rows
      const sctx = sample.getContext('2d', { willReadFrequently: true })!
      sctx.filter = 'grayscale(1) contrast(1.4)'
      drawCover(sctx, source, columns, rows)
      const data = sctx.getImageData(0, 0, columns, rows).data
      const darkness = new Float32Array(columns * rows)
      for (let i = 0; i < darkness.length; i++) darkness[i] = 1 - data[i * 4] / 255
      if (portrait) stretchLevels(darkness)

      // La foto final: completa, ocupando todo el rectángulo y sin fundidos
      const photo = document.createElement('canvas')
      photo.width = width
      photo.height = height
      drawCover(photo.getContext('2d')!, source, width, height)

      const bits = Uint8Array.from({ length: darkness.length }, () => (Math.random() < 0.5 ? 0 : 1))
      ctx.font = `500 ${cell * 0.92}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      let last = 0
      const draw = (now: number) => {
        frame = requestAnimationFrame(draw)
        if (!visible || now - last < FRAME_MS) return
        last = now

        const target = pointer.current.active ? width * 0.22 : 0
        lens += (target - lens) * 0.18
        const px = pointer.current.x * dpr
        const py = pointer.current.y * dpr

        // Revelado: una línea baja fila a fila y convierte el binario en la foto
        const t = reduceMotion ? 1 : revealStart === null ? 0 : (now - revealStart - REVEAL_DELAY) / REVEAL_MS
        const progress = Math.min(1, Math.max(0, t))
        const revealRow = progress * (rows + 4) - 2
        const revealY = Math.max(0, revealRow * cell)
        const scanning = progress > 0 && progress < 1

        ctx.clearRect(0, 0, width, height)

        // Foto donde ya se reveló, invertida dentro de la lente (XOR con evenodd)
        ctx.save()
        ctx.beginPath()
        ctx.rect(0, 0, width, revealY)
        if (lens > 1) ctx.arc(px, py, lens, 0, Math.PI * 2)
        ctx.clip('evenodd')
        ctx.drawImage(photo, 0, 0)
        ctx.restore()

        // Zona ya revelada que la lente vuelve a convertir en código: fondo blanco debajo
        if (lens > 1 && revealY > 0) {
          ctx.save()
          ctx.beginPath()
          ctx.rect(0, 0, width, revealY)
          ctx.clip()
          ctx.beginPath()
          ctx.arc(px, py, lens, 0, Math.PI * 2)
          ctx.fillStyle = '#fff'
          ctx.fill()
          ctx.restore()
        }

        // Antes de revelar, una línea verde recorre el retrato en bucle
        const idleScan = reduceMotion || revealStart !== null ? -10 : ((now / 28) % (rows + 20)) - 10

        for (let row = 0; row < rows; row++) {
          const revealed = row < revealRow
          const edge = scanning && Math.abs(row - revealRow) < 1.5
          const scan = edge || Math.abs(row - idleScan) < 1.5
          for (let col = 0; col < columns; col++) {
            const i = row * columns + col
            const x = (col + 0.5) * cell
            const y = (row + 0.5) * cell
            const inLens = lens > 1 && Math.hypot(x - px, y - py) < lens
            const d = darkness[i]
            // Se ve código si (no revelado y fuera de la lente) o (revelado y dentro de ella)
            if (revealed !== inLens && !edge) continue
            if (d < 0.12 && !edge) continue
            if (!reduceMotion && Math.random() < 0.015) bits[i] ^= 1
            ctx.globalAlpha = scan ? 1 : Math.pow(d, 0.85)
            ctx.fillStyle = scan ? SCAN : INK
            ctx.fillText(bits[i] ? '1' : '0', x, y)
          }
        }
        ctx.globalAlpha = 1

        // Anillo de la lente
        if (lens > 1) {
          ctx.strokeStyle = SCAN
          ctx.lineWidth = 2 * dpr
          ctx.beginPath()
          ctx.arc(px, py, lens, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
      frame = requestAnimationFrame(draw)
    })

    // Solo anima mientras está en pantalla; el revelado arranca (una vez) al verse la mitad
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (revealStart === null && entry.intersectionRatio >= 0.5) revealStart = performance.now()
      },
      { threshold: [0, 0.5] },
    )
    observer.observe(canvas)

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [portrait, columns, reduceMotion])

  const move = (e: PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    pointer.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true }
  }

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      role="img"
      aria-label={alt}
      onPointerMove={move}
      onPointerDown={move}
      onPointerLeave={() => (pointer.current.active = false)}
      onPointerUp={(e) => e.pointerType !== 'mouse' && (pointer.current.active = false)}
    />
  )
}
