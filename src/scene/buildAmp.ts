/**
 * Amplificador valvulado integrado (Orfeu I-300) modelado proceduralmente.
 * Unidades ~ decímetros: chassi 4,4 × 0,9 × 3,0  (= 440 × 90 × 300 mm).
 * Frente em +Z, topo em +Y.
 */
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { MatBank, PAL, additive, glowMaterial, type Cat, type SurfOpts } from './materials'

export interface Part {
  obj: THREE.Object3D
  cat: Cat
  home: THREE.Vector3
  offset: THREE.Vector3 // deslocamento na vista explodida
  delay: number // 0..0.3 — escalonamento da explosão
  spin?: THREE.Euler // rotação extra quando explodido
  lift?: THREE.Vector3 // deslocamento extra controlado por state.coil
}

export interface GlowItem {
  mat: THREE.ShaderMaterial
  fil: THREE.LineBasicMaterial
  amt: number
  phase: number
}

export interface Amp {
  root: THREE.Group
  parts: Part[]
  anchors: Record<string, THREE.Object3D>
  glow: GlowItem[]
}

const W = 4.4
const H = 0.9
const D = 3.0
const TOP = H

export function buildAmp(bank: MatBank, opts: { lite: boolean }): Amp {
  const { lite } = opts
  const root = new THREE.Group()
  const parts: Part[] = []
  const anchors: Record<string, THREE.Object3D> = {}
  const glow: GlowItem[] = []

  /* ---------- helpers ---------- */
  const solid = (
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    cat: Cat,
    o: SurfOpts = {},
    pos?: [number, number, number],
    rot?: [number, number, number],
    edge: number | false = 28,
    lineOpacity = 0.32,
  ) => {
    const g = new THREE.Group()
    g.add(new THREE.Mesh(geo, bank.surface(cat, o)))
    if (edge !== false) g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, edge), bank.line(cat, lineOpacity)))
    if (pos) g.position.set(...pos)
    if (rot) g.rotation.set(...rot)
    parent.add(g)
    return g
  }
  const lines = (parent: THREE.Object3D, pts: number[], cat: Cat, opacity = 0.28, color = PAL.text2) => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    const l = new THREE.LineSegments(geo, bank.line(cat, opacity, color))
    parent.add(l)
    return l
  }
  const ring = (parent: THREE.Object3D, r: number, y: number, cat: Cat, opacity = 0.3, seg = 40) => {
    const pts: number[] = []
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2
      const a1 = ((i + 1) / seg) * Math.PI * 2
      pts.push(Math.cos(a0) * r, y, Math.sin(a0) * r, Math.cos(a1) * r, y, Math.sin(a1) * r)
    }
    return lines(parent, pts, cat, opacity)
  }
  const part = (
    cat: Cat,
    home: [number, number, number],
    offset: [number, number, number],
    delay: number,
    extra: Partial<Pick<Part, 'spin' | 'lift'>> = {},
  ) => {
    const obj = new THREE.Group()
    obj.position.set(...home)
    root.add(obj)
    parts.push({ obj, cat, home: new THREE.Vector3(...home), offset: new THREE.Vector3(...offset), delay, ...extra })
    return obj
  }
  const anchor = (name: string, parent: THREE.Object3D, pos: [number, number, number]) => {
    const a = new THREE.Object3D()
    a.position.set(...pos)
    parent.add(a)
    anchors[name] = a
  }

  const alu: SurfOpts = { base: PAL.line, rim: PAL.text2, baseAmt: 0.05, rimAmt: 0.5, power: 2.4 }
  const aluBright: SurfOpts = { base: PAL.muted, rim: PAL.text, baseAmt: 0.05, rimAmt: 0.55, power: 2.2 }
  const glass: SurfOpts = { base: PAL.line, rim: PAL.text, baseAmt: 0.02, rimAmt: 0.85, power: 3.0, double: true }
  const darkPart: SurfOpts = { base: PAL.line, rim: PAL.muted, baseAmt: 0.08, rimAmt: 0.6, power: 1.8 }
  const copper: SurfOpts = { base: PAL.muted, rim: PAL.text2, baseAmt: 0.1, rimAmt: 0.6, power: 1.6 }

  /* ---------- CHASSI ---------- */
  {
    const bottom = part('chassis', [0, 0, 0], [0, -1.75, 0], 0)
    solid(bottom, new THREE.BoxGeometry(W - 0.1, 0.04, D - 0.1), 'chassis', alu, [0, 0.02, 0])
    for (const x of [-1.85, 1.85])
      for (const z of [-1.15, 1.15])
        solid(bottom, new THREE.CylinderGeometry(0.15, 0.17, 0.1, 20), 'chassis', alu, [x, -0.05, z])
    // ventilação no fundo
    const vent: number[] = []
    for (let i = 0; i < 14; i++) {
      const x = -1.3 + i * 0.2
      vent.push(x, 0.045, -0.9, x, 0.045, 0.6)
    }
    lines(bottom, vent, 'chassis', 0.14)

    for (const s of [-1, 1]) {
      const wall = part('chassis', [s * (W / 2 - 0.03), H / 2, 0], [s * 0.85, -0.55, 0], 0.05)
      solid(wall, new THREE.BoxGeometry(0.06, H, D), 'chassis', alu)
    }

    const top = part('chassis', [0, TOP, 0], [0, 0.7, 0], 0.08)
    solid(top, new THREE.BoxGeometry(W, 0.05, D), 'chassis', aluBright)
    // anéis dos soquetes e furos dos trafos/capacitores gravados no topo
    for (const x of [-1.15, 1.15]) {
      const g = new THREE.Group()
      g.position.set(x, 0.026, 0.45)
      top.add(g)
      ring(g, 0.3, 0, 'chassis', 0.28)
    }
    for (const x of [-0.42, 0.42]) {
      const g = new THREE.Group()
      g.position.set(x, 0.026, 0.8)
      top.add(g)
      ring(g, 0.2, 0, 'chassis', 0.28)
    }
    // linhas de escovado
    const brush: number[] = []
    for (let i = 0; i < 8; i++) {
      const z = -1.35 + i * 0.38
      brush.push(-2.1, 0.027, z, 2.1, 0.027, z)
    }
    lines(top, brush, 'chassis', 0.06)
  }

  /* ---------- FRENTE ---------- */
  {
    const front = part('front', [0, 0.47, D / 2 + 0.04], [0, 0, 1.15], 0.1)
    solid(front, new THREE.BoxGeometry(W + 0.1, 1.0, 0.08), 'front', aluBright)
    // friso gravado
    lines(front, [-2.05, -0.38, 0.041, 2.05, -0.38, 0.041], 'front', 0.22)
    const knobs: [number, number][] = [
      [-1.35, 0.2],
      [0, 0.27],
      [1.35, 0.2],
    ]
    knobs.forEach(([x, r], i) => {
      const k = part('front', [x, 0.5, D / 2 + 0.17], [0, 0, 1.9], 0.14 + i * 0.02, { spin: new THREE.Euler(0, 0, -1.6 - i * 0.4) })
      solid(k, new THREE.CylinderGeometry(r, r, 0.18, 18), 'front', aluBright, [0, 0, 0], [Math.PI / 2, 0, 0], 20, 0.36)
      solid(k, new THREE.CylinderGeometry(r * 1.22, r * 1.25, 0.04, 36), 'front', alu, [0, 0, -0.1], [Math.PI / 2, 0, 0])
      lines(k, [0, r * 0.25, 0.092, 0, r * 0.9, 0.092], 'front', 0.6, PAL.text)
      // marcações da escala
      const ticks: number[] = []
      for (let t = 0; t <= 10; t++) {
        const a = -Math.PI * 0.75 + (t / 10) * Math.PI * 1.5 + Math.PI / 2
        const r0 = r * 1.4
        const r1 = r * (t % 5 === 0 ? 1.62 : 1.52)
        ticks.push(Math.cos(a) * r0, Math.sin(a) * r0, -0.12, Math.cos(a) * r1, Math.sin(a) * r1, -0.12)
      }
      lines(k, ticks, 'front', 0.22)
    })
    // chave liga/desliga
    const sw = part('front', [1.9, 0.5, D / 2 + 0.14], [0.1, 0, 1.7], 0.18)
    solid(sw, new THREE.CylinderGeometry(0.05, 0.05, 0.14, 12), 'front', aluBright, [0, 0, 0], [Math.PI / 2 - 0.3, 0, 0])
  }

  /* ---------- TRASEIRA ---------- */
  {
    const rear = part('rear', [0, 0.45, -D / 2 - 0.02], [0, 0, -1.1], 0.1)
    solid(rear, new THREE.BoxGeometry(W, 0.9, 0.06), 'rear', alu)
    const term = part('rear', [0, 0.45, -D / 2 - 0.06], [0, 0, -1.75], 0.16)
    // bornes de caixa
    for (const x of [-1.85, -1.5, 1.5, 1.85]) {
      solid(term, new THREE.CylinderGeometry(0.075, 0.075, 0.24, 6), 'rear', aluBright, [x, 0.08, -0.1], [Math.PI / 2, 0, 0], 20)
      solid(term, new THREE.CylinderGeometry(0.035, 0.035, 0.12, 10), 'rear', alu, [x, 0.08, -0.26], [Math.PI / 2, 0, 0], false)
    }
    // RCAs
    for (const x of [-0.8, -0.45, -0.1])
      for (const y of [0.18, -0.12]) {
        solid(term, new THREE.CylinderGeometry(0.06, 0.06, 0.12, 16), 'rear', aluBright, [x, y, -0.06], [Math.PI / 2, 0, 0])
        solid(term, new THREE.CylinderGeometry(0.02, 0.02, 0.14, 8), 'rear', alu, [x, y, -0.08], [Math.PI / 2, 0, 0], false)
      }
    // entrada IEC + fusível
    solid(term, new THREE.BoxGeometry(0.34, 0.22, 0.12), 'rear', alu, [0.7, 0.06, -0.06])
    solid(term, new THREE.CylinderGeometry(0.06, 0.06, 0.14, 12), 'rear', alu, [0.7, -0.24, -0.07], [Math.PI / 2, 0, 0])
  }

  /* ---------- VÁLVULAS ---------- */
  const glassProfile300 = [
    [0.0, 0.32],
    [0.19, 0.32],
    [0.2, 0.46],
    [0.26, 0.62],
    [0.335, 0.82],
    [0.355, 1.0],
    [0.335, 1.18],
    [0.27, 1.34],
    [0.16, 1.46],
    [0.05, 1.52],
    [0.0, 1.53],
  ].map(([r, y]) => new THREE.Vector2(r, y))
  const glassProfileSmall = [
    [0.0, 0.22],
    [0.145, 0.22],
    [0.15, 0.3],
    [0.15, 0.82],
    [0.13, 0.9],
    [0.07, 0.94],
    [0.0, 0.95],
  ].map(([r, y]) => new THREE.Vector2(r, y))

  const addGlow = (parent: THREE.Object3D, y: number, sx: number, sy: number, amt: number, filPts: number[]) => {
    const fil = additive(new THREE.LineBasicMaterial({ color: PAL.amber, opacity: 0.9 }), true)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(filPts, 3))
    const filament = new THREE.Line(geo, fil)
    filament.userData.keep = true
    parent.add(filament)
    const mat = glowMaterial(PAL.amberDeep, amt)
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat)
    quad.position.set(0, y, 0)
    quad.scale.set(sx, sy, 1)
    quad.frustumCulled = false
    quad.userData.keep = true
    parent.add(quad)
    glow.push({ mat, fil, amt, phase: Math.random() * 10 })
  }

  const make300B = (x: number, side: number) => {
    const t = part('tubes', [x, TOP + 0.03, 0.45], [side * 0.3, 1.42, 0.25], 0.22)
    solid(t, new THREE.CylinderGeometry(0.29, 0.29, 0.06, 32), 'tubes', alu, [0, 0, 0]) // soquete cerâmico
    solid(t, new THREE.CylinderGeometry(0.2, 0.215, 0.26, 28), 'tubes', darkPart, [0, 0.19, 0]) // base baquelite
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4
      solid(t, new THREE.CylinderGeometry(0.025, 0.025, 0.08, 6), 'tubes', alu, [Math.cos(a) * 0.12, 0.02, Math.sin(a) * 0.12], undefined, false)
    }
    solid(t, new THREE.LatheGeometry(glassProfile300, lite ? 24 : 40), 'tubes', glass, [0, 0, 0], undefined, 18, 0.22)
    // placas, micas, grade
    for (const z of [-0.075, 0.075]) solid(t, new THREE.BoxGeometry(0.32, 0.5, 0.02), 'tubes', copper, [0, 1.0, z])
    solid(t, new THREE.CylinderGeometry(0.23, 0.23, 0.012, 28), 'tubes', darkPart, [0, 0.71, 0])
    solid(t, new THREE.CylinderGeometry(0.23, 0.23, 0.012, 28), 'tubes', darkPart, [0, 1.29, 0])
    const grid: number[] = []
    for (let i = 0; i < 6; i++) {
      const gx = -0.12 + i * 0.048
      grid.push(gx, 0.74, 0.035, gx, 1.27, 0.035, gx, 0.74, -0.035, gx, 1.27, -0.035)
    }
    lines(t, grid, 'tubes', 0.24)
    // getter no topo
    const getter = new THREE.Group()
    getter.position.y = 1.4
    t.add(getter)
    ring(getter, 0.07, 0, 'tubes', 0.4, 20)
    // filamento em "M" + brilho âmbar
    addGlow(t, 1.0, 0.7, 1.05, 0.8, [-0.11, 0.76, 0, -0.065, 1.24, 0, -0.02, 0.76, 0, 0.02, 1.24, 0, 0.065, 0.76, 0, 0.11, 1.24, 0])
    return t
  }
  const makeDriver = (x: number, side: number) => {
    const t = part('tubes', [x, TOP + 0.03, 0.8], [side * 0.12, 1.28, 0.38], 0.26)
    solid(t, new THREE.CylinderGeometry(0.19, 0.19, 0.05, 28), 'tubes', alu, [0, 0, 0])
    solid(t, new THREE.CylinderGeometry(0.14, 0.15, 0.18, 24), 'tubes', darkPart, [0, 0.13, 0])
    solid(t, new THREE.LatheGeometry(glassProfileSmall, lite ? 20 : 32), 'tubes', glass, [0, 0, 0], undefined, 18, 0.22)
    for (const px of [-0.055, 0.055]) solid(t, new THREE.BoxGeometry(0.07, 0.3, 0.07), 'tubes', copper, [px, 0.56, 0])
    solid(t, new THREE.CylinderGeometry(0.13, 0.13, 0.01, 24), 'tubes', darkPart, [0, 0.38, 0])
    solid(t, new THREE.CylinderGeometry(0.13, 0.13, 0.01, 24), 'tubes', darkPart, [0, 0.74, 0])
    addGlow(t, 0.56, 0.3, 0.6, 0.5, [-0.055, 0.44, 0, -0.055, 0.68, 0, 0.055, 0.44, 0, 0.055, 0.68, 0])
    return t
  }
  const t300L = make300B(-1.15, -1)
  make300B(1.15, 1)
  const drvL = makeDriver(-0.42, -1)
  makeDriver(0.42, 1)
  anchor('tube300', t300L, [-0.3, 1.18, 0])
  anchor('tubeDriver', drvL, [0.12, 0.72, 0])

  /* ---------- TRANSFORMADORES ---------- */
  const makeTransformer = (
    name: string,
    home: [number, number, number],
    off: [number, number, number],
    w: number,
    h: number,
    d: number,
    delay: number,
  ) => {
    const core = part('transformers', home, off, delay)
    solid(core, new THREE.BoxGeometry(w, h, d), 'transformers', aluBright, [0, h / 2, 0])
    // laminações (linhas no topo e nas laterais)
    const lam: number[] = []
    const n = lite ? 8 : 14
    for (let i = 1; i < n; i++) {
      const z = -d / 2 + (d / n) * i
      lam.push(-w / 2, h, z, w / 2, h, z)
      lam.push(-w / 2, 0.02, z, -w / 2, h, z)
      lam.push(w / 2, 0.02, z, w / 2, h, z)
    }
    lines(core, lam, 'transformers', 0.16)
    // janelas do núcleo E-I
    const win: number[] = []
    const wx = w * 0.3
    for (const s of [-1, 1]) {
      const x0 = s * (w * 0.16)
      const x1 = s * (w * 0.16 + wx * 0.55)
      for (const z of [d / 2 + 0.001, -d / 2 - 0.001]) {
        win.push(x0, h * 0.18, z, x0, h * 0.82, z, x1, h * 0.18, z, x1, h * 0.82, z)
        win.push(x0, h * 0.18, z, x1, h * 0.18, z, x0, h * 0.82, z, x1, h * 0.82, z)
      }
    }
    lines(core, win, 'transformers', 0.22)
    // parafusos de fixação
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        solid(core, new THREE.CylinderGeometry(0.035, 0.035, h + 0.12, 8), 'transformers', alu, [sx * (w / 2 - 0.08), h / 2, sz * (d / 2 - 0.06)], undefined, false)

    // bobina (sobe da forma no passo "transformadores")
    const cw = w * 0.42
    const ch = h * 0.7
    const cd = d + 0.32
    const coil = part('transformers', home, off, delay + 0.02, { lift: new THREE.Vector3(0, h * 0.95, 0.02) })
    solid(coil, new THREE.BoxGeometry(cw, ch, cd), 'transformers', copper, [0, h / 2, 0], undefined, 28, 0.34)
    const wind: number[] = []
    const loops = lite ? 10 : 18
    for (let i = 1; i < loops; i++) {
      const y = h / 2 - ch / 2 + (ch / loops) * i
      const x = cw / 2 + 0.004
      const z = cd / 2 + 0.004
      wind.push(-x, y, -z, x, y, -z, x, y, -z, x, y, z, x, y, z, -x, y, z, -x, y, z, -x, y, -z)
    }
    lines(coil, wind, 'transformers', 0.2, PAL.text)
    // terminais da bobina (fios saindo)
    const leads: number[] = []
    for (let i = 0; i < 3; i++) {
      const lx = -cw / 2 + 0.08 + i * (cw / 3)
      leads.push(lx, h / 2 + ch / 2, cd / 2 - 0.06, lx + 0.02, h / 2 + ch / 2 + 0.22, cd / 2 + 0.02)
    }
    lines(coil, leads, 'transformers', 0.45, PAL.text)
    anchors[name] = coil
    return { core, coil }
  }
  makeTransformer('ptCoil', [0, TOP + 0.025, -0.86], [0, 1.02, -0.58], 1.05, 0.82, 0.44, 0.15)
  const optL = makeTransformer('optL', [-1.5, TOP + 0.025, -0.92], [-0.5, 0.92, -0.62], 0.82, 0.72, 0.38, 0.17)
  const optR = makeTransformer('optR', [1.5, TOP + 0.025, -0.92], [0.5, 0.92, -0.62], 0.82, 0.72, 0.38, 0.19)
  void optL
  anchor('opt', optR.core, [0.41, 0.66, 0.19])
  {
    // âncora da bobina de força no topo da bobina
    const ptc = anchors.ptCoil
    anchor('ptCoilTop', ptc, [-0.22, 0.7, 0.36])
    anchors.ptCoil = anchors.ptCoilTop
  }

  /* ---------- CAPACITORES ---------- */
  for (const s of [-1, 1]) {
    const c = part('caps', [s * 0.6, TOP + 0.025, 0.02], [s * 0.18, 1.08, 0.1], 0.18)
    solid(c, new THREE.CylinderGeometry(0.165, 0.165, 0.64, 28), 'caps', aluBright, [0, 0.32, 0])
    solid(c, new THREE.CylinderGeometry(0.19, 0.19, 0.07, 28), 'caps', alu, [0, 0.05, 0])
    ring(c, 0.166, 0.52, 'caps', 0.3)
    solid(c, new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8), 'caps', alu, [0.07, 0.665, 0], undefined, false)
    solid(c, new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8), 'caps', alu, [-0.07, 0.665, 0], undefined, false)
  }

  /* ---------- CIRCUITO PONTO A PONTO ---------- */
  {
    const b = part('board', [0, 0.28, 0.22], [0, -0.32, 0.05], 0.12)
    solid(b, new THREE.BoxGeometry(3.5, 0.03, 1.7), 'board', darkPart, [0, 0, 0])
    const rows = [-0.5, 0.5]
    const cols = lite ? 8 : 13
    const turrets: THREE.Vector3[][] = rows.map(() => [])
    rows.forEach((z, ri) => {
      for (let i = 0; i < cols; i++) {
        const x = -1.5 + (3 / (cols - 1)) * i
        solid(b, new THREE.CylinderGeometry(0.026, 0.03, 0.13, 8), 'board', aluBright, [x, 0.08, z], undefined, false)
        turrets[ri].push(new THREE.Vector3(x, 0.14, z))
      }
    })
    // resistores entre torres vizinhas
    rows.forEach((z, ri) => {
      for (let i = 0; i < cols - 1; i += 2) {
        const a = turrets[ri][i]
        const c = turrets[ri][i + 1]
        const mx = (a.x + c.x) / 2
        solid(b, new THREE.CylinderGeometry(0.032, 0.032, 0.17, 10), 'board', copper, [mx, 0.12, z], [0, 0, Math.PI / 2], false)
        lines(b, [a.x, 0.13, z, mx - 0.085, 0.12, z, mx + 0.085, 0.12, z, c.x, 0.13, z], 'board', 0.35, PAL.text)
      }
    })
    // capacitores de filme na linha central (axiais)
    const capXs = lite ? [-1.0, 0.0, 1.0] : [-1.25, -0.6, 0.05, 0.7, 1.3]
    const capGroup = new THREE.Group()
    b.add(capGroup)
    capXs.forEach((x) =>
      solid(capGroup, new THREE.CylinderGeometry(0.075, 0.075, 0.36, 16), 'board', aluBright, [x, 0.12, 0], [0, 0, Math.PI / 2], 30, 0.36),
    )
    anchor('boardCaps', b, [capXs[capXs.length - 1], 0.2, 0])
    // eletrolíticos verticais
    if (!lite)
      for (const x of [-1.55, -1.25, 1.25, 1.55])
        solid(b, new THREE.CylinderGeometry(0.075, 0.075, 0.24, 18), 'board', alu, [x, 0.135, 0.75])
    // fiação ponto a ponto (curvas)
    const wires = lite ? 3 : 8
    for (let i = 0; i < wires; i++) {
      const a = turrets[0][(i * 3) % cols]
      const c = turrets[1][(i * 5 + 2) % cols]
      const mid = a.clone().lerp(c, 0.5)
      mid.y += 0.18 + (i % 3) * 0.06
      mid.x += (i % 2 ? 0.25 : -0.25)
      const curve = new THREE.CatmullRomCurve3([a, mid, c])
      solid(b, new THREE.TubeGeometry(curve, 28, 0.012, 5, false), 'board', { base: PAL.muted, rim: PAL.text, baseAmt: 0.2, rimAmt: 0.6, power: 1.2 }, undefined, undefined, false)
    }
    anchor('board', b, [turrets[1][cols - 2].x, 0.16, 0.5])
  }

  for (const p of parts) bake(p.obj)
  return { root, parts, anchors, glow }
}

