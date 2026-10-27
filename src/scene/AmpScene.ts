import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { MatBank } from './materials'
import { buildAmp, type Amp } from './buildAmp'
import { createParticles } from './particles'
import type { SceneState } from './steps'

export interface SceneOpts {
  mobile: boolean
  capture?: boolean
  bloom?: boolean
  particles?: boolean
  distMul?: number
}

export interface CalloutDef {
  anchor: string
  text: string
  focus: 'fT' | 'fX' | 'fB'
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export class AmpScene {
  readonly renderer: THREE.WebGLRenderer
  readonly scene = new THREE.Scene()
  readonly camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  private bank = new MatBank()
  private amp: Amp
  private particles?: ReturnType<typeof createParticles>
  private composer?: EffectComposer
  private bloom?: UnrealBloomPass
  private running = false
  private wanted = true
  private t0 = performance.now()
  private ptr = { x: 0, y: 0, sx: 0, sy: 0 }
  private w = 1
  private h = 1
  private tmpV = new THREE.Vector3()
  private tmpT = new THREE.Vector3()
  private callouts: { el: HTMLElement; def: CalloutDef; flip: boolean }[] = []

  constructor(
    private canvas: HTMLCanvasElement,
    private state: SceneState,
    private opts: SceneOpts,
  ) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !opts.mobile,
      alpha: true,
      premultipliedAlpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: !!opts.capture,
    })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    this.amp = buildAmp(this.bank, { lite: opts.mobile })
    this.scene.add(this.amp.root)

    if (opts.particles !== false) {
      this.particles = createParticles(opts.mobile ? 140 : 420, this.pixelRatio())
      this.scene.add(this.particles.points)
    }

    if (opts.bloom) {
      const size = new THREE.Vector2(1, 1)
      const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 })
      this.composer = new EffectComposer(this.renderer, rt)
      const rp = new RenderPass(this.scene, this.camera)
      rp.clearAlpha = 0
      this.composer.addPass(rp)
      this.bloom = new UnrealBloomPass(size, 0.42, 0.5, 0.55)
      this.composer.addPass(this.bloom)
      this.composer.addPass(new OutputPass())
    }

    this.resize()
    window.addEventListener('resize', this.resize)
    if (!opts.mobile && !opts.capture) window.addEventListener('pointermove', this.onPointer, { passive: true })
    document.addEventListener('visibilitychange', this.onVisibility)
  }

  private pixelRatio() {
    return Math.min(window.devicePixelRatio || 1, this.opts.mobile ? 1.5 : 2)
  }

  resize = () => {
    const w = this.canvas.clientWidth || window.innerWidth
    const h = this.canvas.clientHeight || window.innerHeight
    this.w = w
    this.h = h
    const pr = this.pixelRatio()
    this.renderer.setPixelRatio(pr)
    this.renderer.setSize(w, h, false)
    this.composer?.setPixelRatio(pr)
    this.composer?.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    if (this.particles) this.particles.mat.uniforms.uPR.value = pr
    if (!this.running) this.frame()
  }

  private onPointer = (e: PointerEvent) => {
    this.ptr.x = (e.clientX / window.innerWidth) * 2 - 1
    this.ptr.y = (e.clientY / window.innerHeight) * 2 - 1
  }

  private onVisibility = () => this.sync()

  /** Liga/desliga o loop (fora da viewport, aba oculta etc.). */
  setActive(on: boolean) {
    this.wanted = on
    this.sync()
  }

  private sync() {
    const run = this.wanted && !document.hidden
    if (run === this.running) return
    this.running = run
    this.renderer.setAnimationLoop(run ? () => this.frame() : null)
  }

  start() {
    this.sync()
  }

  setCallouts(container: HTMLElement, defs: CalloutDef[]) {
    container.innerHTML = ''
    this.callouts = defs.map((def) => {
      const el = document.createElement('div')
      el.className = 'callout'
      el.innerHTML = `<span class="callout__dot"></span><svg width="72" height="40" viewBox="0 0 72 40" fill="none"><path d="M0 40 L30 8 H72" stroke="currentColor" stroke-width="1"/></svg><span class="callout__t"></span>`
      el.querySelector('.callout__t')!.textContent = def.text
      container.appendChild(el)
      return { el, def, flip: false }
    })
  }

  /** Aplica o estado (explosão, foco, câmera) — chamado a cada quadro. */
  private apply(t: number) {
    const s = this.state
    const { parts, glow, root } = this.amp

    for (const p of parts) {
      const e = ease(clamp01((s.explode - p.delay) / 0.7))
      p.obj.position.copy(p.home).addScaledVector(p.offset, e)
      if (p.lift) p.obj.position.addScaledVector(p.lift, ease(clamp01(s.coil)) * e)
      if (p.spin) p.obj.rotation.set(p.spin.x * e, p.spin.y * e, p.spin.z * e)
    }

    const lv = (f: number) => 1 + f * 0.55 - s.dim * (1 - f) * 0.8
    this.bank.setLevel('tubes', lv(s.fT))
    this.bank.setLevel('transformers', lv(s.fX))
    this.bank.setLevel('board', lv(s.fB))
    this.bank.setLevel('caps', lv(s.fB * 0.6))
    this.bank.setLevel('chassis', lv(0))
    this.bank.setLevel('front', lv(0))
    this.bank.setLevel('rear', lv(0))

    const tubeDim = 1 - s.dim * (1 - s.fT) * 0.45
    for (const g of glow) {
      const flick = 1 + Math.sin(t * 7.3 + g.phase) * 0.035 + Math.sin(t * 13.7 + g.phase * 2.1) * 0.02
      ;g.mat.uniforms.uOpacity.value = g.amt * s.glow * flick * tubeDim
      g.fil.opacity = Math.min(1, 0.7 * s.glow * flick * tubeDim)
    }

    const idle = this.opts.capture ? 0 : 1
    root.rotation.y = s.rot - 0.12 + Math.sin(t * 0.23) * 0.07 * idle
    root.position.y = Math.sin(t * 0.7) * 0.05 * (1 - s.explode * 0.5) * idle

    // Câmera: distância extra em telas retrato para o objeto caber na largura
    const aspect = this.w / this.h
    const fit =
      aspect >= 1.6 ? 1 : aspect >= 1 ? Math.max(1, (1.6 / aspect) * 0.97) : Math.max(1, (1.3 / aspect) * (aspect < 0.8 ? 0.92 : 0.8))
    const dist = fit * (this.opts.distMul ?? 1)
    this.ptr.sx += (this.ptr.x - this.ptr.sx) * 0.04
    this.ptr.sy += (this.ptr.y - this.ptr.sy) * 0.04
    this.tmpT.set(s.tx, s.ty, s.tz)
    this.tmpV
      .set(s.cx, s.cy, s.cz)
      .sub(this.tmpT)
      .multiplyScalar(dist)
      .add(this.tmpT)
    this.tmpV.x += this.ptr.sx * 0.45
    this.tmpV.y -= this.ptr.sy * 0.25
    this.camera.position.copy(this.tmpV)
    this.camera.lookAt(this.tmpT)

    // Desloca o objeto na tela (texto à esquerda no desktop, embaixo no mobile)
    if (aspect < 1) this.camera.setViewOffset(this.w, this.h, 0, this.h * 0.23, this.w, this.h)
    else this.camera.setViewOffset(this.w, this.h, -this.w * s.shift, 0, this.w, this.h)

    if (this.particles) this.particles.mat.uniforms.uTime.value = t
  }

  private updateCallouts() {
    if (!this.callouts.length) return
    this.amp.root.updateMatrixWorld()
    for (const c of this.callouts) {
      const a = this.amp.anchors[c.def.anchor]
      const o = this.state[c.def.focus]
      if (!a || o < 0.02) {
        c.el.style.opacity = '0'
        continue
      }
      a.getWorldPosition(this.tmpV)
      this.tmpV.project(this.camera)
      const x = (this.tmpV.x * 0.5 + 0.5) * this.w
      const y = (-this.tmpV.y * 0.5 + 0.5) * this.h
      const flip = x > this.w - 300
      if (flip !== c.flip) {
        c.flip = flip
        c.el.classList.toggle('callout--flip', flip)
      }
      c.el.style.opacity = String(Math.max(0, (o - 0.5) * 2))
      c.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
    }
  }

  /** Qualidade adaptativa: se o quadro passar de ~24 ms, tira o bloom e depois reduz o DPR. */
  private perf = { last: 0, ema: 16, n: 0, level: 0 }
  private adapt(now: number) {
    const p = this.perf
    if (p.last) {
      const dt = Math.min(100, now - p.last)
      p.ema += (dt - p.ema) * 0.05
      p.n++
    }
    p.last = now
    if (p.n < 90 || p.ema < 24 || this.opts.capture) return
    p.n = 0
    if (this.composer) {
      this.composer.dispose()
      this.composer = undefined
    } else if (this.renderer.getPixelRatio() > 1) {
      this.renderer.setPixelRatio(1)
      this.renderer.setSize(this.w, this.h, false)
    }
  }

  frame() {
    const now = performance.now()
    if (this.running) this.adapt(now)
    else this.perf.last = 0
    const t = (now - this.t0) / 1000
    this.apply(t)
    if (this.composer) this.composer.render()
    else this.renderer.render(this.scene, this.camera)
    this.updateCallouts()
  }

  dispose() {
    this.setActive(false)
    window.removeEventListener('resize', this.resize)
    window.removeEventListener('pointermove', this.onPointer)
    document.removeEventListener('visibilitychange', this.onVisibility)
    this.renderer.dispose()
  }
}
