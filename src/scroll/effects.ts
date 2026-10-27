import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface Opts {
  reduced: boolean
  onStageActive?: (on: boolean) => void
}

export function initEffects({ reduced, onStageActive }: Opts) {
  // Barra de progresso sob o menu
  const bar = document.querySelector<HTMLElement>('.progress__bar')
  if (bar)
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => (bar.style.transform = `scaleX(${self.progress.toFixed(4)})`),
    })

  // Revelar: fade + blur
  if (!reduced) {
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 90%',
      once: true,
      onEnter: (els) =>
        gsap.to(els, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.15,
          ease: 'power3.out',
          stagger: 0.09,
          overwrite: true,
          onComplete() {
            els.forEach((el) => el.classList.add('is-in'))
            gsap.set(els, { clearProps: 'opacity,filter,transform' })
          },
        }),
    })

    // Números grandes: contagem
    document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
      const to = Number(el.dataset.count)
      const o = { v: 0 }
      el.textContent = '0'
      gsap.to(o, {
        v: to,
        duration: 1.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onUpdate: () => (el.textContent = String(Math.round(o.v))),
      })
    })

    // Linha do tempo do ateliê
    const fill = document.querySelector<HTMLElement>('.timeline__fill')
    if (fill) {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 901px)', () => {
        gsap.fromTo(fill, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 85%', end: 'bottom 60%', scrub: true } })
      })
      mm.add('(max-width: 900px)', () => {
        gsap.fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 75%', end: 'bottom 55%', scrub: true } })
      })
    }
  }

  // Palco 3D: some quando a linha de produtos entra; o render pausa
  const stage = document.querySelector<HTMLElement>('.stage')
  const line = document.getElementById('linha')
  if (stage && line && document.documentElement.classList.contains('is-3d')) {
    gsap.fromTo(
      stage,
      { autoAlpha: 1 },
      { autoAlpha: 0, ease: 'none', immediateRender: false, scrollTrigger: { trigger: line, start: 'top bottom', end: 'top 35%', scrub: true } },
    )
    ScrollTrigger.create({
      trigger: line,
      start: 'top 35%',
      onEnter: () => onStageActive?.(false),
      onLeaveBack: () => onStageActive?.(true),
    })
  }

  // Link ativo no menu + leitura no canto da tela
  const readout = document.querySelector<HTMLElement>('[data-readout]')
  document.querySelectorAll<HTMLAnchorElement>('.nav__links a[href^="#"]').forEach((a) => {
    const sec = document.querySelector(a.getAttribute('href')!)
    if (!sec) return
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => a.setAttribute('aria-current', String(self.isActive)),
    })
  })
  // Leitura do canto: seção no centro da tela (a desmontagem escreve a própria etapa)
  const secs = [...document.querySelectorAll<HTMLElement>('main > section, .footer')]
  const labels = secs.map((sec, i) => sec.querySelector('.label')?.textContent?.split('—')[0]?.trim() || String(i).padStart(2, '0'))
  if (readout)
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: () => {
        const c = window.innerHeight / 2
        for (let i = 0; i < secs.length; i++) {
          const r = secs[i].getBoundingClientRect()
          if (r.top <= c && r.bottom >= c) {
            if (!secs[i].classList.contains('dis') && readout.textContent !== labels[i]) readout.textContent = labels[i]
            break
          }
        }
      },
    })
}
