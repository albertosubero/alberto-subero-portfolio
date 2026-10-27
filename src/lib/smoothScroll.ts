import type Lenis from 'lenis'

// Instancia de Lenis activa (la crea MatrixStory). Los actos la usan para desplazar
// la página sin pelearse con el scroll suave.
let current: Lenis | null = null

export function setSmoothScroll(lenis: Lenis | null) {
  current = lenis
}

/** Baja con suavidad hasta el final de la página. */
export function scrollToBottom(duration = 2.2) {
  const bottom = document.documentElement.scrollHeight - window.innerHeight
  if (current) {
    // El contenido acaba de crecer (aparece el contacto): Lenis debe recalcular el alto
    current.resize()
    current.scrollTo(bottom, { duration })
  } else {
    window.scrollTo({ top: bottom, behavior: 'smooth' })
  }
}
