/**
 * Renderiza o HTML completo a partir de `content.ts`.
 * Roda no build (plugin do Vite) — o site já chega pronto para buscadores
 * e para quem navega sem JavaScript; o JS só adiciona 3D e animação.
 */
import * as C from '../content.ts'
import { art, roomArt } from './art.ts'

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Escapa e converte *palavra* em <em>palavra</em>. */
const rich = (s: string) => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>')
const plain = (s: string) => s.replace(/\*/g, '')

const resolve = (href: string, msg?: string) => {
  if (href === 'whatsapp') return { url: C.whatsappUrl(msg), ext: true }
  if (href === 'mail') return { url: C.mailUrl(), ext: false }
  return { url: href, ext: /^https?:/.test(href) }
}
const attrs = (href: string, msg?: string) => {
  const r = resolve(href, msg)
  const isFile = /\.pdf$/.test(r.url)
  return `href="${esc(r.url)}"${r.ext ? ' target="_blank" rel="noopener"' : ''}${isFile ? ' download' : ''}`
}

const arrow = `<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false"><path d="M3 9 9 3M4 3h5v5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`

const btn = (label: string, href: string, variant: 'primary' | 'ghost' = 'ghost', extra = '', msg?: string) =>
  `<a class="btn btn--${variant}" ${attrs(href, msg)}${extra}><span class="btn__label">${esc(label)}</span><span class="btn__icon" aria-hidden="true">${arrow}</span></a>`

const label = (text: string, cls = '') => `<p class="label ${cls}" data-reveal>${esc(text)}</p>`

/* ------------------------------------------------------------------ */

function head() {
  const s = C.site
  const a = C.contact.address
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Orfeu Áudio',
    description: s.description,
    url: s.url,
    email: C.contact.email,
    telephone: C.contact.phoneDisplay,
    address: {
      '@type': 'PostalAddress',
      streetAddress: a.street,
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
      postalCode: a.zip,
      addressCountry: 'BR',
    },
  }
  return `
<title>${esc(s.title)}</title>
<meta name="description" content="${esc(s.description)}" />
<link rel="canonical" href="${s.url}/" />
<meta name="theme-color" content="${s.themeColor}" />
<meta name="color-scheme" content="dark" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="pt_BR" />
<meta property="og:site_name" content="Orfeu Áudio" />
<meta property="og:title" content="${esc(s.title)}" />
<meta property="og:description" content="${esc(s.description)}" />
<meta property="og:url" content="${s.url}/" />
<meta property="og:image" content="${s.url}${s.ogImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(s.title)}" />
<meta name="twitter:description" content="${esc(s.description)}" />
<meta name="twitter:image" content="${s.url}${s.ogImage}" />
<script type="application/ld+json">${JSON.stringify(ld)}</script>`
}

function chrome() {
  const n = C.nav
  return `
<a class="skip" href="#conteudo">Pular para o conteúdo</a>
<div class="bg" aria-hidden="true"><div class="bg__mist"></div></div>
<div class="grain" aria-hidden="true"></div>
<div class="frame" aria-hidden="true">
  <i class="frame__c frame__c--tl"></i><i class="frame__c frame__c--tr"></i>
  <i class="frame__c frame__c--bl"></i><i class="frame__c frame__c--br"></i>
  <span class="frame__ro frame__ro--l">ORF · I-300 &nbsp;/&nbsp; <span data-readout>00</span></span>
  <span class="frame__ro frame__ro--r">SÃO PAULO · ${esc(C.contact.coords)}</span>
</div>
<header class="nav" id="topo">
  <div class="nav__bar wrap">
    <a class="logo" href="#conteudo" aria-label="Orfeu Áudio — início">
      <span class="logo__name">${esc(C.brand.name)}</span><span class="logo__bar" aria-hidden="true"></span><span class="logo__sub">${esc(C.brand.sub)}</span>
    </a>
    <nav class="nav__links" id="menu" aria-label="Principal">
      <ul>${n.links.map((l, i) => `<li><a href="${l.href}"><span class="mono" aria-hidden="true">0${i + 1}</span>${esc(l.label)}</a></li>`).join('')}</ul>
    </nav>
    <div class="nav__end">
      ${btn(n.cta.label, n.cta.href, 'primary', ' data-size="sm"')}
      <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="menu" aria-label="Abrir menu"><span></span><span></span></button>
    </div>
  </div>
  <div class="progress" aria-hidden="true"><span class="progress__bar"></span></div>
</header>
<div class="stage" aria-hidden="true">
  <canvas class="stage__canvas"></canvas>
  <div class="callouts"></div>
</div>`
}

