import * as THREE from 'three'
import { fadeOutsideFocus, loadPortrait, type Portrait } from '../lib/portrait'

const WIDTH = 1024

function toTexture(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  return texture
}

function createCanvas(aspect: number) {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = Math.round(WIDTH / aspect)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  return { canvas, ctx }
}

/**
 * Máscara de texto: donde es blanca, la lluvia se "congela" y dibuja las letras.
 * `coverage` es la fracción del ancho/alto que puede ocupar el bloque de texto.
 */
export async function createTextMask(lines: string[], aspect: number, coverage = 0.62) {
  const family = '"Anton", "Arial Narrow", sans-serif'
  await document.fonts.load(`100px ${family}`, lines.join('')).catch(() => undefined)

  const { canvas, ctx } = createCanvas(aspect)
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Ajusta el tamaño para que la línea más larga quepa en el ancho y el bloque en el alto
  ctx.font = `100px ${family}`
  const widest = Math.max(...lines.map((l) => ctx.measureText(l).width))
  const lineHeight = 0.95
  const size = Math.min(
    (canvas.width * coverage * 100) / widest,
    (canvas.height * coverage) / (lines.length * lineHeight),
  )
  ctx.font = `${size}px ${family}`
  const top = canvas.height / 2 - ((lines.length - 1) * size * lineHeight) / 2
  lines.forEach((line, i) => ctx.fillText(line, canvas.width / 2, top + i * size * lineHeight))

  return toTexture(canvas)
}

/** Máscara a partir del retrato: busto apoyado abajo y fondo fundido a negro. */
export async function createImageMask(portrait: Portrait, aspect: number, coverage = 0.85) {
  const source = await loadPortrait(portrait)

  const { canvas, ctx } = createCanvas(aspect)
  // Que quepa en alto y, en pantallas verticales, también en ancho
  const height = Math.min(canvas.height * coverage, (canvas.width * 0.95 * source.height) / source.width)
  const width = (source.width / source.height) * height
  const rect = { x: (canvas.width - width) / 2, y: canvas.height - height, w: width, h: height }
  // Más brillo que contraste: la mitad en sombra de la cara no debe desaparecer
  ctx.filter = 'grayscale(1) contrast(1.2) brightness(1.45)'
  ctx.drawImage(source, rect.x, rect.y, rect.w, rect.h)
  ctx.filter = 'none'
  fadeOutsideFocus(ctx, rect, portrait.focus, '#000')
  return toTexture(canvas)
}
