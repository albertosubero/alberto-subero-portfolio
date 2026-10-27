import * as THREE from 'three'
import type { GlyphAtlas } from './glyphAtlas'

const vertexShader = /* glsl */ `
  attribute vec3 aVelocity;
  attribute float aGlyph;
  attribute float aSize;

  uniform float uTime;
  uniform vec3 uBoxMin;
  uniform vec3 uBoxSize;
  uniform float uPixelRatio;

  varying float vGlyph;
  varying float vDepth;

  void main() {
    // Posición = origen + velocidad · tiempo, envuelta dentro de la caja
    vec3 p = mod(position + aVelocity * uTime - uBoxMin, uBoxSize) + uBoxMin;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (220.0 / -mv.z);
    vGlyph = aGlyph;
    vDepth = -mv.z;
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uAtlas;
  uniform vec2 uAtlasGrid;
  uniform vec3 uColor;

  varying float vGlyph;
  varying float vDepth;

  void main() {
    vec2 cell = vec2(mod(vGlyph, uAtlasGrid.x), floor(vGlyph / uAtlasGrid.x));
    vec2 uv = vec2(
      (cell.x + gl_PointCoord.x) / uAtlasGrid.x,
      1.0 - (cell.y + gl_PointCoord.y) / uAtlasGrid.y
    );
    float ink = texture2D(uAtlas, uv).r;
    // Niebla manual: cerca y lejos se apagan
    float fade = smoothstep(0.6, 2.5, vDepth) * (1.0 - smoothstep(18.0, 42.0, vDepth));
    float alpha = ink * fade;
    if (alpha < 0.02) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`

export function createGlyphPoints(atlas: GlyphAtlas, count: number, boxMin: THREE.Vector3, boxSize: THREE.Vector3) {
  const positions = new Float32Array(count * 3)
  const velocities = new Float32Array(count * 3)
  const glyphs = new Float32Array(count)
  const sizes = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    positions[i * 3] = boxMin.x + Math.random() * boxSize.x
    positions[i * 3 + 1] = boxMin.y + Math.random() * boxSize.y
    positions[i * 3 + 2] = boxMin.z + Math.random() * boxSize.z
    // Todo cae (como la lluvia) con algo de deriva lateral
    velocities[i * 3] = (Math.random() - 0.5) * 0.15
    velocities[i * 3 + 1] = -0.25 - Math.random() * 0.6
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.15
    glyphs[i] = Math.floor(Math.random() * atlas.count)
    sizes[i] = 0.5 + Math.random() * 1.1
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aVelocity', new THREE.BufferAttribute(velocities, 3))
  geometry.setAttribute('aGlyph', new THREE.BufferAttribute(glyphs, 1))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uBoxMin: { value: boxMin },
      uBoxSize: { value: boxSize },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.75) },
      uAtlas: { value: atlas.texture },
      uAtlasGrid: { value: new THREE.Vector2(atlas.columns, atlas.rows) },
      uColor: { value: new THREE.Color('#00ff41') },
    },
  })

  return { geometry, material }
}
