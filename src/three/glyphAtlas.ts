import * as THREE from 'three'

// Katakana de ancho medio + dígitos y símbolos, como la lluvia original.
export const GLYPHS = Array.from('ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ012345789Z:・."=*+-<>¦|')
export const ATLAS_COLUMNS = 8
const CELL = 64
const FONT = `500 ${CELL * 0.72}px "Noto Sans JP", "MS Gothic", "Yu Gothic", monospace`

export type GlyphAtlas = {
  texture: THREE.CanvasTexture
  columns: number
  rows: number
  count: number
}

/** Dibuja todos los glifos en un atlas (en espejo, como en la película). */
export async function createGlyphAtlas(): Promise<GlyphAtlas> {
  await document.fonts.load(FONT, GLYPHS.join('')).catch(() => undefined)

  const rows = Math.ceil(GLYPHS.length / ATLAS_COLUMNS)
  const canvas = document.createElement('canvas')
  canvas.width = ATLAS_COLUMNS * CELL
  canvas.height = rows * CELL
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#fff'
  ctx.font = FONT
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  GLYPHS.forEach((glyph, i) => {
    const x = (i % ATLAS_COLUMNS) * CELL
    const y = Math.floor(i / ATLAS_COLUMNS) * CELL
    ctx.save()
    ctx.translate(x + CELL, y)
    ctx.scale(-1, 1)
    ctx.fillText(glyph, CELL / 2, CELL / 2 + 2)
    ctx.restore()
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.generateMipmaps = true
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.anisotropy = 4
  return { texture, columns: ATLAS_COLUMNS, rows, count: GLYPHS.length }
}
