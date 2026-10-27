/**
 * Carrega o Playwright (local ou global) e sobe um servidor Vite temporário.
 * Uso interno de render-assets.mjs e screenshots.mjs.
 * Requer: npm i -D playwright && npx playwright install chromium
 */
import { createRequire } from 'node:module'
import { execSync } from 'node:child_process'
import { createServer } from 'vite'

const require = createRequire(import.meta.url)

export function loadPlaywright() {
  try {
    return require('playwright')
  } catch {
    const root = execSync('npm root -g').toString().trim()
    return require(`${root}/playwright`)
  }
}

export async function startServer(port = 5199) {
  const server = await createServer({ server: { port, host: '127.0.0.1', strictPort: false }, logLevel: 'error' })
  await server.listen()
  const url = server.resolvedUrls?.local?.[0] ?? `http://127.0.0.1:${port}/`
  return { server, url: url.replace(/\/$/, '') }
}

/** Flags de GL por software para ambientes sem GPU (CI, containers). */
export const GL_ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