function hero() {
  const h = C.hero
  return `
<section class="hero" aria-labelledby="hero-title">
  <div class="wrap hero__inner">
    ${label(h.label)}
    <h1 class="display hero__title" id="hero-title" data-reveal>${rich(h.title)}</h1>
    <p class="lead hero__sub" data-reveal>${esc(h.subtitle)}</p>
    <div class="actions" data-reveal>
      ${btn(h.ctaPrimary.label, h.ctaPrimary.href, 'primary', ' data-scrollto')}
      ${btn(h.ctaSecondary.label, h.ctaSecondary.href, 'ghost')}
    </div>
  </div>
  <img class="still hero__still" src="/fallback/hero.webp" width="1200" height="900" loading="lazy" alt="Amplificador Orfeu I-300 em vista translúcida, com as válvulas 300B acesas" />
  <div class="wrap hero__foot">
    <ul class="stats" aria-label="Destaques do I-300">
      ${h.stats.map((s) => `<li><span class="stats__v">${esc(s.value)}${s.unit ? `<small>${esc(s.unit)}</small>` : ''}</span><span class="stats__c">${esc(s.caption)}</span></li>`).join('<li class="stats__dot" aria-hidden="true">·</li>')}
    </ul>
    <span class="scroll-hint mono" aria-hidden="true"><i></i>${esc(h.scrollHint)}</span>
  </div>
</section>`
}

function disassembly() {
  const d = C.disassembly
  const total = String(d.steps.length).padStart(2, '0')
  return `
<section class="dis" id="desmontagem" aria-labelledby="dis-title">
  <h2 class="sr-only" id="dis-title">${esc(d.srTitle)}</h2>
  <div class="dis__pin">
    <div class="wrap dis__inner">
      ${label(d.label, 'dis__label')}
      <ol class="dis__steps">
        ${d.steps
          .map((s, i) => {
            const n = String(i + 1).padStart(2, '0')
            return `<li class="dis-step" data-step="${i}">
          <img class="still dis-step__img" src="/fallback/step-${i + 1}.webp" width="1200" height="900" loading="lazy" alt="Etapa ${n}: ${esc(plain(s.title))}" />
          <div class="dis-step__text">
            <p class="dis-step__count mono">ETAPA ${n} / ${total} · ${esc(s.short.toUpperCase())}</p>
            <h3 class="dis-step__title">${rich(s.title)}</h3>
            <p class="dis-step__body">${esc(s.text)}</p>
            <p class="dis-step__meta mono">${esc(s.meta)}</p>
          </div>
        </li>`
          })
          .join('')}
      </ol>
      <nav class="dis__nav" aria-label="Etapas da desmontagem">
        <ol>${d.steps.map((s, i) => `<li><button type="button" data-goto="${i}" aria-label="Ir para a etapa ${i + 1}: ${esc(s.short)}"><span class="mono">${String(i + 1).padStart(2, '0')}</span><span class="dis__nav-name">${esc(s.short)}</span></button></li>`).join('')}</ol>
        <span class="dis__nav-track" aria-hidden="true"><span class="dis__nav-fill"></span></span>
      </nav>
    </div>
  </div>
</section>`
}

