// Preparación del retrato: recorte a busto y fundido del fondo con un óvalo suave.
// Coordenadas normalizadas (0..1): `crop` respecto a la foto original, `focus` respecto al recorte.

export type Portrait = {
  src: string
  crop: { x: number; y: number; w: number; h: number }
  focus: { x: number; y: number; rx: number; ry: number }
}

export const FULL_IMAGE: Portrait['crop'] = { x: 0, y: 0, w: 1, h: 1 }

/** El óvalo de foco expresado respecto a la foto completa en lugar del recorte. */
export function focusInFullImage({ crop, focus }: Portrait): Portrait['focus'] {
  return {
    x: crop.x + focus.x * crop.w,
    y: crop.y + focus.y * crop.h,
    rx: focus.rx * crop.w,
    ry: focus.ry * crop.h,
  }
}

/** Carga la foto y devuelve solo el recorte, en un canvas. */
export async function loadPortrait({ src, crop }: Portrait) {
  const image = new Image()
  image.src = src
  await image.decode()
  const sx = crop.x * image.naturalWidth
  const sy = crop.y * image.naturalHeight
  const sw = crop.w * image.naturalWidth
  const sh = crop.h * image.naturalHeight
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(sw)
  canvas.height = Math.round(sh)
  canvas.getContext('2d')!.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh)
  return canvas
}

/**
 * Pinta `color` fuera del óvalo de foco (con borde suave), dentro del rectángulo
 * donde se dibujó el recorte. Todo lo que queda fuera del óvalo también se cubre.
 */
export function fadeOutsideFocus(
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; w: number; h: number },
  focus: Portrait['focus'],
  color: string,
) {
  ctx.save()
  ctx.translate(rect.x + focus.x * rect.w, rect.y + focus.y * rect.h)
  ctx.scale(focus.rx * rect.w, focus.ry * rect.h)
  const gradient = ctx.createRadialGradient(0, 0, 0.7, 0, 0, 1)
  gradient.addColorStop(0, transparentOf(color))
  gradient.addColorStop(1, color)
  ctx.fillStyle = gradient
  // En unidades del óvalo: un rectángulo enorme cubre todo el canvas
  ctx.fillRect(-50, -50, 100, 100)
  ctx.restore()
}

function transparentOf(color: string) {
  return color === '#fff' || color === '#ffffff' ? 'rgba(255,255,255,0)' : 'rgba(0,0,0,0)'
}
