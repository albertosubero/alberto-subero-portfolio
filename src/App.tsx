import { lazy, Suspense, useEffect, useState } from 'react'
import { Act0Choice } from './acts/Act0Choice'
import { ClassicCV } from './acts/ClassicCV'

// Three.js y el postprocesado solo se descargan para la pastilla roja
const loadStory = () => import('./acts/MatrixStory')
const MatrixStory = lazy(() => loadStory().then((m) => ({ default: m.MatrixStory })))

type Stage = 'intro' | 'matrix' | 'classic'

// #cv entra directo al CV clásico (enlace para reclutadores); #matrix salta la intro.
function stageFromHash(): Stage {
  if (location.hash === '#cv') return 'classic'
  if (location.hash === '#matrix') return 'matrix'
  return 'intro'
}

export default function App() {
  const [stage, setStage] = useState<Stage>(stageFromHash)

  useEffect(() => {
    document.body.dataset.stage = stage
    const hash = stage === 'classic' ? '#cv' : stage === 'matrix' ? '#matrix' : ''
    if (location.hash !== hash) history.replaceState(null, '', hash || location.pathname)
  }, [stage])

  useEffect(() => {
    const onHash = () => setStage(stageFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (stage === 'classic') return <ClassicCV onMatrix={() => setStage('matrix')} />
  if (stage === 'matrix')
    return (
      <Suspense fallback={null}>
        <MatrixStory onClassic={() => setStage('classic')} onRestart={() => setStage('intro')} />
      </Suspense>
    )
  return (
    <Act0Choice
      onReady={loadStory}
      onChoose={(c) => setStage(c === 'red' ? 'matrix' : 'classic')}
    />
  )
}