function lineSection() {
  const l = C.line
  return `
<section class="section line" id="linha" aria-labelledby="linha-title">
  <div class="wrap">
    <header class="section__head">
      ${label(l.label)}
      <h2 class="h2" id="linha-title" data-reveal>${rich(l.title)}</h2>
      <p class="lead" data-reveal>${esc(l.intro)}</p>
    </header>
    <div class="cards">
      ${l.products
        .map(
          (p, i) => `<article class="card" data-reveal aria-labelledby="p-${p.id}">
        <div class="card__art">${art[p.art](`Ilustração em traço do ${p.name}`)}</div>
        <p class="card__idx mono">${String(i + 1).padStart(2, '0')} / ${esc(p.type.toUpperCase())}</p>
        <h3 class="card__name" id="p-${p.id}">${esc(p.name)}</h3>
        <p class="card__phrase">${esc(p.phrase)}</p>
        <dl class="card__specs">${p.specs.map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join('')}</dl>
        <div class="card__foot">
          <span class="mono">${esc(l.priceLabel.toUpperCase())}</span>
          <a class="link-arrow" ${attrs('whatsapp', `Olá! Gostaria de saber mais sobre o ${p.name}.`)} aria-label="${esc(l.ctaLabel)} sobre o ${esc(p.name)} pelo WhatsApp">${esc(l.ctaLabel)} ${arrow}</a>
        </div>
      </article>`,
        )
        .join('')}
    </div>
  </div>
</section>`
}

function processSection() {
  const p = C.process
  return `
<section class="section process" id="atelie" aria-labelledby="atelie-title">
  <div class="wrap">
    <header class="section__head section__head--split">
      <div>
        ${label(p.label)}
        <h2 class="h2" id="atelie-title" data-reveal>${rich(p.title)}</h2>
      </div>
      <p class="lead" data-reveal>${esc(p.intro)}</p>
    </header>
    <figure class="media media--loop" data-reveal>
      <div class="media__img" role="img" aria-label="${esc(p.media.alt)}"><img src="/media/atelie-valvulas.webp" alt="" width="1600" height="900" loading="lazy" /></div>
      <figcaption class="media__cap mono"><span class="rec" aria-hidden="true"></span>${esc(p.media.caption)}</figcaption>
    </figure>
    <div class="timeline">
      <span class="timeline__line" aria-hidden="true"><span class="timeline__fill"></span></span>
      <ol class="timeline__list">
      ${p.steps
        .map(
          (s, i) => `<li class="tl-step" data-reveal>
        <span class="tl-step__dot" aria-hidden="true"></span>
        <p class="tl-step__num mono">${String(i + 1).padStart(2, '0')} · ${esc(s.duration.toUpperCase())}</p>
        <h3 class="tl-step__title">${esc(s.title)}</h3>
        <p class="tl-step__text">${esc(s.text)}</p>
      </li>`,
        )
        .join('')}
      </ol>
    </div>
  </div>
</section>`
}

function numbersSection() {
  const n = C.numbers
  return `
<section class="section numbers" aria-label="Orfeu em números">
  <div class="wrap">
    ${label(n.label)}
    <ul class="bignums">
      ${n.items
        .map(
          (it) => `<li data-reveal><span class="bignums__v"><span data-count="${it.value}">${it.value}</span>${it.suffix}</span><span class="bignums__c mono">${esc(it.caption)}</span></li>`,
        )
        .join('')}
    </ul>
    <p class="numbers__note" data-reveal>${esc(n.note)}</p>
  </div>
</section>`
}

function specsSection() {
  const s = C.specs
  return `
<section class="section specs" id="especificacoes" aria-labelledby="specs-title">
  <div class="wrap specs__grid">
    <header class="specs__head">
      ${label(s.label)}
      <h2 class="h2" id="specs-title" data-reveal>${rich(s.title)}</h2>
      <p class="lead" data-reveal>${esc(s.intro)}</p>
      <div class="actions" data-reveal>
        ${btn(s.download.label, s.download.href, 'primary')}
        <span class="mono specs__meta">${esc(s.download.meta)}</span>
      </div>
    </header>
    <dl class="spec-table" data-reveal>
      ${s.rows.map((r) => `<div class="spec-row"><dt>${esc(r.label)}</dt><dd>${esc(r.value)}</dd></div>`).join('')}
    </dl>
  </div>
</section>`
}

