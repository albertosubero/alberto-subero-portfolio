import { useEffect, useMemo, useRef, type ReactNode, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import type { MotionValue } from 'framer-motion'
import * as THREE from 'three'
import type { GlyphAtlas } from './glyphAtlas'
import { createGlyphPoints } from './glyphPoints'
import { PANEL_ASPECT } from './jobPanel'

const JOB_SPACING = 26
const ORBIT_RADIUS = 7.5
const ORBIT_ARC = 1.9
const PANEL_WIDTH = 5.4
const TRANSITION = 0.8
const BULLETS_PER_JOB = 5
const RINGS = 5

/** Tiempo de la escena: avanza muy despacio y se acelera con la velocidad del scroll. */
export type TimeState = { time: number; flow: number }

const center = (j: number) => new THREE.Vector3(0, 0, -j * JOB_SPACING)

function orbitPosition(j: number, t: number, out: THREE.Vector3, radius = ORBIT_RADIUS) {
  const theta = -ORBIT_ARC / 2 + t * ORBIT_ARC
  return out.set(radius * Math.sin(theta), 1.4 - t * 1.6, -j * JOB_SPACING + radius * Math.cos(theta))
}

const smooth = (k: number) => k * k * (3 - 2 * k)

/** Cámara para el avance s ∈ [0, n]: media órbita por trabajo y vuelo hasta el siguiente. */
function cameraAt(s: number, n: number, position: THREE.Vector3, target: THREE.Vector3, radius: number) {
  const j = Math.min(Math.floor(s), n - 1)
  const t = Math.min(1, s - j)
  orbitPosition(j, t, position, radius)
  target.copy(center(j))
  if (t > TRANSITION && j < n - 1) {
    const k = smooth((t - TRANSITION) / (1 - TRANSITION))
    position.lerp(orbitPosition(j + 1, 0, new THREE.Vector3(), radius), k)
    target.lerp(center(j + 1), k)
  }
}

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

type BulletSpec = { origin: THREE.Vector3; dir: THREE.Vector3; speed: number; phase: number }

function makeBullets(n: number): BulletSpec[] {
  const rand = seeded(42)
  const specs: BulletSpec[] = []
  for (let j = 0; j < n; j++) {
    for (let b = 0; b < BULLETS_PER_JOB; b++) {
      const angle = rand() * Math.PI * 2
      specs.push({
        origin: center(j).add(new THREE.Vector3((rand() - 0.5) * 7, (rand() - 0.5) * 4, (rand() - 0.5) * 5)),
        dir: new THREE.Vector3(Math.cos(angle), (rand() - 0.5) * 0.3, Math.sin(angle) * 0.6).normalize(),
        speed: 0.6 + rand() * 0.8,
        phase: rand() * 14,
      })
    }
  }
  return specs
}

/** Bala congelada con sus ondas de choque detrás (el plano clásico del bullet time). */
function Bullet({ spec, state }: { spec: BulletSpec; state: RefObject<TimeState> }) {
  const group = useRef<THREE.Group>(null)
  const quaternion = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), spec.dir),
    [spec.dir],
  )

  useFrame(() => {
    const d = ((spec.speed * state.current.time + spec.phase) % 14) - 7
    group.current!.position.copy(spec.origin).addScaledVector(spec.dir, d)
  })

  return (
    <group ref={group} quaternion={quaternion}>
      <mesh rotation-x={Math.PI / 2}>
        <capsuleGeometry args={[0.055, 0.22, 6, 12]} />
        <meshStandardMaterial color="#d8d8d0" metalness={1} roughness={0.25} />
      </mesh>
      {Array.from({ length: RINGS }, (_, i) => (
        <mesh key={i} position-z={-0.3 - i * 0.32}>
          <torusGeometry args={[0.09 + i * 0.07, 0.006, 6, 40]} />
          <meshBasicMaterial
            color="#b6ffc6"
            transparent
            opacity={0.55 * (1 - i / RINGS)}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function Particles({ atlas, n, state }: { atlas: GlyphAtlas; n: number; state: RefObject<TimeState> }) {
  const { geometry, material } = useMemo(() => {
    const zMin = -(n - 1) * JOB_SPACING - 16
    return createGlyphPoints(
      atlas,
      3200,
      new THREE.Vector3(-15, -9, zMin),
      new THREE.Vector3(30, 18, 26 - zMin),
    )
  }, [atlas, n])
  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )
  useFrame(() => {
    material.uniforms.uTime.value = state.current.time
  })
  return <points geometry={geometry} material={material} />
}

function Rig({ progress, n, state }: { progress: MotionValue<number>; n: number; state: RefObject<TimeState> }) {
  const position = useMemo(() => new THREE.Vector3(), [])
  const target = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => center(0), [])

  useFrame(({ camera, size }, delta) => {
    // En vertical la cámara se aleja para que la placa quepa a lo ancho
    const radius = ORBIT_RADIUS * Math.max(1, 1.25 / (size.width / size.height))
    cameraAt(progress.get() * n, n, position, target, radius)
    const lambda = 4
    camera.position.x = THREE.MathUtils.damp(camera.position.x, position.x, lambda, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, position.y, lambda, delta)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, position.z, lambda, delta)
    look.lerp(target, 1 - Math.exp(-lambda * delta))
    camera.lookAt(look)

    // El tiempo apenas corre en reposo; el scroll lo acelera
    const velocity = Math.abs(progress.getVelocity()) * n
    const flow = 0.03 + Math.min(velocity * 2.2, 3.5)
    state.current.flow = THREE.MathUtils.damp(state.current.flow, flow, 6, delta)
    state.current.time += state.current.flow * Math.min(delta, 0.05)
  })
  return null
}

// Mientras se lee el titular del acto solo se ven las partículas: placas y balas
// aparecen cuando el titular ya se ha ido (medido sobre el scroll completo de la sección)
const INTRO_FADE: [number, number] = [0.07, 0.1]

function IntroFade({ intro, children }: { intro: MotionValue<number>; children: ReactNode }) {
  const group = useRef<THREE.Group>(null)

  useFrame(() => {
    const g = group.current!
    const k = smooth(THREE.MathUtils.clamp((intro.get() - INTRO_FADE[0]) / (INTRO_FADE[1] - INTRO_FADE[0]), 0, 1))
    g.visible = k > 0.001
    if (!g.visible) return
    g.traverse((object) => {
      if (object instanceof THREE.PointLight) {
        object.userData.base ??= object.intensity
        object.intensity = object.userData.base * k
      }
      if (!(object instanceof THREE.Mesh)) return
      const material = object.material as THREE.Material
      material.userData.base ??= material.opacity
      material.transparent = true
      material.opacity = material.userData.base * k
    })
  })

  return <group ref={group}>{children}</group>
}

type SceneProps = {
  /** Avance de la historia (0..1), sin el tramo del titular */
  progress: MotionValue<number>
  /** Scroll completo de la sección, incluido el titular */
  intro: MotionValue<number>
  atlas: GlyphAtlas
  panels: THREE.Texture[]
  state: RefObject<TimeState>
  active: boolean
}

export function BulletTimeScene({ progress, intro, atlas, panels, state, active }: SceneProps) {
  const n = panels.length
  const bullets = useMemo(() => makeBullets(n), [n])
  const start = useMemo(() => orbitPosition(0, 0, new THREE.Vector3()), [])

  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      camera={{ position: start.toArray(), fov: 45, near: 0.1, far: 120 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0d0208']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={2.5} />
      <Rig progress={progress} n={n} state={state} />
      <Particles atlas={atlas} n={n} state={state} />

      <IntroFade intro={intro}>
        {panels.map((texture, j) => (
          <group key={j} position={center(j)}>
            <mesh>
              <planeGeometry args={[PANEL_WIDTH, PANEL_WIDTH / PANEL_ASPECT]} />
              <meshBasicMaterial map={texture} transparent toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
            <pointLight color="#00ff41" intensity={8} distance={9} position={[0, 0, 1.5]} />
          </group>
        ))}

        {bullets.map((spec, i) => (
          <Bullet key={i} spec={spec} state={state} />
        ))}
      </IntroFade>

      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.25} luminanceSmoothing={0.3} />
        <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
        <Vignette offset={0.25} darkness={0.8} />
      </EffectComposer>
    </Canvas>
  )
}
