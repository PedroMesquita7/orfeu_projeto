import type Lenis from 'lenis'

/** Menu mobile, âncoras com rolagem suave e brilho dos cards. */
export function initUI(lenis: Lenis | null) {
  const toggle = document.querySelector<HTMLButtonElement>('.nav__toggle')
  const menu = document.getElementById('menu')
  const setOpen = (open: boolean) => {
    if (!toggle || !menu) return
    toggle.setAttribute('aria-expanded', String(open))
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu')
    menu.dataset.open = String(open)
    if (open) lenis?.stop()
    else lenis?.start()
  }
  toggle?.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'))
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
      setOpen(false)
      toggle.focus()
    }
  })

  // Âncoras internas
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
    if (!a) return
    const id = a.getAttribute('href')!
    if (id === '#' || id.length < 2) return
    const target = document.querySelector<HTMLElement>(id)
    if (!target) return
    e.preventDefault()
    setOpen(false)
    const done = () => {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    }
    if (lenis) lenis.scrollTo(target, { duration: 1.6, onComplete: done })
    else {
      target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
      done()
    }
    history.replaceState(null, '', id)
  })

  // Luz que segue o cursor nos cards
  document.querySelectorAll<HTMLElement>('.card').forEach((c) => {
    c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect()
      c.style.setProperty('--mx', `${e.clientX - r.left}px`)
      c.style.setProperty('--my', `${e.clientY - r.top}px`)
    })
  })
}
