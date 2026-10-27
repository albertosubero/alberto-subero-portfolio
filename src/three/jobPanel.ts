import * as THREE from 'three'

export const PANEL_ASPECT = 1.6
const WIDTH = 1280
const HEIGHT = WIDTH / PANEL_ASPECT

type Job = { company: string; role: string; period: string }

/** Placa del "momento congelado" de un trabajo, dibujada en un canvas 2D. */
export async function createJobPanelTexture(job: Job, index: number) {
  await Promise.all([
    document.fonts.load('100px "Anton"', job.company),
    document.fonts.load('700 40px "JetBrains Mono"', job.role),
  ]).catch(() => undefined)

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = 'rgba(2, 18, 7, 0.95)'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  // Rejilla de fondo
  ctx.strokeStyle = 'rgba(0, 255, 65, 0.07)'
  ctx.lineWidth = 2
  for (let x = 0; x < WIDTH; x += 64) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, HEIGHT)
    ctx.stroke()
  }
  // Marco con esquinas reforzadas
  ctx.strokeStyle = 'rgba(0, 255, 65, 0.5)'
  ctx.lineWidth = 4
  ctx.strokeRect(12, 12, WIDTH - 24, HEIGHT - 24)
  ctx.strokeStyle = '#00ff41'
  ctx.lineWidth = 10
  const c = 70
  for (const [x, y, dx, dy] of [
    [12, 12, 1, 1],
    [WIDTH - 12, 12, -1, 1],
    [12, HEIGHT - 12, 1, -1],
    [WIDTH - 12, HEIGHT - 12, -1, -1],
  ]) {
    ctx.beginPath()
    ctx.moveTo(x + dx * c, y)
    ctx.lineTo(x, y)
    ctx.lineTo(x, y + dy * c)
    ctx.stroke()
  }

  const pad = 90
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#00ff41'
  ctx.font = '700 34px "JetBrains Mono", monospace'
  ctx.fillText(`MOMENTO ${String(index + 1).padStart(2, '0')}`, pad, pad + 30)

  // Nombre de la empresa, ajustado al ancho disponible
  ctx.fillStyle = '#f5f5f0'
  let size = 230
  ctx.font = `${size}px "Anton", sans-serif`
  const max = WIDTH - pad * 2
  const measured = ctx.measureText(job.company.toUpperCase()).width
  if (measured > max) {
    size = Math.floor((size * max) / measured)
    ctx.font = `${size}px "Anton", sans-serif`
  }
  ctx.fillText(job.company.toUpperCase(), pad, HEIGHT / 2 + size * 0.35)

  ctx.fillStyle = '#00ff41'
  ctx.font = '700 44px "JetBrains Mono", monospace'
  ctx.fillText(job.role, pad, HEIGHT - pad - 60)
  ctx.fillStyle = 'rgba(245, 245, 240, 0.6)'
  ctx.font = '400 34px "JetBrains Mono", monospace'
  ctx.fillText(job.period, pad, HEIGHT - pad)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}
