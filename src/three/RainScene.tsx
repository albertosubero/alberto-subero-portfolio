import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import type { MotionValue } from 'framer-motion'
import * as THREE from 'three'
import type { GlyphAtlas } from './glyphAtlas'
import { createRainMaterial } from './rainMaterial'

const FOV = 50
const CAMERA_START = 9
const CAMERA_END = -36
const MASK_REVEAL_DELAY = 0.6
const MASK_REVEAL_DURATION = 2.8

// Capas de lluvia en profundidad: la cámara las atraviesa con el scroll.
const LAYERS = [
  { z: 0, seed: 1, density: 1, opacity: 1, mask: true },
  { z: -8, seed: 2, density: 0.55, opacity: 0.55 },
  { z: -17, seed: 3, density: 0.5, opacity: 0.45 },
  { z: -28, seed: 4, density: 0.45, opacity: 0.4 },
  { z: -46, seed: 5, density: 1, opacity: 0.65 },
]

type SceneProps = {
  progress: MotionValue<number>
  atlas: GlyphAtlas
  mask: THREE.Texture
  aspect: number
}

/** Altura visible de un plano a `distance` de la cámara inicial, con margen para el parallax. */
function planeHeight(distance: number) {
  return 2 * distance * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * 1.15
}

type LayerProps = (typeof LAYERS)[number] & {
  atlas: GlyphAtlas
  aspect: number
  maskTexture: THREE.Texture | null
  revealRef: RefObject<number>
}

function RainLayer({ z, seed, density, opacity, atlas, aspect, maskTexture, revealRef }: LayerProps) {
  const height = planeHeight(CAMERA_START - z)
  const width = height * aspect
  // Celdas más grandes en vertical para que el móvil no quede ilegible,
  // y más finas en la capa con máscara para que el nombre/retrato tenga resolución
  const cell = (aspect < 1 ? 0.13 : 0.2) * (maskTexture ? 0.5 : 1)
  const columns = Math.round(width / cell)
  const rows = Math.round(height / cell)

  const material = useMemo(
    () => createRainMaterial(atlas, [columns, rows], seed, density),
    [atlas, columns, rows, seed, density],
  )
  useEffect(() => () => material.dispose(), [material])

  useEffect(() => {
    material.uniforms.uMask.value = maskTexture
    material.uniforms.uHasMask.value = maskTexture ? 1 : 0
  }, [material, maskTexture])

  useFrame(({ clock, camera }) => {
    const u = material.uniforms
    u.uTime.value = clock.elapsedTime
    // Se desvanece justo antes de que la cámara la atraviese
    const distance = camera.position.z - z
    u.uOpacity.value = opacity * THREE.MathUtils.smoothstep(distance, 0.4, 3.5)
    u.uMaskReveal.value = revealRef.current
  })

  return (
    <mesh position={[0, 0, z]} material={material}>
      <planeGeometry args={[width, height]} />
    </mesh>
  )
}

function CameraRig({ progress }: { progress: MotionValue<number> }) {
  useFrame(({ camera, pointer }, delta) => {
    const p = progress.get()
    const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
    const targetZ = THREE.MathUtils.lerp(CAMERA_START, CAMERA_END, eased)

    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 5, delta)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.35, 2.5, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, pointer.y * 0.2, 2.5, delta)
    camera.lookAt(camera.position.x * 0.4, camera.position.y * 0.4, camera.position.z - 10)
    // Ligero giro al caer por la madriguera
    camera.rotateZ(eased * 0.35)
  })
  return null
}

function Rain({ progress, atlas, mask, aspect }: SceneProps) {
  const revealRef = useRef(0)
  const startRef = useRef<number | null>(null)

  useFrame(({ clock }) => {
    startRef.current ??= clock.elapsedTime
    const t = clock.elapsedTime - startRef.current - MASK_REVEAL_DELAY
    revealRef.current = THREE.MathUtils.clamp(t / MASK_REVEAL_DURATION, 0, 1)
  })

  return (
    <>
      <CameraRig progress={progress} />
      {LAYERS.map((layer) => (
        <RainLayer
          key={layer.seed}
          {...layer}
          atlas={atlas}
          aspect={aspect}
          maskTexture={layer.mask ? mask : null}
          revealRef={revealRef}
        />
      ))}
    </>
  )
}

export function RainScene({ active, ...props }: SceneProps & { active: boolean }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, CAMERA_START], fov: FOV, near: 0.1, far: 120 }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0d0208']} />
      <Rain {...props} />
      {/* ?nofx desactiva el postprocesado (depuración / equipos lentos) */}
      {!location.search.includes('nofx') && (
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={1.3} luminanceThreshold={0.12} luminanceSmoothing={0.35} />
        <Noise opacity={0.06} blendFunction={BlendFunction.OVERLAY} />
        <Vignette offset={0.25} darkness={0.75} />
      </EffectComposer>
      )}
    </Canvas>
  )
}
