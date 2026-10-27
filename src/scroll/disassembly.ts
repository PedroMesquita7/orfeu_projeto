import gsap from 'gsap'
import type Lenis from 'lenis'
import { KEYS, S } from '../scene/steps'

/** Cada etapa: segura HOLD e depois leva TRANS para chegar à próxima. */
export const HOLD = 0.7
export const TRANS = 1

export function initDisassembly(lenis: Lenis | null, onStep?: (i: number) => void) {
  const section = document.querySelector<HTMLElement>('.dis')!
  const pin = section.querySelector<HTMLElement>('.dis__pin')!
  const texts = [...section.querySelectorAll<HTMLElement>('.dis-step__text')]
  const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-goto]')]
  const fill = section.querySelector<HTMLElement>('.dis__nav-fill')
  const n = KEYS.length
  const at = (i: number) => i * (HOLD + TRANS)
  const total = at(n - 1) + HOLD

  let current = -1
  const setCurrent = (i: number) => {
    if (i === current) return
    current = i
    buttons.forEach((b, j) => (j === i ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')))
    onStep?.(i)
  }

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: section,
      pin,
      start: 'top top',
      end: () => `+=${window.innerHeight * (n - 0.4)}`,
      scrub: 0.9,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const time = self.progress * total
        let idx = 0
        for (let i = 0; i < n; i++) if (time >= at(i) - TRANS * 0.5) idx = i
        setCurrent(idx)
        if (fill) fill.style.transform = `scaleX(${self.progress.toFixed(4)})`
      },
    },
  })

  // Estado 3D (objeto S, lido pela cena a cada quadro)
  for (let i = 1; i < n; i++) {
    tl.to(S, { ...KEYS[i], duration: TRANS, ease: 'power2.inOut' }, at(i) - TRANS)
  }
  // Textos: entram com fade + blur, saem subindo
  texts.forEach((el, i) => {
    if (i > 0)
      tl.fromTo(
        el,
        { autoAlpha: 0, y: 28, filter: 'blur(12px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.38, ease: 'power2.out', immediateRender: false },
        at(i) - 0.38,
      )
    if (i < n - 1)
      tl.to(el, { autoAlpha: 0, y: -28, filter: 'blur(12px)', duration: 0.34, ease: 'power2.in' }, at(i) + HOLD)
  })
  tl.to({}, { duration: 0.001 }, total)

  buttons.forEach((b, i) =>
    b.addEventListener('click', () => {
      const st = tl.scrollTrigger!
      const y = st.start + ((at(i) + HOLD * 0.5) / total) * (st.end - st.start)
      if (lenis) lenis.scrollTo(y, { duration: 1.4 })
      else window.scrollTo({ top: y, behavior: 'smooth' })
    }),
  )
  setCurrent(0)

  return {
    tl,
    destroy() {
      tl.scrollTrigger?.kill(true)
      tl.kill()
      gsap.set(texts, { clearProps: 'all' })
    },
  }
}
