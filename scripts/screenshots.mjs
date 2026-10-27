/**
 * QA visual: screenshots em 1440 px e 390 px de cada etapa e seção.
 *   npm run shots            → ./screenshots/*.png
 *   npm run shots -- --static  (modo sem animação / reduced-motion)
 */
import { mkdirSync } from 'node:fs'
import { GL_ARGS, loadPlaywright, startServer } from './pw.mjs'

const { chromium } = loadPlaywright()
const { server, url } = await startServer(5198)
const browser = await chromium.launch({ args: GL_ARGS })
const staticMode = process.argv.includes('--static')
mkdirSync('screenshots', { recursive: true })

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, mobile: false },
  { name: 'mobile', width: 390, height: 844, mobile: true },
]
const SECTIONS = ['#linha', '#atelie', '.numbers', '#especificacoes', '#audicao', '#depoimentos', '.footer']

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
  })
  const problems = []
  page.on('pageerror', (e) => problems.push(e.message))
  page.on('console', (m) => m.type() === 'error' && problems.push(m.text()))
  await page.goto(`${url}/${staticMode ? '?static' : '?nobloom'}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  const shot = async (label) => {
    await page.screenshot({ path: `screenshots/${staticMode ? 'static-' : ''}${vp.name}-${label}.png`, timeout: 120000 })
    console.log('✓', `${vp.name}-${label}`)
  }
  await shot('00-hero')

  if (!staticMode) {
    // centro de cada etapa da desmontagem (mesma conta de src/scroll/disassembly.ts)
    const HOLD = 0.7, TRANS = 1, N = 6
    const total = (N - 1) * (HOLD + TRANS) + HOLD
    for (let i = 0; i < N; i++) {
      await page.evaluate(({ i, HOLD, TRANS, total, N }) => {
        const sec = document.querySelector('.dis')
        const start = sec.getBoundingClientRect().top + scrollY
        const len = innerHeight * (N - 0.4)
        scrollTo(0, start + ((i * (HOLD + TRANS) + HOLD * 0.5) / total) * len)
      }, { i, HOLD, TRANS, total, N })
      await page.waitForTimeout(3000)
      await shot(`01-etapa-${i + 1}`)
    }
  }
  for (const [k, sel] of SECTIONS.entries()) {
    await page.evaluate((sel) => document.querySelector(sel).scrollIntoView(), sel)
    await page.waitForTimeout(1800)
    await shot(`${String(k + 2).padStart(2, '0')}-${sel.replace(/[#.]/g, '')}`)
  }
  // overflow horizontal?
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  if (overflow > 0) problems.push(`overflow horizontal de ${overflow}px`)
  console.log(problems.length ? `⚠ ${vp.name}: ${problems.join(' | ')}` : `✓ ${vp.name}: sem erros`)
  await page.close()
}

await browser.close()
await server.close()
