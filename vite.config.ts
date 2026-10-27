import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // GitHub Pages publica la carpeta /docs de la rama main (albertosubero.dev)
    outDir: 'docs',
    emptyOutDir: true,
    // Three.js y el postprocesado van en un chunk diferido que solo carga la pastilla roja
    chunkSizeWarningLimit: 1200,
  },
})
