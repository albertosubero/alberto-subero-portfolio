# albertosubero.dev

CV online de Alberto Subero, Senior Frontend Developer. Una historia en ocho actos con estética Matrix: elegir pastilla, lluvia de código 3D, evolución del código, el Construct, cifras en binario, el arsenal de tecnologías, la experiencia en bullet time, el túnel de proyectos y la salida.

La pastilla azul (`/#cv`) lleva a un CV clásico, rápido y accesible.

## Stack

React 19 + TypeScript, Vite, React Three Fiber (Three.js) con postprocesado, Framer Motion y Lenis.

## Desarrollo

```bash
npm install
npm run dev
```

- `/#matrix` salta la intro y entra directo a la historia.
- `/?nofx#matrix` desactiva el postprocesado 3D.

## Contenido

Todo el texto del CV vive en `src/content/`:

- `profile.ts`: datos personales, experiencia, proyectos, tecnologías y retrato.
- `stats.ts`: cifras del Acto 4.
- `stack.ts`: estanterías del Acto 5.
- `eras.ts`: código de las tres épocas del Acto 2.

## Publicación

GitHub Pages publica la carpeta `docs/` de la rama `main`. Para publicar:

```bash
npm run build
git add -A && git commit -m "..." && git push
```

`npm run build` genera `docs/` (incluye `CNAME`, `.nojekyll`, favicons, PDFs del CV y capturas desde `public/`).

La web anterior en Angular está en la rama `legacy/angular-site`.
