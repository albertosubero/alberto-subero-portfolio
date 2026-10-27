import * as THREE from 'three'
import type { GlyphAtlas } from './glyphAtlas'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D uAtlas;
  uniform vec2 uAtlasGrid;   // columnas, filas del atlas
  uniform float uGlyphCount;
  uniform vec2 uGrid;        // columnas, filas de la lluvia
  uniform float uTime;
  uniform float uSeed;
  uniform float uSpeed;
  uniform float uDensity;    // 0..1 proporción de columnas activas
  uniform float uOpacity;

  uniform sampler2D uMask;
  uniform float uHasMask;
  uniform float uMaskReveal; // 0..1

  uniform vec3 uColor;
  uniform vec3 uHeadColor;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    vec2 gridUv = vUv * uGrid;
    vec2 cell = floor(gridUv);
    vec2 local = fract(gridUv);
    float column = cell.x;
    float row = uGrid.y - 1.0 - cell.y; // 0 = arriba

    // Máscara (retrato / nombre), muestreada por celda para que quede pixelada
    float mask = 0.0;
    if (uHasMask > 0.5) {
      mask = texture2D(uMask, (cell + 0.5) / uGrid).r;
      mask = smoothstep(0.2, 0.8, mask);
      // Revelado de abajo arriba con borde ruidoso
      float edge = uMaskReveal * 1.3 - (row / uGrid.y) * 0.3 - hash(cell) * 0.15;
      mask *= smoothstep(0.0, 0.25, edge);
    }

    // Dos gotas independientes por columna
    float trail = 0.0;
    float head = 0.0;
    for (int i = 0; i < 2; i++) {
      float fi = float(i);
      if (hash(vec2(column, uSeed + fi * 5.3)) > uDensity) continue;
      float speed = mix(5.0, 16.0, hash(vec2(column, uSeed + fi * 7.1))) * uSpeed;
      float len = mix(6.0, 28.0, hash(vec2(column + 3.1, uSeed + fi * 3.7)));
      float cycle = uGrid.y + len + uGrid.y * hash(vec2(column, uSeed + fi * 11.3));
      float headRow = mod(uTime * speed + hash(vec2(column, uSeed + fi * 19.7)) * cycle, cycle);
      float d = headRow - row;
      if (d >= 0.0 && d < len) {
        trail = max(trail, pow(1.0 - d / len, 1.8));
        head = max(head, 1.0 - step(1.0, d));
      }
    }

    // Glifo de la celda: cambia a ritmo aleatorio (más lento dentro de la máscara)
    float rate = mix(mix(0.4, 7.0, hash(cell + uSeed)), 0.6, mask);
    float glyph = floor(hash(cell + floor(uTime * rate + hash(cell.yx)) * 0.173 + uSeed) * uGlyphCount);
    vec2 atlasCell = vec2(mod(glyph, uAtlasGrid.x), floor(glyph / uAtlasGrid.x));
    vec2 atlasUv = vec2(
      (atlasCell.x + local.x) / uAtlasGrid.x,
      1.0 - (atlasCell.y + 1.0 - local.y) / uAtlasGrid.y
    );
    // Gradientes continuos para que el mipmapping no deje costuras entre celdas
    vec2 grad = 1.0 / uAtlasGrid;
    float ink = textureGrad(uAtlas, atlasUv, dFdx(gridUv) * grad, dFdy(gridUv) * grad).r;

    float shimmer = 0.75 + 0.25 * hash(cell + floor(uTime * 10.0));
    float brightness = max(trail * (1.0 - mask * 0.7), mask * shimmer);
    vec3 color = uColor * brightness;
    color = mix(color, uHeadColor, head * (1.0 - mask));
    color += uHeadColor * mask * 0.25;

    // Dentro de la máscara añadimos un relleno tenue para que las letras se lean como bloques
    float alpha = max(ink * max(brightness, head), mask * 0.14) * uOpacity;
    gl_FragColor = vec4(color, alpha);
  }
`

export function createRainMaterial(atlas: GlyphAtlas, grid: [number, number], seed: number, density = 1) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uAtlas: { value: atlas.texture },
      uAtlasGrid: { value: new THREE.Vector2(atlas.columns, atlas.rows) },
      uGlyphCount: { value: atlas.count },
      uGrid: { value: new THREE.Vector2(...grid) },
      uTime: { value: 0 },
      uSeed: { value: seed },
      uSpeed: { value: 1 },
      uDensity: { value: density },
      uOpacity: { value: 1 },
      uMask: { value: null },
      uHasMask: { value: 0 },
      uMaskReveal: { value: 0 },
      uColor: { value: new THREE.Color('#00ff41') },
      uHeadColor: { value: new THREE.Color('#d9ffe0') },
    },
  })
}