/**
 * Funde as malhas e linhas de cada peça por material: menos draw calls
 * (~290 → ~70), mesma aparência. Âncoras e brilhos ficam intactos.
 */
function bake(part: THREE.Object3D) {
  part.updateMatrixWorld(true)
  const inv = part.matrixWorld.clone().invert()
  const buckets = new Map<string, { mat: THREE.Material; mesh: boolean; geos: THREE.BufferGeometry[] }>()
  const drop: THREE.Object3D[] = []
  part.traverse((o) => {
    if (o.userData.keep) return
    const mesh = (o as THREE.Mesh).isMesh === true
    const seg = (o as THREE.LineSegments).isLineSegments === true
    if (!mesh && !seg) return
    const src = o as THREE.Mesh | THREE.LineSegments
    const mat = src.material as THREE.Material
    const g = src.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld))
    if (g.getAttribute('uv')) g.deleteAttribute('uv')
    if (mesh && !g.index) return
    const key = `${mesh ? 'm' : 'l'}|${mat.uuid}`
    if (!buckets.has(key)) buckets.set(key, { mat, mesh, geos: [] })
    buckets.get(key)!.geos.push(seg && g.index ? g.toNonIndexed() : g)
    drop.push(o)
  })
  for (const o of drop) o.parent?.remove(o)
  for (const b of buckets.values()) {
    const merged = mergeGeometries(b.geos, false)
    if (!merged) continue
    part.add(b.mesh ? new THREE.Mesh(merged, b.mat) : new THREE.LineSegments(merged, b.mat))
  }
}