function listenSection() {
  const l = C.listen
  const a = C.contact.address
  const addr = `${a.street} · ${a.district}<br />${a.city} · ${a.zip}`
  return `
<section class="section listen" id="audicao" aria-labelledby="listen-title">
  <div class="wrap listen__grid">
    <div class="listen__text">
      ${label(l.label)}
      <h2 class="h2" id="listen-title" data-reveal>${rich(l.title)}</h2>
      <p class="lead" data-reveal>${esc(l.intro)}</p>
      <div class="options">
        ${l.options
          .map(
            (o) => `<div class="option" data-reveal>
          <p class="mono option__k">${esc(o.kicker)}</p>
          <h3 class="option__t">${esc(o.title)}</h3>
          <p class="option__p">${esc(o.text)}</p>
          <div class="mono option__d">${o.detail === 'address' ? `<address>${addr}</address><span>${esc(C.contact.hours.toUpperCase())}</span>` : `<span>${esc(o.detail.toUpperCase())}</span>`}</div>
        </div>`,
          )
          .join('')}
      </div>
      <div class="actions" data-reveal>
        ${btn(l.ctaPrimary.label, l.ctaPrimary.href, 'primary')}
        ${btn(l.ctaSecondary.label, l.ctaSecondary.href, 'ghost')}
      </div>
    </div>
    <figure class="media media--room" data-reveal>
      ${roomArt(l.media.alt)}
      <figcaption class="media__cap mono">${esc(l.media.caption)}</figcaption>
    </figure>
  </div>
</section>`
}

function quotesSection() {
  const t = C.testimonials
  return `
<section class="section quotes" id="depoimentos" aria-labelledby="quotes-title">
  <div class="wrap">
    <h2 class="sr-only" id="quotes-title">Depoimentos</h2>
    ${label(t.label)}
    <div class="quotes__grid">
      ${t.items
        .map(
          (q) => `<figure class="quote" data-reveal>
        <blockquote><p>“${esc(q.quote)}”</p></blockquote>
        <figcaption class="mono"><span>${esc(q.name.toUpperCase())}</span><span>${esc(q.place.toUpperCase())} · ${esc(q.product.toUpperCase())}</span></figcaption>
      </figure>`,
        )
        .join('')}
    </div>
  </div>
</section>`
}

function footerSection() {
  const f = C.footer
  return `
<footer class="footer">
  <div class="wrap">
    <div class="footer__top">
      <p class="footer__tag">${f.tagline
        .split(' · ')
        .map((t) => `<span>${esc(t)}</span>`)
        .join('<span class="footer__sep" aria-hidden="true"> · </span>')}</p>
      ${btn('Agendar audição', 'whatsapp', 'ghost')}
    </div>
    <nav class="footer__cols" aria-label="Rodapé">
      ${f.columns
        .map(
          (c) => `<div><h2 class="footer__h mono">${esc(c.title.toUpperCase())}</h2><ul>${c.links.map((l) => `<li><a ${attrs(l.href)}>${esc(l.label)}</a></li>`).join('')}</ul></div>`,
        )
        .join('')}
    </nav>
  </div>
  <p class="footer__brand" aria-hidden="true">${esc(C.brand.name)}</p>
  <div class="wrap footer__legal mono">
    <span>${esc(f.copyright.toUpperCase())}</span>
    <ul>${f.legal.map((l) => `<li><a href="${l.href}">${esc(l.label.toUpperCase())}</a></li>`).join('')}</ul>
  </div>
</footer>`
}

export function renderPage() {
  const body = `${chrome()}
<main id="conteudo" tabindex="-1">
${hero()}
${disassembly()}
${lineSection()}
${processSection()}
${numbersSection()}
${specsSection()}
${listenSection()}
${quotesSection()}
</main>
${footerSection()}`
  return { head: head(), body }
}
