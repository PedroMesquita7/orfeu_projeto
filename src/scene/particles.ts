import * as THREE from 'three'
import { PAL, additive } from './materials'

/** Poeira de luz: pontos suaves que sobem devagar ao fundo. */
export function createParticles(count: number, pixelRatio: number) {
  const pos = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  const size = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 26
    pos[i * 3 + 1] = (Math.random() - 0.5) * 16 + 1
    pos[i * 3 + 2] = (Math.random() - 0.5) * 18 - 3
    seed[i] = Math.random() * 100
    size[i] = 0.4 + Math.random() * Math.random() * 1.8
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPR: { value: pixelRatio },
      uColor: { value: new THREE.Color(PAL.text2) },
      uOpacity: { value: 0.55 },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPR;
      attribute float aSeed;
      attribute float aSize;
      varying float vA;
      void main() {
        vec3 p = position;
        float t = uTime * 0.04 + aSeed;
        p.y = mod(p.y + uTime * 0.06 * (0.4 + fract(aSeed) ) + 8.0, 16.0) - 7.0;
        p.x += sin(t * 2.0) * 0.4;
        p.z += cos(t * 1.6) * 0.3;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPR * (34.0 / -mv.z);
        vA = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * 0.7 + aSeed * 3.0));
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(uColor * a * a * vA * uOpacity, 1.0);
        #include <colorspace_fragment>
        gl_FragColor.a = max(gl_FragColor.r, max(gl_FragColor.g, gl_FragColor.b));
      }
    `,
  })
  additive(mat)
  const points = new THREE.Points(geo, mat)
  points.frustumCulled = false
  return { points, mat }
}
