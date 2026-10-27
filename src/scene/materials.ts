import * as THREE from 'three'

export type Cat = 'chassis' | 'front' | 'rear' | 'tubes' | 'transformers' | 'caps' | 'board'
export const CATS: Cat[] = ['chassis', 'front', 'rear', 'tubes', 'transformers', 'caps', 'board']

/** Paleta (a mesma do CSS). O âmbar existe só dentro das válvulas. */
export const PAL = {
  bg: '#06141B',
  surface: '#11212D',
  line: '#253745',
  muted: '#4A5C6A',
  text2: '#9BABAB',
  text: '#CCD0CF',
  amber: '#FFB25C',
  amberDeep: '#FF8A2A',
}

const vert = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

/** "Raio-x": núcleo quase invisível + borda acesa (fresnel). Mistura aditiva. */
const frag = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uRim;
  uniform float uBaseAmt;
  uniform float uRimAmt;
  uniform float uPower;
  uniform float uLevel;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPower);
    vec3 c = uBase * uBaseAmt + uRim * f * uRimAmt;
    gl_FragColor = vec4(c * uLevel, 1.0);
    #include <colorspace_fragment>
    gl_FragColor.a = max(gl_FragColor.r, max(gl_FragColor.g, gl_FragColor.b));
  }
`

/**
 * Mistura aditiva com alfa coerente: a cor soma sobre o fundo da página
 * (o canvas é transparente e deixa ver o degradê do CSS).
 */
export function additive<T extends THREE.Material>(m: T, premultiply = false): T {
  m.blending = THREE.CustomBlending
  m.blendEquation = THREE.AddEquation
  m.blendSrc = THREE.OneFactor
  m.blendDst = THREE.OneFactor
  m.blendSrcAlpha = THREE.OneFactor
  m.blendDstAlpha = THREE.OneMinusSrcAlphaFactor
  m.transparent = true
  m.depthWrite = false
  if (premultiply) m.premultipliedAlpha = true
  return m
}

export interface SurfOpts {
  base?: string
  rim?: string
  baseAmt?: number
  rimAmt?: number
  power?: number
  double?: boolean
}

/** Ganho global do raio-x (camadas aditivas somam rápido). */
const BASE_GAIN = 0.35
const RIM_GAIN = 0.42
const LINE_GAIN = 0.8

export class MatBank {
  private surf = new Map<string, THREE.ShaderMaterial>()
  private lines = new Map<string, THREE.LineBasicMaterial>()
  private byCat = new Map<Cat, { s: THREE.ShaderMaterial[]; l: THREE.LineBasicMaterial[] }>()

  constructor() {
    for (const c of CATS) this.byCat.set(c, { s: [], l: [] })
  }

  surface(cat: Cat, o: SurfOpts = {}): THREE.ShaderMaterial {
    const key = `${cat}|${o.base}|${o.rim}|${o.baseAmt}|${o.rimAmt}|${o.power}|${o.double}`
    let m = this.surf.get(key)
    if (!m) {
      m = new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: {
          uBase: { value: new THREE.Color(o.base ?? PAL.line) },
          uRim: { value: new THREE.Color(o.rim ?? PAL.text2) },
          uBaseAmt: { value: (o.baseAmt ?? 0.06) * BASE_GAIN },
          uRimAmt: { value: (o.rimAmt ?? 0.55) * RIM_GAIN },
          uPower: { value: o.power ?? 2.2 },
          uLevel: { value: 1 },
        },
        side: o.double ? THREE.DoubleSide : THREE.FrontSide,
      })
      additive(m)
      this.surf.set(key, m)
      this.byCat.get(cat)!.s.push(m)
    }
    return m
  }

  line(cat: Cat, opacity = 0.32, color = PAL.text2): THREE.LineBasicMaterial {
    opacity *= LINE_GAIN
    const key = `${cat}|${opacity}|${color}`
    let m = this.lines.get(key)
    if (!m) {
      m = additive(new THREE.LineBasicMaterial({ color, opacity }), true)
      m.userData.base = opacity
      this.lines.set(key, m)
      this.byCat.get(cat)!.l.push(m)
    }
    return m
  }

  /** Intensidade de uma categoria inteira (destaque / esmaecimento). */
  setLevel(cat: Cat, v: number) {
    const g = this.byCat.get(cat)!
    for (const m of g.s) m.uniforms.uLevel.value = v
    for (const m of g.l) m.opacity = Math.min(1, m.userData.base * v)
  }
}

/** Brilho âmbar: billboard com queda radial calculada no shader (sem textura). */
export function glowMaterial(color: string, opacity: number) {
  const m = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        vec2 sc = vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
        mv.xy += position.xy * sc;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        float d = clamp(length(vUv - 0.5) * 2.0, 0.0, 1.0);
        float core = pow(1.0 - d, 3.0);
        float halo = pow(1.0 - d, 1.6) * 0.22;
        vec3 c = uColor * (core + halo) * uOpacity;
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
        gl_FragColor.a = max(gl_FragColor.r, max(gl_FragColor.g, gl_FragColor.b));
      }
    `,
  })
  return additive(m)
}
