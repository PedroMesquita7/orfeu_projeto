/**
 * Gera as imagens estáticas a partir do próprio modelo 3D:
 *  - public/fallback/hero.webp, step-1..6.webp  (sem WebGL / reduced-motion)
 *  - public/media/atelie-valvulas.webp           (close de válvulas acesas)
 *  - public/og.jpg                                (Open Graph 1200×630)
 *
 *   npm run assets
 */
import { mkdirSync } from 'node:fs'
import sharp from 'sharp'
import { GL_ARGS, loadPlaywright, startServer } from './pw.mjs'

const { chromium } = loadPlaywright()
const { server, url } = await startServer()
const browser = await chromium.launch({ args: GL_ARGS })
mkdirSync('public/fallback', { recursive: true })
mkdirSync('public/media', { recursive: true })

async function capture(which, w, h, { bg = false } = {}) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  await page.goto(`${url}/?capture=${which}`)
  await page.waitForFunction(() => window.__captureReady, null, { timeout: 120000 })
  const buf = await page.screenshot({ omitBackground: !bg, timeout: 120000 })
  await page.close()
  return buf
}

const jobs = [['hero', 'hero'], ...[1, 2, 3, 4, 5, 6].map((n) => [String(n), `step-${n}`])]
for (const [q, name] of jobs) {
  const png = await capture(q, 1200, 900)
  // recorta a transparência e centraliza o objeto num quadro 4:3
  const trimmed = await sharp(png).trim({ threshold: 1 }).toBuffer()
  const { data, info } = await sharp(trimmed).resize(1100, 820, { fit: 'inside' }).toBuffer({ resolveWithObject: true })
  const padX = 1200 - info.width
  const padY = 900 - info.height
  const clear = { r: 0, g: 0, b: 0, alpha: 0 }
  await sharp(data)
    .extend({ left: Math.floor(padX / 2), right: Math.ceil(padX / 2), top: Math.floor(padY / 2), bottom: Math.ceil(padY / 2), background: clear })
    .webp({ quality: 82, alphaQuality: 90 })
    .toFile(`public/fallback/${name}.webp`)
  console.log('✓', `public/fallback/${name}.webp`)
}

const close = await capture('closeup', 1600, 900, { bg: true })
await sharp(close).webp({ quality: 80 }).toFile('public/media/atelie-valvulas.webp')
console.log('✓ public/media/atelie-valvulas.webp')

// Open Graph: o hero como aparece no site
{
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  await page.goto(`${url}/?nobloom`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(4000)
  await page.evaluate(() => {
    document.querySelector('.hero__foot')?.setAttribute('style', 'display:none')
  })
  await page.waitForTimeout(600)
  const buf = await page.screenshot({ timeout: 120000 })
  await sharp(buf).jpeg({ quality: 84, mozjpeg: true }).toFile('public/og.jpg')
  await page.close()
  console.log('✓ public/og.jpg')
}

await browser.close()
await server.close()
