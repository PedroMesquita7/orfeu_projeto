import '@fontsource-variable/fraunces/opsz.css'
import '@fontsource-variable/fraunces/opsz-italic.css'
import '@fontsource-variable/inter/wght.css'
import '@fontsource-variable/jetbrains-mono/wght.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/sections.css'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { disassembly } from './content'
import { CLOSEUP, KEYS, S } from './scene/steps'
import { initSmooth } from './scroll/smooth'
import { initDisassembly } from './scroll/disassembly'
import { initEffects } from './scroll/effects'
import { initUI } from './ui'
import type { AmpScene, CalloutDef } from './scene/AmpScene'

declare global {
  interface Window {
    __orfeuReady?: boolean
    __captureReady?: boolean
  }
}
window.__orfeuReady = true

const root = document.documentElement
const params = new URLSearchParams(location.search)
const capture = params.get('capture')
const reduced = root.classList.contains('reduced')
const mobile = matchMedia('(max-width: 900px), (pointer: coarse)').matches
const canvas = document.querySelector<HTMLCanvasElement>('.stage__canvas')!

const calloutDefs = (): CalloutDef[] => {
  const focus = ['', '', 'fT', 'fX', 'fB', ''] as const
  return disassembly.steps.flatMap((s, i) =>
    focus[i] ? s.callouts.map((c) => ({ ...c, focus: focus[i] as CalloutDef['focus'] })) : [],
  )
}

if (capture) runCapture(capture)
else boot()

function boot() {
  gsap.registerPlugin(ScrollTrigger)
  ScrollTrigger.config({ ignoreMobileResize: true })

  const lenis = reduced ? null : initSmooth()
  initUI(lenis)

  const readout = document.querySelector<HTMLElement>('[data-readout]')
  let scene: AmpScene | null = null
  let stageOn = true
  let dis = root.classList.contains('is-3d')
    ? initDisassembly(lenis, (i) => {
        if (readout) readout.textContent = `01 · ${String(i + 1).padStart(2, '0')}/${KEYS.length}`
      })
    : null

  initEffects({
    reduced,
    onStageActive: (on) => {
      stageOn = on
      scene?.setActive(on)
    },
  })

  if (dis) {
    import('./scene/AmpScene')
      .then(({ AmpScene }) => {
        scene = new AmpScene(canvas, S, { mobile, bloom: !mobile && !params.has('nobloom') })
        scene.setCallouts(document.querySelector<HTMLElement>('.callouts')!, calloutDefs())
        scene.setActive(stageOn)
        if (import.meta.env.DEV) (window as any).__scene = scene
        gsap.from(canvas, { opacity: 0, duration: 1.8, ease: 'power2.out' })
      })
      .catch((err) => {
        // Sem WebGL utilizável: volta para o modo estático com imagens
        console.warn('[orfeu] 3D indisponível, usando imagens estáticas.', err)
        root.classList.remove('is-3d')
        dis?.destroy()
        dis = null
        ScrollTrigger.refresh()
      })
  }

  document.fonts?.ready.then(() => ScrollTrigger.refresh())
  window.addEventListener('load', () => ScrollTrigger.refresh())
}

/** ?capture=hero|1..6|closeup — renderiza um quadro para gerar as imagens estáticas. */
async function runCapture(which: string) {
  const { AmpScene } = await import('./scene/AmpScene')
  const st = which === 'closeup' ? CLOSEUP : which === 'hero' ? KEYS[0] : KEYS[Number(which) - 1]
  Object.assign(S, st, { shift: 0 })
  if (which === 'closeup') root.classList.add('capture-bg')
  const distMul = ['3', '4', '5'].includes(which) ? 1.3 : which === 'closeup' ? 1 : 1.06
  const scene = new AmpScene(canvas, S, { mobile: false, capture: true, bloom: false, particles: which === 'closeup', distMul })
  scene.frame()
  requestAnimationFrame(() => {
    scene.frame()
    requestAnimationFrame(() => {
      scene.frame()
      window.__captureReady = true
    })
  })
}
